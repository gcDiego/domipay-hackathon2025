// routes/callbacks.js
const express = require('express');
const { getDb } = require('../db/database');
const { createAuthenticatedClient, isFinalizedGrant } = require('@interledger/open-payments');

const router = express.Router();

router.post('/finalize-payment', async (req, res) => {
    const { quoteId } = req.body;

    if (!quoteId) {
        return res.status(400).json({ message: "Falta el quoteId." });
    }

    const pool = getDb();
    let connection;

    try {
        const client = await createAuthenticatedClient({
            walletAddressUrl: process.env.SENDING_WALLET_ADDRESS_URL,
            keyId: process.env.KEY_ID,
            privateKey: process.env.PRIVATE_KEY,
        });

        // **LA CORRECCIÓN ESTÁ AQUÍ**
        // 1. OBTENER LOS DETALLES DE NUESTRA PROPIA WALLET PARA TENER LA URL CORRECTA
        const sendingWalletAddress = await client.walletAddress.get({ url: process.env.SENDING_WALLET_ADDRESS_URL });

        connection = await pool.getConnection();
        await connection.beginTransaction();

        const [rows] = await connection.execute(
            "SELECT * FROM Vouchers WHERE open_payments_quote_id = ? AND status = 'pending' FOR UPDATE",
            [quoteId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: "Transacción pendiente no encontrada. Esperando..." });
        }
        const voucher = rows[0];

        const grant = await client.grant.continue({
            accessToken: voucher.op_cont_token,
            url: voucher.op_cont_uri,
        });

        if (!isFinalizedGrant(grant)) {
            return res.status(400).json({ message: "El permiso de pago aún no ha sido finalizado por el usuario." });
        }

        // 2. CREAR EL PAGO SALIENTE USANDO LA URL 'resourceServer' CORRECTA
        const outgoingPayment = await client.outgoingPayment.create(
            { url: sendingWalletAddress.resourceServer, accessToken: grant.access_token.value },
            {
                quoteId: quoteId,
                walletAddress: sendingWalletAddress.id,
            }
        );

        const finalStatus = voucher.current_balance < 0.01 ? 'used' : 'active';
        await connection.execute(
            "UPDATE Vouchers SET status = ?, open_payments_quote_id = NULL, op_cont_token = NULL, op_cont_uri = NULL WHERE voucher_id = ?",
            [finalStatus, voucher.voucher_id]
        );

        await connection.commit();

        console.log("Pago finalizado y confirmado exitosamente. ID de pago saliente:", outgoingPayment.id);

        res.status(200).json({
            message: "Pago completado exitosamente.",
            transaction_id: outgoingPayment.id,
            voucher_id: voucher.voucher_id,
            final_balance: voucher.current_balance
        });

    } catch (error) {
        if (connection) await connection.rollback();
        if (!error.message.includes("finalizado por el usuario")) {
            console.error("Error al finalizar el pago:", error);
        }
        res.status(500).json({ message: "Error interno al finalizar el pago.", details: error.message });
    } finally {
        if (connection) connection.release();
    }
});

module.exports = router;