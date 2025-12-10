
let productos = [];
let families  = [];

document.addEventListener("DOMContentLoaded", () => { main().catch(err => console.error(err)); });

async function main(){
    const productListTable = document.getElementById('productListTable');


    while (productListTable && productListTable.firstChild) {
        productListTable.removeChild(productListTable.firstChild);
    }

    // Fetch from API (prefer helper getData)
    let prodRes = null;
    let famRes = null;
    if (typeof getData === 'function' && typeof url !== 'undefined') {
        prodRes = await getData(url, 'Product');
        famRes = await getData(url, 'Family');
    } else {
        // fallback to direct fetch
        try {
            const [pResp, fResp] = await Promise.all([
                fetch('http://localhost:5000/Product'),
                fetch('http://localhost:5000/Family')
            ]);
            if (pResp.ok) prodRes = await pResp.json();
            if (fResp.ok) famRes = await fResp.json();
        } catch (e) {
            console.error('Fallback fetch error', e);
        }
    }

    // Use API results when available, otherwise fall back to localStorage or global arrays
    productos = Array.isArray(prodRes) ? prodRes : (localStorage.getItem('productes') ? JSON.parse(localStorage.getItem('productes')) : (typeof Product !== 'undefined' ? Product : []));
    families  = Array.isArray(famRes)  ? famRes  : (localStorage.getItem('families') ? JSON.parse(localStorage.getItem('families')) : (typeof Family !== 'undefined' ? Family : []));

    // Persist to localStorage as a cache
    try { localStorage.setItem('productes', JSON.stringify(productos)); } catch(e){}
    try { localStorage.setItem('families', JSON.stringify(families)); } catch(e){}

    productos.forEach( (product, index) => {
        const tr = document.createElement('tr');

        const tdBtn = document.createElement('td');
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.textContent = 'Comp';
        // pass product id to comparator instead of index to be robust
        btn.addEventListener('click', () => obrirComparador(product.id));
        tdBtn.appendChild(btn);
        tr.appendChild(tdBtn);

        const tdIndex = document.createElement('td');
        tdIndex.textContent = index + 1;
        tr.appendChild(tdIndex);

        const tdName = document.createElement('td');
        tdName.textContent = product.name || '';
        tr.appendChild(tdName);
        

        const tdPrice = document.createElement('td');
        tdPrice.textContent = (product.price != null) ? product.price + '€' : '';
        tr.appendChild(tdPrice);


        const tdDesc = document.createElement('td');
        tdDesc.textContent = product.description || product.descripton || '';
        tr.appendChild(tdDesc);
        
        const tdFam = document.createElement('td');
        tdFam.textContent = voreFamilia(product.family_id) || product.family_id || '';
        tr.appendChild(tdFam);

        productListTable.appendChild(tr);
    });
}

function obrirComparador(index){
   window.location.href = "comparador.html?index="+index;
}

function voreFamilia(id){

    for (const family of families) {
            if (family.id == id) {
                return family.name;
            }
        }
        return null;
    }

            function obrirModal() {
            const modal = document.getElementById('comparadorModal');
            const iframe = document.getElementById('comparadorFrame');
            iframe.src = 'comparador.html';
            modal.style.display = 'block';
        }
        
        function tancarModal() {
            const modal = document.getElementById('comparadorModal');
            const iframe = document.getElementById('comparadorFrame');
            modal.style.display = 'none';
            iframe.src = ''; // Limpiar el iframe al cerrar
        }
        
        // Tancar modal si es clica fora
        window.onclick = function(event) {
            const modal = document.getElementById('comparadorModal');
            if (event.target == modal) {
                tancarModal();
            }
        }
