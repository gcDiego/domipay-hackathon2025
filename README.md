#ENGLISH
**---------------------------**
# DomiPay Tarjetas API

## Description

This is a REST API for voucher management. It allows for the creation, validation, and redemption of vouchers, as well as the generation of PDFs and QR codes for them. The project is built with Node.js and Express, and uses a MySQL database for data persistence.

## Key Features

*   **Voucher Creation:** Generates new vouchers with customer information and a specific amount.
*   **Voucher Validation:** Verifies the validity of an existing voucher.
*   **Voucher Redemption:** Marks a voucher as redeemed.
*   **PDF Generation:** Creates a PDF representation of the voucher.
*   **QR Generation:** Generates a QR code for quick access to the voucher.
*   **Email Notification:** Sends the voucher as a PDF to the customer via email.
*   **Open Payments Integration:** Includes functionality to interact with the Interledger protocol.

## Technologies Used

*   **Backend:** Node.js, Express
*   **Database:** MySQL (`mysql2`)
*   **API Handling:** `body-parser`, `cors`
*   **Environment Variables:** `dotenv`
*   **PDF Generation:** `pdf-lib`, `pdfkit`
*   **QR Generation:** `qrcode`
*   **Email Sending:** `nodemailer`
*   **Unique Identifiers:** `uuid`
*   **Payment Protocols:** `@interledger/open-payments`

## Prerequisites

Ensure you have the following installed before starting:

*   [Node.js](https://nodejs.org/) (version 14 or higher)
*   [npm](https://www.npmjs.com/)
*   A running MySQL instance.

## Installation

1.  **Clone the repository:**
    ```bash
    git clone https://URL-DEL-REPOSITORIO.git
    cd paduki-voucher-api
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure environment variables:**
    Create a `.env` file in the project root and add the following variables:

    ```
    # Server Configuration
    PORT=3000
    PORT2=4000

    # Database Configuration
    DB_HOST=localhost
    DB_USER=your_mysql_user
    DB_PASSWORD=your_mysql_password
    DB_DATABASE=your_mysql_database

    # Email Configuration (Nodemailer)
    EMAIL_USER=your_email@gmail.com
    EMAIL_PASS=your_application_password
    ```

    *Note: For `EMAIL_PASS`, if you use Gmail, you need to generate an "Application Password".*

## Usage

Once you have completed the installation and configuration, you can start the servers:

```bash
node server.js


**---------------------------**
#Spanish
**---------------------------**
# DomiPay Tarjetas API



## Descripción

Esta es una API REST para la gestión de vouchers. Permite la creación, validación y canje de vouchers, así como la generación de PDFs y códigos QR para los mismos. El proyecto está construido con Node.js y Express, y utiliza una base de datos MySQL para persistir la información.

## Características Principales

*   **Creación de Vouchers:** Genera nuevos vouchers con información del cliente y un monto específico.
*   **Validación de Vouchers:** Verifica la validez de un voucher existente.
*   **Canje de Vouchers:** Marca un voucher como canjeado.
*   **Generación de PDF:** Crea una representación en PDF del voucher.
*   **Generación de QR:** Genera un código QR para el acceso rápido al voucher.
*   **Notificación por Email:** Envía el voucher en formato PDF al cliente por correo electrónico.
*   **Integración con Open Payments:** Incluye funcionalidades para interactuar con el protocolo Interledger.

## Tecnologías Utilizadas

*   **Backend:** Node.js, Express
*   **Base de Datos:** MySQL (`mysql2`)
*   **Manejo de APIs:** `body-parser`, `cors`
*   **Variables de Entorno:** `dotenv`
*   **Generación de PDF:** `pdf-lib`, `pdfkit`
*   **Generación de QR:** `qrcode`
*   **Envío de Emails:** `nodemailer`
*   **Identificadores Únicos:** `uuid`
*   **Protocolos de Pago:** `@interledger/open-payments`

## Prerrequisitos

Asegúrate de tener instalado lo siguiente antes de comenzar:

*   [Node.js](https://nodejs.org/) (versión 14 o superior)
*   [npm](https://www.npmjs.com/)
*   Una instancia de MySQL en ejecución.

## Instalación

1.  **Clona el repositorio:**
    ```bash
    git clone https://URL-DEL-REPOSITORIO.git
    cd paduki-voucher-api
    ```

2.  **Instala las dependencias:**
    ```bash
    npm install
    ```

3.  **Configura las variables de entorno:**
    Crea un archivo `.env` en la raíz del proyecto y añade las siguientes variables:

    ```
    # Configuración del Servidor
    PORT=3000
    PORT2=4000

    # Configuración de la Base de Datos
    DB_HOST=localhost
    DB_USER=tu_usuario_mysql
    DB_PASSWORD=tu_contraseña_mysql
    DB_DATABASE=tu_base_de_datos_mysql

    # Configuración del Email (Nodemailer)
    EMAIL_USER=tu_email@gmail.com
    EMAIL_PASS=tu_contraseña_de_aplicacion
    ```

    *Nota: Para `EMAIL_PASS`, si usas Gmail, necesitas generar una "Contraseña de aplicación".*

## Uso

Una vez que hayas completado la instalación y configuración, puedes iniciar los servidores:

```bash
node server.js
```

Esto iniciará dos servidores:
*   **Servidor Principal:** En `http://localhost:3000`, que sirve la aplicación principal.
*   **Servidor de Pruebas:** En `http://localhost:4000`, que sirve una tienda de prueba.

Al iniciar, la aplicación intentará abrir automáticamente dos pestañas en tu navegador con ambas URLs.

## API Endpoints

La API se encuentra bajo el prefijo `/api`.

*   `POST /api/vouchers`: Crea un nuevo voucher.
*   `GET /api/vouchers/:id`: Obtiene la información de un voucher específico.
*   `POST /api/vouchers/redeem`: Canjea un voucher.
*   `GET /api/vouchers/validate/:id`: Valida un voucher.

También existen rutas de callback bajo `/callbacks`.

## Contribuciones

Las contribuciones son bienvenidas. Si deseas contribuir, por favor sigue estos pasos:

1.  Haz un fork del proyecto.
2.  Crea una nueva rama (`git checkout -b feature/nueva-funcionalidad`).
3.  Realiza tus cambios y haz commit (`git commit -m 'Añade nueva funcionalidad'`).
4.  Haz push a la rama (`git push origin feature/nueva-funcionalidad`).
5.  Abre un Pull Request.
