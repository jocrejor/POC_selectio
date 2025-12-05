document.addEventListener("DOMContentLoaded", main);

// Funció principal que gestiona l'alta de noves ofertes
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

    function reiniciarFormulario() {
        formulari.reset();
        mostrarMissatge("", "success");
    }

    const reiniciarButton = document.getElementById('reiniciarButton');
    if (reiniciarButton) {
        reiniciarButton.addEventListener('click', reiniciarFormulario);
    }

    // Configurar fecha mínima como hoy
    const avui = new Date().toISOString().split('T')[0];
    entradaDataInici.min = avui;
    entradaDataFi.min = avui;

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

        // Limpiar mensajes anteriores
        mostrarMissatge("", "success");

        if (!validarFormulari()) {
            return;
        }

        const datosAPI = {
            description: entradaOferta.value.trim(),
            discount_percent: parseInt(entradaPercentatge.value.trim()),
            coupon: entradaCupo.value.trim() || null,
            start_date: entradaDataInici.value + ' 00:00:00',
            end_date: entradaDataFi.value + ' 00:00:00',
            created_at: obtenerFechaHoraLocal()
        };

        try {
            // Crear nueva oferta en la API
            const respuesta = await postData(url, "Sale", datosAPI);

            if (respuesta && respuesta.id) {
                mostrarMissatge("Oferta afegida correctament!", "success");

                // Limpiar formulario
                formulari.reset();

                // Redirigir después de 2 segundos
                setTimeout(() => {
                    window.location.href = "index.html";
                }, 2000);
            } else {
                mostrarMissatge("Error: No s'ha rebut resposta del servidor", "error");
            }

        } catch (error) {
            console.error('Error guardant oferta:', error);
            mostrarMissatge("Error guardant l'oferta", "error");
        }
    });
}