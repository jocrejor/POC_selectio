document.addEventListener("DOMContentLoaded", main);

// Variables globals
let accio = "Afegir";
let countryId = null;
let countryName = "";
let provinciesFiltrades = [];
let Province = []; 
const API_URL = 'http://localhost:5002/Province';

// Carrega totes les províncies
async function carregarProvincies() {
    try {
        const data = await getData('http://localhost:5002/', 'Province');
        Province = data || [];
        return Province;
    } catch (error) {
        console.error('Error carregant províncies:', error);
        return [];
    }
}

// Funció principal
async function main() {
    Province = await carregarProvincies();
    llegirParametresURL();
    mostrarInformacioContext();

    if (!countryId) {
        alert("No s'ha pogut determinar el país seleccionat.");
        return;
    }

    provinciesFiltrades = Province.filter(p => p.country_id.toString() === countryId.toString());
    mostrarLlista(provinciesFiltrades);

    configurarBotoAfegir();
    configurarCercador();
}

// Llig paràmetres URL
function llegirParametresURL() {
    const params = new URLSearchParams(window.location.search);
    countryName = params.get("country");
    countryId = params.get("id");
}

// Mostra el país seleccionat
function mostrarInformacioContext() {
    document.getElementById("id").textContent =
        "País seleccionat: " + (countryName || "(Desconegut)");
}

// Configura botó afegir/actualitzar
function configurarBotoAfegir() {
    const afegirButton = document.getElementById("afegir");
    afegirButton.textContent = accio;

    afegirButton.addEventListener("click", async () => {
        if (!validarProvincia()) return;

        if (accio === "Afegir") {
            await crearProvincia();
        } else {
            await actualitzarProvincia();
            accio = "Afegir";
            afegirButton.textContent = accio;
        }

        netejarFormulari();

        Province = await carregarProvincies();
        provinciesFiltrades = Province.filter(p => p.country_id.toString() === countryId.toString());
        mostrarLlista(provinciesFiltrades);
    });
}

// Configura cercador
function configurarCercador() {
    const buscarInput = document.getElementById("buscar");

    buscarInput.addEventListener("input", () => {
        const text = buscarInput.value.toLowerCase();
        const filtrades = provinciesFiltrades.filter(p => p.name.toLowerCase().includes(text));
        mostrarLlista(filtrades);
    });
}

// Mostrar llista
function mostrarLlista(array) {
    const visualitzarLlista = document.getElementById("llista");
    
    // Netejar la llista existent utilitzant DOM
    while (visualitzarLlista.firstChild) {
        visualitzarLlista.removeChild(visualitzarLlista.firstChild);
    }

    // Crear elements per a cada província utilitzant DOM
    array.forEach((prov, index) => {
        const listItem = document.createElement("li");
        
        // Botó esborrar
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "🗑️ Esborrar";
        deleteButton.addEventListener("click", () => esborrarProvincia(prov.id));
        
        // Botó modificar
        const editButton = document.createElement("button");
        editButton.textContent = "✏️ Modificar";
        editButton.addEventListener("click", () => prepararActualitzar(index));
        
        // Enllaç a poblacions
        const poblacionsLink = document.createElement("a");
        poblacionsLink.href = `./poblacio.html?country_id=${countryId}&country=${encodeURIComponent(countryName)}&province_id=${prov.id}&province=${encodeURIComponent(prov.name)}`;
        
        const poblacionsButton = document.createElement("button");
        poblacionsButton.textContent = "Poblacions";
        poblacionsLink.appendChild(poblacionsButton);
        
        // Text del nom de la província
        const provinceName = document.createTextNode(` ${prov.name}`);
        
        // Afegir tots els elements al li
        listItem.appendChild(deleteButton);
        listItem.appendChild(editButton);
        listItem.appendChild(poblacionsLink);
        listItem.appendChild(provinceName);
        
        // Afegir el li a la llista
        visualitzarLlista.appendChild(listItem);
    });
}

// Crear província
async function crearProvincia() {
    const provinceName = document.getElementById("province").value.trim();

    const maxId = Province.length ? Math.max(...Province.map(p => parseInt(p.id))) + 1 : 1;

    const novaProv = {
        id: maxId.toString(),
        country_id: parseInt(countryId),
        name: provinceName
    };

    try {
        await postData('http://localhost:5002/', 'Province', novaProv);
        Province.push(novaProv);
        alert(`Província "${provinceName}" afegida correctament.`);
    } catch (error) {
        console.error('Error al crear província:', error);
        alert('Error al afegir la província.');
    }
}

// Actualitzar província
async function actualitzarProvincia() {
    const index = document.getElementById("index").value;
    const provinceName = document.getElementById("province").value.trim();
    const provinciaId = provinciesFiltrades[index].id;

    const dadesActualitzades = { name: provinceName };

    try {
        await updateId('http://localhost:5002/', 'Province', provinciaId, dadesActualitzades);

        const provGeneral = Province.find(p => p.id === provinciaId);
        if (provGeneral) provGeneral.name = provinceName;

        alert(`Província actualitzada correctament a "${provinceName}".`);
    } catch (error) {
        console.error('Error al actualitzar província:', error);
        alert('Error al actualitzar la província.');
    }
}

// Esborrar província
async function esborrarProvincia(id) {
    const provincia = Province.find(p => p.id === id);
    const provinciaNom = provincia ? provincia.name : '';

    const confirmar = confirm(`Vols eliminar la província "${provinciaNom}"?`);

    if (confirmar) {
        try {
            await deleteData('http://localhost:5002/', 'Province', id);

            const idxGeneral = Province.findIndex(p => p.id === id);
            if (idxGeneral !== -1) Province.splice(idxGeneral, 1);

            const idxFiltrat = provinciesFiltrades.findIndex(p => p.id === id);
            if (idxFiltrat !== -1) provinciesFiltrades.splice(idxFiltrat, 1);

            mostrarLlista(provinciesFiltrades);
            alert(`La província "${provinciaNom}" s'ha eliminat correctament.`);

        } catch (error) {
            console.error('Error al eliminar província:', error);
            alert('Error al eliminar la província.');
        }
    } else {
        alert(`S'ha cancel·lat l'eliminació de "${provinciaNom}".`);
    }
}

// Preparar actualitzar
function prepararActualitzar(index) {
    document.getElementById("index").value = index;
    document.getElementById("province").value = provinciesFiltrades[index].name;

    accio = "Actualitzar";
    document.getElementById("afegir").textContent = accio;
}

// Validar
function validarProvincia() {
    let province = document.getElementById("province");
    let nom = province.value.trim().toLowerCase();

    if (nom === "") {
        document.getElementById("mensajeError").textContent = "Has d'introduïr una província.";
        return false;
    }

    if (province.validity.patternMismatch) {
        document.getElementById("mensajeError").textContent = "Ha de tindre una mida de 3 a 30 caràcters.";
        return false;
    }

    if (provinciesFiltrades.some(p => p.name.toLowerCase() === nom)) {
        document.getElementById("mensajeError").textContent = "La província ja existeix en este país.";
        return false;
    }

    document.getElementById("mensajeError").textContent = "";
    return true;
}

// Netejar formulari
function netejarFormulari() {
    document.getElementById("province").value = "";
    document.getElementById("index").value = "-1";
}