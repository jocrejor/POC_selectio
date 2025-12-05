document.addEventListener("DOMContentLoaded", main);

// Funció principal que gestiona l'edició d'ofertes
async function main() {
    thereIsUser("../login.html");

    // Buscar el botó de tancar sessió
    const btnLogout = document.getElementById("botoTancarSessio");

    btnLogout.addEventListener("click", () => {
        // Eliminar l'usuari actual
        tancarSessio("../login.html");
    });

    const btnLogoutLateral = document.getElementById("tancarSessioLateral");

    btnLogoutLateral.addEventListener("click", () => {
        // Eliminar l'usuari actual del localStorage
        tancarSessio("../login.html");
    });
    const formulari = document.getElementById('formOferta');
    const entradaOferta = document.getElementById('ofertaInput');
    const entradaPercentatge = document.getElementById('percentajeInput');
    const entradaCupo = document.getElementById('couponInput');
    const entradaDataInici = document.getElementById('dataIniciInput');
    const entradaDataFi = document.getElementById('datafiInput');

    function obtenerFechaHoraLocal() {
        const ahora = new Date();
        const año = ahora.getFullYear();
        const mes = String(ahora.getMonth() + 1).padStart(2, '0');
        const dia = String(ahora.getDate()).padStart(2, '0');
        const horas = String(ahora.getHours()).padStart(2, '0');
        const minutos = String(ahora.getMinutes()).padStart(2, '0');
        const segundos = String(ahora.getSeconds()).padStart(2, '0');

        return `${año}-${mes}-${dia} ${horas}:${minutos}:${segundos}`;
    }

    const tornarButton = document.getElementById('tornarOfertes');
    if (tornarButton) {
        tornarButton.addEventListener('click', function () {
            window.location.href = 'index.html';
        });
    }

    const parametres = new URLSearchParams(window.location.search);
    const ofertaId = parametres.get('edit');

    // Carregar dades de l'oferta des de la API
    async function carregarOferta() {
        if (!ofertaId) return null;

        try {
            const oferta = await getIdData(url, "Sale", ofertaId);
            if (oferta) {
                entradaOferta.value = oferta.description || "";
                entradaPercentatge.value = oferta.discount_percent || "";
                entradaCupo.value = oferta.coupon || "";
                entradaDataInici.value = oferta.start_date ? oferta.start_date.split(' ')[0] : "";
                entradaDataFi.value = oferta.end_date ? oferta.end_date.split(' ')[0] : "";
                return oferta;
            }
            return null;
        } catch (error) {
            mostrarMissatge("Error carregant les dades de l'oferta", "error");
            return null;
        }
    }

    if (ofertaId) {
        await carregarOferta();
    } else {
        mostrarMissatge("Error: No s'ha especificat cap oferta per editar", "error");
        return;
    }

    function reiniciarFormulario() {
        formulari.reset();
        mostrarMissatge("Formulari reiniciat", "success");
    }

    const reiniciarButton = document.getElementById('reiniciarButton');
    if (reiniciarButton) {
        reiniciarButton.addEventListener('click', reiniciarFormulario);
    }

    function mostrarMissatge(text, tipus = "error") {
        let missatge = document.getElementById("mensaje");
        if (!missatge) {
            missatge = document.createElement("p");
            missatge.id = "mensaje";
            missatge.style.color = tipus === "error" ? "red" : "green";
            formulari.parentNode.insertBefore(missatge, formulari);
        }
        missatge.textContent = text;
        missatge.style.color = tipus === "error" ? "red" : "green";
    }

    function validarFormulari() {
        let esValid = true;

        // Validar nombre de oferta
        if (!entradaOferta.value.trim()) {
            mostrarMissatge("El nom de l'oferta és obligatori", "error");
            esValid = false;
        } else if (entradaOferta.value.trim().length < 2) {
            mostrarMissatge("L'oferta ha de tenir com a mínim 2 caràcters", "error");
            esValid = false;
        }

        // Validar porcentaje
        if (!entradaPercentatge.value) {
            mostrarMissatge("El percentatge és obligatori", "error");
            esValid = false;
        } else {
            const percentatge = parseInt(entradaPercentatge.value);
            if (percentatge < 1 || percentatge > 100) {
                mostrarMissatge("El percentatge ha de ser entre 1 i 100", "error");
                esValid = false;
            }
        }

        // Validar fechas
        if (!entradaDataInici.value) {
            mostrarMissatge("La data d'inici és obligatòria", "error");
            esValid = false;
        }

        if (!entradaDataFi.value) {
            mostrarMissatge("La data de fi és obligatòria", "error");
            esValid = false;
        }

        if (entradaDataInici.value && entradaDataFi.value) {
            const dataInici = new Date(entradaDataInici.value);
            const dataFi = new Date(entradaDataFi.value);

            if (dataInici >= dataFi) {
                mostrarMissatge("La data de fi ha de ser posterior a la data d'inici", "error");
                esValid = false;
            }
        }

        return esValid;
    }

    formulari.addEventListener('submit', async function (e) {
        e.preventDefault();

        if (!validarFormulari()) {
            return;
        }

        const datosAPI = {
            description: entradaOferta.value.trim(),
            discount_percent: parseInt(entradaPercentatge.value.trim()),
            coupon: entradaCupo.value.trim(),
            start_date: entradaDataInici.value + ' 00:00:00',
            end_date: entradaDataFi.value + ' 00:00:00',
            updated_at: obtenerFechaHoraLocal()
        };

        try {
            if (ofertaId) {
                await updateId(url, "Sale", ofertaId, datosAPI);
                mostrarMissatge("Oferta editada correctament!", "success");

                setTimeout(() => window.location.href = "index.html", 1200);
            } else {
                mostrarMissatge("Error: No s'ha trobat l'oferta per editar.", "error");
            }

        } catch (error) {
            console.error('Error actualitzant oferta:', error);
            mostrarMissatge("Error actualitzant l'oferta", "error");
        }
    });
}