
document.addEventListener("DOMContentLoaded", main);

async function main() {
    //========== OBTENIR DADES DE LA API ==========
    const dadesFamilies = (await getData(url, "Family")).flat();

    //========== CONTENIDOR PRINCIPAL ==========
    const contenidorFamilies = document.getElementById("Families");

    // Miga de pa
    const miguesPa = document.getElementById("llistaMigues");

    //========== VARIABLE PER CONTROLAR LA FAMILIA ACTUAL ==========
    let familiaActualId = null;

    //========== FUNCIO PER MOSTRAR FAMILIES ==========
    function mostrarFamilies(parentId = null) {
        contenidorFamilies.replaceChildren();

        const familiesAMostrar = dadesFamilies.filter(f => f.parent_id === parentId);

        // Actualitzar migues de pa sempre
        actualitzarMiguesPa(parentId);

        // Si no hi ha subfamílies
        if (familiesAMostrar.length === 0) {
            const missatge = document.createElement("p");
            missatge.classList.add("missatge-buit");
            missatge.appendChild(document.createTextNode("No hi ha subfamílies disponibles"));
            contenidorFamilies.appendChild(missatge);
            return;
        }

        // Contenidor de targetes
        const contenidorTargetes = document.createElement("div");
        contenidorTargetes.classList.add("grid-families");

        familiesAMostrar.forEach(familia => {
            const targeta = crearTargetaFamilia(familia);
            contenidorTargetes.appendChild(targeta);
        });

        contenidorFamilies.appendChild(contenidorTargetes);
    }

    //========== FUNCIO PER CREAR TARGETA DE FAMILIA ==========
    function crearTargetaFamilia(familia) {
        const targeta = document.createElement("div");
        targeta.classList.add("targeta-familia");
        targeta.dataset.id = familia.id;

        // URL imatge
        const urlImatge = familia.image
            ? `./backoffice/Productes/img/${familia.image}`
            : "./img/Productes/defaultImage.jpg";

        const contenidorImatge = document.createElement("div");
        contenidorImatge.classList.add("contenidor-imatge-familia");

        const imatge = document.createElement("img");
        imatge.src = urlImatge;
        imatge.alt = familia.name;
        imatge.classList.add("imatge-familia");

        imatge.onerror = () => imatge.src = "./img/Productes/defaultImage.jpg";

        contenidorImatge.appendChild(imatge);
        targeta.appendChild(contenidorImatge);

        const contenidorNom = document.createElement("div");
        contenidorNom.classList.add("contenidor-nom-familia");

        const nom = document.createElement("h3");
        nom.classList.add("nom-familia");
        nom.appendChild(document.createTextNode(familia.name));

        contenidorNom.appendChild(nom);
        targeta.appendChild(contenidorNom);

        const teSubfamilies = dadesFamilies.some(f => f.parent_id === familia.id);

        targeta.addEventListener("click", () => {
            if (teSubfamilies) {
                familiaActualId = familia.id;
                mostrarFamilies(familia.id);
            } else {
                window.location.href = `Product.html?familia=${familia.id}`;
            }
        });

        return targeta;
    }

    //========== FUNCIO PER ACTUALITZAR MIGUES DE PA ==========
    function actualitzarMiguesPa(familiaId) {
        miguesPa.replaceChildren();

        // --- INICI ---
        const liInici = document.createElement("li");
        const linkInici = document.createElement("a");
        linkInici.appendChild(document.createTextNode("Inici"));
        linkInici.href = "#";

        linkInici.addEventListener("click", (e) => {
            e.preventDefault();
            familiaActualId = null;
            mostrarFamilies(null);
        });

        liInici.appendChild(linkInici);
        miguesPa.appendChild(liInici);

        // --- FAMÍLIES SELECCIONADES ---
        if (familiaId !== null) {
            let ruta = [];
            let actual = dadesFamilies.find(f => f.id === familiaId);

            while (actual) {
                ruta.unshift(actual);
                actual = dadesFamilies.find(f => f.id === actual.parent_id);
            }

            ruta.forEach((f, index) => {
                //Separador
                const liSep = document.createElement("li");
                const icon = document.createElement("i");
                icon.className = "fa-solid fa-chevron-right";
                liSep.appendChild(icon);
                miguesPa.appendChild(liSep);


                // Familia
                const liFam = document.createElement("li");
                const esUltima = index === ruta.length - 1;

                if (esUltima) {
                    // Canvi de clase
                    const span = document.createElement("span");
                    span.classList.add("actiu");
                    span.appendChild(document.createTextNode(f.name));
                    liFam.appendChild(span);
                } else {
                    const link = document.createElement("a");
                    link.href = "#";
                    link.appendChild(document.createTextNode(f.name));

                    link.addEventListener("click", (e) => {
                        e.preventDefault();
                        familiaActualId = f.id;
                        mostrarFamilies(f.id);
                    });

                    liFam.appendChild(link);
                }

                miguesPa.appendChild(liFam);
            });
        }
    }

    //========== INICI ==========
    mostrarFamilies(null);
}