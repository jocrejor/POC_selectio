class Comparador {

    constructor() {
        // Array d'objectes { product: Product, sessionId: string }
        this.productes = [];
        this.sessionId = crypto.randomUUID();
        this.pinnedProductId = null; // Nou: ID del producte ancorat
        this.comparatorApiId = null; // ID del comparador a l'API
        this.nom = ''; // Nom del comparador
    }

    async afegirProducte(producte, apiUrl) {
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
        if (this.productes.length > 0) {
           const primeraFamiliaId = this.productes[0].product.family_id;
            if (producte.family_id !== primeraFamiliaId) {
                alert("El producte no és de la mateixa família que els que ja estàs comparant.");
                return false;
            }
        }

        // Afegir el producte
        this.productes.push({ product: producte, sessionId: this.sessionId });
        
        // Guardar a l'API
        await this.guardarAPI(apiUrl);
        
        console.log('Producte afegit:', producte.name, '- Total productes:', this.productes.length);
        return true;
    }

    async eliminarProducte(producteId, apiUrl) {
        this.productes = this.productes.filter(p => p.product.id !== producteId);
        // Si eliminem el producte ancorat, netegem el pin
        if (this.pinnedProductId === producteId) {
            this.pinnedProductId = null;
        }
        
        // Eliminar de l'API si existeix el comparador
        if (this.comparatorApiId && apiUrl) {
            try {
                await ComparatorProduct.eliminarComparatorProduct(apiUrl, this.comparatorApiId, producteId);
            } catch (error) {
                console.error('Error eliminant producte de l\'API:', error);
            }
        }
    }

    pinProducte(producteId) {
        // Canviar el producte ancorat
        this.pinnedProductId = producteId;
    }

    // Guardar o actualitzar el comparador a l'API
    async guardarAPI(apiUrl) {
        try {
            // Obtenir client_id si l'usuari està loguejat
            const currentUser = localStorage.getItem('currentUser');
            const clientId = currentUser ? JSON.parse(currentUser).id : null;
            const userAgent = navigator.userAgent;

            // Si ja existeix el comparador, actualitzar-lo
            if (this.comparatorApiId) {
                console.log('Actualitzant comparador existent:', this.comparatorApiId);
                
                // Actualitzar el comparador a l'API (inclou el nom)
                await Comparador.actualitzarComparatorAPI(
                    apiUrl,
                    this.comparatorApiId,
                    this.sessionId,
                    userAgent,
                    clientId,
                    this.nom || null
                );
                
                // Obtenir els productes actuals del comparador
                const productesActuals = await ComparatorProduct.obtenirProductesDeComparator(
                    apiUrl,
                    this.comparatorApiId
                );
                
                // Afegir els nous productes que no existeixin
                const productesNous = this.obtenirProductes();
                for (const producte of productesNous) {
                    const existeix = productesActuals.some(cp => cp.product_id === producte.id);
                    if (!existeix) {
                        await ComparatorProduct.crearComparatorProduct(
                            apiUrl,
                            this.comparatorApiId,
                            producte.id
                        );
                    }
                }
            } else {
                // Crear nou comparador
                console.log('Creant nou comparador');
                const comparatorCreat = await Comparador.crearComparatorAPI(
                    apiUrl,
                    this.sessionId,
                    userAgent,
                    clientId,
                    this.nom || null
                );
                
                this.comparatorApiId = comparatorCreat.id;
                
                // Afegir tots els productes
                const productesAfegir = this.obtenirProductes();
                for (const producte of productesAfegir) {
                    await ComparatorProduct.crearComparatorProduct(
                        apiUrl,
                        this.comparatorApiId,
                        producte.id
                    );
                }
            }
            
            console.log('Comparador guardat a l\'API amb ID:', this.comparatorApiId);
            return this.comparatorApiId;
            
        } catch (error) {
            console.error('Error guardant el comparador a l\'API:', error);
            throw error;
        }
    }

    // Carregar comparador des de l'API
    async carregarDesDeAPI(apiUrl, comparatorId) {
        try {
            // Obtenir el comparador
            const comparator = await Comparador.obtenirComparatorAPI(apiUrl, comparatorId);
            this.sessionId = comparator.session_id;
            this.comparatorApiId = comparator.id;
            
            // Carregar el nom des de l'API
            this.nom = comparator.name || '';
            
            // Obtenir els productes
            const comparatorProducts = await ComparatorProduct.obtenirProductesDeComparator(
                apiUrl,
                comparatorId
            );
            
            // Carregar els productes complets
            const totsElsProductes = await Product.carregarProductes(apiUrl);
            const productesDelComparador = totsElsProductes.filter(p => 
                comparatorProducts.some(cp => cp.product_id === p.id)
            );
            
            this.productes = productesDelComparador.map(p => ({
                product: p,
                sessionId: this.sessionId
            }));
            
            console.log('Comparador carregat des de l\'API:', this.productes.length, 'productes');
            return true;
        } catch (error) {
            console.error('Error carregant comparador des de l\'API:', error);
            throw error;
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
                const apiUrl = 'https://api.serverred.es';
                await this.eliminarProducte(p.id, apiUrl);
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
        let data = await getData(apiUrl, 'Comparator');

        // Normalitzar si ve com array d'arrays
        if (Array.isArray(data) && data.length > 0 && Array.isArray(data[0])) {
            data = data[0];
        }

        return data;
    }

    // Crear un nou comparador a l'API
    static async crearComparatorAPI(apiUrl, session_id, user_agent, client_id = null, name = null) {
        const data = {
            session_id: session_id,
            user_agent: user_agent,
            client_id: client_id,
            name: name
        };

        const result = await postData(apiUrl, 'Comparator', data);
        
        if (!result) {
            throw new Error('Error creant el comparador');
        }

        return result;
    }

    // Obtenir un comparador per ID
    static async obtenirComparatorAPI(apiUrl, id) {
        const result = await getIdData(apiUrl, 'Comparator', id);
        
        if (!result) {
            throw new Error('Comparador no trobat');
        }

        return result;
    }

    // Actualitzar un comparador
    static async actualitzarComparatorAPI(apiUrl, id, session_id, user_agent, client_id = null, name = null) {
        const data = {
            session_id: session_id,
            user_agent: user_agent,
            client_id: client_id,
            name: name
        };

        const result = await updateId(apiUrl, 'Comparator', id, data);

        if (!result) {
            throw new Error('Error actualitzant el comparador');
        }

        return result;
    }

    // Eliminar un comparador
    static async eliminarComparatorAPI(apiUrl, id) {
        await deleteData(apiUrl, 'Comparator', id);
        return true;
    }
}
