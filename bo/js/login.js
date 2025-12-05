document.addEventListener("DOMContentLoaded", main);

async function main() {
    const form = document.getElementById("formulariLogin");

    // Carregar usuaris
    usuaris = await getData(url, "User");
    /*if (!usuaris) {
        localStorage.setItem('usuaris', JSON.stringify(usuaris));  // CAMBIAR
    }*/

    // Validar formulari
    form.addEventListener("submit", validar);
}

/* ---------------- VALIDACIONS ---------------- */

// Funció per validar el nomUsuari.
function validarnomUsuari() {
    let element = document.getElementById("nomUsuari");
    if (!element.checkValidity()) {
        if (element.validity.valueMissing) {
            error(element, "Has d'introduïr un nom d'Usuari.");
        }
        if (element.validity.patternMismatch) {
            error(element, "El nom ha de tindre entre 3 i 50 caràcters. A més no pots introduïr caracters especials ni majuscules");
        }
        return false;
    }
    return true;
}

// Funció que valida la contrasenya.
function validarContrasenya() {
    let element = document.getElementById("contrasenya");
    if (!element.checkValidity()) {
        if (element.validity.valueMissing) {
            error(element, "Has d'introduïr una contrasenya.");
        }
        if (element.validity.patternMismatch) {
            error(element, "La contrasenya ha de tindre entre 5 i 30 caràcters, amb majúscula, minúscula i símbol.");
        }
        return false;
    }
    return true;
}

async function validar(e) {
    e.preventDefault(); 
    esborrarError();

    if (validarnomUsuari() && validarContrasenya()) {
        const nomUsuari = document.getElementById("nomUsuari").value.trim();
        const password = document.getElementById("contrasenya").value.trim();

        const usuaris = await getData(url, "User");
        const usuariTrobat = usuaris.find(u => u.nickname === nomUsuari && u.password === password);

        if (usuariTrobat) {
            localStorage.setItem("currentUser", JSON.stringify(usuariTrobat));
            window.location.href = "index.html";
        } else {
            error(null, "Usuari o contrasenya incorrectes.");
        }
    }
}

/* ---------------- FUNCIONS D'ERROR ---------------- */

function error(element, missatge) {
    let miss = document.createTextNode(missatge);    
    document.getElementById("missatgeError").appendChild(miss);
    if (element) {
        element.classList.add("error");
        element.focus();
    }
}

function esborrarError() {
    const contError = document.getElementById("missatgeError");
    contError.replaceChildren();

    let formulari = document.getElementById("formulariLogin");
    for (let i = 0; i < formulari.elements.length; i++) {
        formulari.elements[i].classList.remove("error");
    }
}