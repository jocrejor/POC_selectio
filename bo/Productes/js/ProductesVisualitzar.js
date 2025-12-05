document.addEventListener("DOMContentLoaded", main);

async function main() {
    thereIsUser("../login.html");
    botonsTancarSessio("../login.html");

    const id = obtenerIdDeUrl();
    if (!id) {
        alert("ID de producte no especificat.");
        window.location.href = "index.html";
        return;
    }

    await cargarDetallesProducto(id);

    const btnVolver = document.getElementById("btnVolver");
    btnVolver.addEventListener("click", () => {
        window.location.href = "index.html";
    });
}

function obtenerIdDeUrl() {
    const params = new URLSearchParams(window.location.search);
    return parseInt(params.get("id"));
}

async function cargarDetallesProducto(id) {
    try {
        const [producto, familias, imagenes, atributos] = await Promise.all([
            getIdData(url, "Product", id),
            getData(url, "Family"),
            getData(url, "Productimage"),
            getData(url, "Productattribute")
        ]);

        if (!producto) {
            alert("Producte no trobat.");
            window.location.href = "index.html";
            return;
        }

        const familia = familias.find(f => f.id === producto.family_id);
        const nombreFamilia = familia ? familia.name : "Sense família";
        const imagenesProducto = imagenes.filter(img => img.product_id === id);
        imagenesProducto.sort((a, b) => a.order - b.order);
        const atributosProducto = atributos.filter(attr => attr.product_id === id);

        const contenedor = document.getElementById("detallesProducto");
        contenedor.innerHTML = '';

        // Título
        const h2 = document.createElement("h2");
        h2.textContent = producto.name;
        contenedor.appendChild(h2);

        // Información básica en grid
        const divInfo = document.createElement("div");
        divInfo.classList.add("info-basica");
        
        const infoItems = [
            { etiqueta: "ID", valor: producto.id },
            { etiqueta: "Preu", valor: `${producto.price.toFixed(2)} €` },
            { etiqueta: "Família", valor: nombreFamilia },
            { etiqueta: "Estat", valor: producto.active ? '<span class="estado-activo">Actiu</span>' : '<span class="estado-inactivo">Inactiu</span>' }
        ];
        
        infoItems.forEach(item => {
            const divItem = document.createElement("div");
            divItem.classList.add("info-item");
            
            const strong = document.createElement("strong");
            strong.textContent = `${item.etiqueta}:`;
            
            const p = document.createElement("p");
            p.innerHTML = item.valor;
            
            divItem.appendChild(strong);
            divItem.appendChild(p);
            divInfo.appendChild(divItem);
        });
        
        contenedor.appendChild(divInfo);

        // Descripción
        if (producto.description) {
            const divDesc = document.createElement("div");
            divDesc.classList.add("info-item");
            
            const strongDesc = document.createElement("strong");
            strongDesc.textContent = "Descripció:";
            
            const pDesc = document.createElement("p");
            pDesc.textContent = producto.description;
            pDesc.style.whiteSpace = "pre-line";
            
            divDesc.appendChild(strongDesc);
            divDesc.appendChild(pDesc);
            contenedor.appendChild(divDesc);
        }

        // Imágenes
        if (imagenesProducto.length > 0) {
            const h3Imagenes = document.createElement("h3");
            const iconoImagen = document.createElement("i");
            h3Imagenes.appendChild(iconoImagen);
            h3Imagenes.appendChild(document.createTextNode("Imatges del Producte"));
            contenedor.appendChild(h3Imagenes);

            const divImagenes = document.createElement("div");
            divImagenes.classList.add("row");

            imagenesProducto.forEach(img => {
                const divImg = document.createElement("div");
                divImg.classList.add("col-4");

                const imagen = document.createElement("img");
                imagen.src = img.url;
                imagen.alt = img.name || `Imatge del producte ${producto.name}`;
                imagen.classList.add("imagen-producto");
                imagen.onerror = function() {
                    this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZThlOGU4Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYXRnZSBubyBkaXNwb25pYmxlPC90ZXh0Pjwvc3ZnPg==';
                };

                const pImg = document.createElement("p");
                pImg.textContent = `${img.name || 'Sense nom'} (Ordre: ${img.order})`;

                divImg.appendChild(imagen);
                divImg.appendChild(pImg);
                divImagenes.appendChild(divImg);
            });

            contenedor.appendChild(divImagenes);
        } else {
            const pNoImagenes = document.createElement("p");
            const em = document.createElement("em");
            em.textContent = "No hi ha imatges per a este producte";
            pNoImagenes.appendChild(em);
            contenedor.appendChild(pNoImagenes);
        }

        // Atributos
        if (atributosProducto.length > 0) {
            const divAtributos = document.createElement("div");
            divAtributos.classList.add("atributos");

            const h3Atributos = document.createElement("h3");
            const iconoAtributo = document.createElement("i");
            h3Atributos.appendChild(iconoAtributo);
            h3Atributos.appendChild(document.createTextNode("Atributs"));
            divAtributos.appendChild(h3Atributos);

            let definicionesAtributos = [];
            try {
                definicionesAtributos = await getData(url, "Attribute") || [];
            } catch (error) {
                console.log("No s'han trobat definicions d'atributs en el API");
            }

            atributosProducto.forEach(attr => {
                let atributoInfo = null;
                
                if (definicionesAtributos.length > 0) {
                    atributoInfo = definicionesAtributos.find(def => def.id === attr.attribute_id);
                }

                const divAtributo = document.createElement("div");
                divAtributo.classList.add("atributo");

                const strong = document.createElement("strong");
                strong.textContent = `${atributoInfo ? atributoInfo.name : 'Atribut'}: `;

                const textoValor = document.createTextNode(attr.value);

                divAtributo.appendChild(strong);
                divAtributo.appendChild(textoValor);
                divAtributos.appendChild(divAtributo);
            });

            contenedor.appendChild(divAtributos);
        }

    } catch (error) {
        console.error("Error carregant detalls del producte:", error);
        alert("Error al carregar els detalls del producte.");
        
        const contenedor = document.getElementById("detallesProducto");
        contenedor.innerHTML = '<p class="error" style="color: #c62828; text-align: center; padding: 40px; background-color: #ffebee; border-radius: 8px;">Error al caregar els detalls del producte.</p>';
    }
}