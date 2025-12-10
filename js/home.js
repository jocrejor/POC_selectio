document.addEventListener("DOMContentLoaded", main);

async function main() {
    const familias = await getData(url, "Family");

    // Filtrar solo las familias principales
    const familiasPrincipales = familias.filter(familia => familia.parent_id === null);

    const categoriesContainer = document.getElementById("categories-container");
    const nextBtn = document.getElementById("nextBtn");
    const prevBtn = document.getElementById("prevBtn");

    // Inicialmente mostrar las primeras 4 categorías
    let currentIndex = 0;
    const categoriesPerPage = 4;

    // Función para cargar categorías
    function loadCategories() {
        // Limpiar el contenedor antes de agregar los nuevos elementos
        categoriesContainer.innerHTML = '';

        // Mostrar categorías de acuerdo al índice
        const categoriasParaMostrar = familiasPrincipales.slice(currentIndex, currentIndex + categoriesPerPage);
        
        categoriasParaMostrar.forEach(familia => {
            const categoryDiv = document.createElement('div');
            categoryDiv.classList.add('col-3');

            const categoryLink = document.createElement('a');
            categoryLink.href = `./Product.html?familia=${familia.id}`;
            categoryLink.classList.add('cat-item');

            const categoryImage = document.createElement('img');
            categoryImage.src = familia.image ? `./bo/Productes/img/${familia.image}` : './img/Productes/defaultImage.jpg';
            categoryImage.alt = familia.name;

            const categoryName = document.createElement('p');
            categoryName.textContent = familia.name;

            categoryLink.appendChild(categoryImage);
            categoryLink.appendChild(categoryName);

            categoryDiv.appendChild(categoryLink);
            categoriesContainer.appendChild(categoryDiv);
        });

        // Actualizar el índice para las siguientes categorías
        prevBtn.style.display = currentIndex > 0 ? 'inline-block' : 'none'; // Mostrar botón de "anterior" si no estamos al principio
        nextBtn.style.display = currentIndex + categoriesPerPage < familiasPrincipales.length ? 'inline-block' : 'none'; // Mostrar "siguiente" si hay más categorías

    }

    // Cargar las primeras categorías al inicio
    loadCategories();

    // Evento para el botón "Mostrar más categorías"
    nextBtn.addEventListener('click', function() {
        if (currentIndex + categoriesPerPage < familiasPrincipales.length) {
            currentIndex += categoriesPerPage;
            loadCategories();
        }
    });

    // Evento para el botón "Mostrar categorías anteriores"
    prevBtn.addEventListener('click', function() {
        if (currentIndex > 0) {
            currentIndex -= categoriesPerPage;
            loadCategories();
        }
    });
}
