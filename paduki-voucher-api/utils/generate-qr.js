// routes/api.js
const express = require('express');
const { v4: uuidv4 } = require('uuid'); // Para generar IDs únicos
const { getDb } = require('../db/database');

const router = express.Router();

// --- SIMULACIÓN DE API DE PAGOS ---
// En un proyecto real, esto usaría la private_key de .env
// para conectar con la API de OpenPayments.
async function simulateOpenPayment(amount, recipientWalletUrl) {
    console.log(`\n--- INICIANDO PAGO OPENPAYMENTS ---`);
    console.log(`[PADUKI] -> Pagando ${amount} a [${recipientWalletUrl}]`);

    // Simula el tiempo que toma una llamada API
    await new Promise(resolve => setTimeout(resolve, 1000));

    const transactionId = `op-tx-${uuidv4()}`;
    console.log(`--- PAGO EXITOSO (ID: ${transactionId}) ---`);

    return { success: true, transactionId };
}
// ------------------------------------


/**
 * RUTA: POST /api/vouchers/create
 * Crea un nuevo voucher (crédito) para un cliente.
 */
router.post('/vouchers/create', async (req, res) => {
    const { amount, customer_name, customer_email, store_id } = req.body;

    if (!amount || !customer_name || !customer_email) {
        return res.status(400).json({ message: "Faltan datos (amount, customer_name, customer_email)." });
    }

    const voucher_id = uuidv4(); // Genera un ID único para el voucher
    const db = getDb();

    try {
        const query = `
      INSERT INTO Vouchers 
      (voucher_id, customer_name, customer_email, current_balance, initial_amount, status, store_id)
      VALUES (?, ?, ?, ?, ?, 'active', ?)
    `;

        await db.run(query, [voucher_id, customer_name, customer_email, amount, amount, store_id]);

        // Prepara el JSON que irá dentro del código QR
        const qrContent = JSON.stringify({
            voucher_id: voucher_id
        });

        res.status(201).json({
            message: "Voucher creado exitosamente.",
            voucher_id: voucher_id,
            qr_data: qrContent, // Este es el JSON que conviertes en QR
            customer_name: customer_name,
            initial_balance: amount
        });

    } catch (error) {
        console.error("Error al crear voucher:", error);
        res.status(500).json({ message: "Error interno al guardar el voucher." });
    }
});


/**
 * RUTA: POST /api/payments/process
 * Procesa un pago utilizando un voucher (leído desde un QR).
 */
router.post('/payments/process', async (req, res) => {
    // El comercio nos envía el contenido del QR y el monto a cobrar
    const { qrData, amountToCharge, recipientWalletUrl } = req.body;

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
    const db = getDb();

    // (Importante: En producción, usarías transacciones de BD aquí)
    // `db.run('BEGIN TRANSACTION');`

    try {
        // 1. Consultar saldo del QR (en tu Base de Datos)
        const voucher = await db.get('SELECT * FROM Vouchers WHERE voucher_id = ?', [voucher_id]);

        if (!voucher) {
            return res.status(404).json({ message: "Voucher no encontrado." });
        }

        if (voucher.status !== 'active') {
            return res.status(400).json({ message: `Voucher no está activo (estado: ${voucher.status}).` });
        }

        // 2. Verificar si el valor es mayor al cobro
        if (parseFloat(voucher.current_balance) < amountToCharge) {
            return res.status(400).json({
                message: "Fondos insuficientes en el voucher.",
                current_balance: voucher.current_balance
            });
        }

        // 3. Proceder al pago (Simular comunicación con OpenPayments)
        const paymentResult = await simulateOpenPayment(amountToCharge, recipientWalletUrl);

        if (!paymentResult.success) {
            // (Aquí harías `db.run('ROLLBACK');`)
            throw new Error("Falló el pago con OpenPayments");
        }

        // 4. Actualizar el valor del QR (en tu Base de Datos)
        const newBalance = parseFloat(voucher.current_balance) - amountToCharge;
        const newStatus = (newBalance < 0.01) ? 'used' : 'active'; // Si el saldo es 0, se marca como 'used'

        await db.run(
            'UPDATE Vouchers SET current_balance = ?, status = ? WHERE voucher_id = ?',
            [newBalance, newStatus, voucher_id]
        );

        // (Aquí harías `db.run('COMMIT');`)

        res.status(200).json({
            message: "Pago realizado con éxito",
            transaction_id: paymentResult.transactionId,
            voucher_id: voucher_id,
            new_balance: newBalance
        });

    } catch (error) {
        // (Aquí harías `db.run('ROLLBACK');`)
        console.error("Error al procesar pago:", error.message);
        res.status(500).json({ message: "Error interno al procesar el pago." });
    }
});


module.exports = router;