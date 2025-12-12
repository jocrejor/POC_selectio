document.addEventListener("DOMContentLoaded", main);

async function main() {
    thereIsUser("../login.html");
    botonsTancarSessio("../login.html");
    
    const id = obtenerIdDeUrl();
    if (!id) {
        mostrarMensaje("ID de producte no especificat.", "error");
        setTimeout(() => {
            window.location.href = "index.html";
        }, 2000);
        return;
    }

    await cargarFamilias();
    await cargarProducto(id);

    const form = document.getElementById("productForm");
    form.addEventListener("submit", function (event) {
        event.preventDefault();
        guardarCambios(id);
    });

    const btnVolver = document.getElementById("btnVolver");
    btnVolver.addEventListener("click", () => {
        window.location.href = "index.html";
    });

    // Botón para reiniciar el formulario
    const btnLimpiar = document.getElementById("limpiar");
    btnLimpiar.addEventListener("click", function(event) {
        event.preventDefault();
        restaurarValoresOriginales(id);
    });

    // Agregar estilos de error en tiempo real
    agregarEstilosErrorEnTiempoReal(id);
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

function obtenerIdDeUrl() {
    const params = new URLSearchParams(window.location.search);
    return parseInt(params.get("id"));
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

async function cargarProducto(id) {
    try {
        const producto = await getIdData(url, "Product", id);

        if (!producto) {
            mostrarMensaje("Producte no trobat.", "error");
            setTimeout(() => {
                window.location.href = "index.html";
            }, 2000);
            return;
        }

        document.getElementById("name").value = producto.name;
        document.getElementById("price").value = producto.price;
        document.getElementById("description").value = producto.description;
        document.getElementById("family_id").value = producto.family_id;
    } catch (error) {
        console.error("Error cargando producto:", error);
        mostrarMensaje("Error al cargar el producto.", "error");
    }
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
function agregarEstilosErrorEnTiempoReal(productoId) {
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

async function existeProductoConNombre(nombre, productoId) {
    try {
        const productos = await getData(url, "Product");
        return productos.some(producto =>
            producto.id !== productoId &&
            producto.name.toLowerCase() === nombre.toLowerCase()
        );
    } catch (error) {
        console.error("Error verificando nombre del producto:", error);
        return false;
    }
}

// Función para validar y mostrar solo el primer error
async function validarYMostrarPrimerError(productoId) {
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
        mostrarMensaje("El nom només pot contenir lletres, números, espais i símbols bàsics (.,:;!?'\"()-&)", "error");
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

    if (await existeProductoConNombre(name, productoId)) {
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

async function guardarCambios(id) {
    // Limpiar mensajes anteriores
    esborrarError();
    
    // Validar formulario - solo muestra el primer error
    const esValido = await validarYMostrarPrimerError(id);
    
    if (!esValido) {
        return; // Se detiene si hay algún error
    }

    const name = document.getElementById("name").value.trim();
    const price = parseFloat(document.getElementById("price").value);
    const description = document.getElementById("description").value.trim();
    const family_id = parseInt(document.getElementById("family_id").value);

    // Limpiar posibles caracteres peligrosos de la descripción antes de enviar
    const descripcionLimpia = limpiarDescripcion(description);

    // Actualizar el producto
    const productoActualizado = {
        name,
        price,
        description: descripcionLimpia,
        family_id
    };

    try {
        // Mostrar mensaje de carga
        mostrarMensaje("Modificant producte...", "info");
        
        await updateId(url, "Product", id, productoActualizado);
        
        // Mostrar mensaje de éxito
        mostrarMensaje("Producte modificat correctament", "exito");
        
    } catch (error) {
        console.error("Error actualizando producto:", error);
        mostrarMensaje("Error al modificar el producte.", "error");
    }
}

// Función para limpiar la descripción de posibles problemas de seguridad
function limpiarDescripcion(descripcion) {
    // Reemplazar múltiples espacios consecutivos por uno solo
    let limpia = descripcion.replace(/\s{2,}/g, ' ');
    
    // Recortar espacios al inicio y final
    limpia = limpia.trim();
    
    return limpia;
}

function restaurarValoresOriginales(id) {
    // Limpiar mensajes de error
    esborrarError();
    limpiarErroresInputs();
    
    // Recargar los valores originales del producto
    cargarProducto(id);
    
    console.log("Formulario reiniciado a valores originales");
}