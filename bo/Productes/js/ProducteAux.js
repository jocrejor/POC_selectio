window.onload = iniciar;

let products = [];
let families = [];

async function iniciar() {
  await carregarDades();
  mostrarProductos();
}

async function carregarDades() {

  products = await getData(url, "Product");
  families = await getData(url, "Family");
     families = families.flat().filter(f => f.id);
products = products.flat().filter(f => f.id);
  console.log("Products cargados:", products);
  console.log("Families cargadas:", families);
}

function crearCeldacontingut(texto) {
  const td = document.createElement("td");
  const contenido = document.createTextNode(texto);
  td.appendChild(contenido);
  return td;
}

function mostrarProductos() {
  const tbody = document.getElementById("cuerpoTabla");
  tbody.innerHTML = "";

  const limitacioproductes = products.slice(0, 10);

  limitacioproductes.forEach(prod => {
    const fila = document.createElement("tr");

    fila.appendChild(crearCeldacontingut(prod.name));

    let family = families.find(f => f.id === prod.family_id);
    let categoria = family ? family.name : "Sense família";

    fila.appendChild(crearCeldacontingut(categoria));

    const tdBoton = document.createElement("td");
    const boton = document.createElement("button");
    boton.classList.add("btn", "btn-success", "btn-sm", "fw-bold", "text-uppercase");
    boton.appendChild(document.createTextNode("característiques"));

    boton.addEventListener("click", () => {
   const idProducto = encodeURIComponent(prod.id);
    window.location.href = `./AtributAssignar.html?id=${idProducto}`;
    });

    tdBoton.appendChild(boton);
    fila.appendChild(tdBoton);
    tbody.appendChild(fila);
  });
}
