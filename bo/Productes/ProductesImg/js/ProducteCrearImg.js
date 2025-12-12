document.addEventListener("DOMContentLoaded", main);

async function main() {
    thereIsUser("../login.html");
    botonsTancarSessio("../login.html");

    const id = obtenerIdDeUrl();
    console.log("ID producto para nueva imagen:", id);
    
    if (!id) {
        mostrarMensaje("ID de producte no especificat.", "error");
        setTimeout(() => {
            window.location.href = "index.html";
        }, 2000);
        return;
    }

    // Cargar imágenes existentes del producto para validar orden único
    await cargarImagenesProducto(id);

    const form = document.getElementById("productForm");
    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        console.log("Añadiendo nueva imagen...");
        await añadirImagen(id);
    });

    // Botón volver
    const btnVolver = document.getElementById("btnVolver");
    btnVolver.addEventListener("click", () => {
        window.location.href = `ProducteImg.html?id=${id}`;
    });

    // Botón limpiar
    const btnLimpiar = document.getElementById("limpiar");
    btnLimpiar.addEventListener("click", limpiarFormulario);

    // Agregar estilos de error en tiempo real
    agregarEstilosErrorEnTiempoReal();
}

// Variable global para almacenar imágenes existentes
let imagenesExistentes = [];

// Función para cargar imágenes existentes del producto
async function cargarImagenesProducto(productId) {
    try {
        const todasImagenes = await getData(url, "Productimage");
        imagenesExistentes = todasImagenes.filter(img => img.product_id === productId);
        console.log("Imágenes existentes del producto:", imagenesExistentes);
    } catch (error) {
        console.error("Error cargando imágenes del producto:", error);
        // Continuamos aunque falle, pero mostramos advertencia
        console.warn("No se pudieron cargar las imágenes existentes para validación de orden");
    }
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

// Función para limpiar el formulario
function limpiarFormulario(e) {
    e.preventDefault();
    limpiarCampos();
    limpiarErroresInputs();
    esborrarError(); // Limpiar también el mensaje general
}

// Función para limpiar solo los campos del formulario
function limpiarCampos() {
    document.getElementById("nombre").value = "";
    document.getElementById("orden").value = "1";
    document.getElementById("url").value = "";
}

// Función para limpiar errores de los inputs (clases de error)
function limpiarErroresInputs() {
    const inputs = document.querySelectorAll('#productForm input');
    inputs.forEach(input => {
        input.classList.remove("error");
    });
}

// Función para limpiar mensajes de error generales
function esborrarError() {
    const contError = document.getElementById("missatgeError");
    contError.innerHTML = '';
}

// Función para agregar estilos de error en tiempo real (sin mensajes)
function agregarEstilosErrorEnTiempoReal() {
    const nombreInput = document.getElementById("nombre");
    const ordenInput = document.getElementById("orden");
    const urlInput = document.getElementById("url");

    // Quitar error al escribir/cambiar
    nombreInput.addEventListener("input", function() {
        if (this.value.trim() !== "") {
            this.classList.remove("error");
        }
    });

    ordenInput.addEventListener("input", function() {
        if (this.value.trim() !== "") {
            this.classList.remove("error");
        }
    });

    urlInput.addEventListener("input", function() {
        if (this.value.trim() !== "") {
            this.classList.remove("error");
        }
    });
}

// Función para verificar si una posición ya está ocupada
function posicionOcupada(orden) {
    return imagenesExistentes.some(img => img.order === orden);
}

// Función para obtener la siguiente posición disponible
function obtenerSiguientePosicionDisponible() {
    if (imagenesExistentes.length === 0) {
        return 1;
    }
    
    // Ordenar imágenes por posición
    const posiciones = imagenesExistentes.map(img => img.order).sort((a, b) => a - b);
    
    // Encontrar el primer hueco disponible
    for (let i = 1; i <= posiciones.length + 1; i++) {
        if (!posiciones.includes(i)) {
            return i;
        }
    }
    
    // Si no hay huecos, devolver la siguiente posición
    return posiciones.length + 1;
}

// Función para validar y mostrar solo el primer error
function validarYMostrarPrimerError() {
    const nombre = document.getElementById("nombre").value.trim();
    const orden = document.getElementById("orden").value.trim();
    const ordenNum = parseInt(orden);
    const urlImagen = document.getElementById("url").value.trim();

    // Limpiar clases de error anteriores
    limpiarErroresInputs();
    
    // 1. Validar nombre (PRIMERO)
    if (nombre === "") {
        document.getElementById("nombre").classList.add("error");
        mostrarMensaje("El nom de la imatge és obligatori", "error");
        return false;
    } else if (nombre.length < 2) {
        document.getElementById("nombre").classList.add("error");
        mostrarMensaje("El nom ha de tenir almenys 2 caràcters", "error");
        return false;
    } else if (nombre.length > 100) {
        document.getElementById("nombre").classList.add("error");
        mostrarMensaje("El nom no pot tenir més de 100 caràcters", "error");
        return false;
    }
    
    // Validar que el nombre no contenga símbolos raros
    // Permite letras (incluyendo acentos), números, espacios, guiones, guiones bajos y puntos
    const nombreRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ0-9\s.\-_]+$/;
    if (!nombreRegex.test(nombre)) {
        document.getElementById("nombre").classList.add("error");
        mostrarMensaje("El nom només pot contenir lletres, números, espais, punts, guions i guions baixos", "error");
        return false;
    }
    
    // Validar que no tenga múltiples espacios consecutivos
    if (/\s{2,}/.test(nombre)) {
        document.getElementById("nombre").classList.add("error");
        mostrarMensaje("El nom no pot tenir múltiples espais consecutius", "error");
        return false;
    }
    
    // Validar que no empiece ni termine con espacio
    if (nombre.startsWith(" ") || nombre.endsWith(" ")) {
        document.getElementById("nombre").classList.add("error");
        mostrarMensaje("El nom no pot començar ni acabar amb espai", "error");
        return false;
    }

    // 2. Validar orden (SEGUNDO)
    if (orden === "") {
        document.getElementById("orden").classList.add("error");
        mostrarMensaje("L'ordre és obligatori", "error");
        return false;
    } else if (isNaN(ordenNum)) {
        document.getElementById("orden").classList.add("error");
        mostrarMensaje("L'ordre ha de ser un número vàlid", "error");
        return false;
    } else if (ordenNum < 1) {
        document.getElementById("orden").classList.add("error");
        mostrarMensaje("L'ordre ha de ser un número positiu (mínim 1)", "error");
        return false;
    } else if (ordenNum > 999) {
        document.getElementById("orden").classList.add("error");
        mostrarMensaje("L'ordre no pot ser major a 999", "error");
        return false;
    } else if (!Number.isInteger(ordenNum)) {
        document.getElementById("orden").classList.add("error");
        mostrarMensaje("L'ordre ha de ser un número enter (sense decimals)", "error");
        return false;
    }
    
    // 3. Validar que la posición no esté ya ocupada (NUEVA VALIDACIÓN)
    if (posicionOcupada(ordenNum)) {
        document.getElementById("orden").classList.add("error");
        const siguienteDisponible = obtenerSiguientePosicionDisponible();
        mostrarMensaje(`La posició ${ordenNum} ja està ocupada. Posició disponible: ${siguienteDisponible}`, "error");
        return false;
    }

    // 4. Validar URL (TERCERO)
    if (urlImagen === "") {
        document.getElementById("url").classList.add("error");
        mostrarMensaje("La URL de la imatge és obligatòria", "error");
        return false;
    } else if (urlImagen.length > 500) {
        document.getElementById("url").classList.add("error");
        mostrarMensaje("La URL no pot tenir més de 500 caràcters", "error");
        return false;
    }
    
    // Validar formato básico de URL
    const urlRegex = /^(https?:\/\/)[^\s$.?#].[^\s]*$/i;
    if (!urlRegex.test(urlImagen)) {
        document.getElementById("url").classList.add("error");
        mostrarMensaje("La URL ha de tenir un format vàlid (començar amb http:// o https://)", "error");
        return false;
    }
    
    // Validar que sea una URL de imagen común (extensiones típicas)
    const extensionesImagen = /\.(jpg|jpeg|png|gif|bmp|webp|svg|tiff)$/i;
    if (!extensionesImagen.test(urlImagen)) {
        // No mostramos error, solo advertencia, pero permitimos continuar
        console.log("Advertencia: La URL no parece ser de una imagen con extensión común");
        // Podemos dejar que pase, ya que algunas URLs pueden no tener extensión o tener parámetros
    }
    
    // Validar que no contenga caracteres peligrosos
    const urlPermitidaRegex = /^[A-Za-z0-9:\/\-.?_&=#%~]+$/;
    if (!urlPermitidaRegex.test(urlImagen)) {
        document.getElementById("url").classList.add("error");
        mostrarMensaje("La URL conté caràcters no permesos", "error");
        return false;
    }

    // Si pasa todas las validaciones
    return true;
}

async function añadirImagen(productId) {
    // Limpiar mensajes anteriores
    esborrarError();
    
    // Validar formulario - solo muestra el primer error
    const esValido = validarYMostrarPrimerError();
    
    if (!esValido) {
        return; // Se detiene si hay algún error
    }

    const nombre = document.getElementById("nombre").value.trim();
    const urlImagen = document.getElementById("url").value.trim();
    const orden = parseInt(document.getElementById("orden").value) || 1;

    console.log("Datos de nueva imagen:", { nombre, urlImagen, orden, productId });

    // Limpiar la URL de posibles problemas de seguridad
    const urlLimpia = limpiarURL(urlImagen);

    const nuevaImagen = {
        name: nombre,
        url: urlLimpia,
        order: orden,
        product_id: productId
    };

    try {
        // Mostrar mensaje de carga
        mostrarMensaje("Afegint imatge...", "info");
        
        console.log("Enviando a API:", nuevaImagen);
        const resultado = await postData(url, "Productimage", nuevaImagen);
        console.log("Respuesta del servidor:", resultado);
        
        // Actualizar la lista de imágenes existentes
        imagenesExistentes.push({
            ...nuevaImagen,
            id: resultado.id // Suponiendo que la API devuelve el ID creado
        });
        
        // Mostrar mensaje de éxito
        mostrarMensaje("Imatge afegida correctament", "exito");
        
        // Limpiar formulario para añadir otra imagen
        limpiarCampos();
        
        // Sugerir la siguiente posición disponible
        const siguientePosicion = obtenerSiguientePosicionDisponible();
        document.getElementById("orden").value = siguientePosicion;
        
    } catch (error) {
        console.error("Error añadiendo imagen:", error);
        mostrarMensaje("Error al afegir la imatge. Intenta-ho de nou.", "error");
    }
}

// Función para limpiar la URL de posibles problemas de seguridad
function limpiarURL(url) {
    let limpia = url.trim();
    
    // Asegurar que la URL no tenga espacios
    limpia = limpia.replace(/\s/g, '');
    
    // Validar y corregir protocolo si es necesario
    if (!limpia.startsWith('http://') && !limpia.startsWith('https://')) {
        // Añadir https:// por defecto si no tiene protocolo
        console.log("Advertencia: URL sin protocolo, se añadirá https://");
        limpia = 'https://' + limpia;
    }
    
    // Escapar caracteres potencialmente peligrosos (aunque el backend también debería hacerlo)
    // En una URL, los caracteres especiales ya tienen codificación
    // Dejamos que el backend maneje la validación completa de la URL
    
    return limpia;
}