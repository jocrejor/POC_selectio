
// ============================
// INICIAR
// ============================
document.addEventListener("DOMContentLoaded", main);
// ============================
// CONFIGURACIÓ DE L'API
// ============================
const API_BASE = "https://api.serverred.es/";
const USER_ID = 1;

// Variables globals per a les dades
let totesImatges = [];
let totesFamilies = [];
let totsAtributs = [];
let totsProductAtributs = [];

// ============================
// CARREGAR TOTES LES DADES NECESSÀRIES
// ============================
async function carregarTotesDades() {
    try {
        // Carregar totes les dades necessàries per a la comparació
        const [imatges, families, atributs, productAtributs] = await Promise.all([
            fetch(`${API_BASE}/Productimage`).then(r => r.json()),
            fetch(`${API_BASE}/family`).then(r => r.json()),
            fetch(`${API_BASE}/attribute`).then(r => r.json()),
            fetch(`${API_BASE}/productattribute`).then(r => r.json())
        ]);

        totesImatges = imatges;
        totesFamilies = families;
        totsAtributs = atributs;
        totsProductAtributs = productAtributs;

        console.log("Dades carregades:", {
            imatges: totesImatges.length,
            families: totesFamilies.length,
            atributs: totsAtributs.length,
            productAtributs: totsProductAtributs.length
        });
    } catch (error) {
        console.error("Error carregant dades:", error);
    }
}

// ============================
// OBTINDRE IMATGE D'UN PRODUCTE
// ============================
function obtenirImatgeProducte(producteId) {
    const imatge = totesImatges.find(img => img.product_id === producteId);
    return imatge?.url || null;
}

// ============================
// CARREGAR COMPARADORS
// ============================
async function main() {
    try {
        // Primer carregar totes les dades necessàries
        await carregarTotesDades();

        // Després carregar els comparadors
        const res = await fetch(`${API_BASE}/comparator?user_id=${USER_ID}`);
        const comparadors = await res.json();

        pintarComparadors(comparadors);

    } catch (error) {
        console.error("Error carregant comparadors:", error);
    }
}

// ============================
// CARREGAR PRODUCTES D'UN COMPARADOR
// ============================
async function carregarProductesDeComparador(idComparador) {
    try {
        const res = await fetch(`${API_BASE}/comparatorProduct?comparator_id=${idComparador}`);
        const llista = await res.json();

        // Obtindre dades de cada producte
        const productes = await Promise.all(
            llista.map(async (item) => {
                try {
                    const resProducte = await fetch(`${API_BASE}/product/${item.product_id}`);
                    const producte = await resProducte.json();

                    // Buscar imatge, família i atributs del producte
                    const imatgeUrl = obtenirImatgeProducte(producte.id);
                    const familia = totesFamilies.find(f => f.id === producte.family_id);
                    const atributsProducte = totsProductAtributs.filter(pa => pa.product_id === producte.id);

                    return {
                        ...producte,
                        imageUrl: imatgeUrl,
                        familia: familia,
                        atributs: atributsProducte
                    };
                } catch (error) {
                    console.warn(`Error carregant producte ${item.product_id}:`, error);
                    return null;
                }
            })
        );

        // Filtrar productes nuls
        return productes.filter(p => p !== null);

    } catch (error) {
        console.error(`Error carregant productes del comparador ${idComparador}:`, error);
        return [];
    }
}

// ============================
// GENERAR TAULA COMPARATIVA
// ============================
function generarTaulaComparativa(productes) {
    if (productes.length === 0) {
        const p = document.createElement("p");
        p.classList.add("empty");
        p.textContent = "No hi ha productes per comparar";
        return p;
    }

    // Contenedor principal
    const tableContainer = document.createElement("div");
    tableContainer.classList.add("table-container");

    const table = document.createElement("table");
    table.classList.add("taula-comparativa");

    // Crear thead
    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");

    // Columna fija "Atribut"
    const thAtribut = document.createElement("th");
    thAtribut.classList.add("fixed-column");
    thAtribut.appendChild(document.createTextNode("Atribut"));
    headerRow.appendChild(thAtribut);

    // Cabeceras de productos
    productes.forEach(producte => {
        const thProduct = document.createElement("th");
        thProduct.classList.add("product-header");

        const productInfo = document.createElement("div");
        productInfo.classList.add("product-info");

        // Imagen
        const img = document.createElement("img");
        const imatgeUrl = producte.imageUrl || producte.image || 'https://via.placeholder.com/80?text=No+Img';
        img.src = imatgeUrl;
        img.alt = producte.name || "Producte";
        img.onerror = function () {
            this.src = 'https://via.placeholder.com/80?text=Error';
        };

        // Detalles del producto
        const productDetails = document.createElement("div");
        productDetails.classList.add("product-details");

        const h4 = document.createElement("h4");
        h4.appendChild(document.createTextNode(producte.name || "Producte sense nom"));

        const price = document.createElement("p");
        price.classList.add("price");
        price.appendChild(document.createTextNode(producte.price ? `${producte.price}€` : "Preu no disponible"));

        // Construir estructura
        productDetails.appendChild(h4);
        productDetails.appendChild(price);
        productInfo.appendChild(img);
        productInfo.appendChild(productDetails);
        thProduct.appendChild(productInfo);
        headerRow.appendChild(thProduct);
    });

    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Cuerpo de la tabla
    const tbody = document.createElement("tbody");

    // Obtener atributos únicos
    const atributsUnics = [];
    productes.forEach(producte => {
        (producte.atributs || []).forEach(pa => {
            const atribut = totsAtributs.find(a => a.id === pa.attribute_id);
            if (atribut && !atributsUnics.some(a => a.id === atribut.id)) {
                atributsUnics.push(atribut);
            }
        });
    });

    // Ordenar y crear filas
    atributsUnics.sort((a, b) => a.name.localeCompare(b.name));

    if (atributsUnics.length > 0) {
        atributsUnics.forEach(atribut => {
            const row = document.createElement("tr");

            // Celda de atributo
            const tdAtribut = document.createElement("td");
            tdAtribut.classList.add("fixed-column", "atribut-name");

            const atributText = document.createTextNode(atribut.name);
            tdAtribut.appendChild(atributText);

            if (atribut.unit) {
                const unitSpan = document.createElement("span");
                unitSpan.textContent = ` (${atribut.unit})`;
                tdAtribut.appendChild(unitSpan);
            }

            row.appendChild(tdAtribut);

            // Valores para cada producto
            productes.forEach(producte => {
                const td = document.createElement("td");
                const atributProducte = producte.atributs?.find(attr => attr.attribute_id === atribut.id);
                const valor = atributProducte ? atributProducte.value : "-";
                td.appendChild(document.createTextNode(valor));
                row.appendChild(td);
            });

            tbody.appendChild(row);
        });
    } else {
        const row = document.createElement("tr");
        const td = document.createElement("td");
        td.classList.add("fixed-column");
        td.colSpan = productes.length + 1;
        td.appendChild(document.createTextNode("No hi ha atributs per comparar"));
        row.appendChild(td);
        tbody.appendChild(row);
    }

    table.appendChild(tbody);
    tableContainer.appendChild(table);

    return tableContainer;
}

// ============================
// PINTAR COMPARADORS AL HTML
// ============================
async function pintarComparadors(comparadors) {
    const container = document.getElementById("llistat-comparadors");

    // Limpiar contenido de forma segura
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }

    for (const comp of comparadors) {
        const card = document.createElement("div");
        card.classList.add("comparador-card");
        card.dataset.id = comp.id;

        const header = document.createElement("div");
        header.classList.add("comparador-header");

        const titleContainer = document.createElement("div");
        titleContainer.classList.add("comparador-title-container");

        const expandBtn = document.createElement("button");
        expandBtn.classList.add("expand-btn");
        expandBtn.appendChild(document.createTextNode("▶"));
        expandBtn.addEventListener("click", () => toggleComparador(expandBtn, comp.id));

        const title = document.createElement("h3");
        title.appendChild(document.createTextNode(comp.name || "Comparador sense nom"));

        titleContainer.appendChild(expandBtn);
        titleContainer.appendChild(title);
        header.appendChild(titleContainer);

        const productesContainer = document.createElement("div");
        productesContainer.classList.add("productes-container");
        productesContainer.style.display = "none";
        productesContainer.id = `productes-${comp.id}`;

        const loading = document.createElement("div");
        loading.classList.add("loading");
        loading.appendChild(document.createTextNode("Carregant comparació..."));

        productesContainer.appendChild(loading);
        card.appendChild(header);
        card.appendChild(productesContainer);
        container.appendChild(card);
    }
}

// ============================
// TOGGLE EXPANDIR/COL·LAPSAR COMPARADOR
// ============================
async function toggleComparador(btn, comparadorId) {
    const container = document.getElementById(`productes-${comparadorId}`);
    const isExpanded = container.style.display !== "none";

    if (!isExpanded) {
        // Expandir
        btn.replaceChildren(document.createTextNode("▼"));
        container.style.display = "block";

        // Limpiar contenido anterior
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }

        // Añadir indicador de carga
        const loading = document.createElement("div");
        loading.classList.add("loading");
        loading.textContent = "Carregant comparació...";
        container.appendChild(loading);

        // Cargar productos
        const productes = await carregarProductesDeComparador(comparadorId);

        // Limpiar y mostrar resultados
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }

        if (productes.length === 0) {
            const p = document.createElement("p");
            p.classList.add("empty");
            p.appendChild(document.createTextNode("No hi ha productes en aquest comparador"));
            container.appendChild(p);
        } else {
            const taulaElement = generarTaulaComparativa(productes);
            container.appendChild(taulaElement);
            setTimeout(() => afegirScrollButtons(container), 100);
        }
    } else {
        // Colapsar
        btn.textContent = "▶";
        container.style.display = "none";
    }
}

// ============================
// AFEGIR BOTONS DE SCROLL PER A TAULES GRANS
// ============================
function afegirScrollButtons(container) {
    const tableContainer = container.querySelector('.table-container');
    if (!tableContainer) return;

    const table = tableContainer.querySelector('table');
    if (!table) return;

    // Comprovar si la taula és més ampla que el contenidor
    if (table.scrollWidth > tableContainer.clientWidth) {
        // Crear botons de scroll
        const scrollLeftBtn = document.createElement('button');
        scrollLeftBtn.className = 'scroll-btn scroll-left';
        scrollLeftBtn.innerHTML = '◀';
        scrollLeftBtn.onclick = () => {
            tableContainer.scrollBy({ left: -200, behavior: 'smooth' });
        };

        const scrollRightBtn = document.createElement('button');
        scrollRightBtn.className = 'scroll-btn scroll-right';
        scrollRightBtn.innerHTML = '▶';
        scrollRightBtn.onclick = () => {
            tableContainer.scrollBy({ left: 200, behavior: 'smooth' });
        };

        container.insertBefore(scrollLeftBtn, tableContainer);
        container.appendChild(scrollRightBtn);

        // Actualitzar visibilitat dels botons
        tableContainer.addEventListener('scroll', () => {
            updateScrollButtons(tableContainer, scrollLeftBtn, scrollRightBtn);
        });

        updateScrollButtons(tableContainer, scrollLeftBtn, scrollRightBtn);
    }
}

function updateScrollButtons(container, btnLeft, btnRight) {
    const scrollLeft = container.scrollLeft;
    const maxScroll = container.scrollWidth - container.clientWidth;

    btnLeft.style.display = scrollLeft <= 10 ? 'none' : 'flex';
    btnRight.style.display = scrollLeft >= maxScroll - 10 ? 'none' : 'flex';
}

