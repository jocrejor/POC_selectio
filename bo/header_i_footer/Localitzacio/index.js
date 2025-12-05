document.addEventListener("DOMContentLoaded", main);

// Variables globals
let accio = "Afegir";
let paisosFiltrats = [];
let Country = []; // Variable global para almacenar los países
const API_URL = 'http://localhost:5002/Country';

// Función para cargar los países desde el JSON server
async function carregarPaisos() {
    try {
        const data = await getData('http://localhost:5002/', 'Country');
        Country = data || [];
        return Country;
    } catch (error) {
        console.error('Error cargando países:', error);
        return [];
    }
}

// Funció principal que s'executa quan es carrega la pàgina
async function main() {
    // --- Carreguem les dades inicials ---
    await carregarDadesInicials();

    // Inicialitzem la llista de països filtrats
    paisosFiltrats = [...Country];
    mostrarLlista(paisosFiltrats);

    // Configurem el botó d'afegir/actualitzar
    configurarBotoAfegir();

    // Configurem el cercador (si existeix)
    configurarCercador();
}

// --- FUNCIONS D'INICIALITZACIÓ ---

// Carrega les dades inicials
async function carregarDadesInicials() {
    Country = await carregarPaisos();
}

// Configura el botó d'afegir/actualitzar
function configurarBotoAfegir() {
    const afegirButton = document.getElementById("afegir");
    afegirButton.textContent = accio;

    afegirButton.addEventListener("click", async () => {
        if (!validarPais()) return;

        if (accio === "Afegir") {
            await crearPais();
        } else {
            await actualitzarPais();
            accio = "Afegir";
            afegirButton.textContent = accio;
        }

        // Netejar camps després de l'acció
        netejarCamps();
        // Recargar datos actualizados del servidor
        await carregarDadesInicials();
        paisosFiltrats = [...Country];
        mostrarLlista(paisosFiltrats);
    });
}

// Configura el cercador de països
function configurarCercador() {
    const buscarInput = document.getElementById("buscar");
    if (buscarInput) {
        buscarInput.addEventListener("input", () => {
            const text = buscarInput.value.toLowerCase();
            const filtrats = paisosFiltrats.filter(p =>
                p.name.toLowerCase().includes(text)
            );
            mostrarLlista(filtrats);
        });
    }
}

// --- FUNCIONS DE GESTIÓ DE PAÏSOS ---

// Mostra la llista de països a la pàgina
function mostrarLlista(array) {
    const visualitzarLlista = document.getElementById("llista");
    
    // Limpiar la lista existente usando DOM
    while (visualitzarLlista.firstChild) {
        visualitzarLlista.removeChild(visualitzarLlista.firstChild);
    }

    // Crear elementos para cada país usando DOM
    array.forEach((pais, index) => {
        const listItem = document.createElement("li");
        
        // Botón eliminar
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "🗑️ Esborrar";
        deleteButton.addEventListener("click", () => esborrarPais(pais.id));
        
        // Botón modificar
        const editButton = document.createElement("button");
        editButton.textContent = "✏️ Modificar";
        editButton.addEventListener("click", () => prepararActualitzar(index));
        
        // Enlace a provincias
        const provincesLink = document.createElement("a");
        provincesLink.href = `./provincia.html?id=${pais.id}&country=${encodeURIComponent(pais.name)}`;
        
        const provincesButton = document.createElement("button");
        provincesButton.textContent = "🏙️ Províncies";
        provincesLink.appendChild(provincesButton);
        
        // Texto del nombre del país
        const countryName = document.createTextNode(` ${pais.name}`);
        
        // Añadir todos los elementos al li
        listItem.appendChild(deleteButton);
        listItem.appendChild(editButton);
        listItem.appendChild(provincesLink);
        listItem.appendChild(countryName);
        
        // Añadir el li a la lista
        visualitzarLlista.appendChild(listItem);
    });
}

// Crea un nou país
async function crearPais() {
    const nomPais = document.getElementById("country").value.trim();
    
    // Encontrar el próximo ID disponible
    const maxId = Country.length ? Math.max(...Country.map(p => parseInt(p.id))) + 1 : 1;

    const nouPais = {
        id: maxId.toString(),
        name: nomPais
    };

    try {
        await postData('http://localhost:5002/', 'Country', nouPais);
        // Actualizar la lista local después de añadir
        Country.push(nouPais);
        alert(`País "${nomPais}" afegit correctament.`);
    } catch (error) {
        console.error('Error al crear país:', error);
        alert('Error al afegir el país.');
    }
}

// Actualitza un país existent
async function actualitzarPais() {
    const index = document.getElementById("index").value;
    const nomPais = document.getElementById("country").value.trim();
    const paisId = paisosFiltrats[index].id;

    const dadesActualitzades = {
        name: nomPais
    };

    try {
        await updateId('http://localhost:5002/', 'Country', paisId, dadesActualitzades);
        
        // Actualizar también en la lista local
        const paisGeneral = Country.find(p => p.id === paisId);
        if (paisGeneral) paisGeneral.name = nomPais;
        
        alert(`País actualitzat correctament a "${nomPais}".`);
    } catch (error) {
        console.error('Error al actualizar país:', error);
        alert('Error al actualitzar el país.');
    }
}

// Esborra un país
async function esborrarPais(id) {
    const pais = Country.find(p => p.id === id);
    const paisNom = pais ? pais.name : '';

    // Finestra emergent de confirmació
    const confirmar = confirm(`Vols eliminar el país "${paisNom}"?`);

    if (confirmar) {
        try {
            await deleteData('http://localhost:5002/', 'Country', id);
            
            // Actualizar listas locales
            const idxGeneral = Country.findIndex(p => p.id === id);
            if (idxGeneral !== -1) Country.splice(idxGeneral, 1);
            
            const idxFiltrat = paisosFiltrats.findIndex(p => p.id === id);
            if (idxFiltrat !== -1) paisosFiltrats.splice(idxFiltrat, 1);

            mostrarLlista(paisosFiltrats);
            alert(`El país "${paisNom}" s'ha eliminat correctament.`);
        } catch (error) {
            console.error('Error al eliminar país:', error);
            alert('Error al eliminar el país.');
        }
    } else {
        alert(`S'ha cancel·lat l'eliminació de "${paisNom}".`);
    }
}

// Prepara la interfície per actualitzar un país
function prepararActualitzar(index) {
    document.getElementById("index").value = index;
    document.getElementById("country").value = paisosFiltrats[index].name;
    accio = "Actualitzar";
    document.getElementById("afegir").textContent = accio;
}

// --- FUNCIONS AUXILIARS ---

// Valida el país abans d'afegir-lo o actualitzar-lo
function validarPais() {
    let input = document.getElementById("country");
    let nom = input.value.trim().toLowerCase();

    if (nom === "") {
        document.getElementById("mensajeError").textContent = "Has d'introduïr un país.";
        return false;
    }

    if (input.validity.patternMismatch) {
        document.getElementById("mensajeError").textContent = "Ha de tindre una mida de 3 a 30 caràcters.";
        return false;
    }

    if (paisosFiltrats.some(p => p.name.toLowerCase() === nom)) {
        document.getElementById("mensajeError").textContent = "El país ja existeix.";
        return false;
    }

    document.getElementById("mensajeError").textContent = "";
    return true;
}

// Neteja els camps del formulari
function netejarCamps() {
    document.getElementById("country").value = "";
    document.getElementById("index").value = "-1";
}