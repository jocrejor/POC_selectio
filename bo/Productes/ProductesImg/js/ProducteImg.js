document.addEventListener("DOMContentLoaded", main);

async function main() {
    thereIsUser("../login.html");
    botonsTancarSessio("../login.html");
    
    const id = obtenerIdDeUrl();
    if (!id) {
        alert("ID de producte no especificat.");
        window.location.href = "../index.html";
        return;
    }

    console.log("Cargando imágenes para producto ID:", id);
    await cargarImagenesProducto(id);

    const btnAnadir = document.getElementById("btnAnadir");
    btnAnadir.addEventListener("click", () => {
        window.location.href = `ProducteCrearImg.html?id=${id}`;
    });

    const btnVolver = document.getElementById("btnVolver");
    btnVolver.addEventListener("click", () => {
        window.location.href = "../index.html";
    });
}

function obtenerIdDeUrl() {
    const params = new URLSearchParams(window.location.search);
    return parseInt(params.get("id"));
}

async function obtenerImagenesProducto(productId) {
    try {
        const imagenes = await getData(url, "Productimage");
        console.log("Imágenes obtenidas:", imagenes);
        return imagenes.filter(img => img.product_id === productId)
            .sort((a, b) => a.order - b.order);
    } catch (error) {
        console.error("Error obteniendo imágenes:", error);
        return [];
    }
}

async function obtenerProducto(id) {
    try {
        return await getIdData(url, "Product", id);
    } catch (error) {
        console.error("Error obteniendo producto:", error);
        return null;
    }
}

async function cargarImagenesProducto(id) {
    const [imagenesProducto, producto] = await Promise.all([
        obtenerImagenesProducto(id),
        obtenerProducto(id)
    ]);

    const contenedor = document.getElementById("imagenesContainer");
    contenedor.innerHTML = '';

    if (producto) {
        const h2 = document.createElement("h2");
        h2.textContent = `Imatges de: ${producto.name}`;
        contenedor.appendChild(h2);
    }

    if (imagenesProducto.length === 0) {
        const p = document.createElement("p");
        p.textContent = "No hi ha imatges per a este producte.";
        p.classList.add("mensaje-vacio");
        contenedor.appendChild(p);
        return;
    }

    const grid = document.createElement("div");
    grid.classList.add("row");

    imagenesProducto.forEach(img => {
        const card = document.createElement("div");
        card.classList.add("col-4");
        card.dataset.id = img.id;
        card.dataset.productId = id;

        // Imagen
        const imagen = document.createElement("img");
        imagen.src = img.url;
        imagen.alt = img.name;
        imagen.onerror = function () {
            this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZThlOGU4Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYXRnZSBubyBkaXNwb25pYmxlPC90ZXh0Pjwvc3ZnPg==';
        };

        // Contenedor para nombre (modo lectura/edición)
        const nombreContainer = document.createElement("p");
        nombreContainer.innerHTML = `Nom: <span class="nombre-texto">${img.name}</span>`;
        nombreContainer.style.fontWeight = '500';

        // Contenedor para orden (modo lectura/edición)
        const ordenContainer = document.createElement("p");
        ordenContainer.innerHTML = `Ordre: <span class="orden-texto">${img.order}</span>`;

        // Contenedor de acciones
        const acciones = document.createElement("div");
        acciones.classList.add("acciones-container");

        // Icono de Editar/Guardar
        const spanEditar = document.createElement("span");
        spanEditar.classList.add("icon-editar");
        spanEditar.dataset.id = img.id;
        spanEditar.title = "Editar imatge";
        const iEditar = document.createElement("i");
        iEditar.classList.add("fa-solid", "fa-pen-to-square");
        spanEditar.appendChild(iEditar);

        // Icono de Cancelar (oculto inicialmente)
        const spanCancelar = document.createElement("span");
        spanCancelar.classList.add("icon-cancelar");
        spanCancelar.dataset.id = img.id;
        spanCancelar.title = "Cancel·lar";
        spanCancelar.style.display = "none";
        const iCancelar = document.createElement("i");
        iCancelar.classList.add("fa-solid", "fa-times");
        spanCancelar.appendChild(iCancelar);

        // Icono de Eliminar
        const spanEliminar = document.createElement("span");
        spanEliminar.classList.add("icon-borrar");
        spanEliminar.dataset.id = img.id;
        spanEliminar.title = "Eliminar imatge";
        const iEliminar = document.createElement("i");
        iEliminar.classList.add("fa-solid", "fa-trash");
        spanEliminar.appendChild(iEliminar);

        acciones.appendChild(spanEditar);
        acciones.appendChild(spanCancelar);
        acciones.appendChild(spanEliminar);

        card.appendChild(imagen);
        card.appendChild(nombreContainer);
        card.appendChild(ordenContainer);
        card.appendChild(acciones);

        grid.appendChild(card);
    });

    contenedor.appendChild(grid);
    asignarEventListenersImagenes(id);
}

function asignarEventListenersImagenes(productId) {
    // Iconos de editar
    document.querySelectorAll(".icon-editar").forEach(icon => {
        icon.addEventListener("click", async (e) => {
            const card = e.target.closest('.col-4');
            const imageId = parseInt(icon.dataset.id);
            const isEditing = icon.querySelector('.fa-save');

            if (isEditing) {
                // Guardar cambios
                await guardarCambios(card, imageId, productId);
                icon.querySelector('i').className = "fa-solid fa-pen-to-square";
                icon.title = "Editar imatge";
                
                // Mostrar icono eliminar, ocultar cancelar
                const cancelBtn = card.querySelector('.icon-cancelar');
                const deleteBtn = card.querySelector('.icon-borrar');
                cancelBtn.style.display = "none";
                deleteBtn.style.display = "inline-block";
            } else {
                // Activar modo edición
                activarModoEdicion(card);
                icon.querySelector('i').className = "fa-solid fa-save";
                icon.title = "Guardar canvis";
                
                // Mostrar icono cancelar, ocultar eliminar
                const cancelBtn = card.querySelector('.icon-cancelar');
                const deleteBtn = card.querySelector('.icon-borrar');
                cancelBtn.style.display = "inline-block";
                deleteBtn.style.display = "none";
            }
        });
    });

    // Iconos de cancelar
    document.querySelectorAll(".icon-cancelar").forEach(icon => {
        icon.addEventListener("click", (e) => {
            const card = e.target.closest('.col-4');
            cancelarEdicion(card);
        });
    });

    // Iconos de eliminar
    document.querySelectorAll(".icon-borrar").forEach(icon => {
        icon.addEventListener("click", async () => {
            const imageId = parseInt(icon.dataset.id);
            await eliminarImagen(productId, imageId);
        });
    });
}

function activarModoEdicion(card) {
    const nombreSpan = card.querySelector('.nombre-texto');
    const ordenSpan = card.querySelector('.orden-texto');
    
    // Guardar valores originales
    card.dataset.originalNombre = nombreSpan.textContent;
    card.dataset.originalOrden = ordenSpan.textContent;
    
    // Crear inputs de edición
    const nombreInput = document.createElement('input');
    nombreInput.type = 'text';
    nombreInput.value = nombreSpan.textContent;
    nombreInput.className = 'edit-input';
    
    const ordenInput = document.createElement('input');
    ordenInput.type = 'number';
    ordenInput.value = ordenSpan.textContent;
    ordenInput.className = 'edit-input';
    ordenInput.min = '1';
    
    // Reemplazar spans con inputs
    nombreSpan.replaceWith(nombreInput);
    ordenSpan.replaceWith(ordenInput);
    
    // Añadir estilos a los inputs
    card.querySelectorAll('.edit-input').forEach(input => {
        input.style.width = '100%';
        input.style.padding = '5px';
        input.style.margin = '2px 0';
        input.style.border = '1px solid #ddd';
        input.style.borderRadius = '4px';
    });
}

function cancelarEdicion(card) {
    const nombreInput = card.querySelector('input[type="text"]');
    const ordenInput = card.querySelector('input[type="number"]');
    
    if (nombreInput && ordenInput) {
        // Restaurar valores originales
        const nombreSpan = document.createElement('span');
        nombreSpan.className = 'nombre-texto';
        nombreSpan.textContent = card.dataset.originalNombre;
        
        const ordenSpan = document.createElement('span');
        ordenSpan.className = 'orden-texto';
        ordenSpan.textContent = card.dataset.originalOrden;
        
        nombreInput.replaceWith(nombreSpan);
        ordenInput.replaceWith(ordenSpan);
    }
    
    // Restaurar iconos
    const editBtn = card.querySelector('.icon-editar');
    const cancelBtn = card.querySelector('.icon-cancelar');
    const deleteBtn = card.querySelector('.icon-borrar');
    
    editBtn.querySelector('i').className = "fa-solid fa-pen-to-square";
    editBtn.title = "Editar imatge";
    cancelBtn.style.display = "none";
    deleteBtn.style.display = "inline-block";
}

async function guardarCambios(card, imageId, productId) {
    const nombreInput = card.querySelector('input[type="text"]');
    const ordenInput = card.querySelector('input[type="number"]');
    
    if (!nombreInput || !ordenInput) return;
    
    const nuevoNombre = nombreInput.value.trim();
    const nuevoOrden = parseInt(ordenInput.value) || 1;
    
    if (!nuevoNombre) {
        alert("El nom és obligatori");
        return;
    }
    
    try {
        const imagenActualizada = {
            name: nuevoNombre,
            url: card.querySelector('img').src, // Mantener la misma URL
            order: nuevoOrden,
            product_id: productId
        };
        
        await updateId(url, "Productimage", imageId, imagenActualizada);
        
        // Actualizar la visualización
        const nombreSpan = document.createElement('span');
        nombreSpan.className = 'nombre-texto';
        nombreSpan.textContent = nuevoNombre;
        
        const ordenSpan = document.createElement('span');
        ordenSpan.className = 'orden-texto';
        ordenSpan.textContent = nuevoOrden;
        
        nombreInput.replaceWith(nombreSpan);
        ordenInput.replaceWith(ordenSpan);
        
        // Reordenar imágenes si es necesario
        await cargarImagenesProducto(productId);
        
    } catch (error) {
        console.error("Error actualizando imagen:", error);
        alert("Error al actualizar la imagen.");
        cancelarEdicion(card);
    }
}

async function eliminarImagen(productId, imageId) {
    if (confirm("Segur que vols eliminar esta imatge?")) {
        try {
            await deleteData(url, "Productimage", imageId);
            await cargarImagenesProducto(productId);
        } catch (error) {
            console.error("Error eliminando imagen:", error);
            alert("Error al eliminar la imagen.");
        }
    }
}