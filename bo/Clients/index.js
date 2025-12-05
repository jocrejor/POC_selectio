document.addEventListener("DOMContentLoaded", main);

async function main() {
    const clients = await getData(url, "Client");
    clientsGlobals = clients;   // Guardem tots els clients
    carregarClients(clientsGlobals); // Carreguem la primera pàgina
}

function carregarClients(clients) {
    const taula = document.getElementById("taulaClients");
    taula.innerHTML = "";

    // Calcular rang de la pàgina
    const inici = (paginaActual - 1) * filesPerPagina;
    const final = inici + filesPerPagina;

    // Extreure els clients de la pàgina actual
    const clientsPagina = clients.slice(inici, final);

    clientsPagina.forEach(client => {
        const fila = document.createElement("tr");

        fila.innerHTML = `
            <td>${client.id}</td>
            <td>${client.name}</td>
            <td>${client.surname}</td>
            <td>${client.address}</td>
            <td>${client.phone}</td>
            <td>${client.email}</td>
            <td>
                <button class="icon-editar" onclick="window.location.href='clientEditar.html?id=${client.id}'">
                    <i class="fa-solid fa-pen-to-square"></i>
                </button>
                <button class="icon-borrar" onclick="window.location.href='clientEliminar.html?id=${client.id}'">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </td>
        `;

        taula.appendChild(fila);
    });

    // Actualitzar paginació
    mostrarPaginacio(clients.length);
}



let paginaActual = 1;
const filesPerPagina = 10;
let clientsGlobals = [];

function mostrarPaginacio(total) {
    const totalPagines = Math.ceil(total / filesPerPagina);
    const div = document.getElementById("paginacio");
    div.innerHTML = "";

    for (let i = 1; i <= totalPagines; i++) {
        const boto = document.createElement("button");
        boto.textContent = i;

        // Aplicar estil a la pàgina seleccionada
        if (i === paginaActual) {
            boto.classList.add("paginaSeleccionada");
            boto.disabled = true;
        }

        boto.addEventListener("click", () => {
            paginaActual = i;
            carregarClients(clientsGlobals);
        });

        div.appendChild(boto);
    }
}

