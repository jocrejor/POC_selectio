document.addEventListener("DOMContentLoaded", main);

let clients = [];
let paginaActual = 1;
const perPagina = 10;

async function main() {

    clients = await getData(url, "Client");
    thereIsUser('../login.html');

    botonsTancarSessio('../login.html');

    crearBuscador();     // ⬅ ahora sí, el DOM ya existe
    mostrarPaginat();    // ⬅ ahora sí, clients ya tiene datos
}

    


function crearBuscador() {
    const contingut = document.querySelector(".contingut");

    const div = document.createElement("div");
    div.id = "buscadorClients";

    div.innerHTML = `
        <input type="text" id="textCercar" placeholder="Cercar client...">
        <button id="btnBuscar">Cercar</button>
        <button id="btnNetejar">Netejar</button>
    `;

    contingut.insertBefore(div, contingut.children[1]);

    document.getElementById("btnBuscar").addEventListener("click", filtrarClients);
    document.getElementById("btnNetejar").addEventListener("click", () => {
        document.getElementById("textCercar").value = "";
        mostrarPaginat();
    });
}

function filtrarClients() {
    const txt = document.getElementById("textCercar").value.trim().toLowerCase();

    const filtrats = clients.filter(c =>
        c.name.toLowerCase().includes(txt) ||
        c.surname.toLowerCase().includes(txt) ||
        c.email.toLowerCase().includes(txt)
    );

    paginaActual = 1;
    mostrarPaginat(filtrats);
}

function mostrarPaginat(llista = clients) {
    const inici = (paginaActual - 1) * perPagina;
    const final = inici + perPagina;
    const mostrar = llista.slice(inici, final);

    carregarTaula(mostrar);

    crearPaginacio(llista.length);
}

function carregarTaula(llista) {
    const taula = document.getElementById("taulaClients");
    taula.innerHTML = "";

    llista.forEach(client => {
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
}

function crearPaginacio(total) {
    const div = document.getElementById("paginacio");
    div.innerHTML = "";

    const totalPagines = Math.ceil(total / perPagina);

    // Botó anterior
    const btnAnt = document.createElement("button");
    btnAnt.textContent = "Anterior";
    btnAnt.disabled = paginaActual === 1;
    btnAnt.addEventListener("click", () => {
        paginaActual--;
        mostrarPaginat();
    });
    div.appendChild(btnAnt);

    // Botons numerats
    for (let i = 1; i <= totalPagines; i++) {
        const btn = document.createElement("button");
        btn.textContent = i;

        if (i === paginaActual) btn.classList.add("activa");

        btn.addEventListener("click", () => {
            paginaActual = i;
            mostrarPaginat();
        });

        div.appendChild(btn);
    }

    // Botó següent
    const btnSeg = document.createElement("button");
    btnSeg.textContent = "Següent";
    btnSeg.disabled = paginaActual === totalPagines;
    btnSeg.addEventListener("click", () => {
        paginaActual++;
        mostrarPaginat();
    });
    div.appendChild(btnSeg);
}

