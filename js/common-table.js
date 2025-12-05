// Array on guardarem les dades de la taula
let elements = [];

/**
 * Funció encarregada de guardar el JSON que es mostrarà en la taula
 * @param {*} elem Array amb el JSON que es visualitzarà tal qual està en la taula
 */
function agafarDades (elem) {
    elements = elem;
}

/**
 * Funció encarregada de mostrar una taula amb totes les dades seleccionades
 * @param {*} capcalera Array amb tots els elem ents de la capçalera. Per exemple ['ID', 'Nom', 'Email', ... ]
 * @param {*} urlEditar Url per a accedir a la pàgina de editar. Per exemple 'editar.html?id='.
 * @param {*} funcioBorrar Nom de la funció encarregada de borrar un registre. Per ejemple borrar
 * @param {*} urlVisualitzar Url de la pagina per a visualitzar. Per exemple 'visualitzar.html?id='. En cas de no tindre es donarà un null per a que no es mostre
 */
function mostrarTaula (capcalera, urlEditar, funcioBorrar, urlVisualitzar) {
    // Agarrem el element de la taula
    const table = document.getElementById("taula");

    // Buidem la taula
    table.innerHTML = "";

    // Agafem els valors de la capçalera i les keys del json utilitzat
    const headers = capcalera;
    const key = Object.keys(elements[0]);
    let id = "";

    // Construir THEAD
    let html = "<thead><tr>";
    headers.forEach(h => {
        html += `<th>${h}</th>`;
    });
    html += "</tr></thead>";

    html += `
        <tr class="capcalera_movil">
            <th>Llistat</th>
        </tr>
    `;

    // Construir TBODY
    html += "<tbody>";
    // Recorrem amb un bucle foreach per a ficar cada un del elements de la taula
    elements.forEach(elements => {
        html += "<tr>";
        // Fiquem cada un del elements de cada fila i guardem la id
        let i = 0;
        key.forEach(key => {
            html += `<td data-cell="${headers[i]} : ">${elements[key]}</td>`;
            if (key == "id") {
                id = elements[key];
            }
            i++;
        });
        // Mostrem les icones d'acció de cada element
        html += 
            `<td>
                <a class="icon-editar" href="${urlEditar}=${id}"><i class="fa-solid fa-pen-to-square"></i></a>
                <a class="icon-borrar" href="#" onclick="${funcioBorrar}(${id})"><i class="fa-solid fa-trash"></i></a>`;
                
        // En cas de tindre la opció de visualitzar mostrarem una icona
        if (urlVisualitzar) {
            html += `<a class="icon-visualitzar" href="${urlVisualitzar}=${id}"><i class="fa-solid fa-eye"></i></a>`; 
        }
        html += "</td>";
        html += "</tr>";
    });
    html += "</tbody>";

    table.innerHTML = html;
}
