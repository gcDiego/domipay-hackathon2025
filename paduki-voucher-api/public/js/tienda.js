document.addEventListener('DOMContentLoaded', () => {
    const payButton = document.getElementById('open-payments-button');
    const totalElement = document.getElementById('total-value');

    const receiveWalletUrl = 'https://ilp.interledger-test.dev/chavez';

    payButton.addEventListener('click', () => {
        const totalText = totalElement.textContent.replace('$','').trim();
        const total = parseFloat(totalText);

        console.log('Total de la venta:', total);
        console.log('Receive Wallet URL:', receiveWalletUrl);

        // Guardamos los datos en sessionStorage
        sessionStorage.setItem('amountToCharge', total);
        sessionStorage.setItem('recipientWalletUrl', receiveWalletUrl);

        // Redirigimos a venta.html
        window.location.href = '/venta.html';
    });
});


