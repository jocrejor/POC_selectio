document.addEventListener("DOMContentLoaded", main);

async function main() {    
    // Carregar dades de les APIs
    const [clients, favorits, comparadors] = await Promise.all([
        carregarClientsApi(url),
        carregarFavoritsApi(url),
        carregarComparadorsApi(url)
    ]);

    carregarSelects(clients, favorits, comparadors);

    // Configurar esdeveniments del formulari
    configurarFormulari(url);
}

// FUNCIONS DE CÀRREGA DE DADES ----------------------------
async function carregarClientsApi(url) {
    const data = await getData(url, "Client");
    return Array.isArray(data) ? data : [];
}

async function carregarFavoritsApi(url) {
    const data = await getData(url, "Favorite");
    return Array.isArray(data) ? data : [];
}

async function carregarComparadorsApi(url) {
    const data = await getData(url, "Comparator");
    return Array.isArray(data) ? data : [];
}

function carregarSelects(clients, favorits, comparadors) {
    const clientSelect = document.getElementById("client_id");
    const favSelect = document.getElementById("favorite_id");
    const compSelect = document.getElementById("comparator_id");

    // Informació clients
    clients.forEach(client => {
        const opcio = document.createElement("option");
        opcio.value = client.id;
        opcio.textContent = `${client.name} ${client.surname}`;
        clientSelect.appendChild(opcio);
    });

    // Informació favorits
    favorits.forEach(fav => {
        const opcio = document.createElement("option");
        opcio.value = fav.id;
        opcio.textContent = `${fav.id} - ${fav.product_name || "Favorit"}`;
        favSelect.appendChild(opcio);
    });

    // Informació comparadors
    comparadors.forEach(comp => {
        const opcio = document.createElement("option");
        opcio.value = comp.id;
        opcio.textContent = `${comp.id} - ${comp.session_id} - ${comp.user_agent} - ${comp.client_id || "Comparador"}`;
        compSelect.appendChild(opcio);
    });
}

function configurarFormulari(url) {
    const form = document.getElementById("formRegistre");
    const btnCancelar = document.getElementById("btnCancelar");
    const btnTornar = document.getElementById("afegirNou");

    carregarDadesEdicio(url);

    // Configurar submit del formulari
    form.addEventListener("submit", (e) => guardarRegistre(e, url));

    // botó cancel·lar
    btnCancelar.addEventListener("click", (e) => {
        e.preventDefault();
        sessionStorage.removeItem("editId");
        sessionStorage.removeItem("editIndex");
        window.location.href = "./index.html";
    });

    // botó tornar al llistat
    if (btnTornar) {
        btnTornar.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = "./index.html";
        });
    }
}

async function carregarDadesEdicio(url) {
    const editarId = sessionStorage.getItem("editId");
    if (!editarId) return;

    try {
        const registre = await getIdData(url, "Register", editarId);
        if (registre) {
            document.getElementById("client_id").value = String(registre.client_id || "");
            document.getElementById("comparator_id").value = String(registre.comparator_id || "");
            document.getElementById("favorite_id").value = String(registre.favorite_id || "");
            document.getElementById("date_start").value = registre.date_start || "";
            document.getElementById("date_end").value = registre.date_end || "";
        }
    } catch (error) {
        console.error("Error carregant el registre per editar:", error);
    }
}

async function guardarRegistre(e, url) {
    e.preventDefault();

    const date_start = document.getElementById("date_start").value;
    const date_end = document.getElementById("date_end").value;

    // Validar dates
    if (date_start && date_end && new Date(date_end) < new Date(date_start)) {
        alert("ERROR. La data final no pot ser anterior a la data d'inici.");
        return;
    }

    const formData = {
        client_id: document.getElementById("client_id").value,
        comparator_id: document.getElementById("comparator_id").value,
        favorite_id: document.getElementById("favorite_id").value,
        date_start: date_start,
        date_end: date_end,
    };

    try {
        const editId = sessionStorage.getItem("editId");
        
        if (editId) {
            await actualitzarRegistre(url, editId, formData);
        } else {
            await crearRegistre(url, formData);
        }

        window.location.href = "./index.html";

    } catch (error) {
        console.error("Error guardando registro:", error);
        alert("Error al guardar el registro. Por favor, intenta de nuevo.");
    }
}

async function actualitzarRegistre(url, editId, formData) {
    const existReg = await getIdData(url, "Register", editId);
    const infoAct = {
        ...formData,
        session_id: existReg.session_id,
        user_agent: existReg.user_agent
    };
    await updateId(url, "Register", editId, infoAct);
    sessionStorage.removeItem("editId");
    sessionStorage.removeItem("editIndex");
}

async function crearRegistre(url, formData) {
    const novaInfo = {
        ...formData,
        session_id: crypto.randomUUID(),
        user_agent: navigator.userAgent,
    };
    await postData(url, "Register", novaInfo);
}