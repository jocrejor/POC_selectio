document.addEventListener("DOMContentLoaded", main);

// Dades
let carrets = [];
let detalls = [];
let clients = [];
let elementsTaula = [];
let capcalera = [];

const funcioBorrar = "eliminarCarret";

async function main() {

    thereIsUser("../login.html");
    botonsTancarSessio("../login.html");

    // inputs filtres
    const filtreId = document.getElementById("filtreId");
    const filtreSessio = document.getElementById("filtreSessio");
    const filtreUsuari = document.getElementById("filtreUsuari");
    const botoCercar = document.getElementById("cercar");
    const botoNetejar = document.getElementById("netejar");

    // Carregar dades API
    carrets = await getData(url, "Cart");
    detalls = await getData(url, "CartDetail");
    clients = await getData(url, "Client");

    actualitzarDades();

    // BOTÓ CERCA
    botoCercar.addEventListener("click", e => {
        e.preventDefault();

        let filtrats = carrets;

        if (filtreId.value)
            filtrats = filtrats.filter(c => String(c.id) === filtreId.value);

        if (filtreSessio.value)
            filtrats = filtrats.filter(c => c.session_id.includes(filtreSessio.value));

        if (filtreUsuari.value) {
            const valorFiltre = filtreUsuari.value.toLowerCase();
            
            filtrats = filtrats.filter(c => {
                // Si no té user_agent, comprovar si busca "anònim"
                if (!c.User_agent || !c.User_agent.id) {
                    return "anònim".includes(valorFiltre) || "anonim".includes(valorFiltre);
                }

                // Buscar el client
                const client = clients.find(cl => cl.id === c.User_agent.id);

                // Comprovar si el nom o cognom coincideix amb el filtre
                if (client) {
                    const nomComplet = `${client.name} ${client.surname}`.toLowerCase();
                    return nomComplet.includes(valorFiltre);
                }

                return false;
            });
        }
        
        paginaActual = 1; // Reiniciar a la primera pàgina
        actualitzarDades(filtrats);
    });

    // BOTÓ NETEJAR
    botoNetejar.addEventListener("click", e => {
        e.preventDefault();
        filtreId.value = "";
        filtreSessio.value = "";
        filtreUsuari.value = "";
        paginaActual = 1; // Reiniciar a la primera pàgina
        actualitzarDades();
    });
}

// Crear elements taula
function crearElementsTaula(carretsFiltrats = null) {
    elementsTaula = [];
    capcalera = ["ID", "Session ID", "Usuari", "Data", "Total (€)", "Accions"];

    const arrayCarrets = carretsFiltrats || carrets;

    arrayCarrets.forEach(c => {
        // Buscar el client si existeix user_agent
        let usuari = "Anònim";
        if (c.User_agent && c.User_agent.id) {
            const client = clients.find(cl => cl.id === c.User_agent.id);
            if (client) {
                usuari = `${client.name} ${client.surname}`;
            }
        }

        elementsTaula.push({
            id: c.id,
            session_id: c.session_id,
            usuari: usuari,
            date: new Date(c.date).toLocaleString(),
            total_amount: c.total_amount.toFixed(2)
        });
    });
}

function mostraTaula(elements) {
    const taula = document.getElementById("taula");

    // Eliminar tots els fills de la taula 
    while (taula.firstChild) {
        taula.removeChild(taula.firstChild);
    }

    // CAPÇALERA
    const trCap = document.createElement("tr");

    capcalera.forEach(c => {
        const th = document.createElement("th");
        const text = document.createTextNode(c);
        th.appendChild(text);
        trCap.appendChild(th);
    });

    taula.appendChild(trCap);

    // FILES 
    elements.forEach(el => {
        const tr = document.createElement("tr");

        // Camps normals
        Object.keys(el).forEach(k => {
            const td = document.createElement("td");
            const text = document.createTextNode(el[k]);
            td.appendChild(text);
            tr.appendChild(td);
        });

        // ACCIONS
        const tdAccions = document.createElement("td");

        // Icona de detalls (visualitzar)
        const linkDetalls = document.createElement("a");
        linkDetalls.className = "icon-visualitzar";
        linkDetalls.href = "#";
        const iconaDetalls = document.createElement("i");
        iconaDetalls.className = "fa-solid fa-eye";
        linkDetalls.appendChild(iconaDetalls);
        linkDetalls.addEventListener("click", (e) => {
            e.preventDefault();
            veureDetalls(el.id);
        });
        tdAccions.appendChild(linkDetalls);

        // Icona de borrar
        const linkBorrar = document.createElement("a");
        linkBorrar.className = "icon-borrar";
        linkBorrar.href = "#";
        const iconaBorrar = document.createElement("i");
        iconaBorrar.className = "fa-solid fa-trash";
        linkBorrar.appendChild(iconaBorrar);
        linkBorrar.addEventListener("click", (e) => {
            e.preventDefault();
            eliminarCarret(el.id);
        });
        tdAccions.appendChild(linkBorrar);

        tr.appendChild(tdAccions);
        taula.appendChild(tr);
    });
}

// borrar carrets
async function eliminarCarret(id) {
    if (confirm("Segur que vols eliminar este carret?")) {
        await deleteData(url, "Cart", id);
        carrets = await getData(url, "Cart");
        actualitzarDades();
    }
}

// OBIR MODAL AMB ELS DETALLS DEL CARRET
function veureDetalls(idCarret) {
    const detallsCarret = detalls.filter(d => d.Cart.id === idCarret);

    // Crear modal
    const modal = document.createElement("div");
    modal.className = "modal";
    modal.id = "modalDetalls";
    modal.style.display = "block";

    const modalContent = document.createElement("div");
    modalContent.className = "modal-content";

    // Botó tancar
    const botoTancar = document.createElement("span");
    botoTancar.className = "modal-close";
    botoTancar.textContent = "×";
    botoTancar.addEventListener("click", tancarModal);
    modalContent.appendChild(botoTancar);

    // Títol
    const titol = document.createElement("h3");
    titol.textContent = `Detalls del carret #${idCarret}`;
    modalContent.appendChild(titol);

    if (detallsCarret.length === 0) {
        const missatge = document.createElement("p");
        missatge.textContent = "No hi ha productes en aquest carret";
        modalContent.appendChild(missatge);
    } else {
        // Crear taula de detalls
        const taula = document.createElement("table");
        taula.className = "taula-detalls";

        // Capçalera taula
        const thead = document.createElement("thead");
        const trHead = document.createElement("tr");
        const capsDetalls = ["Producte ID", "Quantitat", "Preu unitari", "Descompte", "Subtotal"];
        
        capsDetalls.forEach(cap => {
            const th = document.createElement("th");
            th.textContent = cap;
            trHead.appendChild(th);
        });
        
        thead.appendChild(trHead);
        taula.appendChild(thead);

        // Cos taula
        const tbody = document.createElement("tbody");
        let totalCarret = 0;

        detallsCarret.forEach(d => {
            const tr = document.createElement("tr");
            
            const subtotal = d.quantity * d.price * (1 - d.discount / 100);
            totalCarret += subtotal;

            // Producte ID
            const tdProducte = document.createElement("td");
            tdProducte.textContent = d.Product.id;
            tr.appendChild(tdProducte);

            // Quantitat
            const tdQuantitat = document.createElement("td");
            tdQuantitat.textContent = d.quantity;
            tr.appendChild(tdQuantitat);

            // Preu
            const tdPreu = document.createElement("td");
            tdPreu.textContent = `${d.price.toFixed(2)}€`;
            tr.appendChild(tdPreu);

            // Descompte
            const tdDescompte = document.createElement("td");
            tdDescompte.textContent = `${d.discount}%`;
            tr.appendChild(tdDescompte);

            // Subtotal
            const tdSubtotal = document.createElement("td");
            tdSubtotal.textContent = `${subtotal.toFixed(2)}€`;
            tr.appendChild(tdSubtotal);

            tbody.appendChild(tr);
        });

        taula.appendChild(tbody);

        // Total
        const tfoot = document.createElement("tfoot");
        const trTotal = document.createElement("tr");
        const tdTotal = document.createElement("td");
        tdTotal.colSpan = 4;
        tdTotal.textContent = "Total:";
        tdTotal.style.textAlign = "right";
        tdTotal.style.fontWeight = "bold";
        
        const tdTotalAmount = document.createElement("td");
        tdTotalAmount.textContent = `${totalCarret.toFixed(2)}€`;
        tdTotalAmount.style.fontWeight = "bold";
        
        trTotal.appendChild(tdTotal);
        trTotal.appendChild(tdTotalAmount);
        tfoot.appendChild(trTotal);
        taula.appendChild(tfoot);

        modalContent.appendChild(taula);
    }

    modal.appendChild(modalContent);

    // Afegir al body
    document.body.appendChild(modal);

    // Tancar en clicar fora del modal
    modal.addEventListener("click", (e) => {
        if (e.target === modal) {
            tancarModal();
        }
    });
}

function tancarModal() {
    const modal = document.getElementById("modalDetalls");
    if (modal) {
        modal.remove();
    }
}

// PAGINACIÓ
function actualitzarDades(carretsFiltrats = null) {
    const arrayCarrets = carretsFiltrats || carrets;

    crearElementsTaula(arrayCarrets);
    carregarArray(elementsTaula);
    creaPagines();

    const paginats = aplicarPaginacio(elementsTaula);
    mostraTaula(paginats);
}