document.addEventListener("DOMContentLoaded", main);

async function main() {
    let comandaId = getComandaIdFromUrl();
    let detalleContainer = document.getElementById("detallePedido");

    if (!comandaId) {
        mostrarMissatge(detalleContainer, "No s'ha passat cap ID de comanda.");
        return;
    }

    try {
        // Carregar dades directament de la base de dades
        let orders = await getData(url, "Order") || [];
        let orderDetails = await getData(url, "Orderdetail") || [];
        let productArray = await getData(url, "Product") || [];
        let products = Array.isArray(productArray[0]) ? productArray[0] : productArray;
        window.products = products;


        let clientsArray = await getData(url, "Client") || [];
        window.Client = Array.isArray(clientsArray[0]) ? clientsArray[0] : clientsArray;

        // Buscar la comanda pel seu ID
        let comanda = orders.find(o => Number(o.id) === Number(comandaId));
        if (!comanda) {
            mostrarMissatge(detalleContainer, "Comanda no trobada a la base de dades.");
            return;
        }

        // Afegir productes
        let productes = orderDetails
            .filter(d => Number(d.order_id) === Number(comandaId))
            .map(d => ({
                producte: Number(d.product_id),
                quantitat: Number(d.quantity ?? d.quantitat ?? 0),
                preu: Number(d.unit_price ?? d.preu ?? 0),
                descompte: Number(d.discount ?? d.descompte ?? 0)
            }));


        comanda.productes = productes;


        comanda.productes = productes;

        // Mostrar la comanda
        mostrarComanda(comanda);

        // Botó "Tornar"
        document.getElementById("tornar").addEventListener("click", () => {
            window.location.href = "index.html";
        });

    } catch (err) {
        console.error(err);
        mostrarMissatge(detalleContainer, "Hi ha hagut un error carregant la comanda.");
    }
}

// Obtenir l'ID de la URL
function getComandaIdFromUrl() {
    let params = new URLSearchParams(window.location.search);
    return params.get("id");
}

// Mostrar missatges
function mostrarMissatge(container, text) {
    let p = document.createElement("p");
    p.textContent = text;
    container.replaceChildren();
    container.appendChild(p);
}


// Mostrar la comanda dins de la taula del HTML
function mostrarComanda(comanda) {
    let detalleContainer = document.getElementById("detallePedido");
    detalleContainer.replaceChildren();

    if (!comanda) {
        mostrarMissatge(detalleContainer, "Comanda no disponible.");
        return;
    }

    //  INFO GENERAL
    document.getElementById("infoData").textContent =
        "Data: " + formatData(comanda.date || comanda.data);

    let clientNom = "Client desconegut";
    if (comanda.client_id && window.Client) {
        let cli = window.Client.find(c => Number(c.id) === Number(comanda.client_id));
        if (cli) clientNom = `${cli.name} ${cli.surname}`;
    }
    document.getElementById("infoClient").textContent =
        "Client: " + clientNom;

    document.getElementById("infoPagament").textContent =
        "Tipus de pagament: " + (comanda.payment || comanda.pagament || "Error");

    document.getElementById("infoEnviament").textContent =
        "Enviament (€): " + (Number(comanda.shipping_amount || comanda.enviament || 0)).toFixed(2);

    //  OMPLIR LA TAULA DE PRODUCTES
    let total = 0;
    let productes = comanda.productes || [];

    if (productes.length === 0) {
        let tr = document.createElement("tr");
        let td = document.createElement("td");
        td.colSpan = 5;
        td.style.textAlign = "center";
        td.textContent = "Cap producte a la comanda.";
        tr.appendChild(td);
        detalleContainer.appendChild(tr);
        return;
    }
let detalleBody = document.getElementById("detallePedido");
detalleBody.replaceChildren();
    productes.forEach(p => {
        let fila = document.createElement("tr");

        let nom = obtenirNomProducte(p);
        let quant = Number(p.quantitat) || 0;
        let preu = Number(p.preu) || 0;
        let desc = Number(p.descompte) || 0;

        let subtotal = quant * preu * (1 - desc / 100);
        total += subtotal;

        let camps = [
            { label: "Producte:" , value: nom },
            { label: "Quantitat:", value: quant },
            { label: "Preu:", value: preu.toFixed(2) },
            { label: "Descompte:", value: desc.toFixed(2) },
            { label: "Subtotal:", value: subtotal.toFixed(2) }
        ];

        camps.forEach(c => {
       let td = document.createElement("td");
        td.textContent = c.value;           
        td.setAttribute("data-label", c.label); 
        fila.appendChild(td);
});

        detalleContainer.appendChild(fila);
    });

    //  TOTAL AMB ENVIAMENT
    total += Number(comanda.shipping_amount || comanda.enviament || 0);

    let filaTotal = document.createElement("tr");
    filaTotal.classList.add("fila-total");

    let tdText = document.createElement("td");
    tdText.colSpan = 4;
    tdText.style.textAlign = "right";
    tdText.style.fontWeight = "bold";
    tdText.textContent = "Total amb enviament (€):";

    let tdTotal = document.createElement("td");
    tdTotal.style.fontWeight = "bold";
    tdTotal.textContent = total.toFixed(2);

    filaTotal.append(tdText, tdTotal);
    detalleContainer.appendChild(filaTotal);
}


// Obtenir el nom del producte segons l'ID
function obtenirNomProducte(p) {
    if (typeof p.producte === "string" && isNaN(p.producte)) {
        return p.producte;
    }

    let idProducte = p.producte || p.id;
    if (!idProducte) return "Nom no disponible";

    if (window.products && Array.isArray(window.products)) {
        let trobat = window.products.find(prod => Number(prod.id) === Number(idProducte));
        if (trobat) return trobat.name;
    }

    return "Nom no disponible";
}

// Format de data DD-MM-YYYY
function formatData(dataString) {
    if (!dataString) return "Error";
    let data = new Date(dataString);
    if (isNaN(data)) return dataString;
    let dia = String(data.getDate()).padStart(2, "0");
    let mes = String(data.getMonth() + 1).padStart(2, "0");
    let any = data.getFullYear();
    return `${dia}-${mes}-${any}`;
}