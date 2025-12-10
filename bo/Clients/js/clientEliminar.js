document.addEventListener("DOMContentLoaded", main);

async function main() {
    const params = new URLSearchParams(window.location.search);
    const id = parseInt(params.get("id"), 10);

    if (!id) {
        showError("ID de client invàlid.");
        return;
    }

    //  OBTINDRE EL CLIENT DEL SERVIDOR
    const client = await getIdData(url, "Client", id);

    if (!client) {
        showError("Client no trobat.");
        return;
    }

    //  MOSTRAR DETALLS
    mostrarDetallsClient(client);

    const confirmar = document.getElementById("confirmar");
    const cancelar = document.getElementById("cancelar");
    const missatge = document.getElementById("missatge");

    missatge.textContent = `Vols eliminar el client ${client.name} ${client.surname}?`;

    //  ELIMINAR CLIENT
    confirmar.addEventListener("click", async () => {
        const resposta = await deleteData(url, "Client", id);

        alert("🗑️ Client eliminat correctament!");
        window.location.href = "index.html";
    });

    cancelar.addEventListener("click", () => {
        window.location.href = "index.html";
    });
}

function mostrarDetallsClient(c) {
    document.getElementById("detallsClient").innerHTML = `
        <p><strong>ID:</strong> ${c.id}</p>
        <p><strong>Nom:</strong> ${c.name} ${c.surname}</p>
        <p><strong>Email:</strong> ${c.email}</p>
        <p><strong>Telèfon:</strong> ${c.phone}</p>
    `;
}

function showError(msg) {
    document.getElementById("contenedor").innerHTML =
        `<p style="color:red">${msg}</p>
         <button onclick="window.location.href='index.html'">Tornar</button>`;
}

