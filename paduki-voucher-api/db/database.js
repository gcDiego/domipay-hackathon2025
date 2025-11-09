// db/database.js
const mysql = require('mysql2/promise');
require('dotenv').config();

let pool;

async function initDb() {
    if (pool) return pool;

    try {
        const dbConfig = {
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        };

        pool = mysql.createPool(dbConfig);

        const connection = await pool.getConnection();
        console.log('Conectado exitosamente al pool de MySQL.');
        connection.release();

        // **LA CORRECCIÓN ESTÁ AQUÍ**
        const createTableSql = `
            CREATE TABLE IF NOT EXISTS Vouchers (
                voucher_id VARCHAR(255) PRIMARY KEY,
                customer_name VARCHAR(255) NOT NULL,
                customer_email VARCHAR(255) NOT NULL,
                current_balance DECIMAL(10, 2) NOT NULL,
                initial_amount DECIMAL(10, 2) NOT NULL,
                status VARCHAR(20) NOT NULL,
                store_id VARCHAR(100),
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                
                -- Nueva columna para guardar el ID de la cotización de Open Payments
                open_payments_quote_id VARCHAR(255),

                -- Índice para buscar rápidamente por el quote_id
                INDEX idx_quote_id (open_payments_quote_id)
            );
        `;

        await pool.execute(createTableSql);

        console.log('Tabla "Vouchers" asegurada en MySQL.');

        return pool;
    } catch (error) {
        console.error('Error al inicializar el pool de MySQL:', error.message);
        process.exit(1);
    }
}

function getDb() {
    if (!pool) {
        throw new Error('La base de datos no ha sido inicializada. Llama a initDb() primero.');
    }
    return pool;
}

module.exports = { initDb, getDb };