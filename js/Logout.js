document.addEventListener("DOMContentLoaded", () => {
    const tancaBtn = document.getElementById("tanca");

    tancaBtn.addEventListener("click", () => {
        if (confirm("Vols tancar sessió?")) {
            tancarSessio();
            window.location.href = "./Login.html";
        }
    });
});

function tancarSessio() {
    // Esborrar l'usuari actiu del localStorage
    localStorage.removeItem("currentUser");

    // Redirigir a la pàgina de login
}
