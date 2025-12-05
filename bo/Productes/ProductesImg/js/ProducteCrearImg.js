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

    const form = document.getElementById("formImagen");
    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        console.log("Añadiendo nueva imagen...");
        await añadirImagen(id);
    });

    const btnVolver = document.getElementById("btnVolver");
    btnVolver.addEventListener("click", () => {
        window.location.href = `ProducteImg.html?id=${id}`;
    });
}

function obtenerIdDeUrl() {
    const params = new URLSearchParams(window.location.search);
    return parseInt(params.get("id"));
}

async function añadirImagen(productId) {
    const nombre = document.getElementById("nombre").value.trim();
    // IMPORTANTE: Usar nombre diferente para la URL
    const urlImagen = document.getElementById("url").value.trim();
    const orden = parseInt(document.getElementById("orden").value) || 1;

    console.log("Datos de nueva imagen:", { nombre, urlImagen, orden, productId });

    if (!nombre || !urlImagen) {
        alert("El nom i la URL són obligatoris");
        return;
    }

    const nuevaImagen = {
        name: nombre,
        url: urlImagen,  // Usar urlImagen aquí
        order: orden,
        product_id: productId
    };

    try {
        console.log("Enviando a API:", nuevaImagen);
        // Usar la variable global 'url' desde crud.js
        const resultado = await postData(url, "Productimage", nuevaImagen);
        console.log("Respuesta del servidor:", resultado);
        alert("Imatge afegida correctament");
        window.location.href = `ProducteImg.html?id=${productId}`;
    } catch (error) {
        console.error("Error añadiendo imagen:", error);
        alert("Error al añadir la imagen. Revisa la consola para más detalles.");
    }
}