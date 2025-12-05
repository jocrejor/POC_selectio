document.addEventListener("DOMContentLoaded", main);

// Pàgines
let paginaActual = 1;
const elementsPerPagina = 10;
let arrayElements;

function main () {
    // Botons per a anar a la pagina anterior o posterior
    const paginaAnterior = document.getElementById('anterior');
    const paginaPosterior = document.getElementById('posterior');

    // Configuració del botó per a anar a la pagina anterior
    paginaAnterior.addEventListener("click", () => {
        if (paginaActual > 1) {
            paginaActual--;
            actualitzarDades();
        }
    });

    // Configuració del botó per a anar a la pagina posterior
    paginaPosterior.addEventListener("click", () => {
        const ultima = Math.ceil(arrayElements.length / elementsPerPagina);
        if (paginaActual < ultima) {
            paginaActual++;
            actualitzarDades();
        }
    });
}

// Funció per a carregar el array que volem utilitzar per a la paginació
function carregarArray (e) {
    arrayElements = e;
}

// Funció encarregada d'aplicar la paginació
function aplicarPaginacio (lista) {
    const inicio = (paginaActual - 1) * elementsPerPagina;
    const fin = inicio + elementsPerPagina;
    return lista.slice(inicio, fin);
}

// Funció encarregada de crear els botons de pagina baix de la pantalla
function creaPagines () {
    // Agafem els usuaris i calculem quantes pàgines hi ha
    let totalPagines = Math.ceil((arrayElements.length / elementsPerPagina));

    const paginacio = document.getElementsByClassName('paginacio')[0];
    const contenidorPagines = document.getElementById('pagines');

    // No mostrem el sistema de paginació en cass de tindre 1 soles pagina
    if (totalPagines <= 1 ) {
        paginacio.classList.add('no_mostrar');
        return;
    } else {
        paginacio.classList.remove('no_mostrar');
    }

    // Borrem la paginació actual
    contenidorPagines.replaceChildren();

    // Mostrem o no el botó de pàgina anterior
    const paginaAnterior = document.getElementById('anterior');
    paginaAnterior.classList.toggle("no_mostrar", paginaActual === 1);

    // Variables per a definir quines pagines hi ha que mostrar
    const maxVisible = 4;
    let inici, fi;

    // Calcul per a mostrar soles 4 pàgines visibles
    if (totalPagines <= maxVisible) {
        inici = 1;
        fi = totalPagines;
    } else {
        // Aproximem el número cap a baix
        const mitad = Math.floor(maxVisible / 2);

        // Si la pàgina actual està molt al principi, mostrem les primeres 4 pàgines
        if (paginaActual <= mitad + 1) {
            inici = 1;
            fi = maxVisible;
        }

     // Si la pàgina actual està molt al final, mostrem les últimes 4 pàgines
        else if (paginaActual >= totalPagines - mitad) {
            inici = totalPagines - maxVisible + 1;
            fi = totalPagines;
        } 
        
        // Si estem en una zona intermèdia, centrem la pàgina actual dins del bloc de 4 visibles
        else {
            inici = paginaActual - mitad;
            fi = paginaActual + (maxVisible - mitad - 1);
        }
    }

    // Mostrem cada una de les pàgines
    for (let num = inici; num <= fi; num++) {

        const pagina = document.createElement('button');
        const numero = document.createTextNode(num);
        pagina.appendChild(numero);

        if (num == paginaActual) {
            pagina.classList.add("paginaSeleccionada");
        }

        // Configuració per a cada botó per a canviar de pàgina
        pagina.addEventListener('click', () => {
            paginaActual = num;
            actualitzarDades(arrayElements);
        });

        contenidorPagines.appendChild(pagina);
    }

    // Mostrem o no el botó de pàgina anterior
    const paginaSeguent = document.getElementById("posterior");
    paginaSeguent.classList.toggle("no_mostrar", paginaActual === totalPagines);
}