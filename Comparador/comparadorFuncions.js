const apiUrl = 'https://api.serverred.es';

document.addEventListener('DOMContentLoaded', async () => {
    await carregarComparador();
    await carregarCarrusel();
    carregarNomComparador();
    carregarEstatFavorit();
    setTimeout(updateScrollButtons, 300);
    setTimeout(updateCarruselButtons, 300);
});

async function carregarComparador(forceLocalStorage = false) {
    try {
        // Verificar si hi ha un comparatorApiId al localStorage
        const comparadorLocal = JSON.parse(localStorage.getItem('comparador'));
        
        // Si hi ha un ID de l'API i no forcem localStorage, intentar carregar des de l'API
        if (!forceLocalStorage && comparadorLocal?.comparatorApiId) {
            try {
                await carregarComparadorDesDeAPI(comparadorLocal.comparatorApiId);
                return; // Si té èxit, sortir
            } catch (error) {
                console.warn('No es pot carregar des de l\'API, carregant des de localStorage:', error);
                // Continuar amb la càrrega normal des de localStorage
            }
        }

        // Càrrega normal des de localStorage
        await dibuixarTaulaComparador();
        
    } catch (error) {
        console.error('Error carregant el comparador:', error);
    }
}

// Funció separada per dibuixar la taula
async function dibuixarTaulaComparador(contenidorId = 'comparadorContingut') {
    const productes = await Product.carregarProductes(apiUrl);
    const families = await Family.carregarFamilies(apiUrl);
    const attributes = await Attribute.carregarAtributs(apiUrl);
    const productAttributes = await ProductAttribute.carregarProductAtributs(apiUrl);
    const productImages = await ProductImage.carregarProductImages(apiUrl);

    const comparador = new Comparador();
    comparador.carregarLocalStorage();

    const taula = comparador.generarTaula(productAttributes, attributes, productImages);
    
    const contingut = document.getElementById(contenidorId);
    if (!contingut) {
        console.error(`No s'ha trobat el contenidor amb id: ${contenidorId}`);
        return;
    }
    
    contingut.innerHTML = '';
    
    if (taula) {
        contingut.appendChild(taula);
    } else {
        contingut.innerHTML = '<p style="text-align: center; padding: 2.5rem;">No tens productes per comparar.</p>';
    }
    
    // Actualitzar botons després que la taula estiga renderitzada (només si existeix la funció)
    if (typeof updateScrollButtons === 'function') {
        setTimeout(() => {updateScrollButtons();}, 150);
    }
}

function scrollTable(direction) {
    const container = document.getElementById('tableContainer');
    if (!container) {
        console.error('Container no trobat');
        return;
    }
    
    // Obtenir l'ample d'una cel·la dinàmicament
    const table = container.querySelector('table');
    if (!table) return;
    
    const firstCell = table.querySelector('th:nth-child(2), td:nth-child(2)');
    if (!firstCell) return;
    
    const cellWidth = firstCell.offsetWidth;
    const scrollAmount = direction * cellWidth;
    
    container.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
    });
    
    setTimeout(() => {
        updateScrollButtons();
    }, 350);
}

function updateScrollButtons() {
    const container = document.getElementById('tableContainer');
    const btnLeft = document.getElementById('scrollLeft');
    const btnRight = document.getElementById('scrollRight');
    
    if (!container || !btnLeft || !btnRight) {
        return;
    }
    
    const scrollWidth = container.scrollWidth;
    const clientWidth = container.clientWidth;
    const scrollLeft = container.scrollLeft;
    const maxScroll = scrollWidth - clientWidth;
    
    // Deshabilitar esquerra si està a l'inici
    btnLeft.disabled = scrollLeft <= 1;
    
    // Deshabilitar dreta si està al final o no hi ha scroll
    btnRight.disabled = maxScroll <= 5 || scrollLeft >= maxScroll - 5;
}

// Carregar carrusel de productes relacionats
async function carregarCarrusel() {
    try {
        const productes = await Product.carregarProductes(apiUrl);
        const productImages = await ProductImage.carregarProductImages(apiUrl);

        const comparador = new Comparador();
        comparador.carregarLocalStorage();
        
        const productesComparador = comparador.obtenirProductes();
        if (productesComparador.length === 0) {
            document.querySelector('.carrusel-wrapper').style.display = 'none';
            return;
        }
        
        // Obtenir família del primer producte
        const familyId = productesComparador[0].family_id;
        
        // Filtrar productes de la mateixa família que no estiguen al comparador
        const productesRelacionats = productes.filter(p => 
            p.family_id === familyId && 
            !productesComparador.some(pc => pc.id === p.id)
        );
        
        const carruselContingut = document.getElementById('carruselContingut');
        carruselContingut.textContent = ''; // Netejar
        
        if (productesRelacionats.length === 0) {
            document.querySelector('.carrusel-wrapper').style.display = 'none';
            return;
        }
        
        document.querySelector('.carrusel-wrapper').style.display = 'block';
        
        // Crear targetes de productes
        productesRelacionats.forEach(producte => {
            const targeta = crearTargetaProducte(producte, productImages);
            carruselContingut.appendChild(targeta);
        });
        
        setTimeout(() => {
            updateCarruselButtons();
        }, 150);
        
    } catch (error) {
        console.error('Error carregant carrusel:', error);
    }
}

// Crear targeta de producte per al carrusel
function crearTargetaProducte(producte, productImages) {
    const targeta = document.createElement('div');
    targeta.className = 'carrusel-item';
    
    // Imatge
    const imgContainer = document.createElement('div');
    imgContainer.className = 'carrusel-img-container';
    
    const productImage = productImages.find(pi => pi.product_id === producte.id);
    if (productImage && productImage.url) {
        const img = document.createElement('img');
        img.src = productImage.url;
        img.alt = producte.name;
        imgContainer.appendChild(img);
    }
    targeta.appendChild(imgContainer);
    
    // Nom
    const nom = document.createElement('div');
    nom.className = 'carrusel-nom';
    nom.textContent = producte.name;
    targeta.appendChild(nom);
    
    // Preu
    const preu = document.createElement('div');
    preu.className = 'carrusel-preu';
    preu.textContent = producte.price ? `${producte.price}€` : 'Preu no disponible';
    targeta.appendChild(preu);
    
    // Contenidor de botons
    const botonesContainer = document.createElement('div');
    botonesContainer.className = 'carrusel-botons';
    
    // Botó afegir al comparador
    const btnAfegir = document.createElement('button');
    btnAfegir.className = 'btn-afegir-carrusel';
    btnAfegir.textContent = 'Comparar';
    btnAfegir.onclick = async () => {
        try {
            // Carregar dades de localStorage
            const comparadorData = localStorage.getItem('comparador');
            let comparador = new Comparador();
            
            if (comparadorData) {
                const obj = JSON.parse(comparadorData);
                comparador.sessionId = obj.sessionId;
                comparador.pinnedProductId = obj.pinnedProductId || null;
                comparador.productes = obj.productes.map(p => ({ 
                    product: p, 
                    sessionId: obj.sessionId 
                }));
            }
            
            // Afegir el nou producte
            if (comparador.afegirProducte(producte)) {
                // Recarregar la visualització
                await carregarComparador();
                await carregarCarrusel();
                setTimeout(updateScrollButtons, 300);
                setTimeout(updateCarruselButtons, 300);
            }
        } catch (error) {
            console.error('Error afegint producte:', error);
            alert('Error afegint el producte al comparador');
        }
    };
    
    //Botó afegir al carret
    const btnAfegirCarret = document.createElement('button');
    btnAfegirCarret.className = 'btn-afegir-carrusel';
    btnAfegirCarret.innerHTML = '<i class="fa-solid fa-cart-shopping"></i>';
    btnAfegirCarret.onclick = () => {
        console.log(`Afegit al carret: ${producte.name}`);
    };

    botonesContainer.appendChild(btnAfegir);
    botonesContainer.appendChild(btnAfegirCarret);
    targeta.appendChild(botonesContainer);
    
    return targeta;
}

// Scroll del carrusel
function scrollCarrusel(direction) {
    const container = document.getElementById('carruselContingut');
    if (!container) return;
    
    const firstItem = container.querySelector('.carrusel-item');
    if (!firstItem) return;
    
    const itemWidth = firstItem.offsetWidth + 20; // width + gap
    const scrollAmount = direction * itemWidth;
    
    container.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
    });
    
    setTimeout(() => {
        updateCarruselButtons();
    }, 350);
}

// Actualitzar botons del carrusel
function updateCarruselButtons() {
    const container = document.getElementById('carruselContingut');
    const btnLeft = document.getElementById('carruselLeft');
    const btnRight = document.getElementById('carruselRight');
    
    if (!container || !btnLeft || !btnRight) return;
    
    const scrollWidth = container.scrollWidth;
    const clientWidth = container.clientWidth;
    const scrollLeft = container.scrollLeft;
    const maxScroll = scrollWidth - clientWidth;
    
    btnLeft.disabled = scrollLeft <= 1;
    btnRight.disabled = maxScroll <= 5 || scrollLeft >= maxScroll - 5;
}

// Event listener per a scroll manual
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('tableContainer');
    if (container) {
        container.addEventListener('scroll', () => {
            updateScrollButtons();
        });
    }
    
    const carrusel = document.getElementById('carruselContingut');
    if (carrusel) {
        carrusel.addEventListener('scroll', () => {
            updateCarruselButtons();
        });
    }
    
    // Guardar nom del comparador quan canvia
    const nomInput = document.getElementById('nomComparador');
    if (nomInput) {
        nomInput.addEventListener('input', () => {
            localStorage.setItem('nomComparador', nomInput.value);
        });
    }
});

// Carregar nom del comparador des de localStorage
function carregarNomComparador() {
    const nomInput = document.getElementById('nomComparador');
    if (nomInput) {
        const nomGuardat = localStorage.getItem('nomComparador');
        if (nomGuardat) {
            nomInput.value = nomGuardat;
        }
    }
}

// Carregar estat del favorit des de localStorage
function carregarEstatFavorit() {
    const btnFavorit = document.getElementById('btnFavorit');
    if (btnFavorit) {
        const esFavorit = localStorage.getItem('comparadorFavorit') === 'true';
        if (esFavorit) {
            btnFavorit.classList.add('favorit-actiu');
            btnFavorit.querySelector('i').classList.remove('fa-regular');
            btnFavorit.querySelector('i').classList.add('fa-solid');
        }
    }
}

// Guardar comparador a l'API
async function guardarComparadorAPI() {
    try {
        // Obtenir dades del localStorage
        const comparadorLocal = JSON.parse(localStorage.getItem('comparador'));
        
        if (!comparadorLocal || !comparadorLocal.productes || comparadorLocal.productes.length === 0) {
            alert('No hi ha productes per guardar al comparador');
            return;
        }

        // Obtenir sessionId i user agent
        const sessionId = comparadorLocal.sessionId || generarSessionId();
        const userAgent = navigator.userAgent;
        const clientId = null; // O obtenir de localStorage si hi ha usuari loguejat

        // 1. Crear el Comparator a l'API
        const comparatorCreat = await Comparador.crearComparatorAPI(
            apiUrl,
            sessionId,
            userAgent,
            clientId
        );

        console.log('Comparator creat amb ID:', comparatorCreat.id);

        // 2. Crear les relacions Comparator_Product per cada producte
        const promesesProductes = comparadorLocal.productes.map(async (producte) => {
            const productId = producte.id || producte.product?.id;
            if (productId) {
                await ComparatorProduct.crearComparatorProduct(
                    apiUrl,
                    comparatorCreat.id,
                    productId
                );
            }
        });

        await Promise.all(promesesProductes);

        // 3. Guardar l'ID del comparador al localStorage
        comparadorLocal.comparatorApiId = comparatorCreat.id;
        localStorage.setItem('comparador', JSON.stringify(comparadorLocal));

        alert(`Comparador guardat correctament a l'API amb ID: ${comparatorCreat.id}`);
        
        return comparatorCreat.id;

    } catch (error) {
        console.error('Error guardant el comparador:', error);
        alert('Error guardant el comparador a l\'API');
    }
}

// Carregar comparador des de l'API
async function carregarComparadorDesDeAPI(comparatorId, contenidorId = 'comparadorContingut') {
    try {
        // 1. Obtenir el Comparator
        const comparator = await Comparador.obtenirComparatorAPI(apiUrl, comparatorId);
        console.log('Comparator carregat:', comparator);

        // 2. Obtenir els productes del comparador
        const comparatorProducts = await ComparatorProduct.obtenirProductesDeComparator(
            apiUrl,
            comparatorId
        );

        // 3. Carregar els productes complets
        const productes = await Product.carregarProductes(apiUrl);
        
        // 4. Filtrar només els productes del comparador
        const productesDelComparador = productes.filter(p => 
            comparatorProducts.some(cp => cp.product_id === p.id)
        );

        // 5. Actualitzar localStorage amb els productes
        const comparadorLocal = {
            sessionId: comparator.session_id,
            comparatorApiId: comparator.id,
            productes: productesDelComparador,
            pinnedProductId: null
        };

        localStorage.setItem('comparador', JSON.stringify(comparadorLocal));

        // 6. Dibuixar la taula directament sense cridar carregarComparador (per evitar bucle)
        await dibuixarTaulaComparador(contenidorId);
        
        // 7. Carregar el carrusel només si existeix la funció
        if (typeof carregarCarrusel === 'function') {
            await carregarCarrusel();
        }

        console.log('Comparador carregat des de l\'API amb èxit');

    } catch (error) {
        console.error('Error carregant el comparador des de l\'API:', error);
        alert('Error carregant el comparador des de l\'API');
    }
}

// Generar un sessionId únic
function generarSessionId() {
    let uuid = self.crypto.randomUUID();
    return 'sess_' + uuid;
}

