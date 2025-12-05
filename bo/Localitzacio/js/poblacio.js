$(document).ready(function() {
    main();
});

// Variables globals
let accio = "Afegir";
let countryId = null;
let countryName = "";
let provinceId = null;
let provinceName = "";
let poblacionsFiltrats = [];
let City = [];
const API_URL = 'https://api.serverred.es/City';

// --- VARIABLES PER A PAGINACIÓ ---
let paginaActual = 1;
const itemsPerPagina = 10;


// Funció principal que s'executa quan es carrega la pàgina
async function main() {
    console.log("DEBUG: Iniciant main()");

    // Detectar pàgina actual de forma més robusta
    const formCrear = $('#form-crear');
    const formEditar = $('#form-editar');
    const taulaLlistat = $('#taula');
    
    // Per a editar: si tenim form-editar O estem en poblacioEditar.html
    const isEditarPage = formEditar.length || 
                        (window.location.pathname.includes('poblacioEditar.html') && 
                         window.location.search.includes('id='));

    if (formCrear.length) {
        console.log("DEBUG: Pàgina detectada -> CREAR");
        await configurarPaginaCrear();
    } else if (isEditarPage) {
        console.log("DEBUG: Pàgina detectada -> EDITAR");
        await configurarPaginaEditar();
    } else if (taulaLlistat.length) {
        console.log("DEBUG: Pàgina detectada -> PRINCIPAL");
        await configurarPaginaPrincipal();
    } else {
        console.warn("DEBUG: No s'ha pogut identificar la pàgina.");
    }
}

// --- CONFIGURACIÓ DE PÀGINES ---

// Pàgina Principal
async function configurarPaginaPrincipal() {
    await carregarDadesInicials();
    llegirParametresURL();
    mostrarInformacioContext();

    if (!provinceId) {
        console.warn("No s'ha pogut determinar la província seleccionada.");
    } else {
        // Inicialitzem la llista de poblacions filtrats
        poblacionsFiltrats = City.filter(p => p.province_id.toString() === provinceId.toString());
        // Crida a mostrarPagina() en lloc de mostrarLlista()
        mostrarPagina();
    }

    configurarBotoAfegirPrincipal();
    configurarBotoTornarProvincies();
    configurarCercadorJQuery();
}

// Pàgina Crear
async function configurarPaginaCrear() {
    console.log("DEBUG: Configurant esdeveniments CREAR");
    
    // És vital carregar dades per a poder validar duplicats
    await carregarDadesInicials();
    llegirParametresURLCrear();
    mostrarInformacioContextCrear();
    configurarBotoTornarJQuery();

    const $form = $("#form-crear");
    if ($form.length) {
        $form.on("submit", async function(event) {
            // DETUREM l'enviament tradicional del formulari
            event.preventDefault();
            console.log("DEBUG: Clic en Enviar detectat");

            // Validem
            if (!validarPoblacioJQuery('crear')) {
                console.log("DEBUG: Validació fallida");
                return;
            }

            // Si passa validació, creem
            console.log("DEBUG: Validació OK. Creant...");
            await crearPoblacioJQuery();
        });
    } else {
        console.error("Error: No s'ha trobat el formulari amb id 'form-crear'");
    }

    // Botó reiniciar
    const $reiniciarButton = $("#reiniciar");
    if ($reiniciarButton.length) {
        $reiniciarButton.on('click', function(e) {
            e.preventDefault();
            const $input = $("#poblacio");
            if ($input.length) $input.val("");
            $("#mensajeError").text("");
        });
    }
}

// Pàgina Editar
async function configurarPaginaEditar() {
    console.log("DEBUG: Configurant esdeveniments EDITAR");
    
    await carregarDadesInicials();
    configurarBotoTornarJQuery();
    
    // Llegim dades actuals de la URL
    const params = new URLSearchParams(window.location.search);
    const poblacioId = params.get('id');
    const poblacioName = params.get('name');
    provinceId = params.get('province_id');
    provinceName = params.get('province');
    countryId = params.get('country_id');
    countryName = params.get('country');

    // Mostrar informació de context
    mostrarInformacioContextEditar();

    // Omplim l'input amb jQuery
    const $poblacioInput = $("#poblacio");
    if ($poblacioInput.length) $poblacioInput.val(poblacioName || "");

    // Configurar l'ID ocult
    const $poblacioIdHidden = $("#poblacioId");
    if ($poblacioIdHidden.length) $poblacioIdHidden.val(poblacioId);

    const $form = $("#form-editar");
    if ($form.length) {
        $form.on("submit", async function(event) {
            event.preventDefault();
            
            if (!validarPoblacioJQuery('editar', poblacioId)) {
                return;
            }

            const nouNomPoblacio = $poblacioInput.val().trim();
            const dadesActualitzades = {
                name: nouNomPoblacio,
                province_id: parseInt(provinceId)
            };

            try {
                await updateId('https://api.serverred.es/', 'City', poblacioId, dadesActualitzades);
                alert(`Població "${nouNomPoblacio}" actualitzada correctament.`);
                window.location.href = `../poblacio.html?country_id=${countryId}&country=${encodeURIComponent(countryName)}&province_id=${provinceId}&province=${encodeURIComponent(provinceName)}`;
            } catch (error) {
                console.error('Error actualitzant:', error);
                alert('Error actualitzant la població.');
            }
        });
    } else {
        console.error("Error: No s'ha trobat el formulari amb id 'form-editar'");
    }

    // Configurar botó reiniciar
    const $reiniciarButton = $("#reiniciar");
    if ($reiniciarButton.length) {
        $reiniciarButton.on('click', function(e) {
            e.preventDefault();
            // Restaurar valor original
            if ($poblacioInput.length) $poblacioInput.val(poblacioName || "");
            $("#mensajeError").text("");
        });
    }
}

// --- FUNCIONS DE CARREGA I DADES ---

async function carregarPoblacions() {
    try {
        const data = await getData('https://api.serverred.es/', 'City');
        City = data || [];
        return City;
    } catch (error) {
        console.error('Error carregant poblacions:', error);
        return [];
    }
}

async function carregarDadesInicials() {
    City = await carregarPoblacions();
    console.log("DEBUG: Dades carregades. Total ciutats:", City.length);
}

// --- LECTURA DE PARÀMETRES URL ---

function llegirParametresURL() {
    const params = new URLSearchParams(window.location.search);
    countryName = params.get("country");
    countryId = params.get("country_id");
    provinceName = params.get("province");
    provinceId = params.get("province_id");
}

function llegirParametresURLCrear() {
    llegirParametresURL();
}

// --- CONTEXT ---

function mostrarInformacioContext() {
    const $nomPaisElement = $("#nomPais");
    const $nomProvinciaElement = $("#nomProvincia");
    if ($nomPaisElement.length) $nomPaisElement.text(countryName || "(Desconegut)");
    if ($nomProvinciaElement.length) $nomProvinciaElement.text(provinceName || "(Desconeguda)");
}

function mostrarInformacioContextCrear() {
    console.log("Creant a la Província:", provinceName);
}

function mostrarInformacioContextEditar() {
    const $nomPaisElement = $("#nomPais");
    const $nomProvinciaElement = $("#nomProvincia");
    if ($nomPaisElement.length) $nomPaisElement.text(countryName || "(Desconegut)");
    if ($nomProvinciaElement.length) $nomProvinciaElement.text(provinceName || "(Desconeguda)");
}

// --- BOTONS DE NAVEGACIÓ ---

function configurarBotoAfegirPrincipal() {
    const $afegirButton = $("#afegir");
    if ($afegirButton.length) {
        $afegirButton.on("click", function(e) {
            e.preventDefault();
            window.location.href = `subpage/poblacioCrear.html?country_id=${countryId}&country=${encodeURIComponent(countryName)}&province_id=${provinceId}&province=${encodeURIComponent(provinceName)}`;
        });
    }
}

function configurarBotoTornarProvincies() {
    const $btn = $("#tornarProvincies");
    if ($btn.length) {
        $btn.on("click", function(e) {
            e.preventDefault();
            window.location.href = `provincia.html?id=${countryId}&country=${encodeURIComponent(countryName)}`;
        });
    }
}

function configurarBotoTornarJQuery() {
    const $tornarButton = $("#tornar");
    if ($tornarButton.length) {
        $tornarButton.on("click", function() {
            if (countryId && provinceId) {
                window.location.href = `../poblacio.html?country_id=${countryId}&country=${encodeURIComponent(countryName)}&province_id=${provinceId}&province=${encodeURIComponent(provinceName)}`;
            } else {
                window.location.href = "../poblacio.html";
            }
        });
    }
}

// --- CERCADOR AMB JQUERY ---

function configurarCercadorJQuery() {
    const $buscarInput = $('#buscar');
    const $cercarButton = $('.cercar');
    const $netejarButton = $('.netejar');

    if ($buscarInput.length) {
        // Cerca en temps real a l'escriure
        $buscarInput.on('input', function() {
            const text = $(this).val();
            filtrarIMostrarJQuery(text);
        });

        // Cerca al fer clic al botó
        $cercarButton.on('click', function(e) {
            e.preventDefault();
            const text = $buscarInput.val();
            filtrarIMostrarJQuery(text);
            
            // Efecte visual de cerca
            $(this).addClass('buscant');
            setTimeout(() => {
                $(this).removeClass('buscant');
            }, 300);
        });

        // Netejar cerca
        $netejarButton.on('click', function(e) {
            e.preventDefault();
            $buscarInput.val('');
            filtrarIMostrarJQuery('');
            
            // Enfocar el camp de cerca després de netejar
            $buscarInput.focus();
        });

        // Permetre cerca amb Enter
        $buscarInput.on('keypress', function(e) {
            if (e.which === 13) {
                e.preventDefault();
                $cercarButton.trigger('click');
            }
        });

        // Mostrar/amagar icona de netejar segons si hi ha text
        $buscarInput.on('input', function() {
            if ($(this).val().length > 0) {
                $(this).addClass('amb-text');
            } else {
                $(this).removeClass('amb-text');
            }
        });
    }
}

// Funció per filtrar i mostrar resultats amb jQuery
function filtrarIMostrarJQuery(textCerca) {
    const textCercaLower = textCerca.toLowerCase().trim();

    // Filtrar per província seleccionada
    let poblacionsDeProvincia = City.filter(p => p.province_id.toString() === provinceId.toString());
    
    if (textCercaLower === '') {
        // Si no hi ha text, mostrar totes les poblacions de la província
        poblacionsFiltrats = poblacionsDeProvincia;
    } else {
        // Filtrar poblacions segons el text de cerca
        poblacionsFiltrats = poblacionsDeProvincia.filter(poblacio => 
            poblacio.name.toLowerCase().includes(textCercaLower) ||
            poblacio.id.toString().includes(textCercaLower)
        );
    }
    
    // Resetar la pàgina a 1 i mostrar la nova pàgina
    paginaActual = 1;
    mostrarPagina();
    
    // Mostrar missatge si no hi ha resultats
    mostrarMissatgeSenseResultatsJQuery();
}

// --- NOVA FUNCIÓ CENTRAL PER A GESTIONAR LA PÀGINA ACTIVA ---
function mostrarPagina() {
    // Calcular els items de la pàgina actual
    const startIndex = (paginaActual - 1) * itemsPerPagina;
    const endIndex = paginaActual * itemsPerPagina;
    const itemsPagina = poblacionsFiltrats.slice(startIndex, endIndex);

    // Renderitzar la taula només amb aquests items
    mostrarLlista(itemsPagina);

    // Renderitzar els botons de paginació
    renderitzarPaginacio();
}


// --- FUNCIÓ PER A LA PAGINACIÓ LLISCANT I CENTRADA ---
function renderitzarPaginacio() {
    const $paginacioContainer = $('#paginacio');
    
    // Creem el contenidor si no existeix
    if (!$paginacioContainer.length) {
        return; 
    } 

    $paginacioContainer.empty(); // Netejar botons antics

    const totalPagines = Math.ceil(poblacionsFiltrats.length / itemsPerPagina);

    // No mostrar paginació si només hi ha 1 pàgina o menys
    if (totalPagines <= 1) {
        return;
    }

    // --- Botó Anterior ---
    if (paginaActual > 1) {
        const $btnPrev = $('<button>').text('Anterior').addClass('btn-paginacio btn-prev');
        $btnPrev.on('click', (e) => {
            e.preventDefault(); 
            if (paginaActual > 1) {
                paginaActual--;
                mostrarPagina();
            }
        });
        $paginacioContainer.append($btnPrev);
    }

    // --- FINESTRA LLISCANT ---

    const maxBotonsNumerics = 4;
    
    // Calcular l'inici per centrar la pàgina activa
    let startPage = paginaActual - 2; 

    // Assegurar que l'inici no sigui mai inferior a 1
    if (startPage < 1) {
        startPage = 1;
    }

    // Determinar el final de la finestra de visualització
    let endPage = startPage + maxBotonsNumerics - 1;

    // Corregir si el final s'ha passat del total de pàgines
    if (endPage > totalPagines) {
        endPage = totalPagines;
        
        // Ajustem l'inici per mantenir maxBotonsNumerics
        startPage = totalPagines - maxBotonsNumerics + 1;
        
        // Assegurar de nou que startPage no sigui menor que 1
        if (startPage < 1) {
             startPage = 1;
        }
    }
    
    // --- Creació dels Botons Numèrics ---
    for (let i = startPage; i <= endPage; i++) {
        const $btnPage = $('<button>').text(i).addClass('btn-paginacio btn-page');
        
        if (i === paginaActual) {
            // Afegeix la classe 'activa' per donar el color
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
        const $btnNext = $('<button>').text('Següent').addClass('btn-paginacio btn-next');
        $btnNext.on('click', (e) => {
            e.preventDefault(); 
            if (paginaActual < totalPagines) {
                paginaActual++;
                mostrarPagina();
            }
        });
        $paginacioContainer.append($btnNext);
    }
}


// Mostrar missatge si no hi ha resultats
function mostrarMissatgeSenseResultatsJQuery() {
    const $taulaBody = $('#llista');
    
    // Netejar missatges anteriors
    $('#missatgeSenseResultats').remove();
    $('#missatgeSensePoblacions').remove();

    // Obtenir totes les poblacions de la província actual
    const poblacionsDeProvincia = City.filter(p => p.province_id.toString() === provinceId.toString());

    if (poblacionsDeProvincia.length === 0) {
        // Si no hi ha poblacions a la base de dades per eixa província
        const missatge = $('<tr id="missatgeSensePoblacions"><td colspan="3" style="text-align: center; padding: 20px;">No hi ha poblacions registrades per esta província</td></tr>');
        $taulaBody.append(missatge);
    } else if (poblacionsFiltrats.length === 0) {
        // Si hi ha poblacions però cap coincideix amb la cerca
        const missatge = $('<tr id="missatgeSenseResultats"><td colspan="3" style="text-align: center; padding: 20px;">No s\'han trobat poblacions que coincideixin amb la cerca</td></tr>');
        $taulaBody.append(missatge);
    }
    
    // Actualitzar comptador de resultats
    actualitzarComptadorResultatsJQuery();
}

// Actualitzar comptador de resultats
function actualitzarComptadorResultatsJQuery() {
    // Eliminar comptador anterior si existeix
    $('#comptador-resultats').remove();
    
    // Crear nou comptador
    const textCerca = $('#buscar').val();
    const poblacionsDeProvincia = City.filter(p => p.province_id.toString() === provinceId.toString());
    const total = poblacionsDeProvincia.length;
    const trobades = poblacionsFiltrats.length;    
}

// --- TAULA HTML ---

function mostrarLlista(array) {
    const $taulaBody = $("#llista");
    if (!$taulaBody.length) return;

    $taulaBody.empty();

    if (array.length === 0) {
        return;
    }

    array.forEach((poblacio) => {
        const fila = $('<tr>');

        // ID
        const tdId = $('<td>')
            .text(poblacio.id)
            .attr('data-cell', 'ID : ');
        
        // Nom
        const tdNom = $('<td>')
            .text(poblacio.name)
            .attr('data-cell', 'Nom : ');
        
        // Accions
        const tdAccions = $('<td>')
            .attr('data-cell', 'Accions : ');

        // Editar
        const editar = $('<a>')
            .addClass('icon-editar')
            .attr('href', `subpage/poblacioEditar.html?id=${poblacio.id}&name=${encodeURIComponent(poblacio.name)}&country_id=${countryId}&country=${encodeURIComponent(countryName)}&province_id=${provinceId}&province=${encodeURIComponent(provinceName)}`)
            .html('<i class="fa-solid fa-pen-to-square"></i>');
        
        // Borrar
        const borrar = $('<a>')
            .addClass('icon-borrar')
            .html('<i class="fa-solid fa-trash"></i>')
            .css('cursor', 'pointer')
            .on('click', function() {
                esborrarPoblacio(poblacio.id);
            });

        tdAccions.append(editar, borrar);
        fila.append(tdId, tdNom, tdAccions);
        $taulaBody.append(fila);
    });
}

// --- CREAR I BORRAR ---

async function crearPoblacioJQuery() {
    const $poblacioInput = $("#poblacio");
    const nomPoblacio = $poblacioInput.val().trim();
    
    // Calcular ID màxim
    let maxId = 0;
    if (City.length > 0) {
        City.forEach(p => {
            const val = parseInt(p.id);
            if (!isNaN(val) && val > maxId) {
                maxId = val;
            }
        });
    }
    const nouId = maxId + 1;

    const novaPoblacio = {
        id: nouId.toString(),
        province_id: parseInt(provinceId),
        name: nomPoblacio
    };

    try {
        await postData('https://api.serverred.es/', 'City', novaPoblacio);
        alert(`Població "${nomPoblacio}" afegida correctament.`);
        window.location.href = `../poblacio.html?country_id=${countryId}&country=${encodeURIComponent(countryName)}&province_id=${provinceId}&province=${encodeURIComponent(provinceName)}`;
    } catch (error) {
        console.error('Error creant població:', error);
        alert('Error afegint la població: ' + error.message);
    }
}

async function esborrarPoblacio(id) {
    const poblacio = City.find(p => p.id === id);
    const nom = poblacio ? poblacio.name : id;
    
    if (confirm(`Vols eliminar la població "${nom}"?`)) {
        try {
            await deleteData('https://api.serverred.es/', 'City', id);
            
            // Actualitzem la llista localment per a no haver de recarregar tot
            City = City.filter(p => p.id !== id);
            poblacionsFiltrats = City.filter(p => p.province_id.toString() === provinceId.toString());
            
            // Recalcular paginació després d'esborrar
            const totalPagines = Math.ceil(poblacionsFiltrats.length / itemsPerPagina);
            if (paginaActual > totalPagines && totalPagines > 0) {
                paginaActual = totalPagines; // Ves a l'última pàgina que existeix
            } else if (totalPagines === 0) {
                paginaActual = 1; // Si no queden items, torna a la pàgina 1
            }
            
            mostrarPagina(); // Redibuixa la llista i la paginació
            
            alert(`La població "${nom}" s'ha eliminat correctament.`);
        } catch (error) {
            console.error('Error eliminant:', error);
            alert('Error eliminant la població.');
        }
    }
}

// --- VALIDACIÓ AMB JQUERY ---

function validarPoblacioJQuery(mode = 'crear', idIgnorar = null) {
    const $input = $("#poblacio");
    const $errorMsg = $("#mensajeError");
    
    if (!$input.length) return false;
    
    const nom = $input.val().trim();
    const nomLower = nom.toLowerCase();

    // Netejar missatge previ
    $errorMsg.text("");
    $input.removeClass("error");

    // Camp buit
    if (nom === "") {
        $errorMsg.text("Has d'introduïr una població.");
        $input.addClass("error");
        $input.focus();
        return false;
    }

    // Patró de lletres i espais, 3-30 chars
    const pattern = /^[A-Za-zÀ-ÿ\s]{3,30}$/;
    if (!pattern.test(nom)) {
        $errorMsg.text("El nom ha de tindre entre 3 i 30 caràcters i només lletres.");
        $input.addClass("error");
        $input.focus();
        return false;
    }

    // Duplicats dins de la mateixa província
    const ciutatsDeProvincia = City.filter(p => 
        p.province_id && p.province_id.toString() === provinceId.toString()
    );

    const duplicat = ciutatsDeProvincia.find(p => {
        // En mode editar, si l'ID coincideix amb el que estem editant, no és duplicat
        if (mode === 'editar' && p.id.toString() === idIgnorar.toString()) {
            return false;
        }
        return p.name.toLowerCase() === nomLower;
    });

    if (duplicat) {
        $errorMsg.text("Aquesta població ja existeix en aquesta província.");
        $input.addClass("error");
        $input.focus();
        return false;
    }

    return true;
}

// --- FUNCIONS DE COMPATIBILITAT PER MANTENIR EL CODI ORIGINAL ---

// Per mantenir compatibilitat amb les funcions originals
function configurarBotoTornar() {
    return configurarBotoTornarJQuery();
}

function validarPoblacio(mode = 'crear', idIgnorar = null) {
    return validarPoblacioJQuery(mode, idIgnorar);
}

function crearPoblacio() {
    return crearPoblacioJQuery();
}

function configurarCercador() {
    return configurarCercadorJQuery();
}