$(document).ready(function() {
    main();
});

// Variables globals
let accio = "Afegir";
let countryId = null;
let countryName = "";
let provinciesFiltrats = [];
let Province = [];
const API_URL = 'https://api.serverred.es/Province';

// --- VARIABLES PER A PAGINACIÓ ---
let paginaActual = 1;
const itemsPerPagina = 10;

// Funció per carregar les províncies des del JSON server
async function carregarProvincies() {
    try {
        const data = await getData('https://api.serverred.es/', 'Province');
        Province = data || [];
        return Province;
    } catch (error) {
        console.error('Error carregant províncies:', error);
        return [];
    }
}

// Funció principal que s'executa quan es carrega la pàgina
async function main() {
    const isCrearPage = window.location.pathname.includes('provinciaCrear.html');
    const isEditarPage = window.location.pathname.includes('provinciaEditar.html');

    if (isCrearPage) {
        // Configuració per a la pàgina de crear
        await configurarPaginaCrear();
    } else if (isEditarPage) {
        // Configuració per a la pàgina d'editar
        await configurarPaginaEditar();
    } else {
        // Configuració per a la pàgina principal
        await configurarPaginaPrincipal();
    }
}

// Configuració per a la pàgina principal
async function configurarPaginaPrincipal() {
    await carregarDadesInicials();

    llegirParametresURL();    
    mostrarInformacioContext();

    if (!countryId) {
        alert("No s'ha pogut determinar el país seleccionat.");
        return;
    }

    // Inicialitzem la llista de províncies filtrats pel país
    provinciesFiltrats = Province.filter(p => p.country_id.toString() === countryId.toString());
    
    // Crida a mostrarPagina() en lloc de mostrarLlista()
    mostrarPagina();

    // Configurem el botó d'afegir
    configurarBotoAfegirPrincipal();

    // Configurem el botó de tornar a països
    configurarBotoTornarPaïsos();

    // Configurem el cercador amb jQuery
    configurarCercadorJQuery();
}

// Configuració per a la pàgina de crear
async function configurarPaginaCrear() {
    // Primer carreguem les províncies per a les validacions
    await carregarDadesInicials();
    llegirParametresURLCrear();
    configurarBotoTornarJQuery();
    configurarFormulariCrearJQuery();
}

// Configuració per a la pàgina d'editar
async function configurarPaginaEditar() {
    await carregarDadesInicials();
    
    // Configurar el botó Tornar
    configurarBotoTornarJQuery();

    // Obtenir dades de la URL
    const params = new URLSearchParams(window.location.search);
    const provinciaId = params.get('id');
    const provinciaName = params.get('name');
    countryId = params.get('country_id');
    countryName = params.get('country');

    // Omplir el formulari amb jQuery
    const $provinceInput = $("#province");
    const $provinciaIdInput = $("#provinciaId");

    if ($provinceInput.length) $provinceInput.val(provinciaName || "");
    if ($provinciaIdInput.length) $provinciaIdInput.val(provinciaId || "");

    // Configurar el formulari d'enviament
    const $form = $("form");
    if ($form.length) {
        $form.on("submit", async function(event) {
            event.preventDefault();

            if (!validarProvinciaJQuery()) return;

            const nouNomProvincia = $provinceInput.val().trim();
            
            const dadesActualitzades = {
                name: nouNomProvincia,
                country_id: parseInt(countryId)
            };

            try {
                await updateId('https://api.serverred.es/', 'Province', provinciaId, dadesActualitzades);
                alert(`Província "${nouNomProvincia}" actualitzada correctament.`);
                
                window.location.href = `../provincia.html?id=${countryId}&country=${encodeURIComponent(countryName)}`;
            } catch (error) {
                console.error('Error actualitzant província:', error);
                alert('Error actualitzant la província.');
            }
        });
    }

    // Configurar botó Reiniciar
    const $reiniciarButton = $("#reiniciar");
    if ($reiniciarButton.length) {
        $reiniciarButton.on('click', function(e) {
            e.preventDefault();
            if ($provinceInput.length) $provinceInput.val(provinciaName || "");
            $("#mensajeError").text("");
        });
    }
}

// Funció per configurar el cercador amb jQuery
function configurarCercadorJQuery() {
    const $buscarInput = $('#buscar');
    const $cercarButton = $('.cercar');
    const $netejarButton = $('.netejar');

    if ($buscarInput.length) {
        // Cerca en temps real a l'escriure
        $buscarInput.on('input', function() {
            const text = $(this).val();
            filtrarIMostrar(text);
        });

        // Cerca al fer clic al botó
        $cercarButton.on('click', function(e) {
            e.preventDefault();
            const text = $buscarInput.val();
            filtrarIMostrar(text);
            
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
            filtrarIMostrar('');
            
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

// Funció per filtrar i mostrar resultats
function filtrarIMostrar(textCerca) {
    const textCercaLower = textCerca.toLowerCase().trim();

    // Filtrar per país seleccionat
    let provinciesDelPais = Province.filter(p => p.country_id.toString() === countryId.toString());
    
    if (textCercaLower === '') {
        // Si no hi ha text, mostrar totes les províncies del país
        provinciesFiltrats = provinciesDelPais;
    } else {
        // Filtrar províncies segons el text de cerca
        provinciesFiltrats = provinciesDelPais.filter(provincia => 
            provincia.name.toLowerCase().includes(textCercaLower) ||
            provincia.id.toString().includes(textCercaLower)
        );
    }
    
    // Resetar la pàgina a 1 i mostrar la nova pàgina
    paginaActual = 1;
    mostrarPagina();
    
    // Mostrar missatge si no hi ha resultats
    mostrarMissatgeSenseResultats();
}


// --- FUNCIÓ CENTRAL PER A GESTIONAR LA PÀGINA ACTIVA ---
function mostrarPagina() {
    const startIndex = (paginaActual - 1) * itemsPerPagina;
    const endIndex = paginaActual * itemsPerPagina;
    const itemsPagina = provinciesFiltrats.slice(startIndex, endIndex);

    mostrarLlista(itemsPagina);

    renderitzarPaginacio();
}


// --- FUNCIÓ PER A LA PAGINACIÓ LLISCANT I CENTRADA ---
function renderitzarPaginacio() {
    const $paginacioContainer = $('#paginacio');
    if (!$paginacioContainer.length) {
        return; 
    } 

    $paginacioContainer.empty(); // Netejar botons antics

    const totalPagines = Math.ceil(provinciesFiltrats.length / itemsPerPagina);

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

    // --- LÒGICA DE LA FINESTRA LLISCANT ---
    const maxBotonsNumerics = 4;
    
    let startPage = paginaActual - 2; 
    if (startPage < 1) {
        startPage = 1;
    }

    let endPage = startPage + maxBotonsNumerics - 1;
    if (endPage > totalPagines) {
        endPage = totalPagines;
        startPage = totalPagines - maxBotonsNumerics + 1;
        if (startPage < 1) startPage = 1;
    }
    
    // --- Creació dels Botons Numèrics ---
    for (let i = startPage; i <= endPage; i++) {
        const $btnPage = $('<button>').text(i).addClass('btn-paginacio btn-page');
        
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
function mostrarMissatgeSenseResultats() {
    const $taulaBody = $('#llista');

    // Netejar missatges anteriors
    $('#missatgeSenseResultats').remove();
    $('#missatgeSenseProvincies').remove();

    const provinciesDelPais = Province.filter(p => p.country_id.toString() === countryId.toString());

    if (provinciesDelPais.length === 0) {
        // Si no hi ha províncies a la base de dades per eixe país
        const missatge = $('<tr id="missatgeSenseProvincies"><td colspan="3" style="text-align: center; padding: 20px;">No hi ha províncies registrades per este país</td></tr>');
        $taulaBody.append(missatge);
    } else if (provinciesFiltrats.length === 0) {
        // Si hi ha províncies però cap coincideix amb la cerca
        const missatge = $('<tr id="missatgeSenseResultats"><td colspan="3" style="text-align: center; padding: 20px;">No s\'han trobat províncies que coincideixen amb la cerca</td></tr>');
        $taulaBody.append(missatge);
    }
    
    actualitzarComptadorResultats();
}

// Actualitzar comptador de resultats
function actualitzarComptadorResultats() {
    $('#comptador-resultats').remove();
}

// Llegir paràmetres URL per a pàgina principal
function llegirParametresURL() {
    const params = new URLSearchParams(window.location.search);
    countryName = params.get("country");
    countryId = params.get("id");
}

// Llegir paràmetres URL per a pàgines crear/editar
function llegirParametresURLCrear() {
    const params = new URLSearchParams(window.location.search);
    countryName = params.get("country");
    countryId = params.get("country_id");
}

// Mostrar el país seleccionat
function mostrarInformacioContext() {
    const $nomPaisElement = $("#nomPais");
    if ($nomPaisElement.length) {
        $nomPaisElement.text(countryName || "(Desconegut)");
    }
}

// Configurar el botó d'afegir en la pàgina principal
function configurarBotoAfegirPrincipal() {
    const $afegirButton = $("#afegir");
    if ($afegirButton.length) {
        $afegirButton.on("click", function(e) {
            e.preventDefault();
            window.location.href = `subpage/provinciaCrear.html?country_id=${countryId}&country=${encodeURIComponent(countryName)}`;
        });
    }
}

// Configurar el botó de tornar a països
function configurarBotoTornarPaïsos() {
    const $tornarPaïsosButton = $("#tornarPaïsos");
    if ($tornarPaïsosButton.length) {
        $tornarPaïsosButton.on("click", function(e) {
            e.preventDefault();
            window.location.href = "index.html";
        });
    }
}

// Configurar el botó de tornar en la pàgina de crear/editar amb jQuery
function configurarBotoTornarJQuery() {
    const $tornarButton = $("#tornar");
    if ($tornarButton.length) {
        $tornarButton.on("click", function() {
            if (countryId && countryName) {
                window.location.href = `../provincia.html?id=${countryId}&country=${encodeURIComponent(countryName)}`;
            } else {
                window.location.href = "../provincia.html";
            }
        });
    }
}

// Configurar el formulari en la pàgina de crear amb jQuery
function configurarFormulariCrearJQuery() {
    const $form = $("form");
    if ($form.length) {
        $form.on("submit", async function(event) {
            event.preventDefault();
            
            if (!validarProvinciaJQuery()) return;
            
            await crearProvinciaJQuery();
        });
    }

    // Configurar botó Reiniciar en crear
    const $reiniciarButton = $("#reiniciar");
    if ($reiniciarButton.length) {
        $reiniciarButton.on('click', function(e) {
            e.preventDefault();
            const $provinceInput = $("#province");
            if ($provinceInput.length) $provinceInput.val("");
            $("#mensajeError").text("");
        });
    }
}

// --- FUNCIONS D'INICIALITZACIÓ ---

// Carregar les dades inicials
async function carregarDadesInicials() {
    Province = await carregarProvincies();
}

// --- FUNCIONS DE GESTIÓ DE PROVÍNCIES ---

// Mostrar la llista de províncies a la pàgina amb jQuery
function mostrarLlista(array) {
    const $taulaBody = $("#llista");
    if (!$taulaBody.length) return;

    // Netejar contingut
    $taulaBody.empty();

    if (array.length === 0) {
        return; 
    }

    array.forEach((provincia, index) => {
        const fila = $('<tr>');
        
        // Columna ID
        const tdId = $('<td>').text(provincia.id).attr('data-cell', 'ID : ');
        
        // Columna Nom
        const tdNom = $('<td>').text(provincia.name).attr('data-cell', 'Nom : ');
        
        // Columna Accions
        const tdAccions = $('<td>').attr('data-cell', 'Accions : ');

        // Icona editar
        const editar = $('<a>')
            .addClass('icon-editar')
            .attr('href', `subpage/provinciaEditar.html?id=${provincia.id}&name=${encodeURIComponent(provincia.name)}&country_id=${countryId}&country=${encodeURIComponent(countryName)}`)
            .html('<i class="fa-solid fa-pen-to-square"></i>');
        
        // Icona borrar
        const borrar = $('<a>')
            .addClass('icon-borrar')
            .html('<i class="fa-solid fa-trash"></i>')
            .on('click', () => esborrarProvincia(provincia.id));

        // Icona Poblacions
        const poblacions = $('<a>')
            .addClass('icon-visualitzar')
            .attr('href', `poblacio.html?country_id=${countryId}&country=${encodeURIComponent(countryName)}&province_id=${provincia.id}&province=${encodeURIComponent(provincia.name)}`)
            .html('<i class="fa-solid fa-city"></i>');

        tdAccions.append(editar, borrar, poblacions);
        fila.append(tdId, tdNom, tdAccions);
        $taulaBody.append(fila);
    });
}

// Crear una nova província amb jQuery
async function crearProvinciaJQuery() {
    const $provinceInput = $("#province");
    const nomProvincia = $provinceInput.val().trim();
    
    // Carregar províncies existents per obtenir el proper ID
    let provincies = [];
    try {
        provincies = await getData('https://api.serverred.es/', 'Province');
    } catch (error) {
        console.error('Error carregant províncies:', error);
    }

    // Trobar el proper ID disponible
    const maxId = provincies.length ? Math.max(...provincies.map(p => parseInt(p.id))) + 1 : 1;

    const novaProvincia = {
        id: maxId.toString(),
        country_id: parseInt(countryId),
        name: nomProvincia
    };

    try {
        await postData('https://api.serverred.es/', 'Province', novaProvincia);
        alert(`Província "${nomProvincia}" afegida correctament.`);
        
        // Redirigir a la pàgina principal de províncies
        window.location.href = `../provincia.html?id=${countryId}&country=${encodeURIComponent(countryName)}`;
    } catch (error) {
        console.error('Error creant província:', error);
        alert('Error afegint la província.');
    }
}

// Esborrar una província (Adaptada a la paginació)
async function esborrarProvincia(id) {
    const provincia = Province.find(p => p.id === id);
    const provinciaNom = provincia ? provincia.name : '';

    // Finestra emergent de confirmació
    const confirmar = confirm(`Vols eliminar la província "${provinciaNom}"?`);

    if (confirmar) {
        try {
            await deleteData('https://api.serverred.es/', 'Province', id);
            
            // Actualitzar llistes locals
            const idxGeneral = Province.findIndex(p => p.id === id);
            if (idxGeneral !== -1) Province.splice(idxGeneral, 1);
            
            const idxFiltrat = provinciesFiltrats.findIndex(p => p.id === id);
            if (idxFiltrat !== -1) provinciesFiltrats.splice(idxFiltrat, 1);

            // Recalcular paginació després d'esborrar
            const totalPagines = Math.ceil(provinciesFiltrats.length / itemsPerPagina);
            if (paginaActual > totalPagines && totalPagines > 0) {
                paginaActual = totalPagines; // Ves a l'última pàgina que existeix
            } else if (totalPagines === 0) {
                paginaActual = 1; // Si no queden items, torna a la pàgina 1 (buida)
            }
            
            mostrarPagina(); // Redibuixa la llista i la paginació

            alert(`La província "${provinciaNom}" s'ha eliminat correctament.`);
        } catch (error) {
            console.error('Error eliminant província:', error);
            alert('Error eliminant la província.');
        }
    } else {
        alert(`S'ha cancel·lat l'eliminació de "${provinciaNom}".`);
    }
}

// --- FUNCIONS AUXILIARS ---

// Validar la província abans d'afegir-la o actualitzar-la amb jQuery
function validarProvinciaJQuery() {
    const $input = $("#province");
    const $missatgeError = $("#mensajeError");
    
    if (!$input.length) {
        console.error("No s'ha trobat l'element amb id 'province'");
        return false;
    }
    
    const nom = $input.val().trim();
    const nomLower = nom.toLowerCase();

    // Netejar missatge d'error
    $missatgeError.text("");
    $input.removeClass("error");
    
    // Validar que no estigui buit
    if (nom === "") {
        $missatgeError.text("Has d'introduïr una província.");
        $input.addClass("error");
        $input.focus();
        return false;
    }
    
    // Validar longitud mínima
    if (nom.length < 3) {
        $missatgeError.text("El nom ha de tindre almenys 3 caràcters.");
        $input.addClass("error");
        $input.focus();
        return false;
    }
    
    // Validar patró
    const pattern = /^[A-Za-zÀ-ÿ\s]{3,30}$/;
    if (!pattern.test(nom)) {
        $missatgeError.text("Només es permeten lletres i espais (3-30 caràcters).");
        $input.addClass("error");
        $input.focus();
        return false;
    }

    // Validació de duplicats
    if (window.location.pathname.includes('provinciaCrear.html')) {
        // Filtrar províncies del mateix país
        const provinciesDelPais = Province.filter(p => p.country_id.toString() === countryId.toString());
        if (provinciesDelPais.some(p => p.name.toLowerCase() === nomLower)) {
            $missatgeError.text("La província ja existeix en este país.");
            $input.addClass("error");
            $input.focus();
            return false;
        }
    }

    // Validació per a editar
    if (window.location.pathname.includes('provinciaEditar.html')) {
        const $provinciaIdInput = $("#provinciaId");
        const provinciaIdActual = $provinciaIdInput.length ? $provinciaIdInput.val() : null;
        
        const provinciesDelPais = Province.filter(p => p.country_id.toString() === countryId.toString());
        if (provinciesDelPais.some(p => p.name.toLowerCase() === nomLower && p.id !== provinciaIdActual)) {
            $missatgeError.text("La província ja existeix en este país.");
            $input.addClass("error");
            $input.focus();
            return false;
        }
    }

    return true;
}

// Per mantenir compatibilitat amb la funció original
function validarProvincia() {
    return validarProvinciaJQuery();
}

function configurarBotoTornar() {
    return configurarBotoTornarJQuery();
}

function configurarFormulariCrear() {
    return configurarFormulariCrearJQuery();
}