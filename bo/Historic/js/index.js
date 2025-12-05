document.addEventListener("DOMContentLoaded", main);

async function main() {

    thereIsUser("../login.html");

    botonsTancarSessio("../login.html");

    const tbody = document.getElementById('tableBody');
    const btnAfegir = document.getElementById("afegirNou");

    const filtreClient = document.getElementById("filtreClient");
    const filtreComparador = document.getElementById("filtreComparador");
    const filtreFavorit = document.getElementById("filtreFavorit");
    const dataDesde = document.getElementById("dataDesde");
    const dataFins = document.getElementById("dataFins");
    const btnFiltrar = document.getElementById("btnFiltrar");
    const btnReset = document.getElementById("btnReset");
    
    //JQuery - Datepickers per a les dades
    $("#dataDesde, #dataFins").datepicker({
        dateFormat: 'dd-mm-yy',
        changeYear: true
    });

    // Variables globals per a la paginació
    window.paginaActual = 1;
    window.registresFiltrats = [];
window.actualitzarDades = function() {
        actualitzarTaula();
    };
    // -----------------------------
    // CARREGAR DADES DES DE L'API
    // -----------------------------
    const [clients, favorits, comparadors, registres, productes, enllaçosComparador] = await Promise.all([
        carregarClientsApi(),
        carregarFavoritsApi(),
        carregarComparadorsApi(),
        carregarRegistresApi(),
        carregarProductesApi(),
        carregarCompararProductesApi()
    ]);

    // Guardar registres originals
    window.registresOriginals = registres;

    // Variables per guardar els IDs seleccionats
    let clientSelecId = null;
    let favoritSelecId = null;
    let comparadorSelecId = null;

    // -----------------------------
    // CONFIGURAR AUTOCOMPLETE AMB JQUERY
    // -----------------------------
    
    // Autocomplete per Client
    const dadesClients = clients.map(c => ({
        label: `${c.name || ''} ${c.surname || ''}`.trim() || c.id,
        value: `${c.name || ''} ${c.surname || ''}`.trim() || c.id,
        id: c.id
    }));

    $("#filtreClient").autocomplete({
        source: dadesClients,
        minLength: 0,
        select: function(event, ui) {
            clientSelecId = ui.item.id;
            $(this).data('selectedId', ui.item.id);
        },
        change: function(event, ui) {
            if (!ui.item) {
                clientSelecId = null;
                $(this).val('');
                $(this).removeData('selectedId');
            }
        }
    }).focus(function() {
        $(this).autocomplete("search", $(this).val());
    });

    // Autocomplete per Comparador (session_id)
    const dadesComparadors = registres.map(r => ({
        label: `${r.session_id || r.id || ''}`,
        value: `${r.session_id || r.id || ''}`,
        id: r.comparator_id || r.id,
        session_id: r.session_id
    })).filter((item, index, self) => 
        index === self.findIndex((t) => t.session_id === item.session_id)
    );

    $("#filtreComparador").autocomplete({
        source: dadesComparadors,
        minLength: 0,
        select: function(event, ui) {
            comparadorSelecId = ui.item.session_id || ui.item.id;
            $(this).data('selectedId', comparadorSelecId);
        },
        change: function(event, ui) {
            if (!ui.item) {
                comparadorSelecId = null;
                $(this).val('');
                $(this).removeData('selectedId');
            }
        }
    }).focus(function() {
        $(this).autocomplete("search", $(this).val());
    });

    // Autocomplete per Favorit
    const dadesFavorits = favorits.map(f => ({
        label: `${f.id} - ${f.product_name || f.name || 'Favorit'}`,
        value: `${f.id} - ${f.product_name || f.name || 'Favorit'}`,
        id: f.id
    }));

    $("#filtreFavorit").autocomplete({
        source: dadesFavorits,
        minLength: 0,
        select: function(event, ui) {
            favoritSelecId = ui.item.id;
            $(this).data('selectedId', ui.item.id);
        },
        change: function(event, ui) {
            if (!ui.item) {
                favoritSelecId = null;
                $(this).val('');
                $(this).removeData('selectedId');
            }
        }
    }).focus(function() {
        $(this).autocomplete("search", $(this).val());
    });

    // -----------------------------
    // EVENTS
    // -----------------------------
    btnAfegir.addEventListener("click", () => {
        sessionStorage.removeItem("editIndex");
        window.location.href = "./HistoricForm.html";
    });

    // Funció per actualitzar la taula amb la paginació
    function actualitzarTaula() {
        // Aplicar la paginació als registres filtrats
        const registresPagina = aplicarPaginacio(window.registresFiltrats);
        mostrarRegistresTaula(registresPagina, clients);
        
        // Actualitzar la paginació
        carregarArray(window.registresFiltrats);
        creaPagines();
    }

    // Filtrar amb jQuery
    $(btnFiltrar).click(function (e) {
        e.preventDefault();

        window.paginaActual = 1;
        const filtres = {
            idClient: clientSelecId || "",
            idComparador: comparadorSelecId || "",
            idFavorit: favoritSelecId || "",
            desde: $('#dataDesde').val(),
            fins: $('#dataFins').val(),
        };
        
        window.registresFiltrats = aplicarFiltres(window.registresOriginals, filtres);
        actualitzarTaula();
    });

    // Netejar filtres
    $(btnReset).click(function (e) {
        e.preventDefault();

        $("#filtreClient, #filtreComparador, #filtreFavorit").val('');
        $("#dataDesde, #dataFins").val('');
        
        // Resetejar IDs seleccionats
        clientSelecId = null;
        favoritSelecId = null;
        comparadorSelecId = null;

        window.paginaActual = 1;
        window.registresFiltrats = window.registresOriginals;
        actualitzarTaula();
    });

    // Tancar modals en fer clic al fons del modal
    window.addEventListener('click', (event) => tancarModals(event));

    // Tancar modals en fer clic al botó de tancament
    const botosTancament = document.querySelectorAll('.modal-close');
    botosTancament.forEach(btnTancar => {
        btnTancar.addEventListener('click', function(e) {
            e.preventDefault();
            const modalActiu = this.closest('.modal');
            if (modalActiu) {
                modalActiu.classList.add('ocult');
                modalActiu.style.display = 'none';
            }
        });
    });

    // Inicialitzar amb tots els registres
    window.registresFiltrats = window.registresOriginals;
    actualitzarTaula();
}

// -----------------------------
// FUNCIONS DE CÀRREGA DE DADES
// -----------------------------
async function carregarClientsApi() {
    try {
        const data = await getData(url, "Client");
        return Array.isArray(data) ? data : (data?.Client ?? []);
    } catch {
        const local = localStorage.getItem("Client");
        return local ? JSON.parse(local) : [];
    }
}

async function carregarFavoritsApi() {
    try {
        const data = await getData(url, "Favorite");
        return Array.isArray(data) ? data : (data?.Favorite ?? []);
    } catch {
        const local = localStorage.getItem("Favorite");
        return local ? JSON.parse(local) : [];
    }
}

async function carregarComparadorsApi() {
    try {
        const data = await getData(url, "Comparator");
        return Array.isArray(data) ? data : (data?.Comparator ?? []);
    } catch {
        const local = localStorage.getItem("Comparator");
        return local ? JSON.parse(local) : [];
    }
}

async function carregarRegistresApi() {
    try {
        const data = await getData(url, "Register");
        return Array.isArray(data) ? data : (data?.Register ?? []);
    } catch {
        const local = localStorage.getItem("Register");
        return local ? JSON.parse(local) : [];
    }
}

async function carregarProductesApi() {
    try {
        const data = await getData(url, "Product");
        return Array.isArray(data) ? data : (data?.Product ?? []);
    } catch {
        const local = localStorage.getItem("productes");
        return local ? JSON.parse(local) : [];
    }
}

async function carregarCompararProductesApi() {
    try {
        const data = await getData(url, "compararProductes");
        return Array.isArray(data) ? data : (data?.compararProductes ?? []);
    } catch (error) {
        console.warn("No s'ha pogut carregar compararProductes des de l'API, s'utilitzaran dades locals:", error);
        const local = localStorage.getItem("compararProductes");
        return local ? JSON.parse(local) : [];
    }
}
// ========================================
// FUNCIONS DELS MODALS 
// ========================================

function tancarModals(event) {
    const modalsActius = ["modalClient", "modalComparador", "modalFavorit"];
    modalsActius.forEach(idModal => {
        const modalElement = document.getElementById(idModal);
        if (event.target === modalElement) {
            modalElement.classList.add("ocult");
            modalElement.style.display = "none";
        }
    });
}


async function mostraClientModal(idClient) {
    const clientsCarregats = await carregarClientsApi();
    const clientBuscat = clientsCarregats.find(c => String(c.id) === String(idClient));

    const modalClient = document.getElementById("modalClient");
    const contingutModal = document.getElementById("modalClientContent");

    if (!clientBuscat) {
        contingutModal.innerHTML = '<p>Client no trobat.</p>';
    } else {
        let htmlContent = '';
        const campsClient = {
            "ID": clientBuscat.id,
            "Tipus d'identificació": clientBuscat.taxidtype,
            "Identificador": clientBuscat.taxid,
            "Nom": clientBuscat.name,
            "Cognom": clientBuscat.surname,
            "Email": clientBuscat.email,
            "Telèfon": clientBuscat.phone,
            "Data de naixement": clientBuscat.birth_date,
            "Adreça": clientBuscat.address,
            "CP": clientBuscat.cp,
            "ID País": clientBuscat.country_id,
            "ID Província": clientBuscat.province_id,
            "ID Ciutat": clientBuscat.city_id
        };
        for (const [clau, valor] of Object.entries(campsClient)) {
            htmlContent += `<p><strong>${clau}:</strong> ${valor ?? '-'}</p>`;
        }
        contingutModal.innerHTML = htmlContent;
    }
    // Mostrar el modal: eliminar la classe ocult i fer display block
    modalClient.classList.remove("ocult");
    modalClient.style.display = "flex";
}

async function mostraFavoritModal(idFavorit) {
    const favoritCarregats = await carregarFavoritsApi();
    const favoritBuscat = favoritCarregats.find(f => String(f.id) === String(idFavorit));

    const modalFavorit = document.getElementById("modalFavorit");
    const contingutModal = document.getElementById("modalFavoritContent");

    if (!favoritBuscat) {
        contingutModal.innerHTML = '<p>Favorit no trobat.</p>';
    } else {
        let htmlContent = '';
        const campsFavorit = {
            "ID": favoritBuscat.id,
            "Nom": favoritBuscat.name,
            "Nom producte": favoritBuscat.product_name,
            "ID Producte": favoritBuscat.product_id
        };
        for (const [clau, valor] of Object.entries(campsFavorit)) {
            if (valor !== undefined) {
                htmlContent += `<p><strong>${clau}:</strong> ${valor ?? '-'}</p>`;
            }
        }
        contingutModal.innerHTML = htmlContent;
    }
    // Mostrar el modal: eliminar la classe ocult i fer display block
    modalFavorit.classList.remove("ocult");
    modalFavorit.style.display = "flex";
}

async function mostraComparadorModal(idComparador) {
    const registresCarregats = await carregarRegistresApi();
    const productesCarregats = await carregarProductesApi();
    const enllaçosComparador = await carregarCompararProductesApi();

    const modalComparador = document.getElementById("modalComparador");
    const contingutModal = document.getElementById("modalComparadorContent");
    const contingutProductes = document.getElementById("modalComparadorProducts");

    const registreBuscat = registresCarregats.find(r => 
        String(r.comparator_id) === String(idComparador) || 
        String(r.session_id) === String(idComparador)
    );

    if (!registreBuscat) {
        contingutModal.innerHTML = '<p>Comparador no trobat.</p>';
        contingutProductes.innerHTML = '';
    } else {
        let htmlContent = '';
        const campsComparador = {
            "ID Sessió": registreBuscat.session_id,
            "User Agent": registreBuscat.user_agent,
            "Data inici": registreBuscat.date_start ? new Date(registreBuscat.date_start).toLocaleDateString("es-ES", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit"
            }) : '-',
            "Data fi": registreBuscat.date_end ? new Date(registreBuscat.date_end).toLocaleDateString("es-ES", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit"
            }) : '-'
        };
        for (const [clau, valor] of Object.entries(campsComparador)) {
            htmlContent += `<p><strong>${clau}:</strong> ${valor}</p>`;
        }
        contingutModal.innerHTML = htmlContent;

        // Mostrar els productes relacionats amb el comparador
        const productesPerComparador = enllaçosComparador.filter(item => String(item.sessionId) === String(registreBuscat.session_id));
        let htmlProductes = '';

        if (productesPerComparador.length === 0) {
            htmlProductes = '<p>No hi ha productes associats.</p>';
        } else {
            // Iterar sobre els productes del comparador
            productesPerComparador.forEach(item => {
                const prod = Array.isArray(productesCarregats) ? productesCarregats[item.product] : productesCarregats?.[item.product];
                if (prod) {
                    htmlProductes += `<div class="modal-product-item">`;
                    htmlProductes += `<h4>${prod.name}</h4>`;
                    htmlProductes += `<p>${prod.descripton || ''}</p>`;
                    htmlProductes += `<p><strong>Preu:</strong> ${prod.price || '-'} €</p>`;
                    if (prod.img) {
                        htmlProductes += `<img src="${prod.img}" alt="${prod.name}" class="modal-product-image">`;
                    }
                    htmlProductes += '</div>';
                }
            });
        }
        contingutProductes.innerHTML = htmlProductes;
    }
    // Mostrar el modal
    modalComparador.classList.remove("ocult");
    modalComparador.style.display = "flex";
}

// -----------------------------
// FUNCIONS TAULA I PAGINACIÓ
// -----------------------------
function mostrarRegistresTaula(registresPagina, clients) {
    const tbody = document.getElementById('tableBody');
    
    while (tbody.firstChild) tbody.removeChild(tbody.firstChild);

    if (!registresPagina.length) {
        const tr = document.createElement("tr");
        const td = document.createElement("td");
        td.colSpan = 8;
        td.textContent = "No hi ha registres coincidents amb el filtre.";
        tr.appendChild(td);
        tbody.appendChild(tr);
        return;
    }

    registresPagina.forEach((registre) => {
        const fila = document.createElement("tr");

        const clientNom = clients.find((c) => c.id == registre.client_id) || null;

        const linkClient = document.createElement("a");
        linkClient.textContent = (clientNom ? clientNom.name : "Desconegut") + " " + (clientNom ? clientNom.surname : "");
        linkClient.addEventListener("click", (e) => {
            e.preventDefault();
            mostraClientModal(registre.client_id);
        });

        const linkComparador = document.createElement("a");
        linkComparador.textContent = registre.comparator_id ? `${registre.comparator_id}` : "-";
        linkComparador.addEventListener("click", (e) => {
            e.preventDefault();
            if (registre.comparator_id) mostraComparadorModal(registre.comparator_id);
        });

        const linkFavorit = document.createElement("a");
        linkFavorit.textContent = registre.favorite_id ? `${registre.favorite_id}` : "-";
        linkFavorit.addEventListener("click", (e) => {
            e.preventDefault();
            if (registre.favorite_id) mostraFavoritModal(registre.favorite_id);
        });

        // Crear celdas con atributos data-cell
        const crearCelda = (valor, etiqueta, esEnlace = false) => {
            const td = document.createElement("td");
            td.setAttribute('data-cell', etiqueta);
            
            if (esEnlace && valor && valor.tagName === "A") {
                td.appendChild(valor);
            } else if (valor && !isNaN(Date.parse(valor))) {
                td.textContent = new Date(valor).toLocaleString("es-ES");
            } else if (valor && valor.tagName === "A") {
                td.textContent = valor.textContent;
            } else {
                td.textContent = valor ?? "-";
            }
            return td;
        };

        // Añadir celdas con sus etiquetas
        fila.appendChild(crearCelda(registre.session_id, "ID Sessió : "));
        fila.appendChild(crearCelda(registre.user_agent, "User Agent : "));
        fila.appendChild(crearCelda(linkClient, "ID Client : ", true));
        fila.appendChild(crearCelda(linkComparador, "ID Comparador : ", true));
        fila.appendChild(crearCelda(linkFavorit, "ID Favorit : ", true));
        fila.appendChild(crearCelda(registre.date_start, "Data inici : "));
        fila.appendChild(crearCelda(registre.date_end, "Data fi : "));

        const tdAccions = document.createElement("td");
        tdAccions.setAttribute('data-cell', 'Accions : ');
        tdAccions.setAttribute('data-no-colon', 'true');

        //Botó d'editar
        const btnEditar = document.createElement("a");
        btnEditar.classList.add("accio", "editar");

        const spanEditar = document.createElement("span");
        spanEditar.classList.add("icon-editar");

        const icona = document.createElement("i");
        icona.classList.add("fa-solid", "fa-pen-to-square");

        spanEditar.appendChild(icona);
        btnEditar.appendChild(spanEditar);

        btnEditar.addEventListener("click", (e) => {
            e.preventDefault();
            const index = window.registresFiltrats.indexOf(registre);
            sessionStorage.setItem("editIndex", index);
            if (registre.id !== undefined) sessionStorage.setItem("editId", registre.id);
            window.location.href = "./HistoricForm.html";
        });

        //Botó d'esborrar
        const btnEsborrar = document.createElement("a");
        btnEsborrar.classList.add("accio", "eliminar");

        const spanBorrar = document.createElement("span");
        spanBorrar.classList.add("icon-borrar");

        const icona2 = document.createElement("i");
        icona2.classList.add("fa-solid", "fa-trash");

        spanBorrar.appendChild(icona2);
        btnEsborrar.appendChild(spanBorrar);

        btnEsborrar.addEventListener("click", async () => {
            if (!confirm("Vols esborrar aquest registre?")) return;
            try {
                if (registre.id !== undefined) await deleteData(url, "Register", registre.id);
            } catch (e) { console.error('Error esborrant registre:', e); }
            
            // Recarregar dades després d'esborrar
            window.registresOriginals = await carregarRegistresApi();
            window.registresFiltrats = window.registresOriginals;
            window.paginaActual = 1;
            actualitzarTaula();
        });

        tdAccions.appendChild(btnEditar);
        tdAccions.appendChild(btnEsborrar);
        fila.appendChild(tdAccions);

        tbody.appendChild(fila);
    });
}

function aplicarFiltres(registres, filtres) {
    return registres.filter(reg => {
        let coincideix = true;
        
        if (filtres.idClient) {
            coincideix = coincideix && String(reg.client_id) === String(filtres.idClient);
        }
        
        if (filtres.idComparador) {
            coincideix = coincideix && (
                String(reg.comparator_id) === String(filtres.idComparador) || 
                String(reg.session_id) === String(filtres.idComparador)
            );
        }
        
        if (filtres.idFavorit) {
            coincideix = coincideix && String(reg.favorite_id) === String(filtres.idFavorit);
        }
        
        if (filtres.desde) {
            const parts = filtres.desde.split('-');
            const dataDesde = new Date(parts[2], parts[1] - 1, parts[0]);
            const dataReg = new Date(reg.date_start);
            coincideix = coincideix && dataReg >= dataDesde;
        }
        
        if (filtres.fins) {
            const parts = filtres.fins.split('-');
            const dataFins = new Date(parts[2], parts[1] - 1, parts[0], 23, 59, 59, 999);
            const dataReg = new Date(reg.date_start);
            coincideix = coincideix && dataReg <= dataFins;
        }
        
        return coincideix;
    });
}