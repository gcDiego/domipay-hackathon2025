// server.js

// 1. IMPORTS
const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const { initDb } = require('./db/database');
const apiRoutes = require('./routes/api');
const callbackRoutes = require('./routes/callbacks');

// 2. CONFIGURACIÓN INICIAL
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
const PORT2 = process.env.PORT2 || 4000; // Puerto para pruebatienda.html

// 3. MIDDLEWARE
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('.'));

// 4. RUTAS PRINCIPALES
app.use('/api', apiRoutes);
app.use('/callbacks', callbackRoutes);

// 5. SERVIR index.html en puerto principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 6. INICIAR PRIMER SERVIDOR
async function startMainServer() {
    try {
        await initDb();
        app.listen(PORT, async () => {
            console.log(`Servidor principal corriendo en http://localhost:${PORT}`);
            try {
                const open = (await import('open')).default;
                await open(`http://localhost:${PORT}`);
            } catch (err) {
                console.warn(`No se pudo abrir automáticamente el navegador. Navega a http://localhost:${PORT} manualmente.`);
            }
        });
    } catch (error) {
        console.error("Error al arrancar el servidor principal:", error);
        process.exit(1);
    }
}

// 7. SERVIDOR DE PRUEBAS (pruebatienda.html)
async function startTestServer() {
    const app2 = express();
    app2.use(cors());
    app2.use(bodyParser.json());

    const PORT2 = process.env.PORT2 || 4000;

    // Servir archivos de public
    app2.use('/public', express.static(path.join(__dirname, 'public')));

    // Montar las rutas API y callbacks
    app2.use('/api', apiRoutes);
    app2.use('/callbacks', callbackRoutes);

    // Servir pruebatienda.html en la raíz
    app2.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, 'pruebatienda.html'));
    });

    // Servir cualquier HTML que esté en la raíz
    app2.get('/:htmlFile', (req, res) => {
        const file = req.params.htmlFile;
        if (file.endsWith('.html')) {
            res.sendFile(path.join(__dirname, file));
        } else {
            res.status(404).send('Archivo no encontrado');
        }
    });

    app2.listen(PORT2, async () => {
        console.log(`Servidor de prueba corriendo en http://localhost:${PORT2}`);
        try {
            const open = (await import('open')).default;
            await open(`http://localhost:${PORT2}`);
        } catch (err) {
            console.warn(`No se pudo abrir automáticamente el navegador. Navega a http://localhost:${PORT2} manualmente.`);
        }
    });
}


// 8. INICIAR AMBOS SERVIDORES
startMainServer();
startTestServer();
