const apiUrl = 'https://api.serverred.es';
let comparadorGlobal = null; // Instancia global del comparador

document.addEventListener('DOMContentLoaded', async () => {
    await carregarComparador();
    await carregarCarrusel();
    carregarNomComparador();
    await carregarComparadorsAnteriors();
    setTimeout(updateScrollButtons, 300);
    setTimeout(updateCarruselButtons, 300);
});

async function carregarComparador() {
    try {
        // Intentar obtenir l'ID del comparador actual des de sessionStorage
        const comparatorId = sessionStorage.getItem('currentComparatorId');
        
        if (comparatorId) {
            // Carregar comparador existent des de l'API
            console.log('Carregant comparador existent:', comparatorId);
            comparadorGlobal = new Comparador();
            await comparadorGlobal.carregarDesDeAPI(apiUrl, comparatorId);
        } else {
            // Crear nou comparador
            console.log('Creant nou comparador');
            comparadorGlobal = new Comparador();
        }
        
        // Dibuixar la taula
        await dibuixarTaulaComparador();
        
    } catch (error) {
        console.error('Error carregant el comparador:', error);
        // Si hi ha error, crear un nou comparador
        comparadorGlobal = new Comparador();
        await dibuixarTaulaComparador();
    }
}

// Funció per dibuixar la taula del comparador
async function dibuixarTaulaComparador(contenidorId = 'comparadorContingut') {
    if (!comparadorGlobal) {
        comparadorGlobal = new Comparador();
    }
    
    const attributes = await Attribute.carregarAtributs();
    const productAttributes = await ProductAttribute.carregarProductAtributs();
    const productImages = await ProductImage.carregarProductImages();

    const taula = comparadorGlobal.generarTaula(productAttributes, attributes, productImages);
    
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
    
    // Actualitzar botons després que la taula estiga renderitzada
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
        if (!comparadorGlobal) {
            comparadorGlobal = new Comparador();
        }
        
        const productes = await Product.carregarProductes();
        const productImages = await ProductImage.carregarProductImages();
        
        const productesComparador = comparadorGlobal.obtenirProductes();
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
            if (!comparadorGlobal) {
                comparadorGlobal = new Comparador();
            }
            
            // Afegir el nou producte (ara guarda automàticament a l'API)
            const afegit = await comparadorGlobal.afegirProducte(producte, apiUrl);
            
            if (afegit && comparadorGlobal.comparatorApiId) {
                // Guardar l'ID a sessionStorage
                sessionStorage.setItem('currentComparatorId', comparadorGlobal.comparatorApiId);
                
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
});

// Carregar nom del comparador
function carregarNomComparador() {
    const nomInput = document.getElementById('nomComparador');
    if (nomInput) {
        if (comparadorGlobal && comparadorGlobal.nom) {
            nomInput.value = comparadorGlobal.nom;
        }
        
        // Event listener per detectar canvis en el nom (es dispara quan perd el focus)
        nomInput.addEventListener('blur', async () => {
            if (!comparadorGlobal) return;
            
            const nouNom = nomInput.value.trim();
            const nomAnterior = comparadorGlobal.nom || '';
            
            // Si el nom no ha canviat, no fer res
            if (nouNom === nomAnterior) return;
            
            // Si ja existeix un comparador amb nom i aquest canvia
            if (nomAnterior && nouNom !== nomAnterior) {
                const confirmacio = confirm('Canviar el nom crearà un nou comparador amb aquest nom. El comparador anterior es mantindrà. Vols continuar?');
                if (confirmacio) {
                    // Crear un nou comparador amb el nom nou
                    const productesCopia = [...comparadorGlobal.productes];
                    comparadorGlobal = new Comparador();
                    comparadorGlobal.nom = nouNom;
                    comparadorGlobal.productes = productesCopia;
                    await comparadorGlobal.guardarAPI(apiUrl);
                    sessionStorage.setItem('currentComparatorId', comparadorGlobal.comparatorApiId);
                    console.log('Nou comparador creat amb nom:', nouNom);
                } else {
                    // Restaurar el nom anterior
                    nomInput.value = nomAnterior;
                }
            } else {
                // Actualitzar el nom i guardar a l'API
                comparadorGlobal.nom = nouNom;
                if (comparadorGlobal.comparatorApiId) {
                    await comparadorGlobal.guardarAPI(apiUrl);
                }
            }
        });
    }
}



// Guardar comparador a l'API (ara es fa automàticament)
async function guardarComparadorAPI() {
    try {
        if (!comparadorGlobal || comparadorGlobal.obtenirProductes().length === 0) {
            alert('No hi ha productes per guardar al comparador');
            return;
        }

        await comparadorGlobal.guardarAPI(apiUrl);
        
        if (comparadorGlobal.comparatorApiId) {
            sessionStorage.setItem('currentComparatorId', comparadorGlobal.comparatorApiId);
            alert(`Comparador guardat correctament amb ID: ${comparadorGlobal.comparatorApiId}`);
        }
        
        return comparadorGlobal.comparatorApiId;

    } catch (error) {
        console.error('Error guardant el comparador:', error);
        alert('Error guardant el comparador a l\'API');
    }
}



// Generar un sessionId únic
function generarSessionId() {
    let uuid = self.crypto.randomUUID();
    return 'sess_' + uuid;
}

// Carregar i mostrar els comparadors anteriors
async function carregarComparadorsAnteriors() {
    try {
        const container = document.getElementById('comparadorsAnteriorsList');
        if (!container) return;
        
        // Obtenir el client_id si l'usuari està loguejat
        const currentUser = localStorage.getItem('currentUser');
        let comparadors = [];
        
        if (currentUser) {
            const userId = JSON.parse(currentUser).id;
            
            // Carregar tots els comparadors de l'API
            const totsComparadors = await Comparador.carregarComparatorsAPI(apiUrl);
            
            // Filtrar només els del usuari actual
            comparadors = totsComparadors.filter(c => c.client_id === userId);
        } else {
            // Si no hi ha usuari, mostrar els de la sessió actual
            const sessionId = sessionStorage.getItem('currentSessionId') || generarSessionId();
            sessionStorage.setItem('currentSessionId', sessionId);
            
            const totsComparadors = await Comparador.carregarComparatorsAPI(apiUrl);
            comparadors = totsComparadors.filter(c => c.session_id === sessionId);
        }
        
        // Netejar el container
        container.innerHTML = '';
        
        if (comparadors.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #666;">No tens comparadors guardats.</p>';
            return;
        }
        
        // Ordenar per ID descendent (més recents primer)
        comparadors.sort((a, b) => b.id - a.id);
        
        // Crear una llista amb els comparadors
        const ul = document.createElement('ul');
        ul.className = 'comparadors-anteriors-list';
        
        for (const comp of comparadors) {
            const li = document.createElement('li');
            li.className = 'comparador-item';
            
            // Obtenir el número de productes d'aquest comparador
            let numProductes = 0;
            try {
                const productes = await ComparatorProduct.obtenirProductesDeComparator(apiUrl, comp.id);
                numProductes = productes.length;
            } catch (error) {
                console.error('Error obtenint productes del comparador:', error);
            }
            
            // Nom del comparador
            const nomSpan = document.createElement('span');
            nomSpan.className = 'comparador-nom';
            nomSpan.textContent = comp.name || `Comparador ${comp.id}`;
            
            // Info adicional
            const infoSpan = document.createElement('span');
            infoSpan.className = 'comparador-info';
            infoSpan.textContent = ` (${numProductes} productes)`;
            
            // Botó per carregar
            const btnCarregar = document.createElement('button');
            btnCarregar.className = 'btn-carregar-comparador';
            btnCarregar.innerHTML = '<i class="fa-solid fa-eye"></i> Veure';
            btnCarregar.onclick = async () => {
                sessionStorage.setItem('currentComparatorId', comp.id);
                await carregarComparador();
                await carregarCarrusel();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            };
            
            // Botó per eliminar
            const btnEliminar = document.createElement('button');
            btnEliminar.className = 'btn-eliminar-comparador';
            btnEliminar.innerHTML = '<i class="fa-solid fa-trash"></i>';
            btnEliminar.title = 'Eliminar comparador';
            btnEliminar.onclick = async () => {
                if (confirm(`Segur que vols eliminar "${comp.name || 'aquest comparador'}"?`)) {
                    try {
                        await Comparador.eliminarComparatorAPI(apiUrl, comp.id);
                        await carregarComparadorsAnteriors();
                        
                        // Si era el comparador actual, crear un de nou
                        if (sessionStorage.getItem('currentComparatorId') == comp.id) {
                            sessionStorage.removeItem('currentComparatorId');
                            comparadorGlobal = new Comparador();
                            await carregarComparador();
                        }
                    } catch (error) {
                        console.error('Error eliminant comparador:', error);
                        alert('Error eliminant el comparador');
                    }
                }
            };
            
            li.appendChild(nomSpan);
            li.appendChild(infoSpan);
            li.appendChild(btnCarregar);
            li.appendChild(btnEliminar);
            ul.appendChild(li);
        }
        
        container.appendChild(ul);
        
    } catch (error) {
        console.error('Error carregant comparadors anteriors:', error);
        const container = document.getElementById('comparadorsAnteriorsList');
        if (container) {
            container.innerHTML = '<p style="text-align: center; color: #d32f2f;">Error carregant comparadors.</p>';
        }
    }
}

