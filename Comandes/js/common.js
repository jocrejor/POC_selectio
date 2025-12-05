document.addEventListener("DOMContentLoaded", main);

function main() {
    alternarMenu();
    resetMenuEnEscritori();
}

function alternarMenu() {
    const obrir_menu  = document.querySelector(".obrir-menu");
    const tancar_menu = document.querySelector(".tancar-menu");
    const menu_box    = document.querySelector(".menu-box");

    // Obrir menú
    obrir_menu.addEventListener("click", () => {
        menu_box.classList.add("menu-actiu");
    });

    // Tancar menú (botó X)
    tancar_menu.addEventListener("click", () => {
        menu_box.classList.remove("menu-actiu");
    });

    // Tancar menú quan es fa click a un enllaç
    document.querySelectorAll(".menu a").forEach(enllaç => {
        enllaç.addEventListener("click", () => {
            if (window.innerWidth <= 360) {
                menu_box.classList.remove("menu-actiu");
            }
        });
    });
}

function resetMenuEnEscritori() {
    const menu_box = document.querySelector(".menu-box");

    window.addEventListener("resize", () => {
        if (window.innerWidth > 360) {
            menu_box.classList.remove("menu-actiu");
        }
    });
}