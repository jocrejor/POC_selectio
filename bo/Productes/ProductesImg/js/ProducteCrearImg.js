document.addEventListener("DOMContentLoaded", main);

async function main() {
    thereIsUser("../login.html");
    botonsTancarSessio("../login.html");

    const id = obtenerIdDeUrl();
    console.log("ID producto para nueva imagen:", id);
    
    if (!id) {
        alert("ID de producte no especificat.");
        window.location.href = "index.html";
        return;
    }

    // Formulario ahora tiene id "productForm" (como en el HTML)
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

    // Botón limpiar (nuevo)
    const btnLimpiar = document.getElementById("limpiar");
    btnLimpiar.addEventListener("click", limpiarFormulario);
}

function obtenerIdDeUrl() {
    const params = new URLSearchParams(window.location.search);
    return parseInt(params.get("id"));
}

// Función para limpiar el formulario
function limpiarFormulario(e) {
    e.preventDefault();
    
    // Limpiar campos
    document.getElementById("nombre").value = "";
    document.getElementById("orden").value = "1";
    document.getElementById("url").value = "";
    
    // Limpiar mensajes de error si los hay
    const errorDiv = document.getElementById("missatgeError");
    if (errorDiv) {
        errorDiv.textContent = "";
        errorDiv.className = "";
    }
}

async function añadirImagen(productId) {
    const nombre = document.getElementById("nombre").value.trim();
    const urlImagen = document.getElementById("url").value.trim();
    const orden = parseInt(document.getElementById("orden").value) || 1;

    console.log("Datos de nueva imagen:", { nombre, urlImagen, orden, productId });

    // Validación básica
    if (!nombre) {
        mostrarError("El nom és obligatori");
        return;
    }
    
    if (!urlImagen) {
        mostrarError("La URL és obligatòria");
        return;
    }
    
    if (orden < 1) {
        mostrarError("L'ordre ha de ser un número positiu");
        return;
    }

    const nuevaImagen = {
        name: nombre,
        url: urlImagen,
        order: orden,
        product_id: productId
    };

    try {
        console.log("Enviando a API:", nuevaImagen);
        const resultado = await postData(url, "Productimage", nuevaImagen);
        console.log("Respuesta del servidor:", resultado);
        alert("Imatge afegida correctament");
        window.location.href = `ProducteImg.html?id=${productId}`;
    } catch (error) {
        console.error("Error añadiendo imagen:", error);
        mostrarError("Error al afegir la imatge. Intenta-ho de nou.");
    }
}

// Función para mostrar errores
function mostrarError(mensaje) {
    const errorDiv = document.getElementById("missatgeError");
    errorDiv.textContent = mensaje;
    errorDiv.className = "missatgeError";
}