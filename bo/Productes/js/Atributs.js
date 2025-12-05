window.onload = iniciar;

let filtroFamilia = "";
let families = [];
let attributes = [];
let paginaActual = 1;
const ITEMS_PAGINA = 10;


 async function iniciar() {
   await carregarDadesLocal();

 document.getElementById("enviar").addEventListener("click", anarcrear);
document.getElementById("applyFilter").addEventListener("click", function (e) {
    e.preventDefault();
    aplicarFiltroFamilia();
});

document.getElementById("clearFilter").addEventListener("click", function (e) {
    e.preventDefault();
    limpiarFiltroFamilia();
});


}

function anarcrear() {
  window.location.href = "./AtributsAlta.html";
}

async  function carregarDadesLocal() {
 attributes = await getData(url, "Attribute");
  families = await getData(url, "Family");
  console.log("ATTRIBUTES ", attributes);
console.log("FAMILIES ", families);
 
  mostrarPagina();
  autocompletarfamilies();
}

function mostrarPagina() {

    let atributosFiltrados = attributes;

    if (filtroFamilia) {
        atributosFiltrados = atributosFiltrados.filter(
            attr => String(attr.family_id) === String(filtroFamilia)
        );
    }

    const cos = document.getElementById("cuerpoTabla");
    if (!cos) return;
    cos.textContent = "";

    if (atributosFiltrados.length === 0) {
        const tr = document.createElement("tr");
        const td = document.createElement("td");
        td.setAttribute("colspan", "4");

        td.appendChild(document.createTextNode("No hi ha característiques registrades."));
        tr.appendChild(td);
        cos.appendChild(tr);

        crearPaginacion(0, 0);
        return;
    }

    const inicio = (paginaActual - 1) * ITEMS_PAGINA;
    const fin = inicio + ITEMS_PAGINA;

    let paginaAtributos = atributosFiltrados.slice(inicio, fin);

    paginaAtributos.forEach(caracteristica => {

        let familia = families.find(f => Number(f.id) === Number(caracteristica.family_id));
        let nomFamilia = familia ? familia.name : "Sense família";

        let tr = document.createElement("tr");

        let tdId = document.createElement("td");
        tdId.appendChild(document.createTextNode(caracteristica.id));
       tdId.dataset.cell = "Id :  ";

        let tdNom = document.createElement("td");
        tdNom.appendChild(document.createTextNode(caracteristica.name));
           tdNom.dataset.cell = "Nom :  ";

        let tdFam = document.createElement("td");
        tdFam.appendChild(document.createTextNode(nomFamilia));
        tdFam.dataset.cell = "Familia :  ";
        let tdAcc = document.createElement("td");
        tdAcc.dataset.cell = "Accions :  ";

      let btnEditar = document.createElement("a");
        btnEditar.href = "./AtributsModificar.html?id=" + encodeURIComponent(caracteristica.id);
        btnEditar.className = "icon-editar";
        let iconoEditar = document.createElement("i");
        iconoEditar.className = "fa-solid fa-pen-to-square";
        btnEditar.appendChild(iconoEditar);

      let btnEliminar = document.createElement("a");
        btnEliminar.href = "#";
        btnEliminar.className = "icon-borrar";
        let iconoEliminar = document.createElement("i");
        iconoEliminar.className = "fa-solid fa-trash";
        btnEliminar.appendChild(iconoEliminar);
        btnEliminar.addEventListener("click", async (e) => {
            e.preventDefault();
            await eliminarproductattribut(caracteristica, tr);
        });

        tdAcc.appendChild(btnEditar);
        tdAcc.appendChild(btnEliminar);

        tr.appendChild(tdId);
        tr.appendChild(tdNom);
        tr.appendChild(tdFam);
        tr.appendChild(tdAcc);

        cos.appendChild(tr);
    });

    crearPaginacion(atributosFiltrados.length, ITEMS_PAGINA);
}


async function eliminarproductattribut(caracteristica, fila) {
  if (!confirm("Segur que vols eliminar aquesta característica?")) return;

  try {
    await deleteData(url, "Attribute", caracteristica.id);

    fila.remove();

    attributes = attributes.filter(attr => attr.id !== caracteristica.id);
   mostrarPagina();

  } catch (error) {
    console.log("Error eliminando característica:", error);
  }
}

function crearPaginacion(totalItems, itemsPagina) {
    const contenedorNumeros = document.getElementById("pagines");
    contenedorNumeros.innerHTML = ""; 

    const btnAnterior = document.getElementById("anterior");
    const btnPosterior = document.getElementById("posterior");

    const totalPaginas = Math.ceil(totalItems / itemsPagina);

    if (totalPaginas <= 1) {
        btnAnterior.classList.add("no_mostrar");
        btnPosterior.classList.add("no_mostrar");
        return;
    }

    btnAnterior.classList.toggle("no_mostrar", paginaActual === 1);
    btnPosterior.classList.toggle("no_mostrar", paginaActual === totalPaginas);

    btnAnterior.onclick = () => {
        if (paginaActual > 1) {
            paginaActual--;
            mostrarPagina();
        }
    };
    btnPosterior.onclick = () => {
        if (paginaActual < totalPaginas) {
            paginaActual++;
            mostrarPagina();
        }
    };

    let inicio = paginaActual;
    let fin = paginaActual + 3;

    if (fin > totalPaginas) {
        fin = totalPaginas;
        inicio = Math.max(1, fin - 3); 
    }

    for (let i = inicio; i <= fin; i++) {
        const btn = document.createElement("button");
        btn.textContent = i;
        if (i === paginaActual) btn.classList.add("paginaSeleccionada");

        btn.onclick = () => {
            paginaActual = i;
            mostrarPagina();
        };

        contenedorNumeros.appendChild(btn);
    }
}


function autocompletarfamilies() {

    $("#familia").on("input", function () {
        let texto = $(this).val().toLowerCase();
        let lista = $("#sugerenciasFamilia");
        lista.empty();

        if (texto.length === 0) {
            lista.hide();
            return;
        }

        let resultados = families.filter(f =>
            f.name.toLowerCase().includes(texto)
        );

        if (resultados.length === 0) {
            lista.hide();
            return;
        }

        resultados.forEach(f => {
            let item = $("<div class='autocomplete-item'></div>");
            item.text(f.name);

            item.on("click", function () {
                $("#familia").val(f.name);  
                $("#familia").data("id", f.id); 
                lista.hide();
            });

            lista.append(item);
        });

        lista.show();
    });

    $(document).on("click", function (e) {
        if (!$(e.target).closest("#familia").length) {
            $("#sugerenciasFamilia").hide();
        }
    });
}
function aplicarFiltroFamilia() {
    let id = $("#familia").data("id");  

    filtroFamilia = id ? id : "";      
 paginaActual = 1; 
    mostrarPagina();
}

function limpiarFiltroFamilia() {
    $("#familia").val("");       
    $("#familia").data("id", ""); 
    filtroFamilia = "";        

    mostrarPagina();           
}



