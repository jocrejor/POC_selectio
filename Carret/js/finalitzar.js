document.addEventListener('DOMContentLoaded', main)

function main() {
    mostrarInfoCliente();
    mostrarResumenCompra();
}

function obtenerClienteActual() {
    const clienteId = localStorage.getItem('clienteId');
    if (clienteId && typeof Client !== 'undefined') {
        return Client.find(c => c.id === parseInt(clienteId));
    }
    return null;
}

function obtenerSesion() {
    return JSON.parse(localStorage.getItem('sesion'));
}

// Elimina tots els elements fills d’un contenidor HTML
function clearElement(el) {
    while (el && el.firstChild) el.removeChild(el.firstChild);
}

// Mostra la informació del client o la sessió anònima
function mostrarInfoCliente() {
    const clientInfoDiv = document.getElementById('clientInfo');
    const cliente = obtenerClienteActual();
    const sesion = obtenerSesion();

    clearElement(clientInfoDiv);

    const h3 = document.createElement('h3');
    const p1 = document.createElement('p');
    const p2 = document.createElement('p');

    if (cliente) {
        h3.appendChild(document.createTextNode('Informació d\'enviament'));
        p1.appendChild(document.createTextNode(`${cliente.name} ${cliente.surname}`));
        p2.appendChild(document.createTextNode(`${cliente.address}, ${cliente.cp}`));

        const p3 = document.createElement('p');
        p3.appendChild(document.createTextNode(cliente.email));

        clientInfoDiv.appendChild(h3);
        clientInfoDiv.appendChild(p1);
        clientInfoDiv.appendChild(p2);
        clientInfoDiv.appendChild(p3);
    } else {
        h3.appendChild(document.createTextNode('Sessió anònima'));
        p1.appendChild(document.createTextNode(`ID: ${sesion ? sesion.carretId : 'N/A'}`));

        clientInfoDiv.appendChild(h3);
        clientInfoDiv.appendChild(p1);
    }
}

// Mostra el resum de la compra finalitzada
function mostrarResumenCompra() {
    const comandaStr = localStorage.getItem('ultimaComanda');

    // Si no hi ha cap comanda guardada, mostrar missatge informatiu
    if (!comandaStr) {
        const container = document.querySelector('.container');
        clearElement(container);

        const h1 = document.createElement('h1');
        h1.appendChild(document.createTextNode("No s'ha trobat cap comanda"));

        const p = document.createElement('p');
        p.className = 'subtitle';
        p.appendChild(document.createTextNode('Sembla que no hi ha cap comanda recent'));

        const divButtons = document.createElement('div');
        divButtons.className = 'buttons';

        const btnTenda = document.createElement('a');
        btnTenda.href = 'listarproductes.html';
        btnTenda.className = 'btn btn-primary';
        btnTenda.appendChild(document.createTextNode('Anar a la tenda'));

        divButtons.appendChild(btnTenda);
        container.appendChild(h1);
        container.appendChild(p);
        container.appendChild(divButtons);
        return;
    }

    // Si hi ha una comanda guardada, mostrar-la amb detalls
    const comanda = JSON.parse(comandaStr);

    const numComandaEl = document.getElementById('numComanda');
    clearElement(numComandaEl);
    numComandaEl.appendChild(document.createTextNode(comanda.numeroComanda || 'N/A'));


    const fecha = new Date(comanda.fecha);
    const dataComandaEl = document.getElementById('dataComanda');
    clearElement(dataComandaEl);
    dataComandaEl.appendChild(document.createTextNode(fecha.toLocaleString('ca-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })));

    // Nombre total de productes
    const totalProductes = comanda.productes.reduce((sum, p) => sum + p.quantity, 0);
    const numProductesEl = document.getElementById('numProductes');
    clearElement(numProductesEl);
    numProductesEl.appendChild(document.createTextNode(totalProductes));

    // Total de la comanda
    const totalComandaEl = document.getElementById('totalComanda');
    clearElement(totalComandaEl);
    totalComandaEl.appendChild(document.createTextNode(comanda.total.toFixed(2) + ' €'));

    // Llistat de productes
    const productsListDiv = document.getElementById('productsList');
    clearElement(productsListDiv);

    comanda.productes.forEach(p => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'product-item';

        const img = document.createElement('img');
        img.src = p.image || 'https://freesvg.org/img/Simple-Image-Not-Found-Icon.png';
        img.alt = p.name;
        img.width = 80;
        img.height = 80;

        const infoDiv = document.createElement('div');
        infoDiv.className = 'product-item-info';

        const nameDiv = document.createElement('div');
        nameDiv.className = 'product-item-name';
        nameDiv.appendChild(document.createTextNode(p.name));

        const detailsDiv = document.createElement('div');
        detailsDiv.className = 'product-item-details';
        detailsDiv.appendChild(document.createTextNode(`${p.quantity} x ${p.price.toFixed(2)} € = ${(p.quantity * p.price).toFixed(2)} €`));

        infoDiv.appendChild(nameDiv);
        infoDiv.appendChild(detailsDiv);

        itemDiv.appendChild(img);
        itemDiv.appendChild(infoDiv);

        productsListDiv.appendChild(itemDiv);
    });
}
