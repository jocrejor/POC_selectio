document.addEventListener("DOMContentLoaded", main);

// Variables globals
let accio = "Afegir";
let countryId = null;
let countryName = "";
let provinceId = null;
let provinceName = "";
let ciutatsFiltrades = [];
let City = []; 

// Funcioó per obtindrer el següent ID
function obtindreSeguentId(llista) {

    console.log("DEBUG → Llista rebuda en obtindreSeguentId:", llista);

    if (!Array.isArray(llista)) {
        console.error("ERROR: La llista no és un array. Retornant ID = 1.");
        return 1;
    }

    // Convertim ID a número i eliminem NaN
    const ids = llista
        .map(e => Number(e.id))
        .filter(n => Number.isFinite(n) && n >= 0);

    if (ids.length === 0) return 1;
    
    const maxId = ids.reduce((max, current) => 
        current > max ? current : max, ids[0]
    );
    
    return maxId + 1;
}

// Carrega totes les Ciutats
async function carregarPoblacions() {
    try {
        const data = await getData("http://localhost:5002/", "City");

        console.log("DEBUG → Carregant City des del servidor:", data);

        // Protecció: assegurar que City sempre siga un array
        City = Array.isArray(data) ? data : [];

        return City;

    } catch (error) {
        console.error("ERROR carregant poblacions:", error);
        City = [];
        return [];
    }
}

// Funció principal
async function main() {

    City = await carregarPoblacions();
    llegirParametresURL();
    mostrarInformacioContext();

    if (!provinceId) {
        alert("No s'ha pogut determinar la província seleccionada.");
        return;
    }

    // Filtrar ciutats de la província
    ciutatsFiltrades = City.filter(
        c => c.province_id.toString() === provinceId.toString()
    );

    mostrarLlista(ciutatsFiltrades);

    configurarBotoAfegir();
    configurarCercador();
}

// Llig paràmetres URL
function llegirParametresURL() {
    const params = new URLSearchParams(window.location.search);

    countryId = params.get("country_id");
    countryName = params.get("country") ? decodeURIComponent(params.get("country")) : "(Desconegut)";
    provinceId = params.get("province_id");
    provinceName = params.get("province") ? decodeURIComponent(params.get("province")) : "(Desconeguda)";
}

// Mostra el país seleccionat
function mostrarInformacioContext() {
    document.getElementById("id_province").textContent =
        "Província seleccionada: " + provinceName;

    document.getElementById("id_country").textContent =
        "País seleccionat: " + countryName;
}

// ---------------------------------------------------------
// BOTÓ AFEGIR / ACTUALITZAR
// ---------------------------------------------------------
function configurarBotoAfegir() {

    const afegirButton = document.getElementById("afegir");
    afegirButton.textContent = accio;

    afegirButton.addEventListener("click", async () => {

        if (!validarCiutat()) return;

        if (accio === "Afegir") {
            await crearPoblacio();
        } else {
            await actualitzarPoblacio();
            accio = "Afegir";
            afegirButton.textContent = accio;
        }

        netejarFormulari();

        City = await carregarPoblacions();

        ciutatsFiltrades = City.filter(
            c => c.province_id.toString() === provinceId.toString()
        );

        mostrarLlista(ciutatsFiltrades);
    });
}

// ---------------------------------------------------------
// CERCADOR
// ---------------------------------------------------------
function configurarCercador() {

    const buscarInput = document.getElementById("buscar");

    buscarInput.addEventListener("input", () => {
        const text = buscarInput.value.toLowerCase();
        const filtrades = ciutatsFiltrades.filter(
            c => c.name.toLowerCase().includes(text)
        );

        mostrarLlista(filtrades);
    });
}

// ---------------------------------------------------------
// MOSTRAR LLISTA
// ---------------------------------------------------------
function mostrarLlista(array) {

    const visualitzarLlista = document.getElementById("llista");
    
    // Netejar la llista existent utilitzant DOM
    while (visualitzarLlista.firstChild) {
        visualitzarLlista.removeChild(visualitzarLlista.firstChild);
    }

    // Crear elements per a cada ciutat utilitzant DOM
    array.forEach((city, index) => {
        const listItem = document.createElement("li");
        
        // Botó esborrar
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "🗑️ Esborrar";
        deleteButton.addEventListener("click", () => esborrarPoblacio(city.id));
        
        // Botó modificar
        const editButton = document.createElement("button");
        editButton.textContent = "✏️ Modificar";
        editButton.addEventListener("click", () => prepararActualitzar(index));
        
        // Text del nom de la ciutat
        const cityName = document.createTextNode(` ${city.name}`);
        
        // Afegir tots els elements al li
        listItem.appendChild(deleteButton);
        listItem.appendChild(editButton);
        listItem.appendChild(cityName);
        
        // Afegir el li a la llista
        visualitzarLlista.appendChild(listItem);
    });
}

// ---------------------------------------------------------
// CREAR CIUTAT
// ---------------------------------------------------------
// En la función crearPoblacio, añade esta protección:
async function crearPoblacio() {

    const cityName = document.getElementById("city").value.trim();

    console.log("DEBUG → City abans de calcular ID:", City);

    // PROTECCIÓN: asegurar que City es array antes de obtener ID
    const cityArray = Array.isArray(City) ? City : [];
    const nouId = obtindreSeguentId(cityArray);

    const novaPoblacio = {
        id: nouId.toString(),
        province_id: parseInt(provinceId),
        name: cityName
    };

    try {
        await postData("http://localhost:5002/", "City", novaPoblacio);

        // PROTECCIÓN: asegurar que City es array antes de push
        if (Array.isArray(City)) {
            City.push(novaPoblacio);
        } else {
            City = [novaPoblacio];
        }

        alert(`Població "${cityName}" afegida correctament.`);

    } catch (error) {
        console.error("ERROR en crear població:", error);
        alert("No s'ha pogut crear la població.");
    }
}

// ---------------------------------------------------------
// ACTUALITZAR CIUTAT
// ---------------------------------------------------------
async function actualitzarPoblacio() {

    const index = document.getElementById("index").value;
    const cityName = document.getElementById("city").value.trim();
    const poblacioId = ciutatsFiltrades[index].id;

    const dadesActualitzades = { name: cityName };

    try {
        await updateId("http://localhost:5002/", "City", poblacioId, dadesActualitzades);

        const cityGeneral = City.find(c => c.id === poblacioId);
        if (cityGeneral) cityGeneral.name = cityName;

        alert(`Població actualitzada correctament.`);

    } catch (error) {
        console.error("ERROR en actualitzar població:", error);
        alert("No s'ha pogut actualitzar la població.");
    }
}

// ---------------------------------------------------------
// ESBORRAR CIUTAT
// ---------------------------------------------------------
async function esborrarPoblacio(id) {

    const poblacio = City.find(c => c.id === id);
    const poblacioNom = poblacio ? poblacio.name : "";

    if (!confirm(`Vols eliminar "${poblacioNom}"?`)) {
        alert("Eliminació cancel·lada.");
        return;
    }

    try {
        await deleteData("http://localhost:5002/", "City", id);

        City = City.filter(c => c.id !== id);
        ciutatsFiltrades = ciutatsFiltrades.filter(c => c.id !== id);

        mostrarLlista(ciutatsFiltrades);

        alert(`Població "${poblacioNom}" eliminada.`);

    } catch (error) {
        console.error("ERROR eliminant població:", error);
        alert("No s'ha pogut eliminar.");
    }
}

// ---------------------------------------------------------
// PREPARAR MODIFICACIÓ
// ---------------------------------------------------------
function prepararActualitzar(index) {

    document.getElementById("index").value = index;
    document.getElementById("city").value = ciutatsFiltrades[index].name;

    accio = "Actualitzar";
    document.getElementById("afegir").textContent = accio;
}

// ---------------------------------------------------------
// VALIDACIÓ
// ---------------------------------------------------------
function validarCiutat() {

    let city = document.getElementById("city");
    let nom = city.value.trim().toLowerCase();

    if (nom === "") {
        document.getElementById("mensajeError").textContent =
            "Has d'introduïr una ciutat.";
        return false;
    }

    if (city.validity.patternMismatch) {
        document.getElementById("mensajeError").textContent =
            "Ha de tindre entre 3 i 30 caràcters.";
        return false;
    }

    if (ciutatsFiltrades.some(c => c.name.toLowerCase() === nom)) {
        document.getElementById("mensajeError").textContent =
            "Aquesta ciutat ja existeix en aquesta província.";
        return false;
    }

    document.getElementById("mensajeError").textContent = "";
    return true;
}

// ---------------------------------------------------------
// NETEJAR FORMULARI
// ---------------------------------------------------------
function netejarFormulari() {
    document.getElementById("city").value = "";
    document.getElementById("index").value = "-1";
}