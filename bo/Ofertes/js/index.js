document.addEventListener("DOMContentLoaded", main);

const FILTRES_KEY = 'ofertes_filtres';

function actualitzarDades() {
    if (typeof window.renderitzarTaula === 'function') {
        window.renderitzarTaula();
    }
}

function mostrarMensaje(texto, tipo = "success") {
    const mensaje = document.createElement("div");
    mensaje.className = `notification ${tipo}`;
    mensaje.textContent = texto;
    document.body.appendChild(mensaje);
    setTimeout(() => mensaje.remove(), 3000);
}

function guardarFiltres() {
    const filtres = {
        nom: document.getElementById('filterName').value,
        percentMin: document.getElementById('filterPercentMin').value,
        percentMax: document.getElementById('filterPercentMax').value,
        dataInici: document.getElementById('filterDateStart').value,
        dataFi: document.getElementById('filterDateEnd').value
    };
    localStorage.setItem(FILTRES_KEY, JSON.stringify(filtres));
}

function carregarFiltres() {
    const filtresGuardats = localStorage.getItem(FILTRES_KEY);
    if (!filtresGuardats) return false;
    
    try {
        const filtres = JSON.parse(filtresGuardats);
        document.getElementById('filterName').value = filtres.nom || '';
        document.getElementById('filterPercentMin').value = filtres.percentMin || '';
        document.getElementById('filterPercentMax').value = filtres.percentMax || '';
        document.getElementById('filterDateStart').value = filtres.dataInici || '';
        document.getElementById('filterDateEnd').value = filtres.dataFi || '';
        return true;
    } catch (e) {
        console.error('Error carregant filtres:', e);
        return false;
    }
}

function carregarArray(e) {
    arrayElements = e;
}

async function main() {
    thereIsUser("../login.html");
    
    // Configurar logout
    document.getElementById("botoTancarSessio").addEventListener("click", () => tancarSessio("../login.html"));
    document.getElementById("tancarSessioLateral").addEventListener("click", () => tancarSessio("../login.html"));
    
    // Elements DOM
    const elements = {
        cosTaula: document.getElementById('tableBody'),
        filterName: document.getElementById('filterName'),
        filterPercentMin: document.getElementById('filterPercentMin'),
        filterPercentMax: document.getElementById('filterPercentMax'),
        filterDateStart: document.getElementById('filterDateStart'),
        filterDateEnd: document.getElementById('filterDateEnd'),
        applyFilter: document.getElementById('applyFilter'),
        clearFilter: document.getElementById('clearFilter'),
        botoAfegir: document.getElementById('botoAfegir')
    };
    
    let dades = [];
    let dadesFiltrades = [];
    let currentFocus = -1;

    async function carregarOfertesAPI() {
        try {
            const sale = await getData(url, "Sale");
            if (sale && Array.isArray(sale)) {
                return sale.map(function (venda) {
                    return {
                        id: venda.id,
                        oferta: venda.description,
                        percentaje: venda.discount_percent,
                        dataInici: venda.start_date ? venda.start_date.split(' ')[0] : "",
                        dataFi: venda.end_date ? venda.end_date.split(' ')[0] : "",
                        coupon: venda.coupon || ""
                    };
                });
            }
            return [];
        } catch (error) {
            console.error('Error carregant ofertes des de la API:', error);
            return [];
        }
    }

    async function eliminarDada(ofertaId) {
        try {
            const confirmacio = confirm("Esteu segur que voleu eliminar aquest element?\nAquesta acció no es pot desfer.");
            
            if (!confirmacio) {
                return;
            }
            
            const idNumerico = parseInt(ofertaId);
            const oferta = dadesFiltrades.find(o => {
                const idOferta = parseInt(o.id);
                return idOferta === idNumerico;
            });

            if (oferta && oferta.id) {
                await deleteData(url, "Sale", oferta.id);
                await inicialitzarDades();
                mostrarMensaje("Oferta eliminada correctament", "success");
            } else {
                mostrarMensaje("Error: No s'ha pogut identificar l'oferta per eliminar", "error");
            }
        } catch (error) {
            console.error('Error eliminant oferta:', error);
            mostrarMensaje("Error eliminant l'oferta", "error");
        }
    }

    async function inicialitzarDades() {
        try {
            dades = await carregarOfertesAPI();
            dadesFiltrades = [...dades];

            const filtresCarregats = carregarFiltres();
            
            if (filtresCarregats) {
                aplicarFiltres();
            } else {
                carregarArray(dadesFiltrades);
                window.actualitzarDades();
            }
            
            inicialitzarAutocomplete();
        } catch (error) {
            console.error('Error inicialitzant dades:', error);
        }
    }

    function inicialitzarAutocomplete() {
        const suggestionsContainer = document.createElement('div');
        suggestionsContainer.id = 'autocomplete-suggestions';
        suggestionsContainer.className = 'autocomplete-suggestions';
        elements.filterName.parentNode.insertBefore(suggestionsContainer, elements.filterName.nextSibling);

        elements.filterName.addEventListener('input', function (e) {
            const valor = this.value.trim();
            if (valor.length < 2) {
                amagarSuggestions();
                return;
            }
            const sugerencias = buscarSuggestions(valor);
            mostrarSuggestions(sugerencias, valor);
        });

        elements.filterName.addEventListener('keydown', function (e) {
            const suggestions = document.getElementById('autocomplete-suggestions');
            if (!suggestions || suggestions.style.display === 'none') return;

            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    moureSeleccio(1);
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    moureSeleccio(-1);
                    break;
                case 'Enter':
                    e.preventDefault();
                    seleccionarSuggestion();
                    break;
                case 'Escape':
                    amagarSuggestions();
                    break;
            }
        });

        document.addEventListener('click', function (e) {
            if (!elements.filterName.contains(e.target) && !suggestionsContainer.contains(e.target)) {
                amagarSuggestions();
            }
        });
    }

    function buscarSuggestions(texte) {
        const texteLower = texte.toLowerCase();
        return dades
            .map(oferta => oferta.oferta)
            .filter(nom => nom.toLowerCase().includes(texteLower))
            .filter((nom, index, array) => array.indexOf(nom) === index)
            .slice(0, 8);
    }

    function mostrarSuggestions(sugerencias, texteCerca) {
        const suggestionsContainer = document.getElementById('autocomplete-suggestions');
        const texteLower = texteCerca.toLowerCase();

        if (sugerencias.length === 0) {
            amagarSuggestions();
            return;
        }

        suggestionsContainer.innerHTML = '';

        sugerencias.forEach((suggeriment, index) => {
            const item = document.createElement('div');
            item.className = 'autocomplete-item';
            item.dataset.index = index;

            const text = suggeriment;
            const startIndex = text.toLowerCase().indexOf(texteLower);
            const endIndex = startIndex + texteCerca.length;

            if (startIndex !== -1) {
                const part1 = text.substring(0, startIndex);
                const part2 = text.substring(startIndex, endIndex);
                const part3 = text.substring(endIndex);

                item.innerHTML = `
                    <span>${part1}</span>
                    <strong>${part2}</strong>
                    <span>${part3}</span>
                `;
            } else {
                item.textContent = text;
            }

            item.addEventListener('click', function () {
                elements.filterName.value = suggeriment;
                aplicarFiltres();
                amagarSuggestions();
            });

            item.addEventListener('mouseenter', function () {
                const items = suggestionsContainer.querySelectorAll('.autocomplete-item');
                items.forEach(item => item.classList.remove('selected'));
                this.classList.add('selected');
                currentFocus = parseInt(this.dataset.index);
            });

            suggestionsContainer.appendChild(item);
        });

        suggestionsContainer.style.display = 'block';
        currentFocus = -1;
    }

    function amagarSuggestions() {
        const suggestionsContainer = document.getElementById('autocomplete-suggestions');
        if (suggestionsContainer) {
            suggestionsContainer.style.display = 'none';
            currentFocus = -1;
        }
    }

    function moureSeleccio(direccio) {
        const suggestionsContainer = document.getElementById('autocomplete-suggestions');
        const items = suggestionsContainer.querySelectorAll('.autocomplete-item');

        if (items.length === 0) return;

        items.forEach(item => item.classList.remove('selected'));
        currentFocus += direccio;

        if (currentFocus >= items.length) currentFocus = 0;
        if (currentFocus < 0) currentFocus = items.length - 1;

        items[currentFocus].classList.add('selected');
        items[currentFocus].scrollIntoView({ block: 'nearest' });
    }

    function seleccionarSuggestion() {
        const suggestionsContainer = document.getElementById('autocomplete-suggestions');
        const items = suggestionsContainer.querySelectorAll('.autocomplete-item');

        if (currentFocus > -1 && items[currentFocus]) {
            elements.filterName.value = items[currentFocus].textContent || items[currentFocus].innerText;
            aplicarFiltres();
        }
        amagarSuggestions();
    }

    if (elements.botoAfegir) {
        elements.botoAfegir.addEventListener('click', function () {
            window.location.href = "OfertaAlta.html";
        });
    }

    function aplicarFiltres() {
        const nomFiltre = elements.filterName.value.toLowerCase().trim();
        const percentMin = elements.filterPercentMin.value ? parseInt(elements.filterPercentMin.value) : null;
        const percentMax = elements.filterPercentMax.value ? parseInt(elements.filterPercentMax.value) : null;
        const dataIniciFiltre = elements.filterDateStart.value;
        const dataFiFiltre = elements.filterDateEnd.value;

        dadesFiltrades = dades.filter(function (oferta) {
            if (nomFiltre && !oferta.oferta.toLowerCase().includes(nomFiltre)) {
                return false;
            }

            const percentatgeOferta = parseInt(oferta.percentaje);
            if (percentMin !== null && percentatgeOferta < percentMin) {
                return false;
            }

            if (percentMax !== null && percentatgeOferta > percentMax) {
                return false;
            }

            if (dataIniciFiltre && oferta.dataInici !== dataIniciFiltre) {
                return false;
            }

            if (dataFiFiltre && oferta.dataFi !== dataFiFiltre) {
                return false;
            }

            return true;
        });

        if (typeof paginaActual !== 'undefined') {
            paginaActual = 1;
        }
        
        carregarArray(dadesFiltrades);
        window.actualitzarDades();
        amagarSuggestions();
        guardarFiltres();
    }

    function netejarFiltres() {
        elements.filterName.value = '';
        elements.filterPercentMin.value = '';
        elements.filterPercentMax.value = '';
        elements.filterDateStart.value = '';
        elements.filterDateEnd.value = '';
        
        localStorage.removeItem(FILTRES_KEY);
        
        dadesFiltrades = [...dades];
        if (typeof paginaActual !== 'undefined') {
            paginaActual = 1;
        }
        
        carregarArray(dadesFiltrades);
        window.actualitzarDades();
        amagarSuggestions();
    }

    function validarPercentatges() {
        const percentMin = parseInt(elements.filterPercentMin.value) || null;
        const percentMax = parseInt(elements.filterPercentMax.value) || null;

        if (percentMin !== null && (percentMin < 1 || percentMin > 100)) {
            elements.filterPercentMin.setCustomValidity('El percentatge mínim ha de ser entre 1 i 100');
        } else {
            elements.filterPercentMin.setCustomValidity('');
        }

        if (percentMax !== null && (percentMax < 1 || percentMax > 100)) {
            elements.filterPercentMax.setCustomValidity('El percentatge màxim ha de ser entre 1 i 100');
        } else {
            elements.filterPercentMax.setCustomValidity('');
        }

        if (percentMin !== null && percentMax !== null && percentMin > percentMax) {
            elements.filterPercentMax.setCustomValidity('El percentatge màxim no pot ser menor que el mínim');
        } else {
            elements.filterPercentMax.setCustomValidity('');
        }
    }

    // Event listeners
    if (elements.applyFilter) {
        elements.applyFilter.addEventListener('click', aplicarFiltres);
    }

    if (elements.clearFilter) {
        elements.clearFilter.addEventListener('click', netejarFiltres);
    }

    if (elements.filterPercentMin) {
        elements.filterPercentMin.addEventListener('input', validarPercentatges);
    }

    if (elements.filterPercentMax) {
        elements.filterPercentMax.addEventListener('input', validarPercentatges);
    }

    if (elements.filterName) {
        elements.filterName.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                aplicarFiltres();
                amagarSuggestions();
            }
        });
    }

    // Guardar filtres quan es canvien
    const filtresInputs = ['filterName', 'filterPercentMin', 'filterPercentMax', 'filterDateStart', 'filterDateEnd'];
    filtresInputs.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('change', guardarFiltres);
        }
    });

    function renderitzarTaula() {
        if (!elements.cosTaula) return;

        while (elements.cosTaula.firstChild) {
            elements.cosTaula.removeChild(elements.cosTaula.firstChild);
        }

        if (dadesFiltrades.length === 0) {
            let missatge = "No hi ha ofertes registrades";
            if (dades.length > 0 && dadesFiltrades.length === 0) {
                missatge = "No s'han trobat ofertes que coincideixin amb els filtres";
            }

            const fila = document.createElement("tr");
            const celda = document.createElement("td");
            celda.setAttribute("colspan", "8");
            celda.className = 'no-data';
            celda.textContent = missatge;
            fila.appendChild(celda);
            elements.cosTaula.appendChild(fila);

            const paginacio = document.getElementsByClassName('paginacio')[0];
            if (paginacio) {
                paginacio.classList.add('no_mostrar');
            }
            return;
        }

        const elementsActuals = aplicarPaginacio(dadesFiltrades);

        elementsActuals.forEach(function (element) {
            const fila = document.createElement("tr");

            const celdaId = document.createElement("td");
            celdaId.setAttribute('data-cell', 'ID : ');
            celdaId.textContent = element.id ? element.id.toString() : "N/A";
            fila.appendChild(celdaId);

            const celdaOferta = document.createElement("td");
            celdaOferta.setAttribute('data-cell', 'Oferta : ');
            celdaOferta.textContent = element.oferta;
            fila.appendChild(celdaOferta);

            const celdaPercentatge = document.createElement("td");
            celdaPercentatge.setAttribute('data-cell', 'Percentatge : ');
            celdaPercentatge.textContent = element.percentaje + "%";
            fila.appendChild(celdaPercentatge);

            const celdaDataInici = document.createElement("td");
            celdaDataInici.setAttribute('data-cell', 'Data Inici : ');
            celdaDataInici.textContent = element.dataInici;
            fila.appendChild(celdaDataInici);

            const celdaDataFi = document.createElement("td");
            celdaDataFi.setAttribute('data-cell', 'Data Fi : ');
            celdaDataFi.textContent = element.dataFi;
            fila.appendChild(celdaDataFi);

            const celdaCupo = document.createElement("td");
            celdaCupo.setAttribute('data-cell', 'Cupó : ');
            celdaCupo.textContent = element.coupon || "-";
            fila.appendChild(celdaCupo);

            const celdaAccio = document.createElement("td");
            celdaAccio.setAttribute('data-cell', 'Accions : ');

            const enlaceEditar = document.createElement("a");
            enlaceEditar.className = 'icon-editar';
            enlaceEditar.href = `OfertaModificar.html?edit=${element.id}`;
            enlaceEditar.innerHTML = '<i class="fa-solid fa-pen-to-square"></i>';

            const botoProductesAplicats = document.createElement("a");
            botoProductesAplicats.className = 'icon-visualitzar';
            botoProductesAplicats.href = '#';
            botoProductesAplicats.innerHTML = '<i class="fa-solid fa-eye"></i>';
            botoProductesAplicats.addEventListener('click', function (e) {
                e.preventDefault();
                anarAProductes(element.id);
            });

            const enlaceEliminar = document.createElement("a");
            enlaceEliminar.className = 'icon-borrar';
            enlaceEliminar.href = '#';
            enlaceEliminar.innerHTML = '<i class="fa-solid fa-trash"></i>';
            enlaceEliminar.addEventListener('click', function (e) {
                e.preventDefault();
                eliminarDada(element.id);
            });

            celdaAccio.appendChild(botoProductesAplicats);
            celdaAccio.appendChild(enlaceEditar);
            celdaAccio.appendChild(enlaceEliminar);
            fila.appendChild(celdaAccio);

            elements.cosTaula.appendChild(fila);
        });

        creaPagines();
    }

    window.actualitzarDades = function () {
        renderitzarTaula();
    };
    
    window.renderitzarTaula = renderitzarTaula;

    function anarAProductes(ofertaId) {
        window.location.href = `ProducteLlistar.html?oferta=${ofertaId}`;
    }

    // Inicialitzar les dades
    await inicialitzarDades();
}