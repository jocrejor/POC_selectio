document.addEventListener("DOMContentLoaded", () => { main().catch(err => console.error(err)); });

let compare = localStorage.getItem('comparar') ? JSON.parse(localStorage.getItem('comparar')) : {};
let compareProduct = localStorage.getItem('compararProductes') ? JSON.parse(localStorage.getItem('compararProductes')) : [];
let productes = [];
let productesMesAtributs = localStorage.getItem('productesMesAtributs') ? JSON.parse(localStorage.getItem('productesMesAtributs')) : {};
let productAtribut = [];
let atribute = [];

async function main() {
    // Carregar dades des de l'API
    await carregarDadesAPI();
     
    // Obtenir l'index del producte a través de la URL
    const params = new URLSearchParams(window.location.search);
    const index = params.get('index');

    if (index !== null && productes[index]) {
        const product = productes[index]

        // Crear objecte compararador
        const compare = {
            "sessionId": obtindreSessionId(),
            "userAgent": navigator.userAgent,
                "dateStart": new Date().toISOString()
            };

        // Comprovar si ja existeix ja comparador
        if (!localStorage.getItem('comparar')) {
            localStorage.setItem('comparar', JSON.stringify(compare))
            
        }
        // SI no existeix el producte afegir
        let Existeix = compareProduct.some(p => p.product == index);
        if (!Existeix) {
            // Comprovar que coincideixi la família amb els productes ja afegits
            let canAdd = true;
            if (compareProduct.length > 0) {
                const firstIndex = compareProduct[0].product;
                const firstProduct = productes[firstIndex];
                const firstFamilyId = firstProduct ? firstProduct.family_id : null;
                if (firstFamilyId != null && product.family_id != firstFamilyId) {
                    canAdd = false;
                    alert("El producte no és de la mateixa família que els que ja vols comparar.");
                }
            }
            if (canAdd) {
                // Afegir producte a comparar
                compareProduct.push({
                    "sessionId": compare.sessionId,
                    "product": index
                });
                localStorage.setItem('compararProductes', JSON.stringify(compareProduct));
            }
        } else {
            alert("Ja existeix el producte en el comparador");
        }
        // Neteja el comparador si lleves tots els productes encara que recarregues la pàgina
        window.history.replaceState({}, document.title, "comparador.html");

    }
    
    // Cridar a la funció per a crear l'array d'atributs
    arrayMesAtribut();
    
    mostrarComparador();

}

// Carregar dades des de l'API
async function carregarDadesAPI() {
    let prodRes = null;
    let prodAttrRes = null;
    let attrRes = null;

    // Intentar carregar des de l'API utilitzant getData
    try {
        prodRes = await getData(url, 'Product');
        prodAttrRes = await getData(url, 'Productattribute');
        attrRes = await getData(url, 'Attribute');
    } catch (e) {
        console.error('Error carregant dades amb getData:', e);
    }

    // Assignar resultats o utilitzar localStorage com a fallback
    productes = Array.isArray(prodRes) ? prodRes : 
        (localStorage.getItem('productes') ? JSON.parse(localStorage.getItem('productes')) : []);
    
    productAtribut = Array.isArray(prodAttrRes) ? prodAttrRes : 
        (localStorage.getItem('productAtribut') ? JSON.parse(localStorage.getItem('productAtribut')) : []);
    
    atribute = Array.isArray(attrRes) ? attrRes : 
        (localStorage.getItem('atribute') ? JSON.parse(localStorage.getItem('atribute')) : []);

    // Guardar a localStorage com a cache
    try { 
        localStorage.setItem('productes', JSON.stringify(productes)); 
        localStorage.setItem('productAtribut', JSON.stringify(productAtribut)); 
        localStorage.setItem('atribute', JSON.stringify(atribute)); 
    } catch(e) {
        console.error('Error guardant a localStorage:', e);
    }

    console.log('Dades carregades:', {
        productes: productes.length,
        productAtribut: productAtribut.length,
        atribute: atribute.length
    });
}


function arrayMesAtribut(){

    productes.forEach((product, index) => {
        if (product.id) {
            // Buscar el attribute_id que correspon a aquest product_id
            const atribut = productAtribut.find(attr => attr.product_id === product.id);
            if (atribut) {
                productesMesAtributs[product.id] = atribut.attribute_id;
            }
        }
    });
    

    localStorage.setItem('productesAtributs', JSON.stringify(productesMesAtributs));
    
    // Mostrar el contingut en la consola del navegador
    console.log('Contenido de productesMesAtributs:', productesMesAtributs);
}


// Crear un ID de sessió aleatori
function obtindreSessionId() {
    return crypto.randomUUID();

}
// Mostrar productes a comparar
function mostrarComparador() {
    const compararDiv = document.getElementById('compararDiv');
    compararDiv.innerHTML = ""; // Netejar contingut anterior
    
    const taulaDiv = document.getElementById('taulaDiv');
    taulaDiv.innerHTML = ""; // Netejar contingut de la taula

    if (!compareProduct || compareProduct.length === 0) {
        alert("No tens productes per a comparar");
        return;
    }

    // Crear la taula de comparació d'atributs
    crearTaulaComparacio();

    // Mostrar productes individuals
    compareProduct.forEach((item) => {
        const product = productes[item.product];
        if (product) {
            const productDiv = document.createElement('div');
            productDiv.style.border = "1px solid #000";
            productDiv.style.margin = "10px";
            productDiv.style.padding = "10px";

            const descP = document.createElement('p');
            descP.textContent = product.descripton;
            productDiv.appendChild(descP);

            const priceP = document.createElement('p');
            priceP.textContent = `Preu: ${product.price}€`;
            productDiv.appendChild(priceP);

            const img = document.createElement('img');
            img.src = product.img;
            img.alt = product.name;
            img.style.maxWidth = "100px";
            productDiv.appendChild(img);

            const hr = document.createElement('hr');
            productDiv.appendChild(hr);

            const btnEliminar = document.createElement('button');
            btnEliminar.textContent = "Eliminar";
            btnEliminar.addEventListener('click', () => eliminarProducteComparador(item.product));
            productDiv.appendChild(btnEliminar);

            compararDiv.appendChild(productDiv);
        }
    });
}


// Crear taula de comparació d'atributs
function crearTaulaComparacio() {
    const taulaDiv = document.getElementById('taulaDiv');
    
    // Crear el contenidor de la taula
    const tableContainer = document.createElement('div');
    tableContainer.style.marginBottom = "20px";
    
    const title = document.createElement('h3');
    title.textContent = "Comparació d'Atributs";
    tableContainer.appendChild(title);
    
    // Crear la taula
    const table = document.createElement('table');
    table.style.border = "1px solid #000";
    table.style.borderCollapse = "collapse";
    table.style.width = "100%";
    
    // Obtindre productes a comparar
    const productesComparar = compareProduct.map(item => productes[item.product]).filter(p => p);
    
    if (productesComparar.length === 0) return;
    
    // Crear capçalera de la taula
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    
    // Primera columna: Atributs
    const attrHeader = document.createElement('th');
    attrHeader.textContent = "Atributs";
    attrHeader.style.border = "1px solid #000";
    attrHeader.style.padding = "10px";
    attrHeader.style.backgroundColor = "#f0f0f0";
    headerRow.appendChild(attrHeader);
    
    // Columnes de productes
    productesComparar.forEach(product => {
        const productHeader = document.createElement('th');
        productHeader.textContent = product.name || product.descripton;
        productHeader.style.border = "1px solid #000";
        productHeader.style.padding = "10px";
        productHeader.style.backgroundColor = "#f0f0f0";
        headerRow.appendChild(productHeader);
    });
    
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    // Crear cos de la taula
    const tbody = document.createElement('tbody');
    
    // Afegir fila del preu primer
    const priceRow = document.createElement('tr');
    
    // Primera columna: "Preu"
    const priceAttrCell = document.createElement('td');
    priceAttrCell.textContent = "Preu";
    priceAttrCell.style.border = "1px solid #000";
    priceAttrCell.style.padding = "10px";
    priceAttrCell.style.fontWeight = "bold";
    priceRow.appendChild(priceAttrCell);
    
    // Columnes de preus per a cada producte
    productesComparar.forEach(product => {
        const priceCell = document.createElement('td');
        priceCell.style.border = "1px solid #000";
        priceCell.style.padding = "10px";
        priceCell.style.textAlign = "center";
        priceCell.textContent = product.price ? `${product.price}€` : "N/A";
        priceRow.appendChild(priceCell);
    });
    
    tbody.appendChild(priceRow);
    
    // Obtindre tots els atributs únics dels productes
    const todosAtributos = new Set();
    productesComparar.forEach(product => {
        const productAttrs = productAtribut.filter(attr => attr.product_id === product.id);
        productAttrs.forEach(attr => {
            const atributoInfo = atribute.find(a => a.id === attr.attribute_id);
            if (atributoInfo) {
                todosAtributos.add(JSON.stringify({id: atributoInfo.id, name: atributoInfo.name}));
            }
        });
    });
    
    // Crear files per a cada atribut
    Array.from(todosAtributos).forEach(attrStr => {
        const attr = JSON.parse(attrStr);
        const row = document.createElement('tr');
        
        // Primera columna: nom del atribut
        const attrCell = document.createElement('td');
        attrCell.textContent = attr.name;
        attrCell.style.border = "1px solid #000";
        attrCell.style.padding = "10px";
        attrCell.style.fontWeight = "bold";
        row.appendChild(attrCell);
        
        // Columnes de valors per a cada producte
        productesComparar.forEach(product => {
            const valueCell = document.createElement('td');
            valueCell.style.border = "1px solid #000";
            valueCell.style.padding = "10px";
            valueCell.style.textAlign = "center";
            
            // Buscar el valor del atribut per a aquest producte
            const productAttr = productAtribut.find(pa => 
                pa.product_id === product.id && pa.attribute_id === attr.id /// que locura macho
            );
            
            if (productAttr) {
                valueCell.textContent = productAttr.value || "N/A";
            } else {
                valueCell.textContent = "-";
                valueCell.style.color = "#999";
            }
            
            row.appendChild(valueCell);
        });
        
        tbody.appendChild(row);
    });
    
    table.appendChild(tbody);
    tableContainer.appendChild(table);
    taulaDiv.appendChild(tableContainer);
}

function eliminarProducteComparador(index) {
    // Llig l'array dels productes comparats
    let currentCompareProduct = localStorage.getItem('compararProductes')
        ? JSON.parse(localStorage.getItem('compararProductes'))
        : [];

    // Eliminar el producte seleccionat
    const nouCompareProduct = currentCompareProduct.filter(item => item.product != index);
    // Guardar en localStorage
    localStorage.setItem('compararProductes', JSON.stringify(nouCompareProduct));

    // Actualitzar la variable global
    compareProduct = nouCompareProduct;

    mostrarComparador();  // Actualitza la vista del comparador
}