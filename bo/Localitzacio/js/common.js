document.addEventListener("DOMContentLoaded", main);

function main() {

    // Configuració del botó de hamburguesa
    const menu_hamburguesa = document.getElementById("menu_hamburguesa");
    const nav = document.getElementById("menu_lateral");
    let visible = false;

    // Gestió del menú de hamburguesa
    menu_hamburguesa.addEventListener("click", (e) => {
        if (visible) {
            nav.style.display = 'none';
            visible = false;
        } else {
            nav.style.display = 'block';
            visible = true;
        }
    });
}