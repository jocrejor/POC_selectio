document.addEventListener("DOMContentLoaded", () => {
    carregarPaisos();

    document.getElementById("country").addEventListener("change", e => {
        carregarProvincies(parseInt(e.target.value));
        document.getElementById("city").innerHTML = "<option value=''>-- Selecciona una ciutat --</option>";
    });

    document.getElementById("province").addEventListener("change", e => {
        carregarCiutats(parseInt(e.target.value));
    });

    document.getElementById("formCrear").addEventListener("submit", crearClient);
});


async function carregarPaisos() {
    const sel = document.getElementById("country");
    sel.innerHTML = "<option value=''>-- Selecciona un país --</option>";
    
    const paisos = await getData(url, "Country");

    paisos.forEach(c => {
        const opt = document.createElement("option");
        opt.value = c.id;
        opt.textContent = c.name;
        sel.appendChild(opt);
    });
}

async function carregarProvincies(countryId) {
    const sel = document.getElementById("province");
    sel.innerHTML = "<option value=''>-- Selecciona una província --</option>";

    // Obtenemos TODAS las provincias
    const provincies = await getData(url, "Province");

    // Filtramos solo las del país seleccionado
    provincies
        .filter(p => p.country_id === countryId)
        .forEach(p => {
            const opt = document.createElement("option");
            opt.value = p.id;
            opt.textContent = p.name;
            sel.appendChild(opt);
        });
}

 
async function carregarCiutats(provinceId) {
    const sel = document.getElementById("city");
    sel.innerHTML = "<option value=''>-- Selecciona una ciutat --</option>";

    if (!provinceId) return;

    // 1. Obtén TODAS las ciudades
    const ciutats = await getData(url, "City");

    // 2. FILTRA correctamente por province_id
    ciutats
        .filter(c => Number(c.province_id) === Number(provinceId))
        .forEach(c => {
            const opt = document.createElement("option");
            opt.value = c.id;
            opt.textContent = c.name;
            sel.appendChild(opt);
        });
}



    
    async function crearClient(e) {
    e.preventDefault();

    const nouClient = {
        taxidtype: document.getElementById("taxidtype").value,
        taxid: document.getElementById("taxid").value,
        name: document.getElementById("name").value,
        surname: document.getElementById("surname").value,
        email: document.getElementById("email").value.trim(),
        password: "1234",
        phone: document.getElementById("phone").value,
        birth_date: document.getElementById("birth_date").value,
        address: document.getElementById("address").value,
        cp: document.getElementById("cp").value,
        country_id: parseInt(document.getElementById("country").value),
        province_id: parseInt(document.getElementById("province").value),
        city_id: parseInt(document.getElementById("city").value)
    };

    try {
        await postData(url, "Client", nouClient);  // <<== Aquí usamos la función CRUD
        alert("✅ Client creat correctament!");
        window.location.href = "index.html";
    } catch (error) {
        console.error(error);
        alert("❌ Hi ha hagut un error creant el client.");
    }
}


