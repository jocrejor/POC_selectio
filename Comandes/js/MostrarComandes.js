document.addEventListener("DOMContentLoaded", () => {
    carregarComandes();

    // Recarrega comandes quan es canvia la mida de la finestra
    let resizeTimeout;
    window.addEventListener("resize", () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            carregarComandes();
        }, 200); // espera 200ms per no cridar massa vegades
    });
});

// Funció per mostrar missatges d'error o notificacions
function mostrarMissatge(text) {
    let div = document.getElementById("missatgeError");
    if (div) {
        div.textContent = text;
        div.style.display = "block";
    }
}

// Carregar comandes de l'usuari
async function carregarComandes() {
    let currentUserStr = localStorage.getItem("currentUser");
    if (!currentUserStr) {
        mostrarMissatge("Has d'iniciar sessió per veure les comandes.");
        setTimeout(() => window.location.href = "../Login.html", 2000);
        return;
    }

    let currentUser = JSON.parse(currentUserStr);
    let clientId = Number(currentUser.id);

    try {
        let res = await fetch("https://api.serverred.es/Order");
        let orders = await res.json();
        let mevesComandes = orders.filter(o => Number(o.client_id) === clientId);

        let tbody = document.querySelector("#cosTaula");
        tbody.innerHTML = "";

        if (mevesComandes.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4">Sense comandes</td></tr>`;
            return;
        }

        for (let o of mevesComandes) {
            let total = 0;
            try {
                let detRes = await fetch(`https://api.serverred.es/Orderdetail?order_id=${o.id}`);
                let items = await detRes.json();
                items.forEach(item => {
                    let quantity = Number(item.quantity ?? item.quantitat ?? 0);
                    let price = Number(item.price ?? item.preu ?? 0);
                    let discount = Number(item.discount ?? item.descompte ?? 0);
                    total += (price * quantity) - discount;
                });
                total += Number(o.shipping_amount ?? o.enviament ?? 0);
            } catch (e) {
                console.warn("Error carregant detalls:", e);
            }

            let isMobile = window.innerWidth <= 768;

            if (isMobile) {
                let camps = [
                    { label: "ID", value: o.id },
                    { label: "Data", value: formatData(o.date || o.data) },
                    { label: "Total", value: total.toFixed(2) + " €" }
                ];

                camps.forEach(camp => {
                    let tr = document.createElement("tr");
                    let td = document.createElement("td");
                    td.setAttribute("data-label", camp.label);
                    td.textContent = camp.value;
                    tr.appendChild(td);
                    tbody.appendChild(tr);
                });

                // Botó Veure
                let trAccions = document.createElement("tr");
                let tdAccions = document.createElement("td");
                tdAccions.setAttribute("data-label", "Acció");
                let btnVeure = document.createElement("button");
                btnVeure.className = "accio-icon";
                btnVeure.innerHTML = '<i class="fa-solid fa-eye"></i>';
                btnVeure.onclick = () => carregarDetallsComanda(o);
                tdAccions.appendChild(btnVeure);
                trAccions.appendChild(tdAccions);
                tbody.appendChild(trAccions);

                // Separador
                let trSeparador = document.createElement("tr");
                let tdSeparador = document.createElement("td");
                tdSeparador.colSpan = 1;
                tdSeparador.innerHTML = "<hr>";
                trSeparador.appendChild(tdSeparador);
                tbody.appendChild(trSeparador);
            } else {
                let tr = document.createElement("tr");
                let dataComanda = formatData(o.date || o.data);
                tr.innerHTML = `
                    <td>${o.id}</td>
                    <td>${dataComanda}</td>
                    <td>${total.toFixed(2)} €</td>
                `;
                let tdAccio = document.createElement("td");
                let btnVeure = document.createElement("button");
                btnVeure.className = "accio-icon";
                btnVeure.innerHTML = '<i class="fa-solid fa-eye"></i>';
                btnVeure.onclick = () => carregarDetallsComanda(o);
                tdAccio.appendChild(btnVeure);
                tr.appendChild(tdAccio);
                tbody.appendChild(tr);
            }
        }

    } catch (err) {
        console.error("Error carregant comandes:", err);
        mostrarMissatge("Error carregant comandes.");
    }
}

function formatData(dataString) {
    if (!dataString) return "";
    let data = new Date(dataString);
    if (isNaN(data)) return dataString;
    let dia = String(data.getDate()).padStart(2, "0");
    let mes = String(data.getMonth() + 1).padStart(2, "0");
    let any = data.getFullYear();
    return `${dia}-${mes}-${any}`;
}

// Carregar detalls de la comanda
async function carregarDetallsComanda(comanda) {
    try {
        let res = await fetch(`https://api.serverred.es/Orderdetail?order_id=${comanda.id}`);
        let items = await res.json();
        if (!Array.isArray(items)) items = [];

        items.forEach(item => {
            item.quantity = Number(item.quantity ?? item.quantitat ?? 0);
            item.price = Number(item.price ?? item.preu ?? 0);
            item.discount = Number(item.discount ?? item.descompte ?? 0);
        });

        await Promise.all(items.map(async (item) => {
            try {
                let prodRes = await fetch(`https://api.serverred.es/Product/${item.product_id}`);
                if (prodRes.ok) {
                    let product = await prodRes.json();
                    item.product_name = product.name || "Producte no disponible";
                } else {
                    item.product_name = "Producte no disponible";
                }
            } catch (e) {
                console.warn("Error producte:", e);
                item.product_name = "Producte no disponible";
            }
        }));

        comanda.items = items;
        obrirModalComanda(comanda);

    } catch (err) {
        console.error("Error carregant detalls:", err);
        mostrarMissatge("No s'han pogut carregar els detalls.");
    }
}

// Obrir modal amb detalls
function obrirModalComanda(comanda) {
    let currentUser = JSON.parse(localStorage.getItem("currentUser"));
    let modal = document.getElementById("modalComanda");
    let contingut = document.getElementById("detallsComanda");

    let shippingAmount = Number(comanda.shipping_amount ?? comanda.enviament ?? 0);

    let html = `
        <p><strong>Data:</strong> ${formatData(comanda.date || comanda.data)}</p>
        <p><strong>Client:</strong> ${currentUser.name}</p>
        <p><strong>Tipus de pagament:</strong> ${comanda.payment || ""}</p>
        <p><strong>Enviament (€):</strong> ${shippingAmount.toFixed(2)}</p>
    `;

    html += `<table class="taula-comandes-modal">
        <thead>
            <tr>
                <th>Producte</th>
                <th>Quantitat</th>
                <th>Preu</th>
                <th>Descompte</th>
                <th>Subtotal</th>
            </tr>
        </thead>
        <tbody>`;

    let total = 0;
    if (Array.isArray(comanda.items) && comanda.items.length > 0) {
        comanda.items.forEach(item => {
            let subtotal = (item.price * item.quantity) - item.discount;
            total += subtotal;

            html += `<tr>
                <td data-label="Producte">${item.product_name}</td>
                <td data-label="Quantitat" style="text-align:center;">${item.quantity}</td>
                <td data-label="Preu" style="text-align:right;">${item.price.toFixed(2)}</td>
                <td data-label="Descompte" style="text-align:right;">${item.discount.toFixed(2)}</td>
                <td data-label="Subtotal" style="text-align:right;">${subtotal.toFixed(2)}</td>
            </tr>`;
        });
    } else {
        html += `<tr><td colspan="5" style="text-align:center;">No hi ha productes</td></tr>`;
    }

    html += `<tr>
        <td colspan="4" style="text-align:right; font-weight:bold;">Total amb enviament (€):</td>
        <td style="text-align:right; font-weight:bold;">${(total + shippingAmount).toFixed(2)}</td>
    </tr></tbody></table>`;

    contingut.innerHTML = html;
    modal.style.display = "block";

    modal.querySelector(".close").onclick = () => modal.style.display = "none";
    window.onclick = (e) => { if (e.target === modal) modal.style.display = "none"; };
}
