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
    
    // Cargar imágenes existentes en variable global
    await cargarImagenesProductoGlobal(id);
    
    const btnAnadir = document.getElementById("btnAnadir");
    btnAnadir.addEventListener("click", () => {
        window.location.href = `ProducteCrearImg.html?id=${id}`;
    });

    const btnVolver = document.getElementById("btnVolver");
    btnVolver.addEventListener("click", () => {
        window.location.href = "../index.html";
    });
}

// Variable global para almacenar imágenes existentes
let imagenesExistentes = [];

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

async function cargarImagenesProductoGlobal(productId) {
    try {
        const todasImagenes = await getData(url, "Productimage");
        imagenesExistentes = todasImagenes.filter(img => img.product_id === productId);
        console.log("Imágenes existentes del producto:", imagenesExistentes);
        
        // Cargar la visualización
        await cargarImagenesProducto(productId);
    } catch (error) {
        console.error("Error cargando imágenes del producto:", error);
        console.warn("No se pudieron cargar las imágenes existentes para validación de orden");
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

        // Contenedor de mensajes de error
        const errorContainer = document.createElement("div");
        errorContainer.className = "error-mensaje";
        errorContainer.style.color = "#d32f2f";
        errorContainer.style.fontSize = "12px";
        errorContainer.style.marginTop = "5px";
        errorContainer.style.minHeight = "20px";

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
        card.appendChild(errorContainer);
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
    card.dataset.originalImageId = card.dataset.id;
    
    // Crear inputs de edición
    const nombreInput = document.createElement('input');
    nombreInput.type = 'text';
    nombreInput.value = nombreSpan.textContent;
    nombreInput.className = 'edit-input';
    nombreInput.id = 'edit-nombre';
    
    const ordenInput = document.createElement('input');
    ordenInput.type = 'number';
    ordenInput.value = ordenSpan.textContent;
    ordenInput.className = 'edit-input';
    ordenInput.id = 'edit-orden';
    ordenInput.min = '1';
    ordenInput.max = '999';
    
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
    
    // Agregar eventos de validación en tiempo real
    nombreInput.addEventListener("input", function() {
        if (this.value.trim() !== "") {
            this.style.borderColor = "#ddd";
            card.querySelector('.error-mensaje').textContent = '';
        }
    });
    
    ordenInput.addEventListener("input", function() {
        if (this.value.trim() !== "") {
            this.style.borderColor = "#ddd";
            card.querySelector('.error-mensaje').textContent = '';
        }
    });
}

function cancelarEdicion(card) {
    const nombreInput = card.querySelector('#edit-nombre');
    const ordenInput = card.querySelector('#edit-orden');
    
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
    
    // Limpiar mensaje de error
    card.querySelector('.error-mensaje').textContent = '';
    
    // Restaurar iconos
    const editBtn = card.querySelector('.icon-editar');
    const cancelBtn = card.querySelector('.icon-cancelar');
    const deleteBtn = card.querySelector('.icon-borrar');
    
    editBtn.querySelector('i').className = "fa-solid fa-pen-to-square";
    editBtn.title = "Editar imatge";
    cancelBtn.style.display = "none";
    deleteBtn.style.display = "inline-block";
}

// Función para verificar si una posición ya está ocupada por otra imagen
function posicionOcupada(orden, imagenActualId) {
    return imagenesExistentes.some(img => 
        img.order === orden && img.id !== imagenActualId
    );
}

// Función para obtener la siguiente posición disponible
function obtenerSiguientePosicionDisponible(excluirImagenActualId) {
    if (imagenesExistentes.length === 0) {
        return 1;
    }
    
    // Ordenar imágenes por posición
    const posiciones = imagenesExistentes
        .filter(img => excluirImagenActualId ? img.id !== excluirImagenActualId : true)
        .map(img => img.order)
        .sort((a, b) => a - b);
    
    // Encontrar el primer hueco disponible
    for (let i = 1; i <= posiciones.length + 1; i++) {
        if (!posiciones.includes(i)) {
            return i;
        }
    }
    
    // Si no hay huecos, devolver la siguiente posición
    return posiciones.length + 1;
}

// Función para mostrar mensaje de error en la tarjeta
function mostrarErrorEnTarjeta(card, mensaje) {
    const errorContainer = card.querySelector('.error-mensaje');
    if (errorContainer) {
        errorContainer.textContent = mensaje;
        errorContainer.style.color = "#d32f2f";
    }
}

// Función para validar datos de la imagen
function validarDatosImagen(nombre, orden, imageId) {
    const nombreTrim = nombre.trim();
    const ordenNum = parseInt(orden);
    const imageIdNum = parseInt(imageId);
    
    // 1. Validar nombre
    if (nombreTrim === "") {
        return { valido: false, campo: "nombre", mensaje: "El nom de la imatge és obligatori" };
    } else if (nombreTrim.length < 2) {
        return { valido: false, campo: "nombre", mensaje: "El nom ha de tenir almenys 2 caràcters" };
    } else if (nombreTrim.length > 100) {
        return { valido: false, campo: "nombre", mensaje: "El nom no pot tenir més de 100 caràcters" };
    }
    
    const nombreRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ0-9\s.\-_]+$/;
    if (!nombreRegex.test(nombreTrim)) {
        return { valido: false, campo: "nombre", mensaje: "El nom només pot contenir lletres, números, espais, punts, guions i guions baixos" };
    }
    
    if (/\s{2,}/.test(nombreTrim)) {
        return { valido: false, campo: "nombre", mensaje: "El nom no pot tenir múltiples espais consecutius" };
    }
    
    if (nombreTrim.startsWith(" ") || nombreTrim.endsWith(" ")) {
        return { valido: false, campo: "nombre", mensaje: "El nom no pot començar ni acabar amb espai" };
    }

    // 2. Validar orden
    if (orden === "") {
        return { valido: false, campo: "orden", mensaje: "L'ordre és obligatori" };
    } else if (isNaN(ordenNum)) {
        return { valido: false, campo: "orden", mensaje: "L'ordre ha de ser un número vàlid" };
    } else if (ordenNum < 1) {
        return { valido: false, campo: "orden", mensaje: "L'ordre ha de ser un número positiu (mínim 1)" };
    } else if (ordenNum > 999) {
        return { valido: false, campo: "orden", mensaje: "L'ordre no pot ser major a 999" };
    } else if (!Number.isInteger(ordenNum)) {
        return { valido: false, campo: "orden", mensaje: "L'ordre ha de ser un número enter (sense decimals)" };
    }
    
    // 3. Validar que la posición no esté ya ocupada por OTRA imagen
    if (posicionOcupada(ordenNum, imageIdNum)) {
        const siguienteDisponible = obtenerSiguientePosicionDisponible(imageIdNum);
        return { 
            valido: false, 
            campo: "orden", 
            mensaje: `La posició ${ordenNum} ja està ocupada per una altra imatge. Posició disponible: ${siguienteDisponible}` 
        };
    }

    return { valido: true, campo: null, mensaje: "" };
}

async function guardarCambios(card, imageId, productId) {
    const nombreInput = card.querySelector('#edit-nombre');
    const ordenInput = card.querySelector('#edit-orden');
    
    if (!nombreInput || !ordenInput) return;
    
    const nuevoNombre = nombreInput.value;
    const nuevoOrden = ordenInput.value;
    
    // Validar datos
    const validacion = validarDatosImagen(nuevoNombre, nuevoOrden, imageId);
    
    if (!validacion.valido) {
        // Mostrar error en la tarjeta
        mostrarErrorEnTarjeta(card, validacion.mensaje);
        
        // Resaltar el campo con error
        if (validacion.campo === "nombre") {
            nombreInput.style.borderColor = "#d32f2f";
            nombreInput.focus();
        } else if (validacion.campo === "orden") {
            ordenInput.style.borderColor = "#d32f2f";
            ordenInput.focus();
        }
        return;
    }
    
    const ordenNum = parseInt(nuevoOrden);
    
    try {
        // Obtener la imagen actual para mantener la URL
        const imagenActual = imagenesExistentes.find(img => img.id === parseInt(imageId));
        if (!imagenActual) {
            mostrarErrorEnTarjeta(card, "Error: Imatge no trobada");
            cancelarEdicion(card);
            return;
        }
        
        const imagenActualizada = {
            name: nuevoNombre.trim(),
            url: imagenActual.url, // Mantener la misma URL
            order: ordenNum,
            product_id: productId
        };
        
        console.log("Actualizando imagen:", imagenActualizada);
        await updateId(url, "Productimage", imageId, imagenActualizada);
        
        // Actualizar la visualización
        const nombreSpan = document.createElement('span');
        nombreSpan.className = 'nombre-texto';
        nombreSpan.textContent = nuevoNombre.trim();
        
        const ordenSpan = document.createElement('span');
        ordenSpan.className = 'orden-texto';
        ordenSpan.textContent = ordenNum;
        
        nombreInput.replaceWith(nombreSpan);
        ordenInput.replaceWith(ordenSpan);
        
        // Limpiar mensaje de error
        card.querySelector('.error-mensaje').textContent = '';
        
        // Actualizar iconos
        const editBtn = card.querySelector('.icon-editar');
        const cancelBtn = card.querySelector('.icon-cancelar');
        const deleteBtn = card.querySelector('.icon-borrar');
        
        editBtn.querySelector('i').className = "fa-solid fa-pen-to-square";
        editBtn.title = "Editar imatge";
        cancelBtn.style.display = "none";
        deleteBtn.style.display = "inline-block";
        
        // Actualizar la lista global y recargar
        await cargarImagenesProductoGlobal(productId);
        
    } catch (error) {
        console.error("Error actualizando imagen:", error);
        mostrarErrorEnTarjeta(card, "Error al actualizar la imagen.");
        cancelarEdicion(card);
    }
}

async function eliminarImagen(productId, imageId) {
    if (confirm("Segur que vols eliminar esta imatge?")) {
        try {
            await deleteData(url, "Productimage", imageId);
            await cargarImagenesProductoGlobal(productId);
        } catch (error) {
            console.error("Error eliminando imagen:", error);
            alert("Error al eliminar la imagen.");
        }
    }
}