// pages/api/upload.js
import { getAuth } from 'firebase-admin/auth';
import { getStorage } from 'firebase-admin/storage';
import { initializeApp, cert } from 'firebase-admin/app';
import formidable from 'formidable';
import fs from 'fs';

// Inicialize o Firebase Admin SDK
if (!initializeApp.length) { // Evita re-inicializações
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
    storageBucket: `${process.env.FIREBASE_PROJECT_ID}.appspot.com`,
  });
}

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Autenticação requerida' });
  }

  const token = authHeader.split('Bearer ')[1];

  try {
    const decodedToken = await getAuth().verifyIdToken(token);
    const userId = decodedToken.uid;

    const form = new formidable.IncomingForm();
    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Erro no processamento do formulário' });
      }

      const file = files.file;
      if (!file) {
        return res.status(400).json({ error: 'Arquivo não encontrado' });
      }

      const bucket = getStorage().bucket();
      const blob = bucket.file(`logos/${userId}/${file.originalFilename}`);
      const blobStream = blob.createWriteStream({
        resumable: false,
        contentType: file.mimetype,
        metadata: {
          firebaseStorageDownloadTokens: decodedToken.uid, // Opcional
        },
      });

      blobStream.on('error', (error) => {
        console.error(error);
        res.status(500).json({ error: 'Erro no upload' });
      });

      blobStream.on('finish', async () => {
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
        res.status(200).json({ url: publicUrl });
      });

      blobStream.end(fs.readFileSync(file.filepath));
    });
  } catch (error) {
    console.error(error);
    return res.status(401).json({ error: 'Token inválido' });
  }
}
