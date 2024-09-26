// /pages/api/uploadLogo.js (Next.js)
// ou
// /api/uploadLogo.js (Vercel Sem Next.js)
require('dotenv').config();

const formidable = require('formidable');
const admin = require('firebase-admin');

// Inicializa o Firebase Admin SDK apenas uma vez
if (!admin.apps.length) {
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
}

const bucket = admin.storage().bucket();

// Desativa o parser padrão para usar o formidable
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
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
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    const token = req.headers.authorization?.split('Bearer ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Não autorizado: Nenhum token fornecido' });
    }

    try {
      // Verifica o token de autenticação
      const decodedToken = await admin.auth().verifyIdToken(token);
      const userId = decodedToken.uid;

      // Assegura que o userId no formulário corresponde ao token
      if (fields.userId !== userId) {
        return res.status(403).json({ error: 'Proibido: ID de usuário inválido' });
      }

      const fileName = file.originalFilename;
      const filePath = `logos/${userId}/${fileName}`;
      const destination = bucket.file(filePath);

      // Faça upload do arquivo para o Firebase Storage
      await bucket.upload(file.filepath, {
        destination: filePath,
        metadata: {
          contentType: file.mimetype,
          cacheControl: 'public, max-age=31536000',
        },
      });

      // Obtenha a URL de download do arquivo
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${encodeURIComponent(filePath)}`;

      return res.status(200).json({ url: publicUrl });
    } catch (uploadError) {
      console.error('Erro ao fazer upload do arquivo:', uploadError);
      return res.status(500).json({ error: 'Erro ao fazer upload do arquivo' });
    }
  });
}
