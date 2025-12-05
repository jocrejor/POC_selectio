


document.addEventListener("DOMContentLoaded", carregarComandes);

async function carregarComandes() {
    //  Recuperar el client loguejat del localStorage
    let currentUserStr = localStorage.getItem("clientActiu");

    if (!currentUserStr) {
        alert("Has d'iniciar sessió per veure les comandes.");
        window.location.href = "../Login.html";
        return;
    }

    let currentUser;
    try {
        currentUser = JSON.parse(currentUserStr);
    } catch (e) {
        console.error("Error parsejant clientActiu", e);
        alert("Hi ha hagut un problema amb la sessió. Torna a iniciar sessió.");
        window.location.href = "../Login.html";
        return;
    }

    //  Obtenir l'ID del client
    let clientId = Number(currentUser.id);
    if (!clientId) {
        console.error("No s'ha pogut obtenir l'ID del client", currentUser);
        alert("No s'ha pogut identificar el client. Torna a iniciar sessió.");
        window.location.href = "../Login.html";
        return;
    }

    //  Fer fetch de les comandes
    let url = "https://api.serverred.es/Order"; // URL de la teva API

    try {
        let res = await fetch(url);
        if (!res.ok) throw new Error("Error HTTP " + res.status);

        let orders = await res.json();

        //  Filtrar només les comandes del client actiu
        let mevesComandes = orders.filter(o => Number(o.client_id) === clientId);

        let tbody = document.querySelector("#taula tbody");
        tbody.innerHTML = "";

        if (mevesComandes.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6">Aquest client no té comandes</td></tr>`;
            return;
        }

        //  Afegir les files de les comandes a la taula
        mevesComandes.forEach(o => {
            let tr = document.createElement("tr");

            tr.innerHTML = `
                <td>${o.id}</td>
                <td>${formatData(o.date || o.data)}</td>
                <td>${currentUser.name || currentUser.nom || ""}</td>
                <td>${o.payment || o.pagament || ""}</td>
                <td>${o.shipping_amount || o.enviament || ""}</td>
            `;

            // ---- ACCIONS ----
            let tdAccions = document.createElement("td");
            let btnView = document.createElement("a");
            btnView.href = `/webFake/backoffice/Comandes/ComandaVisualitza.html?id=${o.id}`;
            btnView.innerHTML = `<i class="fa-solid fa-eye"></i>`;
            btnView.title = "Visualitzar comanda";
            btnView.classList.add("accio-icon");

            tdAccions.appendChild(btnView);
            tr.appendChild(tdAccions);

            tbody.appendChild(tr);
        });

    } catch (err) {
        console.error(err);
        alert("Error carregant comandes");
    }
    // Format data DD-MM-YYYY
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

