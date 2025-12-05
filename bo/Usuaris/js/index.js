document.addEventListener("DOMContentLoaded", main);

// Array per emmagatzemar informació
let usuaris = [];
let rols = [];
let elementsTaula = [];
let capcalera = [];

// Variables globals
const funcioBorrar = "eliminarUsuari";
const urlEditar = "usuarisAlta.html?editar";

// Funció per iniciar els esdeveniments de la pàgina
async function main () {

    thereIsUser("../login.html");

    // Gestionem els botons de tancar sessió
    botonsTancarSessio("../login.html");

    // Botons per a accedir a altaUsuaris i rols
    const usuarisButton= document.getElementById("afegirUsuari");
    const rolsButton= document.getElementById("gestionarRols");

    // Configuració del botó per a tornar al formulari d'altaUsuaris
    usuarisButton.addEventListener("click", (e) => {
        window.location.href='usuarisAlta.html';
    });

    // Configuració del botó per a tornar al formulari de rols
    rolsButton.addEventListener("click", (e) => {
        window.location.href='rols.html';
    });

    const filtreNom = document.getElementById('filtreNom');
    const filtreRol = document.getElementById('filtreRol');
    const botoCercar= document.getElementById("cercar");
    const botoNetejar= document.getElementById("netejar");

    rols = await getData(url, "Rol");
    usuaris = await getData(url, "User");
    
    carregarRolsSelect();
    autocompletarNom();
    actualitzarDades();

    // Botó de cercar
    botoCercar.addEventListener("click", (e) => {
        e.preventDefault();

        const text = filtreNom.value.toLowerCase();
        const rolSeleccionat = filtreRol.value;

        let usuarisFiltrats = usuaris;

        if (text) {
            usuarisFiltrats = usuarisFiltrats.filter(u => u.name.toLowerCase().includes(text));
        }

        if (rolSeleccionat) {
            usuarisFiltrats = usuarisFiltrats.filter(u => String(u.rol_id) === rolSeleccionat);
        }

        paginaActual = 1;

        actualitzarDades(usuarisFiltrats);
    });

    // Botón de netejar
    botoNetejar.addEventListener("click", (e) => {
        paginaActual = 1;
        actualitzarDades();
    });
}

// Funció que s'encarrega de carregar el select amb els rols per a filtrar
function carregarRolsSelect() {
    const selectorRol = document.getElementById("filtreRol");
    selectorRol.replaceChildren(); // Netejar per si de cas

    // Opció per mostrar tots
    const optTots = document.createElement("option");
    optTots.setAttribute("value", "");
    optTots.appendChild(document.createTextNode("Tots"));
    selectorRol.appendChild(optTots);

    // Afegim cada rol real
    rols.forEach(rol => {
        const option = document.createElement("option");
        option.setAttribute("value", rol.id);
        option.appendChild(document.createTextNode(rol.name));
        selectorRol.appendChild(option);
    });
}

// Funció encarregada d'actualitzar les dades
function actualitzarDades (usuarisFiltrats = null) {

    const arrayUsuaris = usuarisFiltrats || usuaris;

    crearElementsTaula(arrayUsuaris);
    carregarArray(arrayUsuaris);
    creaPagines();

    const paginats = aplicarPaginacio(elementsTaula);
    agafarDades(paginats);
    mostrarTaula(capcalera, urlEditar, funcioBorrar, null);
}

// Funció per a crear la informació que es vorà en la taula
function crearElementsTaula(usuarisFiltrats = null) {

    elementsTaula = [];
    capcalera = ['ID', 'Nom', 'Email', 'Nom usuari', 'Rol', 'Accions'];

    const arrayUsuaris = usuarisFiltrats || usuaris;

    // Crear una copia del array d'usuaris per a manipular-lo
    arrayUsuaris.forEach(u => {
        const copiaUsuario = {
            "id": u.id, 
            "name": u.name, 
            "email": u.email, 
            "nickname": u.nickname, 
            "rol_id": u.rol_id,
        };

        elementsTaula.push(copiaUsuario);
    });

    // Reemplazar rol_id per el nom
    rols.forEach(rol => {
        elementsTaula.forEach(u => {
            if (String(u.rol_id) === String(rol.id)) {
                u.rol_id = rol.name;
            }
        });
    });
}

// Funció per eliminar un usuari amb confirmació.
async function eliminarUsuari(id) {
    if (confirm("Estàs segur que vols eliminar aquest usuari?")) {
        await deleteData(url, 'User', id);
        await recarregarDades();
    }
}

// Funció per editar un usuari - redirigeix al formulari d'edició.
function editarUsuari(id) {
    window.location.href = `altaUsuaris.html?editar=${id}`;
}

// Funció encarregada de recarregar les dades y mostrar la taula
async function recarregarDades () {
    usuaris = await getData(url, "User");
    crearElementsTaula();
    agafarDades(elementsTaula);
    mostrarTaula(capcalera, urlEditar, funcioBorrar, null);   
}

// Funció encarregada de autompletar el input de nom
function autocompletarNom () {

    let nomsDisponibles = [];

    usuaris.forEach(u => {
        nomsDisponibles.push(u.name);
    })

    $( "#filtreNom" ).autocomplete({
      source: nomsDisponibles
    });
}
