class Comparador {

    constructor() {
        // Array d'objectes { product: Product, sessionId: string }
        this.productes = [];
        this.sessionId = crypto.randomUUID();
        this.pinnedProductId = null; // Nou: ID del producte ancorat
    }

    afegirProducte(producte) {
        // Validar que el producte té les propietats necessàries
        if (!producte || !producte.id) {
            console.error('Producte invàlid:', producte);
            alert("Error: El producte no és vàlid.");
            return false;
        }

        // Comprovar si el producte ja està al comparador
        if (this.productes.some(p => p.product.id === producte.id)) {
            alert("El producte ja està al comparador.");
            return false;
        }

        // Comprovar compatibilitat per família
        //if (this.productes.length > 0) {
        //    const primeraFamiliaId = this.productes[0].product.family_id;
        //    if (producte.family_id !== primeraFamiliaId) {
        //        alert("El producte no és de la mateixa família que els que ja estàs comparant.");
        //        return false;
        //    }
        //}

        // Afegir el producte
        this.productes.push({ product: producte, sessionId: this.sessionId });
        this.guardarLocalStorage();
        
        console.log('Producte afegit:', producte.name, '- Total productes:', this.productes.length);
        return true;
    }

    eliminarProducte(producteId) {
        this.productes = this.productes.filter(p => p.product.id !== producteId);
        // Si eliminem el producte ancorat, netegem el pin
        if (this.pinnedProductId === producteId) {
            this.pinnedProductId = null;
        }
        this.guardarLocalStorage();
    }

    pinProducte(producteId) {
        // Canviar el producte ancorat
        this.pinnedProductId = producteId;
        this.guardarLocalStorage();
    }

    guardarLocalStorage() {
        const dataToSave = {
            sessionId: this.sessionId,
            productes: this.productes.map(p => p.product),
            pinnedProductId: this.pinnedProductId
        };
        
        localStorage.setItem('comparador', JSON.stringify(dataToSave));
        console.log('Guardat a localStorage:', dataToSave.productes.length, 'productes');
    }

    carregarLocalStorage() {
        const data = localStorage.getItem('comparador');
        if (!data) return;
        
        try {
            const obj = JSON.parse(data);
            this.sessionId = obj.sessionId || crypto.randomUUID();
            this.pinnedProductId = obj.pinnedProductId || null;
            
            // Reconstruir els productes assegurant que són objectes vàlids
            if (obj.productes && Array.isArray(obj.productes)) {
                this.productes = obj.productes.map(product => {
                    // Si el producte ja és un objecte Product amb totes les propietats
                    if (product && typeof product === 'object') {
                        return { 
                            product: product, 
                            sessionId: this.sessionId 
                        };
                    }
                    return null;
                }).filter(p => p !== null); // Filtrar nulls
            }
            
            console.log('Comparador carregat des de localStorage:', this.productes.length, 'productes');
        } catch (error) {
            console.error('Error carregant comparador des de localStorage:', error);
            // Si hi ha error, inicialitzar buit
            this.productes = [];
            this.sessionId = crypto.randomUUID();
            this.pinnedProductId = null;
        }
    }

    obtenirProductes() {
        const productes = this.productes.map(p => p.product);
        
        // Si hi ha un producte ancorat, posar-lo primer
        if (this.pinnedProductId) {
            const pinnedIndex = productes.findIndex(p => p.id === this.pinnedProductId);
            if (pinnedIndex > 0) {
                const pinnedProduct = productes.splice(pinnedIndex, 1)[0];
                productes.unshift(pinnedProduct);
            }
        }
        
        return productes;
    }

     // ---------- GENERAR TAULA DE COMPARACIÓ ----------
    generarTaula(productAttributes, attributes, productImages = []) {
        const productesComparar = this.obtenirProductes();
        if (productesComparar.length === 0) {
            alert("No tens productes per a comparar.");
            return null;
        }

        const taula = document.createElement('table');
        taula.style.borderCollapse = "collapse";
        taula.style.width = "100%";

        // --- Capçalera amb imatge i nom ---
        const thead = document.createElement('thead');
        const filaCapcalera = document.createElement('tr');

        const thAtributs = document.createElement('th');
        thAtributs.textContent = "";
        thAtributs.className = "attribute-label sticky-col-1";
        filaCapcalera.appendChild(thAtributs);

        productesComparar.forEach((p, index) => {
            const th = document.createElement('th');
            
            // Afegir classe sticky a la primera columna de producte
            if (index === 0) {
                th.classList.add('sticky-col-2');
            }

            // Contenidor principal amb classe
            const container = document.createElement('div');
            container.className = "product-header";

            // X per a tancar/eliminar producte
            const closeBtn = document.createElement('span');
            closeBtn.innerHTML = "<i class=\"fa-solid fa-xmark\"></i>";
            closeBtn.className = "product-close";
            closeBtn.onclick = async () => {
                this.eliminarProducte(p.id);
                await carregarComparador();
                await carregarCarrusel();
            };
            container.appendChild(closeBtn);

            // chincheta (pin)
            const chincheta = document.createElement('i');
            chincheta.className = "fa-solid fa-thumbtack product-pin";
            
            // Si aquest producte està ancorat, afegir classe activa
            if (this.pinnedProductId === p.id) {
                chincheta.classList.add('pinned');
            }
            
            chincheta.onclick = async () => {
                this.pinProducte(p.id);
                await carregarComparador();
                await carregarCarrusel();
            };
            container.appendChild(chincheta);



            // Contenidor de la imatge
            const imageContainer = document.createElement('div');
            imageContainer.className = "product-image-container";
            
            const productImage = productImages.find(pi => pi.product_id === p.id);
            
            if (productImage && productImage.url) {
                const img = document.createElement('img');
                img.src = productImage.url;
                img.alt = p.name;
                imageContainer.appendChild(img);
            }
            container.appendChild(imageContainer);

            // Nom del producte
            const nomProducte = document.createElement('div');
            nomProducte.textContent = p.name;
            nomProducte.className = "product-name";
            container.appendChild(nomProducte);

            // Botón Comprar
            const btnComprar = document.createElement('button');
            btnComprar.textContent = "Afegir al carret";
            btnComprar.className = "btn-comprar";
            btnComprar.onclick = () => {

            };
            container.appendChild(btnComprar);

            th.appendChild(container);
            filaCapcalera.appendChild(th);
        });

        thead.appendChild(filaCapcalera);
        taula.appendChild(thead);

        // --- Cos ---
        const tbody = document.createElement('tbody');

        // Fila de preus
        const filaPreu = document.createElement('tr');
        filaPreu.className = "price-row";
        
        const tdPreu = document.createElement('td');
        tdPreu.textContent = "Preu";
        tdPreu.className = "attribute-label sticky-col-1";
        filaPreu.appendChild(tdPreu);

        productesComparar.forEach((p, index) => {
            const td = document.createElement('td');
            td.textContent = p.price != null ? `${p.price}€` : "-";
            
            // Afegir classe sticky a la primera columna de producte
            if (index === 0) {
                td.classList.add('sticky-col-2');
            }
            
            filaPreu.appendChild(td);
        });

        tbody.appendChild(filaPreu);

        // --- Fila d'atributs ---
        const totsAtributs = new Set();
        productesComparar.forEach(p => {
            const attrs = productAttributes.filter(pa => pa.product_id === p.id);
            attrs.forEach(pa => {
                const attrInfo = attributes.find(a => a.id === pa.attribute_id);
                if (attrInfo) {
                    totsAtributs.add(JSON.stringify({ id: attrInfo.id, name: attrInfo.name }));
                }
            });
        });

        Array.from(totsAtributs).forEach(attrStr => {
            const attr = JSON.parse(attrStr);
            const fila = document.createElement('tr');

            const tdAttr = document.createElement('td');
            tdAttr.textContent = attr.name;
            tdAttr.className = "attribute-label sticky-col-1";
            fila.appendChild(tdAttr);

            productesComparar.forEach((p, index) => {
                const tdValue = document.createElement('td');
                const pa = productAttributes.find(pa => pa.product_id === p.id && pa.attribute_id === attr.id);
                tdValue.textContent = pa ? pa.value : "-";
                
                // Afegir classe sticky a la primera columna de producte
                if (index === 0) {
                    tdValue.classList.add('sticky-col-2');
                }
                
                fila.appendChild(tdValue);
            });

            tbody.appendChild(fila);
        });

        taula.appendChild(tbody);
        return taula;
    }

    // ---------- MÈTODES ESTÀTICS PER A L'API ----------
    
    // Carregar tots els comparadors de l'API
    static async carregarComparatorsAPI(apiUrl) {
        const resp = await fetch(`${apiUrl}/Comparator`);
        let data = await resp.json();

        // Normalitzar si ve com array d'arrays
        if (Array.isArray(data) && data.length > 0 && Array.isArray(data[0])) {
            data = data[0];
        }

        return data;
    }

    // Crear un nou comparador a l'API
    static async crearComparatorAPI(apiUrl, session_id, user_agent, client_id = null) {
        const data = {
            session_id: session_id,
            user_agent: user_agent,
            client_id: client_id
        };

        const resp = await fetch(`${apiUrl}/Comparator`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!resp.ok) {
            throw new Error('Error creant el comparador');
        }

        return await resp.json();
    }

    // Obtenir un comparador per ID
    static async obtenirComparatorAPI(apiUrl, id) {
        const resp = await fetch(`${apiUrl}/Comparator/${id}`);
        
        if (!resp.ok) {
            throw new Error('Comparador no trobat');
        }

        return await resp.json();
    }

    // Eliminar un comparador
    static async eliminarComparatorAPI(apiUrl, id) {
        const resp = await fetch(`${apiUrl}/Comparator/${id}`, {
            method: 'DELETE'
        });

        if (!resp.ok) {
            throw new Error('Error eliminant el comparador');
        }

        return true;
    }
}
