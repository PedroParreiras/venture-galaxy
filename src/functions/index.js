// functions/index.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');

admin.initializeApp();

const app = express();

// Configurar CORS para permitir requisições da origem do seu app
app.use(cors({ origin: 'http://localhost:3000' })); // Atualize para o domínio do seu app em produção

// Middleware para verificar autenticação
app.use(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Autenticação requerida.' });
  }

  const idToken = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Erro na verificação do token:', error);
    return res.status(401).json({ error: 'Token inválido.' });
  }
});

// Rota para upload de arquivos
app.post('/upload', async (req, res) => {
  try {
    const { fileName, fileData, fileType } = req.body;

    if (!fileName || !fileData || !fileType) {
      return res.status(400).json({ error: 'Parâmetros faltando.' });
    }

    const userId = req.user.uid;

    const buffer = Buffer.from(fileData, 'base64');

    const bucket = admin.storage().bucket();
    const file = bucket.file(`logos/${userId}/${fileName}`);

    await file.save(buffer, {
      metadata: {
        contentType: fileType,
      },
    });

    const publicUrl = `https://storage.googleapis.com/${bucket.name}/logos/${userId}/${fileName}`;

    return res.status(200).json({ url: publicUrl });
  } catch (error) {
    console.error('Erro no upload:', error);
    return res.status(500).json({ error: 'Erro no upload.' });
  }
});

exports.api = functions.https.onRequest(app);
