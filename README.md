#ENGLISH
**---------------------------**
# Paduki Voucher API

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
