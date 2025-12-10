document.addEventListener("DOMContentLoaded", main);

function main() {
    alternarMenuMovil();
    resetMenuEscritori();
}
function alternarMenuMovil() {
    const obrir_menu = document.querySelector(".obrir-menu");
    const tancar_menu = document.querySelector(".tancar-menu");
    const menu_box = document.querySelector(".menu-box");

    if(obrir_menu) obrir_menu.addEventListener("click", () => menu_box.classList.add("menu-actiu"));
    if(tancar_menu) tancar_menu.addEventListener("click", () => menu_box.classList.remove("menu-actiu"));

    document.querySelectorAll(".menu a").forEach(enllaç => {
        enllaç.addEventListener("click", () => {
            if (window.innerWidth <= 768) menu_box.classList.remove("menu-actiu");
        });
    });
}

function resetMenuEscritori() {
    const menu_box = document.querySelector(".menu-box");
    window.addEventListener("resize", () => {
        if (window.innerWidth > 768 && menu_box) menu_box.classList.remove("menu-actiu");
    });
}


// ==========================================
// BUSCADOR CON JQUERY
// ==========================================

$(document).ready(function () {
    
    // 1. Endpoint CORREGIDO y confirmado (con P mayúscula)
    const ENDPOINT_PRODUCTOS = "Product"; 

    $("#buscador").autocomplete({
        minLength: 2, 
        
        
        source: function(request, response) {
            
            const busquedaEndPoint = `${ENDPOINT_PRODUCTOS}?q=${request.term}`;
            
            
            getData(url, busquedaEndPoint).then(data => {
                
                // Mapeamos los datos recibidos
                const resultados = data.map(item => ({
                    label: item.name, 
                    value: item.name,
                    id: item.id,
                    price: item.price,
                }));

                
                response(resultados);

            }).catch(error => {
                console.error("Error buscando productos:", error);
                response([]); 
            });
        },

        
        select: function (event, ui) {
            // Ponemos el nombre en el input
            $("#buscador").val(ui.item.label);

            // Calculamos la ruta relativa
            let rutaBase = "./ProductDetall.html";
            
            const path = window.location.pathname;
            if(path.includes("/AreaPersonal/") || path.includes("/Comandes/") || 
               path.includes("/Carret/") || path.includes("/Comparador/") || path.includes("/Contacta/")) {
                rutaBase = "../ProductDetall.html";
            }

            // Redirigimos enviando el ID por URL
            window.location.href = `${rutaBase}?id=${ui.item.id}`;
            
            return false;
        }
    })
    
    // Renderizado visual personalizado para mostrar el nombre y el precio
    .autocomplete("instance")._renderItem = function (ul, item) {
        return $("<li>")
            .append(`<div>
                        <span style="font-weight:bold">${item.label}</span>
                        <br>
                        <span style="font-size:0.9em; color:#007bff">${item.price} €</span>
                     </div>`)
            .appendTo(ul);
    };
});