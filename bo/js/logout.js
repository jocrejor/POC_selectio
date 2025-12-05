document.addEventListener("DOMContentLoaded", main);

async function main() {

    // Si llegamos aquí, sí hay usuario → mostrar nombre
    const usuariNom = document.getElementById("usuariNom");
    const usuariActual = JSON.parse(localStorage.getItem("currentUser"));
    if (usuariNom && usuariActual) {
        const nom = document.createTextNode(usuariActual.name);
        usuariNom.appendChild(nom);
    }
}

// Funcio per a gestionar els botons de tancar sessió
function botonsTancarSessio (url) {

    const btnLogout = document.getElementById("botoTancarSessio");

    btnLogout.addEventListener("click", () => {
        // Eliminar l'usuari actual del localStorage
        if (confirm(`Estàs segur que vols tancar sessió?`)) {
            tancarSessio(url);
        }
    });

    const btnLogoutLateral = document.getElementById("tancarSessioLateral");

    btnLogoutLateral.addEventListener("click", () => {
        // Eliminar l'usuari actual del localStorage
        if (confirm(`Estàs segur que vols tancar sessió?`)) {
            tancarSessio(url);
        }
    });
}