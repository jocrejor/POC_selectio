$(document).ready(function() {
    principal();
});

// Variables globals
let accio = "Afegir";
let paisosFiltrats = [];
let Country = [];
const API_URL = 'https://api.serverred.es/Country';

// --- VARIABLES PER A PAGINACIÓ ---
let paginaActual = 1;
const itemsPerPagina = 10;

// Funció per a carregar els països des de l'arxiu JSON
async function carregarPaisos() {
    try {
        const dades = await getData('https://api.serverred.es/', 'Country');
        Country = dades || [];
        return Country;
    } catch (error) {
        console.error('Error carregant països:', error);
        return [];
    }
}

// Funció principal que s'executa quan es carrega la pàgina
async function principal() {
    const camiActual = window.location.pathname;
    const esPaginaCrear = camiActual.includes('indexCrear.html');
    const esPaginaEditar = camiActual.includes('indexEditar.html');
    

    if (esPaginaCrear) {
        // Configuració per a la pàgina de crear
        configurarPaginaCrear();
    } else if (esPaginaEditar) {
        // Configuració per a la pàgina d'editar
        configurarPaginaEditar();
    } else {
        // Configuració per a la pàgina principal
        await recarregarDadesIPintar();
    }

    // Configurar botó de tancar sessió DESPRÉS de configurar la pàgina
    setTimeout(() => {
        try {
            botonsTancarSessio("../login.html");
        } catch (error) {
            console.warn("No s'ha trobat el botó de tancar sessió:", error);
        }
    }, 100);
}


// Nova funció per recarregar dades i pintar
async function recarregarDadesIPintar() {
    // Carregar dades directament de l'API
    try {
        const dades = await getData('https://api.serverred.es/', 'Country');
        Country = dades || [];
    } catch (error) {
        console.error('Error recarregant països:', error);
        Country = [];
    }
    
    // Inicialitzem la llista de països filtrats
    paisosFiltrats = [...Country];
    
    // Resetar la pàgina
    paginaActual = 1;
    
    // Pintar la llista
    mostrarPagina();

    // Configurem el botó d'afegir
    configurarBotoAfegirPrincipal();

    // Configurem el cercador amb jQuery
    configurarCercadorJQuery();
}

// Configuració per a la pàgina principal
async function configurarPaginaPrincipal() {
    // Verificar si necessitem recarregar
    verificarRecarregarDespresEdicio();
        
    await carregarDadesInicials();

    // Inicialitzem la llista de països filtrats
    paisosFiltrats = [...Country];
    
    // DEBUG
    console.log(`Països carregats: ${Country.length}`);
    Country.forEach(p => console.log(`- ${p.id}: ${p.name}`));
    
    // Crida a mostrarPagina() en lloc de mostrarLlista()
    mostrarPagina();

    // Configurem el botó d'afegir
    configurarBotoAfegirPrincipal();

    // Configurem el cercador amb jQuery
    configurarCercadorJQuery();
}

// Funció millorada per a configurar el cercador amb jQuery
function configurarCercadorJQuery() {
    const $entradaCercar = $('#buscar');
    const $botoCercar = $('.cercar');
    const $botoNetejar = $('.netejar');

    if ($entradaCercar.length) {
        // Cerca en temps real mentre s'escriu
        $entradaCercar.on('input', function() {
            const text = $(this).val(); // Ja no necessitem .toLowerCase() aquí
            filtrarIPintar(text);
        });

        // Cerca en fer clic al botó
        $botoCercar.on('click', function(e) {
            e.preventDefault();
            const text = $entradaCercar.val(); // Ja no necessitem .toLowerCase() aquí
            filtrarIPintar(text);
            
            // Efecte visual de cerca
            $(this).addClass('cercant');
            setTimeout(() => {
                $(this).removeClass('cercant');
            }, 300);
        });

        // Netejar cerca
        $botoNetejar.on('click', function(e) {
            e.preventDefault();
            $entradaCercar.val('');
            filtrarIPintar('');
            
            // Enfocar el camp de cerca després de netejar
            $entradaCercar.focus();
        });

        // Permetre cerca amb Enter
        $entradaCercar.on('keypress', function(e) {
            if (e.which === 13) {
                e.preventDefault();
                $botoCercar.trigger('click');
            }
        });

        // Mostrar/amagar icona de netejar segons si hi ha text
        $entradaCercar.on('input', function() {
            if ($(this).val().length > 0) {
                $(this).addClass('amb-text');
            } else {
                $(this).removeClass('amb-text');
            }
        });
    }
}

// Funció per a filtrar i mostrar resultats
function filtrarIPintar(textCerca) {
    const textCercaLower = textCerca.toLowerCase().trim(); // Netejar i passar a minúscules una sola vegada

    if (textCercaLower === '') {
        // Si no hi ha text, mostrar tots els països
        paisosFiltrats = [...Country];
    } else {
        // Filtrar països segons el text de cerca
        paisosFiltrats = Country.filter(pais => 
            pais.name.toLowerCase().includes(textCercaLower) ||
            pais.id.toString().includes(textCercaLower)
        );
    }
    
    // Resetar la pàgina a 1 en cada nova cerca
    paginaActual = 1; 
    
    // Dibuixa la nova llista i la paginació
    mostrarPagina();
    
    // Mostrar missatge si no hi ha resultats
    mostrarMissatgeSenseResultats();
}

// Mostrar missatge si no hi ha resultats
function mostrarMissatgeSenseResultats() {
    const $cosTaula = $('#llista');

    // Netejar missatges anteriors
    $('#missatgeSenseResultats').remove();
    $('#missatgeSensePaïsos').remove();

    if (Country.length === 0) {
        // Si no hi ha països a la base de dades
        const missatge = $('<tr id="missatgeSensePaïsos"><td colspan="3" style="text-align: center; padding: 20px;">No hi ha països registrats</td></tr>');
        $cosTaula.append(missatge);
    } else if (paisosFiltrats.length === 0) {
        // Si hi ha països però cap coincideix amb la cerca
        const missatge = $('<tr id="missatgeSenseResultats"><td colspan="3" style="text-align: center; padding: 20px;">No s\'han trobat països que coincideixen amb la cerca</td></tr>');
        $cosTaula.append(missatge);
    }
}

// Configuració per a la pàgina de crear
function configurarPaginaCrear() {
    configurarBotoTornar();
    configurarFormulariCrearJQuery();
}

// Configuració per a la pàgina d'editar
function configurarPaginaEditar() {
    configurarBotoTornarJQuery();

    const params = new URLSearchParams(window.location.search);
    const paisId = params.get('id');
    const paisNom = params.get('name');

    // Omplir el formulari amb jQuery
    const $inputPais = $("#country");
    const $inputPaisId = $("#paisId");

    if ($inputPais.length) $inputPais.val(paisNom);
    if ($inputPaisId.length) $inputPaisId.val(paisId);

    // Configurar el formulari d'enviament amb jQuery
    const $formulari = $("form");
    if ($formulari.length) {
        $formulari.on("submit", async function(event) {
            event.preventDefault();

            if (!validarPaisJQuery()) return;

            const nouNomPais = $inputPais.val().trim();
            
            const dadesActualitzades = {
                name: nouNomPais
            };

            try {
                // 1. Actualitzar a l'API
                await updateId('https://api.serverred.es/', 'Country', paisId, dadesActualitzades);
                
                // 2. Esperar un moment per assegurar que l'API ha processat
                await new Promise(resolve => setTimeout(resolve, 500));
                
                // 3. Redirigir a la pàgina principal amb un paràmetre de cache busting
                window.location.href = "../index.html?t=" + new Date().getTime();
            } catch (error) {
                console.error('Error en actualitzar el país:', error);
            }
        });
    }

    // Configurar botó Reiniciar amb jQuery
    const $botoReiniciar = $("#reiniciar");
    if ($botoReiniciar.length) {
        $botoReiniciar.on('click', function(e) {
            // Tornar a carregar els valors originals
            $inputPais.val(paisNom);
            $("#missatgeError").text("");
        });
    }
// Dins de configurarPaginaEditar()
$formulari.on("submit", async function(event) {
    event.preventDefault();

    // Esperar a que es completi la validació (inclosa comprovació de duplicats)
    const esValid = await validarPaisJQuery();
    if (!esValid) return;

    const nouNomPais = $inputPais.val().trim();
    
    const dadesActualitzades = {
        name: nouNomPais
    };

    try {
        // 1. Actualitzar a l'API
        await updateId('https://api.serverred.es/', 'Country', paisId, dadesActualitzades);
        
        // 2. Esperar un moment per assegurar que l'API ha processat
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // 3. Redirigir a la pàgina principal amb un paràmetre de cache busting
        window.location.href = "../index.html?t=" + new Date().getTime();
    } catch (error) {
        console.error('Error en actualitzar el país:', error);
    }
});
}

// Configura el botó d'afegir a la pàgina principal amb jQuery
function configurarBotoAfegirPrincipal() {
    const $botoAfegir = $("#afegir");
    if ($botoAfegir.length) {
        $botoAfegir.on("click", function(e) {
            e.preventDefault();
            window.location.href = "subpage/indexCrear.html";
        });
    }
}

// Configurar el botó de tornar amb jQuery
function configurarBotoTornarJQuery() {
    const $botoTornar = $("#tornar");
    if ($botoTornar.length) {
        $botoTornar.on("click", function() {
            window.location.href = "../index.html";
        });
    }
}

// Configurar el formulari a la pàgina de crear amb jQuery
function configurarFormulariCrearJQuery() {
    const $formulari = $("form");
    if ($formulari.length) {
        $formulari.on("submit", async function(event) {
            event.preventDefault();
            
            // Esperar a que es completi la validació (inclosa comprovació de duplicats)
            const esValid = await validarPaisJQuery();
            if (!esValid) return;
            
            await crearPaisJQuery();
        });
    }
}

// --- FUNCIONS D'INICIALITZACIÓ ---

// Carrega les dades inicials
async function carregarDadesInicials() {
    Country = await carregarPaisos();
}

// --- FUNCIONS DE GESTIÓ DE PAÏSOS ---


// Funció central per mostrar la pàgina actual i els controls de paginació.

function mostrarPagina() {
    // Calcular els items de la pàgina actual
    const startIndex = (paginaActual - 1) * itemsPerPagina;
    const endIndex = paginaActual * itemsPerPagina;
    const itemsPagina = paisosFiltrats.slice(startIndex, endIndex);

    // Renderitzar la taula només amb aquests items
    mostrarLlista(itemsPagina);

    // Renderitzar els botons de paginació
    renderitzarPaginacio();
}


//Dibuixa els botons de paginació.
function renderitzarPaginacio() {
    const $paginacioContainer = $('#paginacio');
    if (!$paginacioContainer.length) return; 

    $paginacioContainer.empty(); // Netejar botons antics

    const totalPagines = Math.ceil(paisosFiltrats.length / itemsPerPagina);

    // No mostrar paginació si només hi ha 1 pàgina o menys
    if (totalPagines <= 1) {
        return;
    }

    // --- Botó Anterior ---
    if (paginaActual > 1) {
        const $btnPrev = $('<button>')
            .text('Anterior')
            .addClass('btn-paginacio btn-prev');

        $btnPrev.on('click', (e) => {
            e.preventDefault(); 
            paginaActual--;
            mostrarPagina();
        });

        $paginacioContainer.append($btnPrev);
    }

    // --- LÒGICA DE LA FINESTRA LLISCANT ---

    const maxBotonsNumerics = 4;
    
    let startPage = paginaActual - 2; 
    if (startPage < 1) startPage = 1;

    let endPage = startPage + maxBotonsNumerics - 1;
    if (endPage > totalPagines) {
        endPage = totalPagines;
        startPage = totalPagines - maxBotonsNumerics + 1;
        if (startPage < 1) startPage = 1;
    }
    
    // --- Creació dels Botons Numèrics ---
    for (let i = startPage; i <= endPage; i++) {
        const $btnPage = $('<button>')
            .text(i)
            .addClass('btn-paginacio btn-page');
        
        if (i === paginaActual) {
            $btnPage.addClass('activa').prop('disabled', true); 
        }
        
        $btnPage.on('click', (e) => {
            e.preventDefault(); 
            paginaActual = i;
            mostrarPagina();
        });

        $paginacioContainer.append($btnPage);
    }

    // --- Botó Següent ---
    if (paginaActual < totalPagines) {
        const $btnNext = $('<button>')
            .text('Següent')
            .addClass('btn-paginacio btn-next');

        $btnNext.on('click', (e) => {
            e.preventDefault(); 
            paginaActual++;
            mostrarPagina();
        });

        $paginacioContainer.append($btnNext);
    }
}


// Mostra la llista de països a la pàgina amb jQuery
// Mostra la llista de països a la pàgina amb jQuery
function mostrarLlista(array) {
    const $cosTaula = $("#llista");
    if (!$cosTaula.length) return;

    // Netejar contingut
    $cosTaula.empty();

    // DEBUG: Mostrar quants països es mostren
    console.log(`Mostrant ${array.length} països:`);
    array.forEach(pais => console.log(`- ${pais.id}: ${pais.name}`));

    array.forEach((pais, index) => {
        const fila = $('<tr>');
        
        // Columna ID
        const celdaId = $('<td>').text(pais.id).attr('data-cell', 'ID : ');
        
        // Columna Nom
        const celdaNom = $('<td>').text(pais.name).attr('data-cell', 'Nom : ');
        
        // Columna Accions
        const celdaAccions = $('<td>').attr('data-cell', 'Accions : ');

        // Icona editar
        const editar = $('<a>')
            .addClass('icon-editar')
            .attr('href', `subpage/indexEditar.html?id=${pais.id}&name=${encodeURIComponent(pais.name)}`)
            .html('<i class="fa-solid fa-pen-to-square"></i>');
        
        // Icona esborrar
        const esborrar = $('<a>')
            .addClass('icon-borrar')
            .html('<i class="fa-solid fa-trash"></i>')
            .on('click', () => esborrarPais(pais.id));

        // Icona Províncies
        const provincies = $('<a>')
            .addClass('icon-visualitzar')
            .attr('href', `provincia.html?id=${pais.id}&country=${encodeURIComponent(pais.name)}`)
            .html('<i class="fa-solid fa-city"></i>');

        celdaAccions.append(editar, esborrar, provincies);
        fila.append(celdaId, celdaNom, celdaAccions);
        $cosTaula.append(fila);
    });
}

// Crea un nou país amb jQuery
async function crearPaisJQuery() {
    const nomPais = $("#country").val().trim();
    
    // Carregar països existents per a obtenir el pròxim ID
    let països = [];
    try {
        països = await getData('https://api.serverred.es/', 'Country');
    } catch (error) {
        console.error('Error carregant països:', error);
    }

    // Trobar el pròxim ID disponible
    const maxId = països.length ? Math.max(...països.map(p => parseInt(p.id))) + 1 : 1;

    const nouPais = {
        id: maxId.toString(),
        name: nomPais
    };

    try {
        await postData('https://api.serverred.es/', 'Country', nouPais);
        
        // Redirigir a la pàgina principal
        window.location.href = "../index.html";
    } catch (error) {
        console.error('Error en crear el país:', error);
        alert('Error en afegir el país.');
    }
}

// Esborra un país
async function esborrarPais(id) {
    const pais = Country.find(p => p.id === id);
    const nomPais = pais ? pais.name : '';

    // Finestra emergent de confirmació
    const confirmar = confirm(`Segur que vols eliminar "${nomPais}"?`);

    if (confirmar) {
        try {
            await deleteData('https://api.serverred.es/', 'Country', id);
            
            // Actualitzar llistes locals
            const idxGeneral = Country.findIndex(p => p.id === id);
            if (idxGeneral !== -1) Country.splice(idxGeneral, 1);
            
            const idxFiltrat = paisosFiltrats.findIndex(p => p.id === id);
            if (idxFiltrat !== -1) paisosFiltrats.splice(idxFiltrat, 1);
            
            // Comprovar si la pàgina actual ha quedat buida
            const totalPagines = Math.ceil(paisosFiltrats.length / itemsPerPagina);
            if (paginaActual > totalPagines && totalPagines > 0) {
                paginaActual = totalPagines; // Ves a l'última pàgina que existeix
            } else if (totalPagines === 0) {
                paginaActual = 1; // Si no queden items, torna a la pàgina 1 (buida)
            }
            
            mostrarPagina();
        } catch (error) {
            console.error('Error en eliminar el país:', error);
        }    
    }
}

// --- FUNCIONS AUXILIARS ---

// Valida el país amb jQuery
// Valida el país amb jQuery i comprova duplicats
async function validarPaisJQuery() {
    const $entrada = $("#country");
    const $missatgeError = $("#missatgeError");
    const $paisId = $("#paisId"); // Per a mode editar
    const nom = $entrada.val().trim();
    
    // Netejar missatge d'error
    $missatgeError.text("");
    $entrada.removeClass("error");
    
    // Validar que no estigui buit
    if (nom === "") {
        $missatgeError.text("El nom del país és obligatori.");
        $entrada.addClass("error");
        $entrada.focus();
        return false;
    }
    
    // Validar longitud mínima
    if (nom.length < 3) {
        $missatgeError.text("El nom ha de tenir com a mínim 3 caràcters.");
        $entrada.addClass("error");
        $entrada.focus();
        return false;
    }
    
    // Validar patró
    const patro = /^[A-Za-zÀ-ÿ\s]{3,30}$/;
    if (!patro.test(nom)) {
        $missatgeError.text("Nomós es permeten lletres i espais (3-30 caràcters).");
        $entrada.addClass("error");
        $entrada.focus();
        return false;
    }
    
    // --- COMPROVACIÓ DE DUPLICATS ---
    const nomLower = nom.toLowerCase();
    
    try {
        // Carregar tots els països per comprovar duplicats
        const païsosExistent = await getData('https://api.serverred.es/', 'Country');
        
        // Verificar si estem en mode editar o crear
        const mode = window.location.pathname.includes('indexEditar.html') ? 'editar' : 'crear';
        const idIgnorar = mode === 'editar' && $paisId.length ? $paisId.val() : null;
        
        // Buscar duplicats
        const duplicat = païsosExistent.find(p => {
            if (!p || !p.id || !p.name) return false;
            
            // En mode editar, si l'ID coincideix amb el que estem editant, no és duplicat
            if (mode === 'editar' && idIgnorar && p.id.toString() === idIgnorar.toString()) {
                return false;
            }
            
            return p.name.toLowerCase() === nomLower;
        });
        
        if (duplicat) {
            // Mostrar alerta igual que en el teu exemple
            alert("Aquest país ja existeix.");
            
            // També marcar com error al formulari
            $missatgeError.text(`Aquest país "${duplicat.name}" ja existeix.`);
            $entrada.addClass("error");
            $entrada.focus();
            return false;
        }
        
    } catch (error) {
        console.error('Error comprovant duplicats:', error);
        // Si hi ha error en la comprovació, permetem continuar
        // per no bloquejar l'usuari
    }
    
    return true;
}

// Per a mantenir compatibilitat amb la teva funció original
function validarPais() {
    return validarPaisJQuery();
}

function configurarBotoTornar() {
    return configurarBotoTornarJQuery();
}

// Funció per actualitzar un país en l'array local
function actualitzarPaisLocal(id, nouNom) {
    // Actualitzar a l'array principal
    const index = Country.findIndex(pais => pais.id === id);
    if (index !== -1) {
        Country[index].name = nouNom;
    }
    
    // Actualitzar a l'array filtrat si existeix
    const indexFiltrat = paisosFiltrats.findIndex(pais => pais.id === id);
    if (indexFiltrat !== -1) {
        paisosFiltrats[indexFiltrat].name = nouNom;
    }
}

// Verificar si venim d'una edició (podem afegir un paràmetre a l'URL)
function verificarRecarregarDespresEdicio() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('t')) {
        // És una recàrrega després d'editar
        console.log('Recarregant dades després d\'edició...');
        // Eliminar el paràmetre de la URL sense refrescar
        window.history.replaceState({}, document.title, window.location.pathname);
    }
}

// Funció millorada per actualitzar dades a l'API
async function updateId(baseUrl, endpoint, id, data) {
    try {
        console.log(`Actualitzant ${endpoint}/${id}:`, data);
        const response = await fetch(`${baseUrl}${endpoint}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        console.log('Resposta de l\'API:', result);
        return result;
    } catch (error) {
        console.error('Error en updateId:', error);
        throw error;
    }
}