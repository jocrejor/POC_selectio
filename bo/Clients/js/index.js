
document.addEventListener("DOMContentLoaded", () => {

    let clients = [];
    let idSeleccionat = null;
    let paginaActual = 1;
    const perPagina = 10;

    main();

    async function main() {
        try {
            thereIsUser('../login.html');
            botonsTancarSessio('../login.html');

            // Crear buscador primero (inserta el input en DOM)
            crearBuscador();

            // Cargar datos (si falla, lo atrapamos)
            try {
                clients = await getData(url, "Client");
            } catch (err) {
                console.error("Error cargando clients:", err);
                clients = [];
            }

            // Autocomplete con nombres (aunque clients esté vacío funciona)
            activarAutocomplete(prepararAutocomplete());

            // Mostrar tabla y paginación
            mostrarPaginat();

        } catch (err) {
            // Error inesperado — lo vemos en consola pero seguimos intentando configurar modal
            console.error("Error en main():", err);
        } finally {
            // Siempre configurar modal y exponer función
            configurarModal();
            window.obrirModalEliminar = obrirModalEliminar;
        };
    }
    function prepararAutocomplete() {
    return clients.map(c => c.name);
}


    function activarAutocomplete(dades) {
    if (typeof $ === "undefined" || $("#textCercar").length === 0) return;

    $("#textCercar").autocomplete({
        minLength: 1,
        source: function(request, response) {
            const terme = request.term.toLowerCase();

            const resultats = dades.filter(nom =>
                nom.toLowerCase().startsWith(terme)
            );

            response(resultats);
        }
    });
}



    function crearBuscador() {
        const contingut = document.querySelector(".contingut");
        const div = document.createElement("div");
        div.id = "buscadorClients";

        div.innerHTML = `
            <input type="text" id="textCercar" placeholder="Cercar client...">
            <button id="btnBuscar"><i class="fa-solid fa-magnifying-glass"></i> Cercar</button>
            <button id="btnNetejar"><i class="fa-solid fa-xmark"></i> Netejar</button>
        `;

        // Inserta solo si no existe ya
        const existing = document.getElementById("buscadorClients");
        if (!existing) contingut.insertBefore(div, contingut.children[1]);
        document.getElementById("btnBuscar").addEventListener("click", filtrarClients);

        
        document.getElementById("btnNetejar").addEventListener("click", () => {
            const input = document.getElementById("textCercar");
            if (input) input.value = "";
            mostrarPaginat();
        });
    }

    function configurarModal() {
        // Asegúrate que los elementos existen
        const btnCancelar = document.getElementById("btnCancelarModal");
        const btnEliminar = document.getElementById("btnEliminarConfirmat");

        if (btnCancelar) {
            btnCancelar.addEventListener("click", () => {
                const modal = document.getElementById("modalEliminar");
                if (modal) modal.classList.add("modal-ocult");
                idSeleccionat = null;
            });
        } else {
            console.warn("btnCancelarModal no encontrado en DOM");
        }

        if (btnEliminar) {
            btnEliminar.addEventListener("click", async () => {
                if (!idSeleccionat) return;
                try {
                    await deleteData(url, "Client", idSeleccionat);
                    // cerrar y recargar
                    const modal = document.getElementById("modalEliminar");
                    if (modal) modal.classList.add("modal-ocult");

                    // recargar datos y tabla
                    try {
                        clients = await getData(url, "Client");
                    } catch (e) {
                        console.error("Error recargando clients post-delete:", e);
                    }
                    mostrarPaginat();
                } catch (err) {
                    console.error("Error eliminando client:", err);
                    alert("S'ha produït un error en eliminar l'usuari.");
                } finally {
                    idSeleccionat = null;
                }
            });
        } else {
            console.warn("btnEliminarConfirmat no encontrado en DOM");
        }

        // Delegación de eventos: escuchar clicks en los botones de borrar dentro de la tabla
        const taula = document.getElementById("taulaClients");
        if (taula) {
            taula.addEventListener("click", (ev) => {
                const btn = ev.target.closest("button[data-action='borrar']");
                if (!btn) return;
                const id = btn.dataset.id;
                const name = btn.dataset.name;
                const surname = btn.dataset.surname;
                // Abrir modal
                obrirModalEliminar(parseInt(id, 10), name, surname);
            });
        }
    }

    function obrirModalEliminar(id, nom, cognom) {
        idSeleccionat = id;
        const msg = document.getElementById("modalMissatge");
        if (msg) msg.textContent = `Esteu segur que voleu eliminar el client ${nom} ${cognom}? Aquesta acció no es pot desfer.`;
        const modal = document.getElementById("modalEliminar");
        if (modal) modal.classList.remove("modal-ocult");
    }

    function filtrarClients() {
        const input = document.getElementById("textCercar");
        const txt = input ? input.value.trim().toLowerCase() : "";

        const filtrats = clients.filter(c =>
            (c.name && c.name.toLowerCase().includes(txt)) ||
            (c.surname && c.surname.toLowerCase().includes(txt)) ||
            (c.email && c.email.toLowerCase().includes(txt))
        );

        paginaActual = 1;
        mostrarPaginat(filtrats);
    }

    function mostrarPaginat(llista = clients) {
        const inici = (paginaActual - 1) * perPagina;
        const final = inici + perPagina;
        const mostrar = llista.slice(inici, final);

        carregarTaula(mostrar);
        crearPaginacio(llista.length);
    }

    function carregarTaula(llista) {
        const taula = document.getElementById("taulaClients");
        taula.innerHTML = "";

        llista.forEach(client => {
            const fila = document.createElement("tr");

            // Creamos botón de borrar con data-attributes para evitar problemas con comillas/apóstrofes
            const borrarBtn = `<button class="icon-borrar" data-action="borrar" data-id="${client.id}"
                                    data-name="${escapeHtmlAttr(client.name)}" data-surname="${escapeHtmlAttr(client.surname)}">
                                    <i class="fa-solid fa-trash"></i>
                               </button>`;

            fila.innerHTML = `
                <td>${client.id}</td>
                <td>${escapeHtml(client.name)}</td>
                <td>${escapeHtml(client.surname)}</td>
                <td>${escapeHtml(client.address)}</td>
                <td>${escapeHtml(client.phone)}</td>
                <td>${escapeHtml(client.email)}</td>
                <td>
                    <button class="icon-editar" onclick="window.location.href='clientEditar.html?id=${client.id}'">
                        <i class="fa-solid fa-pen-to-square"></i>
                    </button>
                    ${borrarBtn}
                </td>
            `;
            taula.appendChild(fila);
        });
    }

    function crearPaginacio(total) {
        const div = document.getElementById("paginacio");
        div.innerHTML = "";

        const totalPagines = Math.max(1, Math.ceil(total / perPagina));

        const btnAnt = document.createElement("button");
        btnAnt.textContent = "Anterior";
        btnAnt.disabled = paginaActual === 1;
        btnAnt.addEventListener("click", () => {
            if (paginaActual > 1) paginaActual--;
            mostrarPaginat();
        });
        div.appendChild(btnAnt);

        for (let i = 1; i <= totalPagines; i++) {
            const btn = document.createElement("button");
            btn.textContent = i;

            if (i === paginaActual) btn.classList.add("activa");

            btn.addEventListener("click", () => {
                paginaActual = i;
                mostrarPaginat();
            });

            div.appendChild(btn);
        }

        const btnSeg = document.createElement("button");
        btnSeg.textContent = "Següent";
        btnSeg.disabled = paginaActual === totalPagines;
        btnSeg.addEventListener("click", () => {
            if (paginaActual < totalPagines) paginaActual++;
            mostrarPaginat();
        });
        div.appendChild(btnSeg);
    }

    // ---------- helpers ----------
    function escapeHtml(str) {
        if (!str && str !== 0) return "";
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
    }
    function escapeHtmlAttr(str) {
        if (!str && str !== 0) return "";
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
    }

}); // DOMContentLoaded
