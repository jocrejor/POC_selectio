document.addEventListener("DOMContentLoaded", main);

function actualitzarDades() {
    if (typeof window.renderitzarTaula === 'function') {
        window.renderitzarTaula();
    }
}

// Funció per a mostrar missatges temporals a l'usuari
function mostrarMensaje(texto, tipo = "success") {
    const mensaje = document.createElement("div");
    mensaje.className = `notification ${tipo}`;
    mensaje.textContent = texto;

    document.body.appendChild(mensaje);

    setTimeout(function () {
        mensaje.remove();
    }, 3000);
}

// Funció principal que inicialitza la llista d'ofertes
async function main() {
    thereIsUser("../login.html");

    // Buscar el botó de tancar sessió
    const btnLogout = document.getElementById("botoTancarSessio");

    btnLogout.addEventListener("click", () => {
        // Eliminar l'usuari actual
        tancarSessio("../login.html");
    });

    const btnLogoutLateral = document.getElementById("tancarSessioLateral");

    btnLogoutLateral.addEventListener("click", () => {
        // Eliminar l'usuari actual del localStorage
        tancarSessio("../login.html");
    });

    const cosTaula = document.getElementById('tableBody');

    const filterName = document.getElementById('filterName');
    const filterPercentMin = document.getElementById('filterPercentMin');
    const filterPercentMax = document.getElementById('filterPercentMax');
    const filterDateStart = document.getElementById('filterDateStart');
    const filterDateEnd = document.getElementById('filterDateEnd');
    const applyFilter = document.getElementById('applyFilter');
    const clearFilter = document.getElementById('clearFilter');
    const botoAfegir = document.getElementById('botoAfegir');

    let dades = [];
    let dadesFiltrades = [];

    let autocompleteSuggestions = [];
    let currentFocus = -1;

    // Funció per a carregar les ofertes des de la API
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

    // Funció per a carregar array
    function carregarArray(e) {
        if (typeof arrayElements === 'undefined') {
            arrayElements = e;
        } else {
            // Si ya existe, asignar el valor
            arrayElements = e;
        }
    }

    window.actualitzarDades = function () {
        renderitzarTaula();
    };

    // Funció per a eliminar una oferta específica
    async function eliminarDada(ofertaId) {
        try {
            // Convertir a número
            const idNumerico = parseInt(ofertaId);

            // Buscar la oferta en dadesFiltradas por su ID
            const oferta = dadesFiltrades.find(o => {
                const idOferta = parseInt(o.id);
                return idOferta === idNumerico;
            });

            if (oferta && oferta.id) {
                // Llamar a la API para eliminar
                await deleteData(url, "Sale", oferta.id);

                // Recargar datos
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

    // Carregar dades inicials des de la API
    async function inicialitzarDades() {
        try {
            dades = await carregarOfertesAPI();
            dadesFiltrades = [...dades];

            // Cargar array para paginación
            carregarArray(dadesFiltrades);
            window.actualitzarDades();
            inicialitzarAutocomplete();
        } catch (error) {
            console.error('Error inicialitzant dades:', error);
        }
    }

    // Funció per a inicialitzar l'autocompletat estilo Google
    function inicialitzarAutocomplete() {
        // Crear el contenedor de sugerencias
        const suggestionsContainer = document.createElement('div');
        suggestionsContainer.id = 'autocomplete-suggestions';
        suggestionsContainer.className = 'autocomplete-suggestions';

        // Insertar después del input de búsqueda
        filterName.parentNode.insertBefore(suggestionsContainer, filterName.nextSibling);

        // Event listener para input
        filterName.addEventListener('input', function (e) {
            const valor = this.value.trim();

            if (valor.length < 2) {
                amagarSuggestions();
                return;
            }

            // Buscar sugerencias
            const sugerencias = buscarSuggestions(valor);
            mostrarSuggestions(sugerencias, valor);
        });

        // Event listener para teclas
        filterName.addEventListener('keydown', function (e) {
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

        // Cerrar sugerencias al hacer click fuera
        document.addEventListener('click', function (e) {
            if (!filterName.contains(e.target) && !suggestionsContainer.contains(e.target)) {
                amagarSuggestions();
            }
        });
    }

    // Funció per a buscar suggestions
    function buscarSuggestions(texte) {
        const texteLower = texte.toLowerCase();
        return dades
            .map(oferta => oferta.oferta)
            .filter(nom => nom.toLowerCase().includes(texteLower))
            .filter((nom, index, array) => array.indexOf(nom) === index)
            .slice(0, 8);
    }

    // Funció per a mostrar les suggestions
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

            // Resaltar el texto coincidente
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
                filterName.value = suggeriment;
                aplicarFiltres();
                amagarSuggestions();
            });

            item.addEventListener('mouseenter', function () {
                // Remover selección anterior
                const items = suggestionsContainer.querySelectorAll('.autocomplete-item');
                items.forEach(item => item.classList.remove('selected'));
                // Añadir selección actual
                this.classList.add('selected');
                currentFocus = parseInt(this.dataset.index);
            });

            suggestionsContainer.appendChild(item);
        });

        suggestionsContainer.style.display = 'block';
        currentFocus = -1;
    }

    // Funció per a amagar les suggestions
    function amagarSuggestions() {
        const suggestionsContainer = document.getElementById('autocomplete-suggestions');
        if (suggestionsContainer) {
            suggestionsContainer.style.display = 'none';
            currentFocus = -1;
        }
    }

    // Funció per a moure la selecció amb teclat
    function moureSeleccio(direccio) {
        const suggestionsContainer = document.getElementById('autocomplete-suggestions');
        const items = suggestionsContainer.querySelectorAll('.autocomplete-item');

        if (items.length === 0) return;

        // Remover selección anterior
        items.forEach(item => item.classList.remove('selected'));

        currentFocus += direccio;

        if (currentFocus >= items.length) currentFocus = 0;
        if (currentFocus < 0) currentFocus = items.length - 1;

        // Añadir nueva selección
        items[currentFocus].classList.add('selected');

        // Scroll a la opción seleccionada
        items[currentFocus].scrollIntoView({ block: 'nearest' });
    }

    // Funció per a seleccionar una suggestion
    function seleccionarSuggestion() {
        const suggestionsContainer = document.getElementById('autocomplete-suggestions');
        const items = suggestionsContainer.querySelectorAll('.autocomplete-item');

        if (currentFocus > -1 && items[currentFocus]) {
            filterName.value = items[currentFocus].textContent || items[currentFocus].innerText;
            aplicarFiltres();
        }
        amagarSuggestions();
    }

    if (botoAfegir) {
        botoAfegir.addEventListener('click', function () {
            window.location.href = "OfertaAlta.html";
        });
    }

    // Funció per a aplicar filtros
    function aplicarFiltres() {
        const nomFiltre = filterName.value.toLowerCase().trim();
        const percentMin = filterPercentMin.value ? parseInt(filterPercentMin.value) : null;
        const percentMax = filterPercentMax.value ? parseInt(filterPercentMax.value) : null;
        const dataIniciFiltre = filterDateStart.value;
        const dataFiFiltre = filterDateEnd.value;

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

        // Usar la variable global paginaActual de common-paginacio.js
        if (typeof paginaActual !== 'undefined') {
            paginaActual = 1;
        }
        // Actualizar array para paginación
        carregarArray(dadesFiltrades);
        window.actualitzarDades();
        amagarSuggestions();
    }

    function netejarFiltres() {
        filterName.value = '';
        filterPercentMin.value = '';
        filterPercentMax.value = '';
        filterDateStart.value = '';
        filterDateEnd.value = '';
        dadesFiltrades = [...dades];
        if (typeof paginaActual !== 'undefined') {
            paginaActual = 1;
        }
        // Actualizar array para paginación
        carregarArray(dadesFiltrades);
        window.actualitzarDades();
        amagarSuggestions();
    }

    function validarPercentatges() {
        const percentMin = filterPercentMin.value ? parseInt(filterPercentMin.value) : null;
        const percentMax = filterPercentMax.value ? parseInt(filterPercentMax.value) : null;

        if (percentMin !== null && (percentMin < 1 || percentMin > 100)) {
            filterPercentMin.setCustomValidity('El percentatge mínim ha de ser entre 1 i 100');
        } else {
            filterPercentMin.setCustomValidity('');
        }

        if (percentMax !== null && (percentMax < 1 || percentMax > 100)) {
            filterPercentMax.setCustomValidity('El percentatge màxim ha de ser entre 1 i 100');
        } else {
            filterPercentMax.setCustomValidity('');
        }

        if (percentMin !== null && percentMax !== null && percentMin > percentMax) {
            filterPercentMax.setCustomValidity('El percentatge màxim no pot ser menor que el mínim');
        } else {
            filterPercentMax.setCustomValidity('');
        }
    }

    // Event listeners
    if (applyFilter) {
        applyFilter.addEventListener('click', aplicarFiltres);
    }

    if (clearFilter) {
        clearFilter.addEventListener('click', netejarFiltres);
    }

    if (filterPercentMin) {
        filterPercentMin.addEventListener('input', validarPercentatges);
        filterPercentMin.addEventListener('change', validarPercentatges);
    }

    if (filterPercentMax) {
        filterPercentMax.addEventListener('input', validarPercentatges);
        filterPercentMax.addEventListener('change', validarPercentatges);
    }

    if (filterName) {
        filterName.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                aplicarFiltres();
                amagarSuggestions();
            }
        });
    }

    // Funció principal per a mostrar les ofertes en la taula
    function renderitzarTaula() {
        if (!cosTaula) return;

        while (cosTaula.firstChild) {
            cosTaula.removeChild(cosTaula.firstChild);
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
            cosTaula.appendChild(fila);

            // Ocultar paginación si no hay datos
            const paginacio = document.getElementsByClassName('paginacio')[0];
            if (paginacio) {
                paginacio.classList.add('no_mostrar');
            }
            return;
        }

        const elementsActuals = aplicarPaginacio(dadesFiltrades);

        elementsActuals.forEach(function (element, index) {
            const fila = document.createElement("tr");

            // Celdas de datos con data-cell attributes
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

            // Celda de acciones
            const celdaAccio = document.createElement("td");
            celdaAccio.setAttribute('data-cell', 'Accions : ');

            // Enlace editar
            const enlaceEditar = document.createElement("a");
            enlaceEditar.className = 'icon-editar';
            enlaceEditar.href = `OfertaModificar.html?edit=${element.id}`;
            enlaceEditar.innerHTML = '<i class="fa-solid fa-pen-to-square"></i>';

            // Botón productos aplicados
            const botoProductesAplicats = document.createElement("a");
            botoProductesAplicats.className = 'icon-visualitzar';
            botoProductesAplicats.href = '#';
            botoProductesAplicats.innerHTML = '<i class="fa-solid fa-eye"></i>';
            botoProductesAplicats.addEventListener('click', function (e) {
                e.preventDefault();
                anarAProductes(element.id);
            });

            // Enlace eliminar
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

            cosTaula.appendChild(fila);
        });

        creaPagines();
    }

    window.renderitzarTaula = renderitzarTaula;

    function anarAProductes(ofertaId) {
        window.location.href = `ProducteLlistar.html?oferta=${ofertaId}`;
    }

    // Inicialitzar les dades
    await inicialitzarDades();
}