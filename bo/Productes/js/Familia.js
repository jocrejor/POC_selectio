document.addEventListener("DOMContentLoaded", main);

let accio = "Afegir";
let families = [];
let llistaAutocomplete = [];

async function main() {
    try {
        families = await getData(url, "Family");
        console.log("Familias cargadas:", families);
        
        // Ajuste por si la respuesta viene en un array anidado
        if (Array.isArray(families) && families.length > 0 && Array.isArray(families[0])) {
            families = families[0];
        }

        const afegirButton = document.getElementById("afegir");
        afegirButton.textContent = accio;

        mostrarFamilies(families);
        actualitzarSelect();

        // Evento para el botón de agregar/actualizar
        afegirButton.addEventListener("click", async function (e) {
            e.preventDefault();
            if (await validar(e)) {
                if (accio === "Afegir") {
                    await crearFamilia();
                } else {
                    await actualitzarFamilia();
                }
                netejarFormulari();
                await recargarDatos();
            }
        });
    } catch (error) {
        console.error("Error en main:", error);
        alert("Error al cargar las familias.");
    }
}

// Recargar datos desde el API
async function recargarDatos() {
    try {
        families = await getData(url, "Family");
        if (Array.isArray(families) && families.length > 0 && Array.isArray(families[0])) {
            families = families[0];
        }
        mostrarFamilies(families);
        actualitzarSelect();
    } catch (error) {
        console.error("Error recargando datos:", error);
    }
}

// Limpia todos los campos del formulario
function netejarFormulari() {
    document.getElementById("nom").value = "";
    document.getElementById("familia_de").value = "";
    document.getElementById("index").value = "-1";
    document.getElementById("descripcio").value = "";
    document.getElementById("imatge").value = "";
    accio = "Afegir";
    document.getElementById("afegir").textContent = accio;
    const alerta = document.getElementById("alerta");
    alerta.textContent = "";
    
    // Limpiar errores de validación
    esborrarError();
}

// Muestra todas las familias en la tabla con estructura jerárquica
function mostrarFamilies(families) {
    const taula = document.getElementById("taulaFamilia");
    taula.innerHTML = "";

    console.log("Mostrando familias:", families);

    const childrenMap = {};

    // Organiza las familias por su parent_id para crear la jerarquía
    families.forEach(function (f) {
        const parentKey = f.parent_id === null ? "root" : f.parent_id;
        if (!childrenMap[parentKey]) {
            childrenMap[parentKey] = [];
        }
        childrenMap[parentKey].push(f);
    });

    // Función recursiva para mostrar familias y subfamilias
    function agregarFila(fam, nivel) {
        if (nivel === undefined) nivel = 0;

        const fila = document.createElement("tr");
        fila.dataset.id = fam.id;
        fila.dataset.nivel = nivel;

        // Aplica estilos según el nivel de jerarquía
        if (nivel > 0) {
            fila.classList.add("subfamilia", "oculto");
        }
        if (nivel === 0) {
            fila.classList.add("fam-principal");
        }

        // Formatea el nombre según el nivel
        var nombreTexto = fam.name;
        if (nivel > 0) {
            nombreTexto = '↳ ' + fam.name;
        }

        var fontWeight = "normal";
        if (nivel === 0) {
            fontWeight = "bold";
        }

        var anchoImagen = "70";
        if (nivel === 0) {
            anchoImagen = "70";
        }

        // Crea el HTML de la fila
        const celdaNom = document.createElement("td");
        celdaNom.style.paddingLeft = (20 * nivel) + "px";
        celdaNom.style.cursor = "pointer";
        celdaNom.style.fontWeight = fontWeight;
        celdaNom.textContent = nombreTexto;

        const celdaDesc = document.createElement("td");
        celdaDesc.textContent = fam.description;

        const celdaImg = document.createElement("td");
        if (fam.image) {
            const img = document.createElement("img");
            img.src = "./img/" + fam.image;
            img.width = anchoImagen;
            img.alt = fam.name;
            celdaImg.appendChild(img);
        }



        const celdaBotons = document.createElement("td");
        // Crear enlace "Editar"
        const enlaceEditar = document.createElement("a");
        enlaceEditar.className = "icon-editar";
        enlaceEditar.href = "#";
        enlaceEditar.setAttribute("onclick", `editarFamilia(${fam.id}); return false;`);
        enlaceEditar.innerHTML = `<i class="fa-solid fa-pen-to-square"></i>`;

        // Crear enlace "Eliminar"
        const enlaceEliminar = document.createElement("a");
        enlaceEliminar.className = "icon-borrar";
        enlaceEliminar.href = "#";
        enlaceEliminar.setAttribute("onclick", `borrarFamilia(${fam.id}); return false;`);
        enlaceEliminar.innerHTML = `<i class="fa-solid fa-trash"></i>`;

        // Añadir los enlaces a la celda
        celdaBotons.append(enlaceEditar, enlaceEliminar);

        // Añadir celdas a la fila
        fila.append(celdaNom, celdaDesc, celdaImg, celdaBotons);
        taula.appendChild(fila);

        // Si tiene subfamilias, añade funcionalidad de expandir/colapsar
        if (childrenMap[fam.id] && childrenMap[fam.id].length > 0) {
            const celdaNombre = fila.querySelector('td');
            celdaNombre.style.cursor = 'pointer';

            celdaNombre.addEventListener('click', function (e) {
                if (e.target.tagName !== 'BUTTON') {
                    childrenMap[fam.id].forEach(function (hijo) {
                        const filaHijo = document.querySelector('tr[data-id="' + hijo.id + '"]');
                        if (filaHijo) {
                            filaHijo.classList.toggle("oculto");
                        }
                    });
                }
            });

            // Añade recursivamente las subfamilias
            childrenMap[fam.id].forEach(function (hijo) {
                agregarFila(hijo, nivel + 1);
            });
        }
    }

    // Muestra primero las familias principales (sin padre)
    if (childrenMap["root"]) {
        childrenMap["root"].forEach(function (fam) {
            agregarFila(fam, 0);
        });
    }
}

// Actualiza el dropdown con todas las familias disponibles
function actualitzarSelect() {
    let select = document.getElementById("familia_de");
    select.innerHTML = '<option value="">Sense família pare</option>';

    // Només famílies principals (parent_id == null)
    families
        .filter(f => f.parent_id === null)
        .forEach(f => {
            select.innerHTML += `<option value="${f.id}">${f.name}</option>`;
        });
}

// Crea una nueva familia con los datos del formulario
async function crearFamilia() {
    let nom = document.getElementById("nom").value.trim();
    let familia_de = document.getElementById("familia_de").value;
    let imatge = document.getElementById("imatge").files[0]?.name || "";
    let descripcio = document.getElementById("descripcio").value.trim();

    // Validación
    if (!nom || !descripcio) {
        alert("El nombre y la descripción son obligatorios");
        return;
    }

    let novaFamilia = {
        name: nom,
        parent_id: familia_de === "" ? null : parseInt(familia_de),
        image: imatge,
        description: descripcio
    };

    try {
        // POST a la API
        await postData(url, "Family", novaFamilia);
        alert("Familia creada correctamente");
    } catch (error) {
        console.error("Error creando familia:", error);
        alert("Error al crear la familia.");
    }
}

// Actualiza una familia existente con los datos del formulario
async function actualitzarFamilia() {
    const id = document.getElementById("index").value;
    if (id === "-1") return;

    const nom = document.getElementById("nom").value.trim();
    const familia_de = document.getElementById("familia_de").value;
    const imatge = document.getElementById("imatge").files[0]?.name || "";
    const descripcio = document.getElementById("descripcio").value.trim();

    const updated = {
        name: nom,
        parent_id: familia_de === "" ? null : parseInt(familia_de),
        image: imatge,
        description: descripcio
    };

    try {
        // PATCH a la API
        await updateId(url, "Family", id, updated);
        alert("Familia actualizada correctamente");
    } catch (error) {
        console.error("Error actualizando familia:", error);
        alert("Error al actualizar la familia.");
    }
}

// Prepara el formulario para editar una familia existente
window.editarFamilia = function (id) {
    const fam = families.find(f => f.id == id); // Usar == para comparar string con número
    if (!fam) return;

    document.getElementById("index").value = fam.id;
    document.getElementById("nom").value = fam.name;
    document.getElementById("familia_de").value = fam.parent_id || "";
    document.getElementById("descripcio").value = fam.description;
    // Nota: No establecemos el valor de imatge ya que es un file input

    accio = "Actualitzar";
    document.getElementById("afegir").textContent = accio;
};

// Elimina una familia después de confirmación
async function borrarFamilia(id) {
    // Comprobar si tiene subfamilias
    const subfam = families.some(f => f.parent_id == id); // Usar == para comparar
    if (subfam) {
        alert("No es pot eliminar perquè té subfamílies");
        return;
    }

    // AVISO DE CONFIRMACIÓN
    const ok = confirm("Estàs segur que vols eliminar aquesta família?");
    if (!ok) return;

    try {
        // DELETE de la API
        await deleteData(url, "Family", id);
        alert("Familia eliminada correctamente");
        await recargarDatos();
    } catch (error) {
        console.error("Error eliminando familia:", error);
        alert("Error al eliminar la familia.");
    }
}

/* ---------------- VALIDACIONES ---------------- */

// Valida que el nombre cumpla los requisitos
function validarNom() {
    const element = document.getElementById("nom");
    if (!element.checkValidity()) {
        if (element.validity.valueMissing) {
            error(element, "Has d'introduir un nom.");
        } else if (element.validity.patternMismatch) {
            error(element, "El nom només pot tindre lletres, números i espais, entre 3 i 100 caràcters.");
        } else if (element.validity.tooShort) {
            error(element, "El nom ha de tindre almenys 3 caràcters.");
        } else if (element.validity.tooLong) {
            error(element, "El nom no pot superar els 100 caràcters.");
        }
        return false;
    }
    return true;
}

// Valida que la descripción cumpla los requisitos
function validarDescripcio() {
    const element = document.getElementById("descripcio");
    if (!element.checkValidity()) {
        if (element.validity.valueMissing) {
            error(element, "Has d'introduir una descripció.");
        } else if (element.validity.tooShort) {
            error(element, "La descripció ha de tindre almenys 3 caràcters.");
        } else if (element.validity.tooLong) {
            error(element, "La descripció no pot superar els 250 caràcters.");
        }
        return false;
    }
    return true;
}

// Valida el tamaño del archivo de imagen
function validarImatge() {
    const archivo = document.getElementById("imatge").files[0];
    if (archivo && archivo.size > 2 * 1024 * 1024) {
        error(document.getElementById("imatge"), "La imatge no pot pesar més de 2MB.");
        return false;
    }
    return true;
}

// Valida que una familia no sea subfamilia de sí misma
function validarSubfamilia() {
    const index = document.getElementById("index").value;
    const familia_de = document.getElementById("familia_de").value;
    if (index !== "-1" && familia_de !== "" && parseInt(index) === parseInt(familia_de)) {
        error(document.getElementById("familia_de"), "Una família no pot ser subfamília de sí mateixa.");
        return false;
    }
    return true;
}

// Función principal de validación que ejecuta todas las validaciones
async function validar(e) {
    esborrarError();
    if (validarNom() && validarDescripcio() && validarImatge() && validarSubfamilia()) {
        return true;
    } else {
        if (e) {
            e.preventDefault();
        }
        return false;
    }
}

// Muestra un mensaje de error en el elemento especificado
function error(element, missatge) {
    const alerta = document.getElementById("alerta");
    alerta.textContent = missatge;
    element.classList.add("error");
    element.focus();
}

// Limpia todos los mensajes de error
function esborrarError() {
    document.getElementById("alerta").textContent = "";
    const inputs = document.querySelectorAll("input, textarea, select");
    for (var i = 0; i < inputs.length; i++) {
        inputs[i].classList.remove("error");
    }
}