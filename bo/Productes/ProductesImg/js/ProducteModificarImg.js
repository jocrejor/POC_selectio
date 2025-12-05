document.addEventListener("DOMContentLoaded", main);

async function main() {
    thereIsUser("../login.html");
    botonsTancarSessio("../login.html");

    const productId = obtenerProductIdDeUrl();
    const imageId = obtenerImageIdDeUrl();
    
    console.log("Product ID:", productId, "Image ID:", imageId);
    
    if (!productId || !imageId) {
        alert("Paràmetres incorrectes.");
        window.location.href = "index.html";
        return;
    }

    await cargarImagen(imageId);

    const form = document.getElementById("formImagen");
    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        console.log("Guardando cambios...");
        await guardarCambios(productId, imageId);
    });

    const btnVolver = document.getElementById("btnVolver");
    btnVolver.addEventListener("click", () => {
        window.location.href = `ProducteImg.html?id=${productId}`;
    });
}

function obtenerProductIdDeUrl() {
    const params = new URLSearchParams(window.location.search);
    return parseInt(params.get("productId"));
}

function obtenerImageIdDeUrl() {
    const params = new URLSearchParams(window.location.search);
    return parseInt(params.get("imageId"));
}

async function cargarImagen(imageId) {
    try {
        // Usa la variable global 'url' desde crud.js
        const imagen = await getIdData(url, "Productimage", imageId);
        console.log("Imagen cargada:", imagen);
        
        if (!imagen) {
            alert("Imatge no trobada.");
            window.history.back();
            return;
        }

        document.getElementById("nombre").value = imagen.name;
        // IMPORTANTE: Renombrar la variable para evitar conflicto
        document.getElementById("url").value = imagen.url;
        document.getElementById("orden").value = imagen.order;
    } catch (error) {
        console.error("Error cargando imagen:", error);
        alert("Error al cargar la imagen.");
    }
}

async function guardarCambios(productId, imageId) {
    const nombre = document.getElementById("nombre").value.trim();
    // IMPORTANTE: Usar un nombre diferente para la URL
    const urlImagen = document.getElementById("url").value.trim();
    const orden = parseInt(document.getElementById("orden").value) || 1;

    console.log("Datos a guardar:", { nombre, urlImagen, orden, imageId });

    if (!nombre || !urlImagen) {
        alert("El nom i la URL són obligatoris");
        return;
    }

    const imagenActualizada = {
        name: nombre,
        url: urlImagen,  // Usar urlImagen aquí
        order: orden
    };

    try {
        console.log("Enviando a API:", imagenActualizada);
        // Usar la variable global 'url' desde crud.js
        const resultado = await updateId(url, "Productimage", imageId, imagenActualizada);
        console.log("Respuesta del servidor:", resultado);
        alert("Imatge actualitzada correctament");
        window.location.href = `ProducteImg.html?id=${productId}`;
    } catch (error) {
        console.error("Error actualizando imagen:", error);
        alert("Error al actualizar la imagen. Revisa la consola para más detalles.");
    }
}