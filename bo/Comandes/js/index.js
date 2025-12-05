/*Esperem que tot el DOM estiga carregat abans d'executar la funcio main */
document.addEventListener("DOMContentLoaded", main);

async function main() {
    // Carreguem dades globals del API
    Order = await getData(url, "Order");
    Orderdetail = await getData(url, "Orderdetail");
    Client = await getData(url, "Client");
    Product = await getData(url, "Product");

    carregarDades();
    carregarClientsSelect();
    mostrarComandes();


    // Configuració botons
    let botoAfegir = document.getElementById("afegirPedido");
    if (botoAfegir) {
        botoAfegir.addEventListener("click", () => {
            window.location.href = "ComandaAlta.html";
        });
    }
    // Agafem filtres de data, client i pagament
    let dataDesde = document.getElementById("data_desde");
    let dataFins = document.getElementById("data_fins");
    let inputClient = document.getElementById("filtrar_client");
    let btnFiltrar = document.getElementById("aplicarFiltres");
    let selectPagament = document.getElementById("payment");

    // Afegim listeners per actualitzar la llista de comandes quan canvien els filtres
    if (dataDesde) dataDesde.addEventListener("change", mostrarComandes);
    if (dataFins) dataFins.addEventListener("change", mostrarComandes);
    if (inputClient) inputClient.addEventListener("input", mostrarComandes);
    if (selectPagament) selectPagament.addEventListener("change", mostrarComandes);
    if (btnFiltrar) {
        btnFiltrar.type = "button";
        btnFiltrar.addEventListener("click", (ev) => {
            ev.preventDefault();
            mostrarComandes();
        });
    }
    // Configurar datepickers amb jQuery UI
    // Inicialitza el datepicker per als inputs #data_desde i #data_fins
    $("#data_desde, #data_fins").datepicker({
        // Format de la data que es mostrarà
        dateFormat: "dd-mm-yy",
        // Noms dels dies de la setmana
        dayNamesMin: ["Dg", "Dl", "Dm", "Dc", "Dj", "Dv", "Ds"],
        // Noms dels mesos
        monthNames: ["Gener", "Febrer", "Març", "Abril", "Maig", "Juny",
            "Juliol", "Agost", "Setembre", "Octubre", "Novembre", "Desembre"],
        // El primer dia de la setmana serà dilluns
        firstDay: 1,
        // Abans de mostrar el calendari
        beforeShow: function (input, inst) {
            // S’espera que el calendari es dibuixi i després s’apliquen els colors
            setTimeout(() => {
                aplicarColors();
            }, 0);
        },
        // Quan es canvia de mes o d’any al calendari
        onChangeMonthYear: function () {
            // Torna a aplicar els colors perquè el contingut es redibuixa
            setTimeout(() => {
                aplicarColors();
            }, 0);
        },
        // Quan se selecciona una data
        onSelect: mostrarComandes // Crida la funció mostrarComandes()
    });
}

// Variables globals
let paginaActual = 1;
let COMANDES_PER_PAGINA = 5;
let comandesTotals = [];

function carregarClientsSelect() {
    let llistaClients = (Client || []).map(c => ({
        label: `${c.name} ${c.surname}`,
        value: `${c.name} ${c.surname}`,
        id: c.id
    }));

    $("#filtrar_client").autocomplete({
        source: llistaClients,
        minLength: 1,

        select: function (event, ui) {
            $("#filtrar_client").val(ui.item.label);
            $("#clientIdFiltrat").val(ui.item.id);
            mostrarComandes();
            return false;
        },

        change: function () {
            if (!this.value.trim()) {
                $("#clientIdFiltrat").val("");
                mostrarComandes();
            }
        }
    });
}

// Funció que aplica colors al calendari
function aplicarColors() {
    $(".ui-datepicker-month, .ui-datepicker-year, .ui-datepicker th span").css({
        "color": "black"
    });
}

// Formata data
function formatDataDDMMYYYY(dataString) {
    if (!dataString) return "Error data";

    dataString = String(dataString);

    // Si veniu en ISO: 2025-06-11T22:00:00.000Z → ens quedem amb la part de la data
    if (dataString.includes("T")) {
        dataString = dataString.split("T")[0];
    }

    // Si veniu amb espai: "2025-06-11 22:00:00" ens quedem amb la part de la data
    if (dataString.includes(" ")) {
        dataString = dataString.split(" ")[0];
    }

    // Si ja té format dd-mm-yyyy la tornem tal qual
    if (/^\d{2}-\d{2}-\d{4}$/.test(dataString)) return dataString;

    // Si està en format yyyy-mm-dd la convertim a dd-mm-yyyy
    if (/^\d{4}-\d{2}-\d{2}$/.test(dataString)) {
        const [yyyy, mm, dd] = dataString.split("-");
        return `${dd}-${mm}-${yyyy}`;
    }

    // Per si ve en un altre format rar
    return dataString;
}

//Convertir a string dd-mm-yyyy a objecte date
/*function parseDateDDMMYYYY(dateString) {
    const [dd, mm, yyyy] = dateString.split("-");
    return new Date(`${dd}-${mm}-${yyyy}`);

}*/

function parseDateDDMMYYYY(dateString) {
    const [dd, mm, yyyy] = dateString.split("-");
    return new Date(yyyy, mm - 1, dd);
}


// Mostrar errors
function mostrarError(missatge) {
    console.error(missatge);
    let contError = document.getElementById("errors");
    if (!contError) {
        contError = document.createElement("div");
        contError.id = "errors";
        contError.style.color = "red";
        contError.style.margin = "10px 0";
        document.body.prepend(contError);
    }
    let p = document.createElement("p");
    p.appendChild(document.createTextNode(missatge));
    contError.appendChild(p);
}

//Borrar errors
function esborrarErrors() {
    let contError = document.getElementById("errors");
    if (contError) contError.replaceChildren();
}


// Carrega dades de comandes
function carregarDades() {
    console.log("Order des de la API:", Order);
    console.log("Client des de la API:", Client);
    if (!Order || Order.length === 0) {
        mostrarError("No hi ha comandes disponibles.");
        comandesTotals = [];
        return;
    }
    // Order ve dins un array d'objectes
    let ordersArray = Array.isArray(Order[0]) ? Order[0] : Order;

    comandesTotals = ordersArray.map(o => {
        let productes = (Orderdetail || [])
            .filter(d => Number(d.order_id) === Number(o.id))
            .map(d => ({
                producte: `Producte ${d.product_id}`,
                quantitat: Number(d.quantity) || 0,
                preu: Number(d.price) || 0,
                descompte: Number(d.discount) || 0
            }));
        //Busquem el client associat
        let clientIdOrder = String(o.client_id).trim();
        let cli = (Client || []).find(c => String(
            c.id
        ).trim() === clientIdOrder) || {};
        let clientNom = cli.name && cli.surname ? `${cli.name
            } ${cli.surname}`
            : "Client desconegut";

        return {
            id: o.id,
            data: o.data || o.date || o.order_date || "Error",
            client: clientNom,
            clientId: cli.id || null,
            pagament: o.pagament || o.payment || o.payment_method || "Error",
            enviament: Number(o.enviament || o.shipping_amount || o.shipping_cost || 0),
            productes: productes
        };
    });
}
//Validem i formatejem input de data
function formatInputDate(input) {
    input.addEventListener("blur", function () {
        let v = this.value.trim();
        if (!v) return;

        // Ve yyyy-mm-dd heu convertim
        if (/^\d{4}-\d{2}-\d{2}$/.test(v)) {
            const [yyyy, mm, dd] = v.split("-");
            this.value = `${dd}-${mm}-${yyyy}`;
        }
    });
}

// Filtrar comandes segons els filtres 
function filtrarComandes(comandes) {
    let dataDesde = document.getElementById("data_desde").value;
    let dataFins = document.getElementById("data_fins").value;
    /*let clientId = document.getElementById("filtrar_client").value;*/
    let clientId = document.getElementById("clientIdFiltrat").value;

    let pagament = document.getElementById("payment").value;

    return comandes.filter(c => {
        let ok = true;

        // Convertim la data de la comanda 
        (
            c.data
        )
        let dataComanda = parseDateDDMMYYYY(formatDataDDMMYYYY(
            c.data
        ));

        // Convertim tambe els filtros si l'usuari també te filtros el ususari escribint dd-mm-yyyy
        if (dataDesde) {
            let desde = parseDateDDMMYYYY(formatDataDDMMYYYY(dataDesde));
            ok = ok && dataComanda >= desde;
        }

        if (dataFins) {
            let fins = parseDateDDMMYYYY(formatDataDDMMYYYY(dataFins));
            ok = ok && dataComanda <= fins;
        }

        if (clientId) ok = ok && c.clientId == Number(clientId);
        if (pagament) ok = ok && c.pagament.toLowerCase().includes(pagament.toLowerCase());
        return ok;
    });
}


let isMobileMode = window.innerWidth <= 767; // mòbil si amplada ≤ 767px
// Funció debounce simple
function debounce(func, wait = 150) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}
// Redibuixar només si canvia el mode (desktop ↔ mòbil)
function checkResize() {
    const currentMode = window.innerWidth <= 767;
    if (currentMode !== isMobileMode) {
        isMobileMode = currentMode;
        mostrarComandes();
    }
}
window.addEventListener("resize", debounce(checkResize, 150));

// Funció principal per mostrar comandes
function mostrarComandes() {
    esborrarErrors();

    let tbody = document.getElementById("llistaComandes");
    if (!tbody) {
        mostrarError("No s'ha trobat el tbody de comandes.");
        return;
    }

    tbody.innerHTML = "";

    let comandes = filtrarComandes(comandesTotals);

    if (comandes.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;">No hi ha comandes.</td></tr>`;
        return;
    }
    // ---- PAGINACIÓ ----
    let perPag = COMANDES_PER_PAGINA;
    let totalPagines = Math.ceil(comandes.length / perPag);

    if (paginaActual > totalPagines) paginaActual = totalPagines;
    if (paginaActual < 1) paginaActual = 1;

    let inici = (paginaActual - 1) * perPag;
    let final = inici + perPag;
    let llista = comandes.slice(inici, final);


    //Mostrar Comandes
    llista.forEach((c, index) => {
        let total = (c.productes || []).reduce((acc, p) =>
            acc + (p.quantitat * p.preu * (1 - (p.descompte || 0) / 100))
            , 0);
        total += c.enviament || 0;

        if (isMobileMode) {
            // Format vertical mòbil amb labels en negreta i color negre
            const camps = [
                { label: "ID", value: c.id },
                { label: "Data", value: formatDataDDMMYYYY(c.data) },
                { label: "Client", value: c.client },
                { label: "Pagament", value: c.pagament },
                { label: "Enviament", value: (+c.enviament).toFixed(2) + "€" },
                { label: "Total", value: total.toFixed(2) + "€" }
            ];

            camps.forEach(camp => {
                let tr = document.createElement("tr");
                let td = document.createElement("td");
                td.innerHTML = `<strong style="color:black">${camp.label}:</strong> ${camp.value}`;
                tr.appendChild(td);
                tbody.appendChild(tr);
            });

            // Accions
            let trAccions = document.createElement("tr");
            let tdAccions = document.createElement("td");
            tdAccions.innerHTML = `
        <a class="icon-editar" href="ComandaVisualitza.html?id=${c.id}">
            <i class="fa-solid fa-eye"></i>
        </a>
        <a class="icon-editar" href="ComandaModificar.html?id=${c.id}">
            <i class="fa-solid fa-pen-to-square"></i>
        </a>
        <a class="icon-borrar" href="#" onclick="eliminarComanda(${index})">
            <i class="fa-solid fa-trash"></i>
        </a>`;
            trAccions.appendChild(tdAccions);
            tbody.appendChild(trAccions);
        }

        else {
            // Format taula normal
            let tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${c.id}</td>
                <td>${formatDataDDMMYYYY(c.data)}</td>
                <td>${c.client}</td>
                <td>${c.pagament}</td>
                <td>${(+c.enviament).toFixed(2)}€</td>
                <td>${total.toFixed(2)}€</td>
                <td>
                    <a class="icon-editar" href="ComandaVisualitza.html?id=${c.id}">
                        <i class="fa-solid fa-eye"></i>
                    </a>
                    <a class="icon-editar" href="ComandaModificar.html?id=${c.id}">
                        <i class="fa-solid fa-pen-to-square"></i>
                    </a>
                    <a class="icon-borrar" href="#" onclick="eliminarComanda(${index})">
                        <i class="fa-solid fa-trash"></i>
                    </a>
                </td>`;
            tbody.appendChild(tr);
        }
    });
    actualizarPaginacio(totalPagines);

}
function actualizarPaginacio(totalPagines) {

    const btnAnterior = document.getElementById("anterior");
    const btnPosterior = document.getElementById("posterior");
    const contPagines = document.getElementById("pagines");

    if (!btnAnterior || !btnPosterior || !contPagines) return;

    contPagines.innerHTML = "";

    //  BOTÓ ANTERIOR 
    if (paginaActual <= 1) {
        btnAnterior.classList.add("no_mostrar");
    } else {
        btnAnterior.classList.remove("no_mostrar");
    }

    btnAnterior.onclick = () => {
        if (paginaActual > 1) {
            paginaActual--;
            mostrarComandes();
        }
    };

    //  BOTONS NUMÈRICS 
    for (let i = 1; i <= totalPagines; i++) {
        const boto = document.createElement("button");
        boto.textContent = i;

        if (i === paginaActual) {
            boto.classList.add("paginaSeleccionada");
        }

        boto.addEventListener("click", () => {
            paginaActual = i;
            mostrarComandes();
        });

        contPagines.appendChild(boto);
    }

    //  BOTÓ SEGÜENT 
    if (paginaActual >= totalPagines) {
        btnPosterior.classList.add("no_mostrar");
    } else {
        btnPosterior.classList.remove("no_mostrar");
    }

    btnPosterior.onclick = () => {
        if (paginaActual < totalPagines) {
            paginaActual++;
            mostrarComandes();
        }
    };
}

// Accions de visualitzar, modificar i eliminar
function visualitzarComanda(index) {
    let comanda = comandesTotals[index];
    if (!comanda) return;
    window.location.href = `ComandaVisualitza.html?id=${comanda.id}`;
}


function modificarComanda(index) {
    const comanda = comandesTotals[index];
    if (!comanda) return;

    window.location.href = `ComandaModificar.html?id=${comanda.id}`;
}

function eliminarComanda(index) {
    const comanda = comandesTotals[index];
    if (!comanda) return;

    // Crida la funció que elimina la comanda de la base de dades
    eliminarPedido(comanda.id)
        .then(() => {
            // Després de l'eliminació, recarregar les dades locals
            comandesTotals.splice(index, 1);
            mostrarComandes();
        })
        .catch(err => {
            console.error("No s'ha pogut eliminar la comanda:", err);
            alert("Error en eliminar la comanda.");
        });
}
