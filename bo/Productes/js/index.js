document.addEventListener("DOMContentLoaded", main);

// Variables globales - SOLO las necesarias para filtros y datos
let productesFiltrats = [];
let productosCompletos = [];
let familiasCompletas = [];
let imagenesCompletas = [];
let atributosCompletos = [];

// Variable para guardar la página temporalmente
let paginaTemporal = null;
// Variable para guardar el estado global temporal
let estadoGlobal = null;

function main() {
    thereIsUser("../login.html");
    botonsTancarSessio("../login.html");
    
    // Verificar si hay estado global guardado para restaurar
    const estadoGuardado = sessionStorage.getItem('estadoGlobal');
    if (estadoGuardado) {
        try {
            estadoGlobal = JSON.parse(estadoGuardado);
            
            // Verificar que el estado no sea muy viejo (máximo 5 minutos)
            const ahora = Date.now();
            if (ahora - estadoGlobal.timestamp < 300000) { // 5 minutos en milisegundos
                // Restaurar página desde el estado global
                paginaTemporal = estadoGlobal.pagina;
                console.log("Restaurando página:", paginaTemporal, "desde estado global");
            } else {
                // El estado es viejo, limpiarlo
                estadoGlobal = null;
            }
            
            // Limpiar el estado global después de usarlo
            sessionStorage.removeItem('estadoGlobal');
        } catch (error) {
            console.error("Error al parsear estado global:", error);
            sessionStorage.removeItem('estadoGlobal');
            estadoGlobal = null;
        }
    }

    const btnCrear = document.getElementById("btnCrear");
    if (btnCrear) {
        btnCrear.addEventListener("click", () => {
            window.location.href = "ProducteAlta.html";
        });
    }

    // Primero cargar datos, luego inicializar filtros
    cargarDatosCompletos().then(() => {
        // Solo después de cargar los datos, inicializar los filtros
        $(document).ready(function () {
            inicializarFiltros();
        });
    });
}

function inicializarFiltros() {
    // Inicializar autocomplete para el campo de nombre
    $('#searchName').autocomplete({
        source: function (request, response) {
            const term = request.term.toLowerCase();
            const nombresFiltrados = productosCompletos
                .map(producto => producto.name)
                .filter(nombre => nombre.toLowerCase().includes(term))
                .slice(0, 10);
            response(nombresFiltrados);
        },
        minLength: 2,
        delay: 300
    });

    // Manejar el envío del formulario de filtros
    $('form').on('submit', function (e) {
        e.preventDefault();
        aplicarFiltros();
    });

    // Manejar el botón de limpiar
    $('button[type="reset"]').on('click', function () {
        setTimeout(() => {
            $('#searchName').val('');
            $('#filterFamily').val('all');
            $('#filterStatus').val('all');
            $('#filterSort').val('id_asc');
            aplicarFiltros();
        }, 0);
    });
    
    // NO llamar a aplicarFiltros() aquí - ya se llama desde cargarDatosCompletos()
}

async function cargarDatosCompletos() {
    try {
        [productosCompletos, familiasCompletas, imagenesCompletas, atributosCompletos] = await Promise.all([
            obtenerProductos(),
            obtenerFamilias(),
            obtenerImagenes(),
            obtenerAtributos()
        ]);

        llenarSelectorFamilias();
        
        // Si hay estado global, restaurar filtros inmediatamente
        if (estadoGlobal && estadoGlobal.filtros) {
            $('#searchName').val(estadoGlobal.filtros.nombre || '');
            $('#filterFamily').val(estadoGlobal.filtros.familia || 'all');
            $('#filterStatus').val(estadoGlobal.filtros.estado || 'all');
            $('#filterSort').val(estadoGlobal.filtros.orden || 'id_asc');
            
            // Aplicar filtros inmediatamente con los valores restaurados
            aplicarFiltrosConEstado();
        } else {
            // Sin estado global, aplicar filtros normales
            aplicarFiltros();
        }
    } catch (error) {
        console.error("Error cargando datos completos:", error);
    }
}

function llenarSelectorFamilias() {
    const filterFamily = document.getElementById('filterFamily');
    while (filterFamily.children.length > 1) {
        filterFamily.removeChild(filterFamily.lastChild);
    }

    familiasCompletas.forEach(familia => {
        const option = document.createElement('option');
        option.value = familia.id;
        option.textContent = familia.name;
        filterFamily.appendChild(option);
    });
}

function aplicarFiltrosConEstado() {
    const filtroNombre = $('#searchName').val().toLowerCase();
    const filtroFamilia = $('#filterFamily').val();
    const filtroEstado = $('#filterStatus').val();
    const orden = $('#filterSort').val();

    let productosFiltrados = [...productosCompletos];

    if (filtroNombre) {
        productosFiltrados = productosFiltrados.filter(producto =>
            producto.name.toLowerCase().includes(filtroNombre)
        );
    }

    if (filtroFamilia !== 'all') {
        productosFiltrados = productosFiltrados.filter(producto =>
            producto.family_id == filtroFamilia
        );
    }

    if (filtroEstado !== 'all') {
        const estadoActivo = filtroEstado === 'active';
        productosFiltrados = productosFiltrados.filter(producto =>
            producto.active === estadoActivo
        );
    }

    productosFiltrados.sort((a, b) => {
        switch (orden) {
            case 'name_asc':
                return a.name.localeCompare(b.name);
            case 'name_desc':
                return b.name.localeCompare(a.name);
            case 'price_asc':
                return a.price - b.price;
            case 'price_desc':
                return b.price - a.price;
            case 'id_asc':
                return a.id - b.id;
            case 'id_desc':
                return b.id - a.id;
            default:
                return 0;
        }
    });

    productesFiltrats = productosFiltrados;
    
    // Cargar el array en el sistema de paginación
    carregarArray(productesFiltrats);
    
    // Usar la página del estado global si existe
    if (paginaTemporal !== null) {
        paginaActual = paginaTemporal;
        paginaTemporal = null;
    } else if (estadoGlobal && estadoGlobal.pagina) {
        // Si hay estado global, usar esa página
        paginaActual = estadoGlobal.pagina;
    }
    
    actualitzarDades();
    
    // Limpiar estado global después de usarlo
    estadoGlobal = null;
}


function aplicarFiltros() {
    const filtroNombre = $('#searchName').val().toLowerCase();
    const filtroFamilia = $('#filterFamily').val();
    const filtroEstado = $('#filterStatus').val();
    const orden = $('#filterSort').val();

    let productosFiltrados = [...productosCompletos];

    if (filtroNombre) {
        productosFiltrados = productosFiltrados.filter(producto =>
            producto.name.toLowerCase().includes(filtroNombre)
        );
    }

    if (filtroFamilia !== 'all') {
        productosFiltrados = productosFiltrados.filter(producto =>
            producto.family_id == filtroFamilia
        );
    }

    if (filtroEstado !== 'all') {
        const estadoActivo = filtroEstado === 'active';
        productosFiltrados = productosFiltrados.filter(producto =>
            producto.active === estadoActivo
        );
    }

    productosFiltrados.sort((a, b) => {
        switch (orden) {
            case 'name_asc':
                return a.name.localeCompare(b.name);
            case 'name_desc':
                return b.name.localeCompare(a.name);
            case 'price_asc':
                return a.price - b.price;
            case 'price_desc':
                return b.price - a.price;
            case 'id_asc':
                return a.id - b.id;
            case 'id_desc':
                return b.id - a.id;
            default:
                return 0;
        }
    });

    productesFiltrats = productosFiltrados;
    
    // Cargar el array en el sistema de paginación
    carregarArray(productesFiltrats);
    
    // Solo ir a página 1 si hay filtros activos y no es una operación temporal
    const hayFiltros = filtroNombre || filtroFamilia !== 'all' || filtroEstado !== 'all';
    if (hayFiltros && !paginaTemporal) {
        paginaActual = 1;
    }
    
    actualitzarDades();
    
    // Si había una página temporal guardada, restaurarla
    if (paginaTemporal !== null) {
        paginaActual = paginaTemporal;
        paginaTemporal = null;
    }
}

// Esta función será llamada desde el sistema de paginación
function actualitzarDades() {
    // Usar arrayElements del sistema de paginación
    if (!arrayElements || arrayElements.length === 0) {
        const tbody = document.getElementById('tableBody');
        tbody.innerHTML = "";

        const tr = document.createElement("tr");
        const td = document.createElement("td");
        td.colSpan = 9;
        td.textContent = "No hi ha productes per a mostrar.";
        td.classList.add('error-message');
        tr.appendChild(td);
        tbody.appendChild(tr);
        
        // Ocultar la paginación si no hay datos
        const paginacio = document.getElementsByClassName('paginacio')[0];
        if (paginacio) {
            paginacio.classList.add('no_mostrar');
        }
        return;
    }

    // Usar aplicarPaginacio del sistema de paginación
    const productosPagina = aplicarPaginacio(arrayElements);
    
    actualizarTablaConProductos(productosPagina);
    
    // LLAMAR A LA FUNCIÓN DEL SISTEMA DE PAGINACIÓN
    creaPagines();
}

function actualizarTablaConProductos(productosPagina) {
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = "";

    productosPagina.forEach(producto => {
        const tr = document.createElement("tr");
        if (!producto.active) {
            tr.classList.add('inactive');
        }

        let familia = null;
        for (let j = 0; j < familiasCompletas.length; j++) {
            if (familiasCompletas[j].id === producto.family_id) {
                familia = familiasCompletas[j];
                break;
            }
        }
        const nombreFamilia = familia ? familia.name : "Sense família";

        const imagenesProducto = imagenesCompletas.filter(img => img.product_id === producto.id);
        const numImagenes = imagenesProducto.length;

        // ID
        const tdId = document.createElement("td");
        tdId.textContent = producto.id;
        tdId.setAttribute("data-cell", "ID: ");
        tr.appendChild(tdId);

        // Nom
        const tdNombre = document.createElement("td");
        tdNombre.textContent = producto.name;
        tdNombre.setAttribute("data-cell", "Nom: ");
        tr.appendChild(tdNombre);

        // Preu
        const tdPrecio = document.createElement("td");
        const precio = Number(producto.price);
        tdPrecio.textContent = `${!isNaN(precio) ? precio.toFixed(2) : "0.00"} €`;
        tdPrecio.setAttribute("data-cell", "Preu: ");
        tr.appendChild(tdPrecio);

        // Descripció
        const tdDescripcion = document.createElement("td");
        tdDescripcion.textContent = producto.description;
        tdDescripcion.setAttribute("data-cell", "Descripció: ");
        tr.appendChild(tdDescripcion);

        // Família
        const tdFamilia = document.createElement("td");
        tdFamilia.textContent = nombreFamilia;
        tdFamilia.setAttribute("data-cell", "Família: ");
        tr.appendChild(tdFamilia);

        // Imatges
        const tdImagenes = document.createElement("td");
        const linkImagenes = document.createElement("a");
        linkImagenes.href = `#`;
        linkImagenes.textContent = `Imatges (${numImagenes})`;
        linkImagenes.classList.add("link-images");
        linkImagenes.setAttribute("data-id", producto.id);

        if (numImagenes === 0) {
            linkImagenes.classList.add("link-no-images");
        }

        tdImagenes.setAttribute("data-cell", "Imatges: ");
        tdImagenes.appendChild(linkImagenes);
        tr.appendChild(tdImagenes);

        // Atributs
        const tdAtributos = document.createElement("td");
        const linkAtributos = document.createElement("a");
        linkAtributos.href = `#`;
        linkAtributos.textContent = "Atributs";
        linkAtributos.classList.add("link-attributes");
        linkAtributos.setAttribute("data-id", producto.id);
        tdAtributos.setAttribute("data-cell", "Característiques: ");
        tdAtributos.appendChild(linkAtributos);
        tr.appendChild(tdAtributos);

        // Actiu/Inactiu
        const tdToggle = document.createElement("td");
        const btnToggle = document.createElement("button");
        btnToggle.textContent = producto.active ? 'Activat' : 'Desactivat';
        btnToggle.classList.add("btn", "btn-toggle");
        btnToggle.setAttribute("data-id", producto.id);
        tdToggle.setAttribute("data-cell", "Estat: ");
        tdToggle.appendChild(btnToggle);
        tr.appendChild(tdToggle);

        // Accions
        const tdAcciones = document.createElement("td");
        tdAcciones.setAttribute("data-cell", "");

        const divAcciones = document.createElement("div");
        divAcciones.classList.add("acciones-container");

        // Icono de Detalls
        const spanDetalles = document.createElement("span");
        spanDetalles.classList.add("icon-visualitzar");
        spanDetalles.setAttribute("data-id", producto.id);
        spanDetalles.setAttribute("title", "Veure detalls");
        const iDetalles = document.createElement("i");
        iDetalles.classList.add("fa-solid", "fa-eye");
        spanDetalles.appendChild(iDetalles);
        divAcciones.appendChild(spanDetalles);

        // Icono de Editar
        const spanEditar = document.createElement("span");
        spanEditar.classList.add("icon-editar");
        spanEditar.setAttribute("data-id", producto.id);
        spanEditar.setAttribute("title", "Editar producte");
        const iEditar = document.createElement("i");
        iEditar.classList.add("fa-solid", "fa-pen-to-square");
        spanEditar.appendChild(iEditar);
        divAcciones.appendChild(spanEditar);

        // Icono de Borrar
        if (!producto.active) {
            const spanBorrar = document.createElement("span");
            spanBorrar.classList.add("icon-borrar");
            spanBorrar.setAttribute("data-id", producto.id);
            spanBorrar.setAttribute("title", "Esborrar producte");
            const iBorrar = document.createElement("i");
            iBorrar.classList.add("fa-solid", "fa-trash");
            spanBorrar.appendChild(iBorrar);
            divAcciones.appendChild(spanBorrar);
        }

        tdAcciones.appendChild(divAcciones);
        tr.appendChild(tdAcciones);

        tbody.appendChild(tr);
    });

    asignarEventListeners();
}

function asignarEventListeners() {
    document.querySelectorAll(".link-images").forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            const id = parseInt(link.getAttribute("data-id"));
            guardarEstadoGlobal(id, "imagenes");
            window.location.href = `./ProductesImg/ProducteImg.html?id=${id}`;
        });
    });

    document.querySelectorAll(".icon-visualitzar").forEach(icon => {
        icon.addEventListener("click", () => {
            const id = parseInt(icon.getAttribute("data-id"));
            guardarEstadoGlobal(id, "visualizar");
            window.location.href = `ProductesVisualitzar.html?id=${id}`;
        });
    });

    document.querySelectorAll(".icon-editar").forEach(icon => {
        icon.addEventListener("click", () => {
            const id = parseInt(icon.getAttribute("data-id"));
            guardarEstadoGlobal(id, "editar");
            window.location.href = `ProducteModificar.html?id=${id}`;
        });
    });

    document.querySelectorAll(".btn-toggle").forEach(btn => {
        btn.addEventListener("click", () => {
            const id = parseInt(btn.getAttribute("data-id"));
            toggleActivo(id);
        });
    });

    document.querySelectorAll(".link-attributes").forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            const id = parseInt(link.getAttribute("data-id"));
            guardarEstadoGlobal(id, "atributos");
            window.location.href = `AtributAssignar.html?id=${id}`;
        });
    });
    
    document.querySelectorAll(".icon-borrar").forEach(icon => {
        icon.addEventListener("click", () => {
            const id = parseInt(icon.getAttribute("data-id"));
            if (confirm("Segur que vols esborrar permanentment este producte?")) {
                borrarProducto(id);
            }
        });
    });
}

// Función para guardar el estado global
function guardarEstadoGlobal(productId, accion) {
    console.log("Guardando estado global. Página actual:", paginaActual);
    const estadoGlobal = {
        pagina: paginaActual,
        filtros: {
            nombre: $('#searchName').val(),
            familia: $('#filterFamily').val(),
            estado: $('#filterStatus').val(),
            orden: $('#filterSort').val()
        },
        productoId: productId,
        accion: accion,
        timestamp: Date.now()
    };
    
    console.log("Estado guardado:", estadoGlobal);
    sessionStorage.setItem('estadoGlobal', JSON.stringify(estadoGlobal));
}

async function obtenerProductos() {
    try {
        return await getData(url, "Product") || [];
    } catch (error) {
        console.error("Error obteniendo productos:", error);
        return [];
    }
}

async function obtenerFamilias() {
    try {
        return await getData(url, "Family") || [];
    } catch (error) {
        console.error("Error obteniendo familias:", error);
        return [];
    }
}

async function obtenerImagenes() {
    try {
        return await getData(url, "Productimage") || [];
    } catch (error) {
        console.error("Error obteniendo imágenes:", error);
        return [];
    }
}

async function obtenerAtributos() {
    try {
        return await getData(url, "Productattribute") || [];
    } catch (error) {
        console.error("Error obteniendo atributos:", error);
        return [];
    }
}

async function toggleActivo(id) {
    try {
        // Guardar página actual antes de la operación
        paginaTemporal = paginaActual;
        
        const producto = await getIdData(url, "Product", id);
        if (producto) {
            const nuevoEstado = !producto.active;
            await updateId(url, "Product", id, { active: nuevoEstado });

            [productosCompletos, familiasCompletas, imagenesCompletas, atributosCompletos] = await Promise.all([
                obtenerProductos(),
                obtenerFamilias(),
                obtenerImagenes(),
                obtenerAtributos()
            ]);
            
            // Aplicar filtros manteniendo la página
            aplicarFiltros();
        }
    } catch (error) {
        console.error("Error cambiando estado del producto:", error);
        alert("Error al cambiar l'estat del producte.");
        paginaTemporal = null;
    }
}

async function borrarProducto(id) {
    try {
        // Guardar página actual antes de la operación
        paginaTemporal = paginaActual;
        
        for (const imagen of imagenesCompletas) {
            if (imagen.product_id === id) {
                await deleteData(url, "Productimage", imagen.id);
            }
        }

        for (const atributo of atributosCompletos) {
            if (atributo.product_id === id) {
                await deleteData(url, "Productattribute", atributo.id);
            }
        }

        await deleteData(url, "Product", id);

        [productosCompletos, familiasCompletas, imagenesCompletas, atributosCompletos] = await Promise.all([
            obtenerProductos(),
            obtenerFamilias(),
            obtenerImagenes(),
            obtenerAtributos()
        ]);
        
        // Aplicar filtros manteniendo la página
        aplicarFiltros();

    } catch (error) {
        console.error("Error eliminando producto:", error);
        alert("Error al eliminar el producte.");
        paginaTemporal = null;
    }
}