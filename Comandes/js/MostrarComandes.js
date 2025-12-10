document.addEventListener("DOMContentLoaded", carregarComandes);

async function carregarComandes() {
    // Recuperar el client loguejat del localStorage
    let currentUserStr = localStorage.getItem("currentUser");

    if (!currentUserStr) {
        alert("Has d'iniciar sessió per veure les comandes.");
        window.location.href = "../Login.html";
        return;
    }

    let currentUser;
    try {
        currentUser = JSON.parse(currentUserStr);
    } catch (e) {
        console.error("Error parsejant currentUser", e);
        mostrarError("Has d'iniciar sessió per veure les comandes.");
        window.location.href = "../Login.html";
        return;
    }

    let clientId = Number(currentUser.id);
    if (!clientId) {
        console.error("No s'ha pogut obtenir l'ID del client", currentUser);
        mostrarError("No s'ha pogut identificar el client. Torna a iniciar sessió.");
        window.location.href = "../Login.html";
        return;
    }

    let url = "https://api.serverred.es/Order";

    try {
        let res = await fetch(url);
        if (!res.ok) throw new Error("Error HTTP " + res.status);

        let orders = await res.json();

        // Filtrar només les comandes del client actiu
        let mevesComandes = orders.filter(o => Number(o.client_id) === clientId);

        let tbody = document.querySelector("#taula tbody");
        tbody.innerHTML = "";

        if (mevesComandes.length === 0) {
            tbody.innerHTML = `<tr><td colspan="3">Aquest client no té comandes</td></tr>`;
            return;
        }

        // Afegir les files de les comandes a la taula
        mevesComandes.forEach(o => {
            let tr = document.createElement("tr");

            const totalOrPrice = Number(o.total || o.preu) || 0;

            tr.innerHTML = `
                <td>${o.id}</td>
                <td>${totalOrPrice.toFixed(2)} €</td>
            `;

            let tdAccions = document.createElement("td");
            let btnView = document.createElement("button");
            btnView.innerHTML = `<i class="fa-solid fa-eye"></i>`;
            btnView.title = "Visualitzar comanda";
            btnView.classList.add("accio-icon");

            btnView.addEventListener("click", () => obrirModalComanda(o));

            tdAccions.appendChild(btnView);
            tr.appendChild(tdAccions);

            tbody.appendChild(tr);
        });

    } catch (err) {
        console.error(err);
        mostrarError("Error carregant comandes.");
    }

    function formatData(dataString) {
        if (!dataString) return "";
        const data = new Date(dataString);
        if (isNaN(data)) return dataString;
        const dia = String(data.getDate()).padStart(2, "0");
        const mes = String(data.getMonth() + 1).padStart(2, "0");
        const any = data.getFullYear();
        return `${dia}-${mes}-${any}`;
    }

    function mostrarError(msg) {
        const errorDiv = document.getElementById("missatgeError");
        if (errorDiv) errorDiv.textContent = msg;
    }
}

// Modal
function obrirModalComanda(comanda) {
    const currentUserStr = localStorage.getItem("currentUser");
    const currentUser = currentUserStr ? JSON.parse(currentUserStr) : {};

    const modal = document.getElementById("modalComanda");
    const contingut = document.getElementById("detallsComanda");

    const shippingAmount = Number(comanda.shipping_amount || comanda.enviament) || 0;

    let html = `
        <p><strong>Data:</strong> ${formatData(comanda.date || comanda.data)}</p>
        <p><strong>Client:</strong> ${currentUser.name || currentUser.nom || ""}</p>
        <p><strong>Tipus de pagament:</strong> ${comanda.payment || comanda.pagament || ""}</p>
        <p><strong>Enviament (€):</strong> ${shippingAmount.toFixed(2)}</p>
    `;

    html += `
        <table style="width:100%; border-collapse: collapse; margin-top: 10px;">
            <thead>
                <tr style="background-color:#4B4B8D; color:white;">
                    <th style="border:1px solid #d13d3dff; padding:5px;">Producte</th>
                    <th style="border:1px solid #d13d3dff; padding:5px;">Quantitat</th>
                    <th style="border:1px solid #d13d3dff; padding:5px;">Preu</th>
                    <th style="border:1px solid #d13d3dff; padding:5px;">Descompte</th>
                    <th style="border:1px solid #d13d3dff; padding:5px;">Subtotal</th>
                </tr>
            </thead>
            <tbody>
    `;

    let total = 0;

    if (comanda.items && comanda.items.length > 0) {
        comanda.items.forEach(item => {
            // Provar diferents camps per al nom
            const productName = item.name || item.product_name || item.title || "Nom no disponible";
            const quantity = Number(item.quantity) || 0;
            const price = Number(item.price) || 0;
            const discount = Number(item.discount) || 0;
            const subtotal = price * quantity - discount;
            total += subtotal;

            html += `
                <tr>
                    <td style="border:1px solid #70e610ff; padding:5px;">${productName}</td>
                    <td style="border:1px solid #70e610ff; padding:5px; text-align:center;">${quantity}</td>
                    <td style="border:1px solid #70e610ff; padding:5px; text-align:right;">${price.toFixed(2)}</td>
                    <td style="border:1px solid #70e610ff; padding:5px; text-align:right;">${discount.toFixed(2)}</td>
                    <td style="border:1px solid #70e610ff; padding:5px; text-align:right;">${subtotal.toFixed(2)}</td>
                </tr>
            `;
        });
    }

    const totalAmbEnviament = total + shippingAmount;

    html += `
            <tr>
                <td colspan="4" style="text-align:right; font-weight:bold; border:1px solid #70e610ff; padding:5px;">Total amb enviament (€):</td>
                <td style="text-align:right; font-weight:bold; border:1px solid #70e610ff; padding:5px;">${totalAmbEnviament.toFixed(2)}</td>
            </tr>
            </tbody>
        </table>
    `;

    contingut.innerHTML = html;
    modal.style.display = "block";

    modal.querySelector(".close").onclick = () => modal.style.display = "none";
    window.onclick = (event) => {
        if (event.target === modal) modal.style.display = "none";
    };

    function formatData(dataString) {
        if (!dataString) return "";
        const data = new Date(dataString);
        if (isNaN(data)) return dataString;
        const dia = String(data.getDate()).padStart(2, "0");
        const mes = String(data.getMonth() + 1).padStart(2, "0");
        const any = data.getFullYear();
        return `${dia}-${mes}-${any}`;
    }
}
