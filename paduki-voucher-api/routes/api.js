// routes/api.js
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../db/database');
const { createAuthenticatedClient, isFinalizedGrant } = require('@interledger/open-payments');
const { PDFDocument } = require('pdf-lib');
const QRCode = require('qrcode');
const fs = require('fs/promises');
const path = require('path');
const nodemailer = require('nodemailer');

const router = express.Router();

// Configurar transporte de correo usando variables de .env
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// --- CREAR VOUCHER Y ENVIAR POR CORREO ---
router.post('/vouchers/create', async (req, res) => {
    const { amount, customer_name, customer_email, store_id } = req.body;
    if (!amount || !customer_name || !customer_email) {
        return res.status(400).json({ message: "Faltan datos (amount, customer_name, customer_email)." });
    }

    const voucher_id = uuidv4();
    const pool = getDb();

    try {
        // Guardar voucher en la base de datos
        const query = `
            INSERT INTO Vouchers (voucher_id, customer_name, customer_email, current_balance, initial_amount, status, store_id)
            VALUES (?, ?, ?, ?, ?, 'active', ?)
        `;
        await pool.execute(query, [voucher_id, customer_name, customer_email, amount, amount, store_id]);

        // Generar QR en PNG
        const qrContent = JSON.stringify({ voucher_id });
        const qrImageBytes = await QRCode.toBuffer(qrContent, { type: 'png' });

        // Crear PDF del voucher
        const templateDir = path.join(__dirname, '../templates');
        const templatePath = path.join(templateDir, 'TRASERA.pdf');

        // Crear carpeta templates si no existe
        await fs.mkdir(templateDir, { recursive: true });

        const pdfTemplateBytes = await fs.readFile(templatePath);
        const pdfDoc = await PDFDocument.load(pdfTemplateBytes);
        const qrImage = await pdfDoc.embedPng(qrImageBytes);
        const firstPage = pdfDoc.getPages()[0];

        const qrX = 280;
        const qrY = 20;
        const qrSize = 50;
        firstPage.drawImage(qrImage, { x: qrX, y: qrY, width: qrSize, height: qrSize });

        const pdfBytes = await pdfDoc.save();

        // Guardar PDF temporalmente en templates
        const tempPdfPath = path.join(templateDir, `voucher-${voucher_id}.pdf`);
        await fs.writeFile(tempPdfPath, pdfBytes);

        // Enviar correo al cliente
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: customer_email,
            subject: `Tu Voucher ${voucher_id}`,
            text: `Hola ${customer_name},\n\nAdjunto encontrarás tu voucher con QR.\nValor: ${amount}`,
            attachments: [
                {
                    filename: `voucher-${voucher_id}.pdf`,
                    path: tempPdfPath
                }
            ]
        });

        // Eliminar temporal
        await fs.unlink(tempPdfPath);

        res.status(201).json({
            message: "Voucher creado exitosamente y enviado por correo.",
            voucher_id,
            qr_data: qrContent,
            customer_name,
            initial_balance: amount
        });
    } catch (error) {
        console.error("Error al crear voucher:", error);
        res.status(500).json({ message: "Error interno al guardar el voucher o enviar correo." });
    }
});

// --- RUTA DE INICIO DE PAGOS ---
router.post('/payments/initiate', async (req, res) => {
    const recipientWalletUrl = req.body.recipientWalletUrl ? req.body.recipientWalletUrl.trim() : null;
    const { qrData, amountToCharge } = req.body;

    if (!qrData || !amountToCharge || !recipientWalletUrl) {
        return res.status(400).json({ message: "Faltan datos (qrData, amountToCharge, recipientWalletUrl)." });
    }

    let qrJson;
    try {
        qrJson = JSON.parse(qrData);
        if (!qrJson.voucher_id) throw new Error('ID de voucher no encontrado');
    } catch (error) {
        return res.status(400).json({ message: "El código QR no es válido o está mal formado." });
    }

    const { voucher_id } = qrJson;
    const pool = getDb();
    let connection;

    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();
        const [rows] = await connection.execute('SELECT * FROM Vouchers WHERE voucher_id = ? FOR UPDATE', [voucher_id]);
        if (rows.length === 0) throw new Error("Voucher no encontrado.");
        const voucher = rows[0];
        if (voucher.status !== 'active') throw new Error(`Voucher no está activo (estado: ${voucher.status}).`);
        if (parseFloat(voucher.current_balance) < amountToCharge) throw new Error("Fondos insuficientes en el voucher.");

        const client = await createAuthenticatedClient({
            walletAddressUrl: process.env.SENDING_WALLET_ADDRESS_URL,
            keyId: process.env.KEY_ID,
            privateKey: process.env.PRIVATE_KEY
        });

        const sendingWalletAddress = await client.walletAddress.get({ url: process.env.SENDING_WALLET_ADDRESS_URL });
        const receivingWalletAddress = await client.walletAddress.get({ url: recipientWalletUrl });

        const incomingPaymentGrant = await client.grant.request(
            { url: receivingWalletAddress.authServer },
            { access_token: { access: [{ type: 'incoming-payment', actions: ['create'] }] } }
        );
        if (!isFinalizedGrant(incomingPaymentGrant)) throw new Error('No se pudo obtener el permiso para el pago entrante.');

        const valueToSend = BigInt(Math.floor(amountToCharge * (10 ** receivingWalletAddress.assetScale))).toString();
        const incomingPayment = await client.incomingPayment.create(
            { url: receivingWalletAddress.resourceServer, accessToken: incomingPaymentGrant.access_token.value },
            {
                walletAddress: receivingWalletAddress.id,
                incomingAmount: { assetCode: receivingWalletAddress.assetCode, assetScale: receivingWalletAddress.assetScale, value: valueToSend },
                expiresAt: new Date(Date.now() + 60000 * 10).toISOString()
            }
        );

        const quoteGrant = await client.grant.request(
            { url: sendingWalletAddress.authServer },
            { access_token: { access: [{ type: 'quote', actions: ['create', 'read'] }] } }
        );
        if (!isFinalizedGrant(quoteGrant)) throw new Error('No se pudo obtener el permiso para la cotización.');

        const quote = await client.quote.create(
            { url: sendingWalletAddress.resourceServer, accessToken: quoteGrant.access_token.value },
            { walletAddress: sendingWalletAddress.id, receiver: incomingPayment.id, method: 'ilp' }
        );

        const outgoingPaymentGrant = await client.grant.request(
            { url: sendingWalletAddress.authServer },
            {
                access_token: { access: [{ type: 'outgoing-payment', actions: ['create', 'read'], identifier: sendingWalletAddress.id, limits: { debitAmount: quote.debitAmount } }] },
                interact: { start: ['redirect'] }
            }
        );

        const newBalance = parseFloat(voucher.current_balance) - amountToCharge;
        await connection.execute(
            "UPDATE Vouchers SET status = 'pending', current_balance = ?, open_payments_quote_id = ?, op_cont_token = ?, op_cont_uri = ? WHERE voucher_id = ?",
            [newBalance, quote.id, outgoingPaymentGrant.continue.access_token.value, outgoingPaymentGrant.continue.uri, voucher_id]
        );
        await connection.commit();

        res.status(200).json({
            message: "Pago iniciado. Redirigiendo al usuario para aprobación.",
            approvalUrl: outgoingPaymentGrant.interact.redirect,
            quoteId: quote.id
        });

    } catch (error) {
        if (connection) await connection.rollback();
        console.error("Error al iniciar pago:", error);
        const userMessage = error.message.includes("Fondos") || error.message.includes("Voucher") || error.message.includes("permiso")
            ? error.message
            : "Error interno al iniciar el pago.";
        res.status(500).json({ message: userMessage, details: error.message });
    } finally {
        if (connection) connection.release();
    }
});

// --- RUTA PARA DESCARGAR PDF DEL VOUCHER ---
router.get('/vouchers/:voucher_id/pdf', async (req, res) => {
    const { voucher_id } = req.params;
    const pool = getDb();

    try {
        const [rows] = await pool.execute('SELECT * FROM Vouchers WHERE voucher_id = ?', [voucher_id]);
        if (rows.length === 0) {
            return res.status(404).send('Voucher no encontrado');
        }
        const voucher = rows[0];

        const templatePath = path.join(__dirname, '../templates/TRASERA.pdf');
        const pdfTemplateBytes = await fs.readFile(templatePath);
        const pdfDoc = await PDFDocument.load(pdfTemplateBytes);

        const qrContent = JSON.stringify({ voucher_id: voucher.voucher_id });
        const qrImageBytes = await QRCode.toBuffer(qrContent, { type: 'png' });
        const qrImage = await pdfDoc.embedPng(qrImageBytes);

        const firstPage = pdfDoc.getPages()[0];
        const qrX = 280;
        const qrY = 20;
        const qrSize = 50;
        firstPage.drawImage(qrImage, { x: qrX, y: qrY, width: qrSize, height: qrSize });

        const pdfBytes = await pdfDoc.save();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=voucher-${voucher_id}.pdf`);
        res.send(Buffer.from(pdfBytes));

    } catch (error) {
        console.error('Error al generar el PDF:', error);
        res.status(500).send('Error interno al generar el PDF.');
    }
});

module.exports = router;
