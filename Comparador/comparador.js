// Variables globals
let productes = [];
let families = [];
let atributs = [];
let productAtributs = [];
let productImages = [];

const comparador = new Comparador();
comparador.carregarLocalStorage();

// ---------- CARREGAR DADES ----------
document.addEventListener("DOMContentLoaded", async () => {
    const taula = document.getElementById('productListTable');
    if (!taula) return; // Si no està la taula, no fem res
    
    taula.innerHTML = '<tr><td colspan="5">Carregant productes...</td></tr>';

    // Carregar totes les dades des de l'API
    try {

        const apiUrl = Product.apiUrl;
        productes = await Product.carregarProductes(apiUrl);
        families = await Family.carregarFamilies(apiUrl);
        atributs = await Attribute.carregarAtributs(apiUrl);
        productAtributs = await ProductAttribute.carregarProductAtributs(apiUrl);
        productImages = await ProductImage.carregarProductImages(apiUrl);
        
    } catch (error) {
        console.error('Error carregant dades:', error);
        taula.innerHTML = '<tr><td colspan="5">Error carregant dades de l\'API</td></tr>';
        return;
    } 

    // Comprovar si hi ha productes
    if (!productes || productes.length === 0) {
        taula.innerHTML = '<tr><td colspan="5">No hi ha productes disponibles</td></tr>';
        return;
    }

    console.log('Primer producte:', productes[0]);

    // Netejar la taula
    taula.innerHTML = "";

    // Crear fila per a cada producte
    productes.forEach((producte, index) => {
        console.log(`Producte ${index}:`, producte);
        
        const fila = document.createElement('tr');

        // Botó per afegir al comparador
        const tdAccio = document.createElement('td');
        const btnComparar = document.createElement('button');
        btnComparar.textContent = "Comparar";
        btnComparar.onclick = () => {
            const afegit = comparador.afegirProducte(producte);
            if (afegit) {
                window.location.href = 'comparador.html';
            }
        };
        tdAccio.appendChild(btnComparar);
        fila.appendChild(tdAccio);

        // Index
        const tdIndex = document.createElement('td');
        tdIndex.textContent = index + 1;
        fila.appendChild(tdIndex);

        // Nom
        const tdNom = document.createElement('td');
        tdNom.textContent = producte.name || '-';
        console.log(`  name: "${producte.name}"`);
        fila.appendChild(tdNom);

        // Descripció
        const tdDesc = document.createElement('td');
        tdDesc.textContent = producte.description || '-';
        console.log(`  description: "${producte.description}"`);
        fila.appendChild(tdDesc);

        // Preu
        const tdPreu = document.createElement('td');
        tdPreu.textContent = producte.price != null ? `${producte.price}€` : "-";
        console.log(`  price: "${producte.price}"`);
        fila.appendChild(tdPreu);

        taula.appendChild(fila);
        console.log('Fila afegida a la taula');
    });
    
    console.log('Total files afegides:', taula.children.length);
});

// ---------- FUNCIONS DEL MODAL ----------
function obrirModal() {
    const modal = document.getElementById('comparadorModal');
    const contingut = document.getElementById('comparadorContingut');
    contingut.innerHTML = ""; 

    // Generar taula amb productes, atributs i imatges
    const taula = comparador.generarTaula(productAtributs, atributs, productImages);
    if (taula) contingut.appendChild(taula);

    modal.style.display = 'block';
}

function tancarModal() {
    const modal = document.getElementById('comparadorModal');
    modal.style.display = 'none';
}

// Tancar modal si es clica fora
window.onclick = function(event) {
    const modal = document.getElementById('comparadorModal');
    if (event.target == modal) tancarModal();
}
