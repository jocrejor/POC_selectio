document.addEventListener("DOMContentLoaded", main);

async function main() {
    thereIsUser("../login.html");
    botonsTancarSessio("../login.html");

    await cargarFamilias();

    const form = document.getElementById("productForm");
    form.addEventListener("submit", function(event) {
        event.preventDefault();
        crearProducto(event);
    });

    const btnVolver = document.getElementById("btnVolver");
    btnVolver.addEventListener("click", () => {
        window.location.href = "index.html";
    });

    // Afegir validació en temps real
    agregarValidacionEnTiempoReal();
}

async function cargarFamilias() {
    try {
        const select = document.getElementById("family_id");
        const familias = await getData(url, "Family");

        // Netejar opcions existents
        select.innerHTML = '';

        // Afegir opció per defecte
        const defaultOption = document.createElement("option");
        defaultOption.value = "";
        defaultOption.textContent = "Selecciona una família";
        defaultOption.disabled = true;
        defaultOption.selected = true;
        select.appendChild(defaultOption);

        // Afegir famílies
        familias.forEach(familia => {
            const option = document.createElement("option");
            option.value = familia.id;
            option.textContent = familia.name;
            select.appendChild(option);
        });
    } catch (error) {
        console.error("Error cargando familias:", error);
        alert("Error al cargar las familias.");
    }
}

function agregarValidacionEnTiempoReal() {
    const nameInput = document.getElementById("name");
    const priceInput = document.getElementById("price");
    const descriptionInput = document.getElementById("description");
    const familySelect = document.getElementById("family_id");

    // Validar nom
    nameInput.addEventListener("blur", async function() {
        const name = this.value.trim();
        if (name === "") {
            mostrarError(this, "El nom és obligatori");
        } else if (name.length < 2) {
            mostrarError(this, "El nom ha de tenir almenys 2 caràcters");
        } else if (name.length > 100) {
            mostrarError(this, "El nom no pot tenir més de 100 caràcters");
        } else if (await existeProductoConNombre(name)) {
            mostrarError(this, "Ja existeix un producte amb este nom");
        } else {
            limpiarError(this);
        }
    });

    // Validar preu
    priceInput.addEventListener("blur", function() {
        const price = parseFloat(this.value);
        if (isNaN(price)) {
            mostrarError(this, "El preu ha de ser un número vàlid");
        } else if (price <= 0) {
            mostrarError(this, "El preu no pot ser zero o negatiu");
        } else if (price > 1000000) {
            mostrarError(this, "El preu no pot ser major a 1.000.000");
        } else {
            limpiarError(this);
        }
    });

    // Validar descripció
    descriptionInput.addEventListener("blur", function() {
        const description = this.value.trim();
        if (description === "") {
            mostrarError(this, "La descripció és obligatòria");
        } else if (description.length > 500) {
            mostrarError(this, "La descripció no pot tenir més de 500 caràcters");
        } else {
            limpiarError(this);
        }
    });

    // Validar família
    familySelect.addEventListener("change", function() {
        const familyId = parseInt(this.value);
        if (isNaN(familyId)) {
            mostrarError(this, "Has de seleccionar una família vàlida");
        } else {
            limpiarError(this);
        }
    });
}

function mostrarError(input, mensaje) {
    // Netejar error anterior
    limpiarError(input);

    // Afegir classe d'error
    input.classList.add("error");

    // Crear element d'error
    const errorElement = document.createElement("div");
    errorElement.className = "error-message";
    errorElement.textContent = mensaje;

    // Inserir després de l'input
    input.parentNode.insertBefore(errorElement, input.nextSibling);
}

function limpiarError(input) {
    // Eliminar classe d'error
    input.classList.remove("error");

    // Eliminar missatge d'error si existeix
    const errorElement = input.parentNode.querySelector(".error-message");
    if (errorElement) {
        errorElement.remove();
    }
}

async function existeProductoConNombre(nombre) {
    try {
        const productos = await getData(url, "Product");
        return productos.some(producto =>
            producto.name.toLowerCase() === nombre.toLowerCase()
        );
    } catch (error) {
        console.error("Error verificando nombre del producto:", error);
        return false;
    }
}

async function validarFormulario() {
    const name = document.getElementById("name").value.trim();
    const price = parseFloat(document.getElementById("price").value);
    const description = document.getElementById("description").value.trim();
    const familyId = parseInt(document.getElementById("family_id").value);

    let esValido = true;

    // Validar nom
    if (name === "") {
        mostrarError(document.getElementById("name"), "El nom és obligatori");
        esValido = false;
    } else if (name.length < 2) {
        mostrarError(document.getElementById("name"), "El nom ha de tenir almenys 2 caràcters");
        esValido = false;
    } else if (name.length > 100) {
        mostrarError(document.getElementById("name"), "El nom no pot tenir més de 100 caràcters");
        esValido = false;
    } else if (await existeProductoConNombre(name)) {
        mostrarError(document.getElementById("name"), "Ja existeix un producte amb este nom");
        esValido = false;
    }

    // Validar preu
    if (isNaN(price)) {
        mostrarError(document.getElementById("price"), "El preu ha de ser un número vàlid");
        esValido = false;
    } else if (price <= 0) {
        mostrarError(document.getElementById("price"), "El preu no pot ser zero o negatiu");
        esValido = false;
    } else if (price > 1000000) {
        mostrarError(document.getElementById("price"), "El preu no pot ser major a 1.000.000");
        esValido = false;
    }

    // Validar descripció
    if (description === "") {
        mostrarError(document.getElementById("description"), "La descripció és obligatòria");
        esValido = false;
    } else if (description.length > 500) {
        mostrarError(document.getElementById("description"), "La descripció no pot tenir més de 500 caràcters");
        esValido = false;
    }

    // Validar família
    if (isNaN(familyId)) {
        mostrarError(document.getElementById("family_id"), "Has de seleccionar una família vàlida");
        esValido = false;
    }

    return esValido;
}

async function crearProducto(event) {
    // Validar formulari
    if (!await validarFormulario()) {
        alert("Per favor, corregeix els errors en el formulari");
        return;
    }

    const name = document.getElementById("name").value.trim();
    const price = parseFloat(document.getElementById("price").value);
    const description = document.getElementById("description").value.trim();
    const family_id = parseInt(document.getElementById("family_id").value);

    // Crear nou producte
    const nuevoProducto = {
        name,
        price,
        description,
        family_id,
        active: true
    };

    try {
        // Enviar al API
        await postData(url, "Product", nuevoProducto);
        alert("Producte creat correctament");
        window.location.href = "index.html";
    } catch (error) {
        console.error("Error creant producte:", error);
        alert("Error al crear el producte. Intenta-ho de nou.");
    }
}