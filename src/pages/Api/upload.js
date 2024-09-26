// pages/api/uploadLogo.js

import formidable from 'formidable';
import admin from 'firebase-admin';

// Disable the default body parser to use formidable
export const config = {
  api: {
    bodyParser: false,
  },
};

// Initialize Firebase Admin SDK only once
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        type: process.env.FIREBASE_TYPE,
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID,
        auth_uri: process.env.FIREBASE_AUTH_URI,
        token_uri: process.env.FIREBASE_TOKEN_URI,
        auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
        client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
      }),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'venture-galaxy.appspot.com',
    });
    console.log("Firebase Admin initialized successfully.");
  } catch (initError) {
    console.error("Firebase Admin initialization error:", initError);
  }
}

const bucket = admin.storage().bucket();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    console.warn(`Received unsupported method: ${req.method}`);
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const form = new formidable.IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Erro ao analisar o formulário:', err);
      return res.status(500).json({ error: 'Erro ao analisar os dados do formulário' });
    }

    const file = files.logo; // Nome do campo do arquivo no formulário

    if (!file) {
      console.warn('Nenhum arquivo enviado');
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    const token = req.headers.authorization?.split('Bearer ')[1];

    if (!token) {
      console.warn('Nenhum token fornecido');
      return res.status(401).json({ error: 'Não autorizado: Nenhum token fornecido' });
    }

    try {
      // Verifica o token de autenticação
      const decodedToken = await admin.auth().verifyIdToken(token);
      const userId = decodedToken.uid;
      console.log(`Authenticated user ID: ${userId}`);

      // Assegura que o userId no formulário corresponde ao token
      if (fields.userId !== userId) {
        console.warn(`userId mismatch: form userId = ${fields.userId}, token userId = ${userId}`);
        return res.status(403).json({ error: 'Proibido: ID de usuário inválido' });
      }

      const fileName = file.originalFilename;
      const filePath = `logos/${userId}/${Date.now()}_${fileName}`;
      const destination = bucket.file(filePath);

      console.log(`Uploading file to ${filePath}`);

      // Faça upload do arquivo para o Firebase Storage
      await bucket.upload(file.filepath, {
        destination: filePath,
        metadata: {
          contentType: file.mimetype,
          cacheControl: 'public, max-age=31536000',
        },
      });

      console.log(`File uploaded successfully to ${filePath}`);

      // Obtenha a URL de download do arquivo
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${encodeURIComponent(filePath)}`;

      return res.status(200).json({ url: publicUrl });
    } catch (uploadError) {
      console.error('Erro ao fazer upload do arquivo:', uploadError);
      return res.status(500).json({ error: 'Erro ao fazer upload do arquivo' });
    }
  });
}
