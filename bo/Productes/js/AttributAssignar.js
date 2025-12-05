window.onload = iniciar;

let atributsCreades = [];
let attributes = [];
let products = [];
let productAttributes = [];
let families = [];
let params;
let idProducto;


async function iniciar() {
  await carregarDadesLocal();
  mostrarNomProducte();
  carregarAtributs();
  mostrarAtributsCreades();

  document.getElementById("enviar").addEventListener("click", crearProductattribute);
}

async function carregarDadesLocal() {
  attributes = await getData(url, "Attribute");
  products = await getData(url, "Product");
  families = await getData(url, "Family"); 
  products = products.flat().filter(f => f.id);
    families = families.flat().filter(f => f.id);     
    params = new URLSearchParams(window.location.search)
    idProducto = params.get('id');
  productAttributes = await getData(url, "Productattribute");

}

function mostrarNomProducte() {
  let contenedor = document.getElementById("nomProducte");
  contenedor.textContent = "";

  let id = Number(idProducto);
  let texto = "Cap producte seleccionat";

  if (!Number.isNaN(id) && id) {
    let producto = products?.find(p => Number(p.id) === id);
    texto = producto ? "Producte: " + producto.name : "Cap producte seleccionat";
  }

  contenedor.appendChild(document.createTextNode(texto));
}

function carregarAtributs() {
  const select = document.getElementById("atributo");
  select.textContent = "";

  const productoId = Number(idProducto);

// Crear opcions
  const afegiropcio = (value, text, disabled = false, selected = false) => {
    const opt = document.createElement("option");
    opt.setAttribute("value", value);      
    opt.appendChild(document.createTextNode(text));
    if (disabled) opt.disabled = true;
    if (selected) opt.selected = true;
    select.appendChild(opt);
  };

  if (!productoId) {
    afegiropcio("", "Cap producte seleccionat", true);
    return;
  }

  let producto = products.find(p => parseInt(p.id) === productoId);
  if (!producto) {
    afegiropcio("", "Producte no trobat", true);
    return;
  }

  // Opció inicial
  afegiropcio("", "Selecciona un atribut", true, true);

  const atributosFiltrados = (attributes || []).filter(
    a => parseInt(a.family_id) === parseInt(producto.family_id)
  );

  if (atributosFiltrados.length === 0) {
    afegiropcio("", "No hi ha atributs per a aquesta família", true);
    return;
  }

  atributosFiltrados.forEach(attr => {
    if (attr && attr.name != null) {
      afegiropcio(attr.id, attr.name);
    }
  });
}


function validarAtributo() {
  let element = document.getElementById("atributo");

  if (!element.checkValidity()) {
    error(element, "Has de seleccionar un atribut vàlid.");
    return false;
  }
  return true;
}

function validarValor() {
  let element = document.getElementById("valor");

  if (!element.checkValidity()) {
    if (element.validity.valueMissing) {
      error(element, "Has d'introduir un valor.");
    } else if (element.validity.patternMismatch) {
      error(element, "El valor només pot contenir lletres i números (màxim 255 caràcters).");
    }
    return false;
  }
  return true;
}

function validar(e) {
  esborrarError();

  if (validarAtributo() && validarValor() && confirm("Confirma si vols afegir el Product Attribute?")) {
    return true;
  } else {
    e.preventDefault();
    return false;
  }
}
function validarguardar(e) {
  esborrarError();

  if (validarAtributo() && validarValor() && confirm("Confirma que vols modificar el Product Attribute?")) {
    return true;
  } else {
    e.preventDefault();
    return false;
  }
}

function mostrarAtributsCreades() {
  let cos = document.getElementById("cuerpoTabla");
    let productId = Number(idProducto);
  cos.textContent = "";

 let atributosProducto = productAttributes
    .filter(pa => Number(pa.product_id) === productId && pa.id);

  if ( atributosProducto.length === 0) {
    let fila = document.createElement("tr");
    let celda = document.createElement("td");
    celda.setAttribute("colspan", "2");
    celda.appendChild(document.createTextNode("Encara no has creat cap productattribute."));
    fila.appendChild(celda);
    cos.appendChild(fila);
    return;
  }

  atributosProducto.forEach(proattr => {
    let fila = document.createElement("tr");

    let tdAttr = document.createElement("td");
    let atribut = attributes.find(a => parseInt(a.id) === parseInt(proattr.attribute_id));
    let accions = document.createElement("td");

       let btnEditar = document.createElement("a");
    btnEditar.href = "#";
    btnEditar.className = "icon-editar";
    let iconEditar = document.createElement("i");
    iconEditar.className = "fa-solid fa-pen-to-square"; // Icono editar
    btnEditar.appendChild(iconEditar);

    btnEditar.addEventListener("click", () => {
        cargarParaEditar(proattr);
    });

       let btnEliminar = document.createElement("a");
    btnEliminar.href = "#";
    btnEliminar.className = "icon-borrar";
    let iconBorrar = document.createElement("i");
    iconBorrar.className = "fa-solid fa-trash"; // Icono eliminar
    btnEliminar.appendChild(iconBorrar);

    btnEliminar.addEventListener("click", async () => {
        await eliminarproductattribut(proattr, fila);
    });


accions.dataset.cell = "Accions :";
accions.appendChild(btnEliminar);
  accions.appendChild(btnEditar);
    tdAttr.appendChild(document.createTextNode(atribut ? atribut.name : "Sense atribut"));
     tdAttr.dataset.cell = "Value :";
    fila.appendChild(tdAttr);

    let tdValue = document.createElement("td");

    tdValue.appendChild(document.createTextNode(proattr.value));
      tdValue.dataset.cell = "Value :";
    fila.appendChild(tdValue);
    fila.appendChild(accions);

    cos.appendChild(fila);
  });
}

async function eliminarproductattribut(productattributs, fila) {
  if (!confirm("Segur que vols eliminar aquest productattribut?")) return;

  try {
    await deleteData(url, "ProductAttribute", productattributs.id);

      productAttributes = productAttributes.filter(
      (pa) => pa.id !== productattributs.id
    );


    fila.remove();

  mostrarAtributsCreades();

  } catch (error) {
    console.log("Error eliminando característica:", error);
  }
}

async function crearProductattribute(e) {
  e.preventDefault();
  if (!validar(e)) return;

  let productId = Number(idProducto);
  let attributeId = parseInt(document.getElementById("atributo").value);
  let value = document.getElementById("valor").value.trim();

  let data = {
    product_id: productId,
    attribute_id: attributeId,
    value: value
  };

    console.log("Datos de crear", data);
    await postData(url, "Productattribute", data);
  

  productAttributes = await getData(url, "Productattribute");
  mostrarAtributsCreades();

  document.getElementById("atributo").value = "";
  document.getElementById("valor").value = "";
}

function cargarParaEditar(proattr) {
  document.getElementById("atributo").value = proattr.attribute_id;
  document.getElementById("atributo").disabled = false;
  document.getElementById("valor").value = proattr.value;

  document.getElementById("enviar").style.display = "none";

  let btnGuardar = document.getElementById("guardarCambios");

  if (!btnGuardar) {
    btnGuardar = document.createElement("button");
    btnGuardar.id = "guardarCambios";
    btnGuardar.type = "button";
    btnGuardar.textContent = "Guardar canvis";

    const enviarBtn = document.getElementById("enviar");
    enviarBtn.parentNode.insertBefore(btnGuardar, enviarBtn.nextSibling);
  }

  btnGuardar.onclick = async () => {
    await modificarProductattribute(proattr.id);
  };
}

async function modificarProductattribute(id) {

 if (!validarguardar()) {
    return; 
  }

  let attributeId = parseInt(document.getElementById("atributo").value);
  let value = document.getElementById("valor").value.trim();



  let data = {
    attribute_id: attributeId,
    value: value
  };

  await updateId(url, "ProductAttribute", id, data);

  // Actualizar la lista local
  let index = productAttributes.findIndex(pa => pa.id === id);
  if (index !== -1) {
    productAttributes[index].attribute_id = attributeId;
    productAttributes[index].value = value;
  }

  // Limpiar formulario y restaurar botones
  document.getElementById("atributo").disabled = false;
  document.getElementById("atributo").value = "";
  document.getElementById("valor").value = "";

  let btnGuardar = document.getElementById("guardarCambios");
  if (btnGuardar) btnGuardar.remove();

  document.getElementById("enviar").style.display = "";

  mostrarAtributsCreades();
}


function error(element, missatge) {
  const cont = document.getElementById("missatgeError");
  cont.textContent = missatge;
  element.classList.add("error");
  element.focus();
}

function esborrarError() {
  const missatge = document.getElementById("missatgeError");
  missatge.textContent = "";

  const form = document.forms[0];
  for (let i = 0; i < form.elements.length; i++) {
    form.elements[i].classList.remove("error");
  }
}
