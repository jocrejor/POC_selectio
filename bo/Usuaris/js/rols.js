// Array per emmagatzemar els rols.
let rols = []; // Rols per defecte del sistema

// Inicialització - s'executa quan la pàgina està carregada
document.addEventListener("DOMContentLoaded",main); 
    
async function main () {

    thereIsUser("../login.html");

    // Gestionem els botons de tancar sessió
    botonsTancarSessio("../login.html");

    rols = await getData(url, "Rol");
    usuaris = await getData(url, "User");
    mostrarRols();
    
    // Configuració del botó de tornar a la pàgina d'usuaris
    const usuarisButton= document.getElementById("usuaris");
    
    usuarisButton.addEventListener("click", (e) => {
        window.location.href='index.html';
    });

    // Configurar l'event listener per al formulari d'afegir rols
    document.getElementById("formulariRol").addEventListener("submit", afegirRol);
};


// Funció per guardar els rols al localStorage.
function guardarRols() {
    actualitzarSelectorRols();
    return postData(url, "Rols", nouUsuari);
}

// Funció per mostrar tots els rols en una taula HTML.
function mostrarRols() {
    const llista = document.getElementById('llistaRols');
    
    llista.replaceChildren();

    // Crear taula
    const taula = document.createElement('table');
    taula.id = 'taula_rols';

    // Crear capçalera
    const header = document.createElement('tr');
    const columnes = ['ID', 'Nom', 'Accio'];
    columnes.forEach(text => {
        const th = document.createElement('th');
        th.appendChild(document.createTextNode(text));
        header.appendChild(th);
    });
    taula.appendChild(header);

    // Crear dinàmicament cada element de la taula amb el seu botó d'eliminar
    
    //for (let i = 0; i < rols.length; i++) {
// Crear files per a cada rol
    rols.forEach((rol, index) => {
        const fila = document.createElement('tr');

        // ID
        const tdId = document.createElement('td');
        tdId.appendChild(document.createTextNode(rol.id));
        fila.appendChild(tdId);

        // Nom del rol
        const tdNom = document.createElement('td');
        tdNom.appendChild(document.createTextNode(rol.name));
        fila.appendChild(tdNom);

        // Cel·la d'accions
        const accionsTd = document.createElement('td');
        accionsTd.classList.add('accio');

        // Botó eliminar
        const botoEliminar = document.createElement('a');
        botoEliminar.classList.add("icon-borrar");

        // Crear l'icona FontAwesome
        const icona = document.createElement('i');
        icona.classList.add('fa-solid', 'fa-trash');

        // Afegir la icona dins del botó
        botoEliminar.appendChild(icona);

        // Afegir l'esdeveniment
        botoEliminar.addEventListener('click', () => eliminarRol(index));

        // Afegir el botó a la cel·la
        accionsTd.appendChild(botoEliminar);

        fila.appendChild(accionsTd);

        // Afegir la fila a la taula
        taula.appendChild(fila);
    });

    // Afegir taula al contenidor
    llista.appendChild(taula);
}

// Funció per afegir un nou rol des del formulari.
async function afegirRol(e) {
    e.preventDefault(); // Evitar l'enviament tradicional del formulari

    let rol = document.getElementById("nouRol").value.trim();

    let nouRol = {
        "name": rol
    };

    const rolExisteix = rols.some(r => r.name === nouRol.name);

    // Validacions per afegir el nou rol
    if (!rol) {
        mostrarMissatge('El nom del rol no pot estar buit', 'missatgeError');
    } else if (rol && !rolExisteix) {
        await postData(url, "Rol", nouRol);
        rols = await getData(url, "Rol");
        mostrarRols();
        document.getElementById("nouRol").setAttribute("value", ""); // Netejar el camp
        mostrarMissatge(`Rol ${nouRol.name} afegit correctament`, 'missatge');
    } else if (rolExisteix) {
        mostrarMissatge('Aquest rol ja existeix', 'missatgeError');
    }
}

// Funció per eliminar un rol amb confirmació.
async function eliminarRol(idRol) {
    const rol = rols[idRol];
    let rolUtilitzat = false;

    // Impedir eliminar els rols que estiguen sent utilitzats per algun usuari
    usuaris.forEach(u => {
        if (String(u.rol_id) == String(rol.id)) {
            mostrarMissatge('No pots eliminar els rols que ja tinga algun usuari asignat', 'missatgeError');
            rolUtilitzat = true;
        }
    });

    // Si el rol està sent utilitzat eixim de la funció per a evitar que s'execute el reste del code de la funció
    if (rolUtilitzat) {
        return;
    }

    if (confirm(`Estàs segur que vols eliminar el rol ${rol.name}?`)) {
        // Filtrar l'array per eliminar el rol especificat
        await deleteData(url, 'Rol', rol.id);
        rols = await getData(url, "Rol");
        mostrarRols();
        mostrarMissatge(`Rol ${rol.name} eliminat correctament`, 'missatge');
    }
}

// Funció encarregada de mostrar el missatge d'error o informatiu
function mostrarMissatge (mis, clase) {
    const contenidorMissatge = document.getElementById('contenidorMissatge');

    // Removem els elements anteriors
    contenidorMissatge.replaceChildren();

    // Creem el missatge
    const missatge = document.createElement('p');
    missatge.id = "missatge";
    missatge.classList.add(clase);
    const contingutMissatge = document.createTextNode(mis);

    // Afegim com a fills els elements creats
    missatge.appendChild(contingutMissatge);
    contenidorMissatge.appendChild(missatge);
}

// Funció per actualitzar el selector de rols a totes les pàgines.
function actualitzarSelectorRols() {
    // Aquesta funció assegura que els rols estan sincronitzats. En un sistema real, aquí s'actualitzarien totes les pàgines obertes
    console.log('Rols actualitzats:', rols);
}