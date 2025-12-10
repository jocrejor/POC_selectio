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

    // Botón volver
    const btnVolver = document.getElementById("btnVolver");
    btnVolver.addEventListener("click", () => {
        window.location.href = "index.html";
    });

    // Botón limpiar
    const btnLimpiar = document.getElementById("limpiar");
    btnLimpiar.addEventListener("click", limpiarFormulario);

    // Agregar estilos de error en tiempo real
    agregarEstilosErrorEnTiempoReal();
}

// Función simple para mostrar mensajes
function mostrarMensaje(mensaje, tipo = "error") {
    const mensajeDiv = document.getElementById("missatgeError");
    mensajeDiv.innerHTML = '';
    
    const div = document.createElement("div");
    div.className = `missatge missatge-${tipo}`;
    div.textContent = mensaje;
    
    mensajeDiv.appendChild(div);
}

// Función para limpiar el formulario
function limpiarFormulario(e) {
    e.preventDefault();
    limpiarCampos();
    limpiarErroresInputs();
    esborrarError(); // Limpiar también el mensaje general
}

// Función para limpiar solo los campos del formulario
function limpiarCampos() {
    document.getElementById("name").value = "";
    document.getElementById("price").value = "";
    document.getElementById("description").value = "";
    document.getElementById("family_id").value = "";
}

// Función para limpiar errores de los inputs (clases de error)
function limpiarErroresInputs() {
    let formulari = document.getElementById("productForm");
    for (let i = 0; i < formulari.elements.length; i++) {
        formulari.elements[i].classList.remove("error");
    }
}

// Función para limpiar mensajes de error generales
function esborrarError() {
    const contError = document.getElementById("missatgeError");
    contError.innerHTML = '';
}

// Función para agregar estilos de error en tiempo real (sin mensajes)
function agregarEstilosErrorEnTiempoReal() {
    const nameInput = document.getElementById("name");
    const priceInput = document.getElementById("price");
    const descriptionInput = document.getElementById("description");
    const familySelect = document.getElementById("family_id");

    // Quitar error al escribir/cambiar
    nameInput.addEventListener("input", function() {
        if (this.value.trim() !== "") {
            this.classList.remove("error");
        }
    });

    priceInput.addEventListener("input", function() {
        if (this.value.trim() !== "") {
            this.classList.remove("error");
        }
    });

    descriptionInput.addEventListener("input", function() {
        if (this.value.trim() !== "") {
            this.classList.remove("error");
        }
    });

    familySelect.addEventListener("change", function() {
        if (this.value !== "") {
            this.classList.remove("error");
        }
    });
}

async function cargarFamilias() {
    try {
        const select = document.getElementById("family_id");
        const familias = await getData(url, "Family");

        // Limpiar opciones existentes
        select.innerHTML = '<option value="">Selecciona una família</option>';

        // Añadir familias
        familias.forEach(familia => {
            const option = document.createElement("option");
            option.value = familia.id;
            option.textContent = familia.name;
            select.appendChild(option);
        });
    } catch (error) {
        console.error("Error cargando familias:", error);
        mostrarMensaje("Error al cargar las familias.", "error");
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

// Función para validar y mostrar solo el primer error
async function validarYMostrarPrimerError() {
    const name = document.getElementById("name").value.trim();
    const price = document.getElementById("price").value.trim();
    const priceNum = parseFloat(price);
    const description = document.getElementById("description").value.trim();
    const familyId = document.getElementById("family_id").value;

    // Limpiar clases de error anteriores
    limpiarErroresInputs();
    
    // 1. Validar nombre (PRIMERO)
    if (name === "") {
        document.getElementById("name").classList.add("error");
        mostrarMensaje("El nom del producte és obligatori", "error");
        return false;
    } else if (name.length < 2) {
        document.getElementById("name").classList.add("error");
        mostrarMensaje("El nom ha de tenir almenys 2 caràcters", "error");
        return false;
    } else if (name.length > 100) {
        document.getElementById("name").classList.add("error");
        mostrarMensaje("El nom no pot tenir més de 100 caràcters", "error");
        return false;
    }
    
    // Validar que el nombre no contenga símbolos raros
    // Permite letras (incluyendo acentos), números, espacios y algunos caracteres básicos
    const nombreRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ0-9\s.,:;!?'"()\-&]+$/;
    if (!nombreRegex.test(name)) {
        document.getElementById("name").classList.add("error");
        mostrarMensaje("El no pot contenir caràcters especials", "error");
        return false;
    }
    
    // Validar que no tenga múltiples espacios consecutivos
    if (/\s{2,}/.test(name)) {
        document.getElementById("name").classList.add("error");
        mostrarMensaje("El nom no pot tenir múltiples espais consecutius", "error");
        return false;
    }
    
    // Validar que no empiece ni termine con espacio
    if (name.startsWith(" ") || name.endsWith(" ")) {
        document.getElementById("name").classList.add("error");
        mostrarMensaje("El nom no pot començar ni acabar amb espai", "error");
        return false;
    }

    if (await existeProductoConNombre(name)) {
        document.getElementById("name").classList.add("error");
        mostrarMensaje("Ja existeix un producte amb este nom", "error");
        return false;
    }

    // 2. Validar precio (SEGUNDO)
    if (price === "") {
        document.getElementById("price").classList.add("error");
        mostrarMensaje("El preu és obligatori", "error");
        return false;
    } else if (isNaN(priceNum)) {
        document.getElementById("price").classList.add("error");
        mostrarMensaje("El preu ha de ser un número vàlid", "error");
        return false;
    } else if (priceNum <= 0) {
        document.getElementById("price").classList.add("error");
        mostrarMensaje("El preu no pot ser zero o negatiu", "error");
        return false;
    } else if (priceNum > 1000000) {
        document.getElementById("price").classList.add("error");
        mostrarMensaje("El preu no pot ser major a 1.000.000", "error");
        return false;
    }

    // 3. Validar descripción (TERCERO)
    if (description === "") {
        document.getElementById("description").classList.add("error");
        mostrarMensaje("La descripció és obligatòria", "error");
        return false;
    } else if (description.length > 2000) {
        document.getElementById("description").classList.add("error");
        mostrarMensaje("La descripció no pot tenir més de 2000 caràcters", "error");
        return false;
    }
    
    // Validar descripción contra XSS - prohibir etiquetas HTML y scripts
    const xssRegex = /<[^>]*>|javascript:|onclick=|onload=|onerror=|onmouseover=|alert\(|confirm\(|prompt\(|eval\(|document\.|window\./i;
    if (xssRegex.test(description)) {
        document.getElementById("description").classList.add("error");
        mostrarMensaje("La descripció conté caràcters o paraules no permeses per seguretat", "error");
        return false;
    }
    
    // Validar que no contenga caracteres peligrosos pero permitir puntuación normal
    // Permite letras, números, espacios, puntuación común, pero evita caracteres potencialmente peligrosos
    const descripcionPermitidaRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ0-9\s.,:;!?'"()\-&%@#\$\*\+=_\/\\\[\]\n\r]+$/;
    if (!descripcionPermitidaRegex.test(description)) {
        document.getElementById("description").classList.add("error");
        mostrarMensaje("La descripció conté símbols no permesos. Pots utilitzar lletres, números, puntuació i símbols com .,:;!?'\"()&-", "error");
        return false;
    }
    
    // Validar que la descripción no sea solo espacios
    if (/^\s+$/.test(description)) {
        document.getElementById("description").classList.add("error");
        mostrarMensaje("La descripció no pot contenir només espais", "error");
        return false;
    }

    // 4. Validar familia (CUARTO)
    if (familyId === "") {
        document.getElementById("family_id").classList.add("error");
        mostrarMensaje("Has de seleccionar una família", "error");
        return false;
    }

    // Si pasa todas las validaciones
    return true;
}

async function crearProducto(event) {
    // Limpiar mensajes anteriores
    esborrarError();
    
    // Validar formulario - solo muestra el primer error
    const esValido = await validarYMostrarPrimerError();
    
    if (!esValido) {
        return; // Se detiene si hay algún error
    }

    const name = document.getElementById("name").value.trim();
    const price = parseFloat(document.getElementById("price").value);
    const description = document.getElementById("description").value.trim();
    const family_id = parseInt(document.getElementById("family_id").value);

    // Limpiar posibles caracteres peligrosos de la descripción antes de enviar
    const descripcionLimpia = limpiarDescripcion(description);

    // Crear nuevo producto
    const nuevoProducto = {
        name,
        price,
        description: descripcionLimpia,
        family_id,
        active: true
    };

    try {
        
        // Enviar al API
        await postData(url, "Product", nuevoProducto);
        
        // Mostrar mensaje de éxito
        mostrarMensaje("Producte creat correctament", "exito");
        
        // Limpiar formulario para crear otro (solo campos, no mensajes)
        limpiarCampos();
        limpiarErroresInputs(); // También limpiamos las clases de error
        
    } catch (error) {
        console.error("Error creant producte:", error);
        mostrarMensaje("Error al crear el producte. Intenta-ho de nou.", "error");
    }
}

// Función para limpiar la descripción de posibles problemas de seguridad
function limpiarDescripcion(descripcion) {
    // Reemplazar múltiples espacios consecutivos por uno solo
    let limpia = descripcion.replace(/\s{2,}/g, ' ');
    
    // Recortar espacios al inicio y final
    limpia = limpia.trim();
    
    // Escapar caracteres HTML para prevenir XSS
    limpia = limpia
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
    
    return limpia;
}