document.addEventListener("DOMContentLoaded", main);

function actualitzarDades() {
    if (typeof window.renderitzarTaulaProductes === 'function') {
        window.renderitzarTaulaProductes();
    }
}

// Función para calcular el precio con descuento
function calcularPrecioConDescuento(precioOriginal, porcentajeDescuento) {
    if (!porcentajeDescuento || porcentajeDescuento === 0) {
        return precioOriginal;
    }
    const descuento = (precioOriginal * porcentajeDescuento) / 100;
    const precioFinal = precioOriginal - descuento;
    return precioFinal.toFixed(2);
}

// Funció per a afegir un producte a una oferta específica
async function afegirProducteAOferta(ofertaId, productId) {
    try {
        const ofertaIdNum = parseInt(ofertaId);
        const productIdNum = parseInt(productId);

        // Obtener las relaciones existentes para generar un ID único
        const productSale = await obtenerProductSale();

        // Generar un ID único (máximo ID existente + 1)
        let nuevoId;
        if (productSale.length > 0) {
            const maxId = Math.max(...productSale.map(rel => {
                if (rel.id) {
                    return typeof rel.id === 'string' ? parseInt(rel.id) : rel.id;
                }
                return 0;
            }));
            nuevoId = maxId + 1;
        } else {
            nuevoId = 1;
        }

        // Verificar si ya existe esta relación específica
        const existeRelacion = productSale.find(rel => {
            const relSaleId = typeof rel.sale_id === 'string' ? parseInt(rel.sale_id) : rel.sale_id;
            const relProductId = typeof rel.product_id === 'string' ? parseInt(rel.product_id) : rel.product_id;
            return relSaleId === ofertaIdNum && relProductId === productIdNum;
        });

        if (existeRelacion) {
            mostrarMensaje("Aquest producte ja està a l'oferta", "error");
            return;
        }

        // Crear la relación con ID manual
        const nuevaRelacion = {
            id: nuevoId,
            sale_id: ofertaIdNum,
            product_id: productIdNum
        };

        await postData(url, "ProductSale", nuevaRelacion);

        // Recargar la lista
        if (typeof window.cargarProductosAplicados === 'function') {
            await window.cargarProductosAplicados(ofertaId);
        }

        // Mostrar mensaje después de actualizar
        mostrarMensaje("Producte afegit correctament a l'oferta", "success");

    } catch (error) {
        console.error('Error afegint producte a oferta:', error);
        mostrarMensaje("Error afegint el producte", "error");
    }
}

// Funció que elimina un producte d'una oferta específica
async function eliminarProductoDeOferta(ofertaId, productId) {
    if (confirm("Estàs segur que vols eliminar aquest producte de l'oferta?")) {
        try {
            const productSale = await obtenerProductSale();

            const relacion = productSale.find(function (rel) {
                return rel.sale_id === parseInt(ofertaId) && rel.product_id === parseInt(productId);
            });

            if (relacion && relacion.id) {
                await deleteData(url, "ProductSale", relacion.id);

                if (typeof window.cargarProductosAplicados === 'function') {
                    await window.cargarProductosAplicados(ofertaId);
                }

                mostrarMensaje("Producte eliminat correctament de l'oferta", "success");
            } else {
                mostrarMensaje("No s'ha trobat la relació per eliminar", "error");
            }
        } catch (error) {
            console.error('Error eliminant producte de oferta:', error);
            mostrarMensaje("Error eliminant el producte", "error");
        }
    }
}

// Funció principal que inicialitza l'aplicació i gestiona la visualització dels productes d'una oferta
async function main() {
    thereIsUser("../login.html");

    // Buscar el botó de tancar sessió
    const btnLogout = document.getElementById("botoTancarSessio");

    btnLogout.addEventListener("click", () => {
        // Eliminar l'usuari actual
        tancarSessio("../login.html");
    });

    const btnLogoutLateral = document.getElementById("tancarSessioLateral");

    btnLogoutLateral.addEventListener("click", () => {
        // Eliminar l'usuari actual del localStorage
        tancarSessio("../login.html");
    });

    const tableBody = document.getElementById('tableBody');
    const pageTitle = document.getElementById('pageTitle');
    const addProductButton = document.getElementById('addProductButton');

    // Variables para los datos
    let productosAplicados = [];

    const params = new URLSearchParams(window.location.search);
    const ofertaId = params.get('oferta');

    if (!ofertaId) {
        mostrarError("No s'ha especificat cap oferta");
        return;
    }

    async function carregarOferta() {
        try {
            const oferta = await getIdData(url, "Sale", ofertaId);
            if (oferta) {
                if (pageTitle) {
                    pageTitle.textContent = `Productes de l'oferta: ${oferta.description}`;
                    document.title = `Productes - ${oferta.description}`;
                }
                return oferta;
            }
            return null;
        } catch (error) {
            mostrarError("Error carregant les dades de l'oferta");
            return null;
        }
    }

    const oferta = await carregarOferta();

    if (!oferta) {
        return;
    }

    if (addProductButton) {
        addProductButton.addEventListener('click', function () {
            mostrarModalProductos(ofertaId, oferta.description);
        });
    }

    function carregarArray(e) {
        // Asegurarse de que arrayElements existe
        if (typeof arrayElements === 'undefined') {
            arrayElements = e;
        } else {
            // Si ya existe, asignar el valor
            arrayElements = e;
        }
    }

    // Sobrescribir la función global actualitzarDades
    window.actualitzarDades = function () {
        if (typeof renderitzarTaula === 'function') {
            renderitzarTaula();
        }
    };

    // Funció que carrega i mostra els productes associats a una oferta específica
    async function cargarProductosAplicados(ofertaId) {
        productosAplicados = await buscarProductosAplicados(ofertaId);

        if (productosAplicados.length === 0) {
            mostrarNoProductos();
            return;
        }

        // Cargar array para paginación
        carregarArray(productosAplicados);
        if (typeof paginaActual !== 'undefined') {
            paginaActual = 1;
        }
        window.actualitzarDades();
    }

    await cargarProductosAplicados(ofertaId);

    // Hacer la función cargarProductosAplicados disponible globalmente
    window.cargarProductosAplicados = cargarProductosAplicados;

    // Event listener para el botón de cerrar del modal
    const modalClose = document.querySelector('.modal-close');
    if (modalClose) {
        modalClose.addEventListener('click', function () {
            const modal = document.getElementById('modalOferta');
            if (modal) {
                modal.style.display = 'none';
            }
        });
    }

    // Event listener para cerrar modal al hacer click fuera
    const modal = document.getElementById('modalOferta');
    if (modal) {
        modal.addEventListener('click', function (e) {
            if (e.target === this) {
                this.style.display = 'none';
            }
        });
    }

    // Event listener para el botón Tornar a Ofertes
    const tornarButton = document.querySelector('.boton-tornar');
    if (tornarButton) {
        tornarButton.addEventListener('click', function () {
            window.location.href = 'index.html';
        });
    }

    // Funció per a mostrar les ofertes en la taula
    function renderitzarTaula() {
        if (!tableBody) return;

        while (tableBody.firstChild) {
            tableBody.removeChild(tableBody.firstChild);
        }

        if (productosAplicados.length === 0) {
            mostrarNoProductos();
            return;
        }

        const elementsActuals = aplicarPaginacio(productosAplicados);

        elementsActuals.forEach(function (producto, index) {
            const row = document.createElement("tr");

            // Celda ID con data-cell attribute
            const celdaId = document.createElement("td");
            celdaId.setAttribute('data-cell', 'ID : ');
            celdaId.textContent = producto.id;
            row.appendChild(celdaId);

            // Celda Nombre con data-cell attribute
            const celdaNombre = document.createElement("td");
            celdaNombre.setAttribute('data-cell', 'Nom del Producte : ');
            celdaNombre.textContent = producto.name;
            row.appendChild(celdaNombre);

            // Celda Precio original con data-cell attribute
            const celdaPrecio = document.createElement("td");
            celdaPrecio.setAttribute('data-cell', 'Preu : ');
            celdaPrecio.textContent = producto.price + " €";
            row.appendChild(celdaPrecio);

            // Celda Precio con descuento
            const celdaPrecioDescuento = document.createElement("td");
            celdaPrecioDescuento.setAttribute('data-cell', 'Preu amb Descompte : ');
            const precioConDescuento = calcularPrecioConDescuento(producto.price, producto.descuentoPorcentaje);
            celdaPrecioDescuento.textContent = `(${producto.descuentoPorcentaje}%) ${precioConDescuento} €`;
            row.appendChild(celdaPrecioDescuento);

            // Celda Descripción con data-cell attribute
            const celdaDescripcion = document.createElement("td");
            celdaDescripcion.setAttribute('data-cell', 'Descripció : ');
            celdaDescripcion.textContent = producto.description || "Sense descripció";
            row.appendChild(celdaDescripcion);

            // Celda Familia con data-cell attribute
            const celdaFamilia = document.createElement("td");
            celdaFamilia.setAttribute('data-cell', 'Família : ');
            celdaFamilia.textContent = producto.familyName;
            row.appendChild(celdaFamilia);

            // Celda de acciones con data-cell attribute
            const actionCell = document.createElement("td");
            actionCell.setAttribute('data-cell', 'Accions : ');

            const removeButton = document.createElement("a");
            removeButton.className = 'icon-borrar';
            removeButton.href = '#';
            removeButton.innerHTML = '<i class="fa-solid fa-trash"></i>';
            removeButton.addEventListener('click', function (e) {
                e.preventDefault();
                eliminarProductoDeOferta(ofertaId, producto.id);
            });

            actionCell.appendChild(removeButton);
            row.appendChild(actionCell);

            tableBody.appendChild(row);
        });

        creaPagines();
    }

    window.renderitzarTaulaProductes = renderitzarTaula;
}

async function mostrarModalProductos(ofertaId, ofertaNombre) {
    const modal = document.getElementById("modalOferta");
    const modalContent = document.getElementById("modalOfertaContent");

    if (!modal || !modalContent) return;

    // Actualizar título
    const modalTitle = modal.querySelector('h3');
    if (modalTitle) {
        modalTitle.textContent = `Productes disponibles per: ${ofertaNombre}`;
    }

    // Limpiar contenido anterior
    modalContent.innerHTML = '';

    const productosDisponibles = await obtenerProductosDisponibles(ofertaId);

    if (productosDisponibles.length === 0) {
        const noProductsMsg = document.createElement("div");
        noProductsMsg.textContent = "No hi ha més productes disponibles per afegir";
        modalContent.appendChild(noProductsMsg);
    } else {
        productosDisponibles.forEach(function (producto) {
            const productItem = document.createElement("div");
            productItem.className = 'product-item';

            const productInfo = document.createElement("div");
            productInfo.className = 'product-info';

            const productName = document.createElement("p");
            productName.className = 'product-name';
            productName.textContent = producto.name;
            productName.setAttribute('data-cell', 'Nom : ');

            const productDetails = document.createElement("p");
            productDetails.className = 'product-details';
            productDetails.setAttribute('data-cell', 'Preu : ');
            productDetails.textContent = `${producto.price} €`;

            const productFamily = document.createElement("p");
            productFamily.className = 'product-family';
            productFamily.setAttribute('data-cell', 'Familia : ');
            productFamily.textContent = producto.familyName;

            productInfo.appendChild(productName);
            productInfo.appendChild(productDetails);
            productInfo.appendChild(productFamily);

            const addButton = document.createElement("button");
            addButton.className = 'modal-add-button';
            addButton.textContent = "Afegir";

            addButton.addEventListener('click', function () {
                afegirProducteAOferta(ofertaId, producto.id);
                modal.style.display = 'none';
            });

            productItem.appendChild(productInfo);
            productItem.appendChild(addButton);
            modalContent.appendChild(productItem);
        });
    }

    // Mostrar modal
    modal.style.display = 'block';
}

// Funció per a obtindre ProductSale des de la API
async function obtenerProductSale() {
    try {
        const productSale = await getData(url, "ProductSale");
        if (productSale && Array.isArray(productSale)) {
            return productSale;
        }
        return [];
    } catch (error) {
        return [];
    }
}

// Funció per a obtindre Productes des de la API
async function obtenerProductos() {
    try {
        const productos = (await getData(url, "Product")).flat();
        if (productos && Array.isArray(productos)) {
            return productos;
        }
        return [];
    } catch (error) {
        return [];
    }
}

// Funció per a obtindre Families des de la API
async function obtenerFamilias() {
    try {
        const familias = (await getData(url, "Family")).flat();
        if (familias && Array.isArray(familias)) {
            return familias;
        }
        return [];
    } catch (error) {
        return [];
    }
}

// Funció que busca tots els productes que estan associats a una oferta específica
async function buscarProductosAplicados(ofertaId) {
    const productosAplicados = [];

    try {
        const [productSale, productos, familias, oferta] = await Promise.all([
            obtenerProductSale(),
            obtenerProductos(),
            obtenerFamilias(),
            getIdData(url, "Sale", ofertaId) // Obtener datos de la oferta para el descuento
        ]);

        const ofertaIdNum = parseInt(ofertaId);
        const porcentajeDescuento = oferta ? oferta.discount_percent : 0;

        productSale.forEach(function (relacion) {
            const relacionSaleId = parseInt(relacion.sale_id);

            if (relacionSaleId === ofertaIdNum) {
                const producto = productos.find(function (p) {
                    const productoId = typeof p.id === 'string' ? parseInt(p.id) : p.id;
                    const relacionProductId = typeof relacion.product_id === 'string' ? parseInt(relacion.product_id) : relacion.product_id;
                    return productoId === relacionProductId;
                });

                if (producto) {
                    const familia = familias.find(function (f) {
                        const familiaId = typeof f.id === 'string' ? parseInt(f.id) : f.id;
                        const productFamilyId = typeof producto.family_id === 'string' ? parseInt(producto.family_id) : producto.family_id;
                        return familiaId === productFamilyId;
                    });

                    productosAplicados.push({
                        id: producto.id,
                        name: producto.name,
                        price: producto.price,
                        descuentoPorcentaje: porcentajeDescuento,
                        description: producto.description,
                        familyName: familia ? familia.name : 'Desconeguda',
                        productSaleId: relacion.id || null
                    });
                }
            }
        });

    } catch (error) {
        console.error('Error buscant productes aplicats:', error);
    }

    return productosAplicados;
}

async function obtenerProductosDisponibles(ofertaId) {
    const productosAplicados = await buscarProductosAplicados(ofertaId);
    const productosAplicadosIds = productosAplicados.map(p => p.id);

    const productosDisponibles = [];

    try {
        const productos = await obtenerProductos();
        const familias = await obtenerFamilias();

        productos.forEach(function (producto) {
            if (!productosAplicadosIds.includes(producto.id)) {
                const familia = familias.find(function (f) {
                    const familiaId = typeof f.id === 'string' ? parseInt(f.id) : f.id;
                    const productFamilyId = typeof producto.family_id === 'string' ? parseInt(producto.family_id) : producto.family_id;
                    return familiaId === productFamilyId;
                });

                productosDisponibles.push({
                    id: producto.id,
                    name: producto.name,
                    price: producto.price,
                    familyName: familia ? familia.name : 'Desconeguda'
                });
            }
        });
    } catch (error) {
        console.error('Error obtenint productes disponibles:', error);
    }

    return productosDisponibles;
}

// Funció per a mostrar missatges temporals a l'usuari
function mostrarMensaje(texto, tipo = "success") {
    const mensaje = document.createElement("div");
    mensaje.className = `notification ${tipo}`;
    mensaje.textContent = texto;

    document.body.appendChild(mensaje);

    setTimeout(function () {
        mensaje.remove();
    }, 3000);
}

// Funció per a mostrar missatges d'error en la taula
function mostrarError(mensaje) {
    const tableBody = document.getElementById('tableBody');
    if (!tableBody) return;

    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.setAttribute('colspan', '7');
    cell.className = 'no-data';
    cell.textContent = mensaje;
    row.appendChild(cell);
    tableBody.appendChild(row);
}

// Funció per a mostrar un missatge quan no hi ha productes
function mostrarNoProductos() {
    const tableBody = document.getElementById('tableBody');
    if (!tableBody) return;

    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.setAttribute('colspan', '7');
    cell.className = 'no-data';
    cell.textContent = "No hi ha productes aplicats a aquesta oferta";
    row.appendChild(cell);
    tableBody.appendChild(row);

    // Ocultar paginación si no hay datos
    const paginacio = document.getElementsByClassName('paginacio')[0];
    if (paginacio) {
        paginacio.classList.add('no_mostrar');
    }
}