let productesActuals = [];

document.addEventListener("DOMContentLoaded", main);

async function main() {
  document.getElementById("pedidoForm").addEventListener("submit", validarFormulari);
  document.getElementById("llista").addEventListener("click", () => location.href = "index.html");
  document.getElementById("productsTable").addEventListener("click", function (e) {
    if (e.target.classList.contains("addProduct")) afegirProducte(e);
  });
  document.querySelectorAll(".addProduct").forEach(btn => btn.style.cursor = "pointer");

  // Obtenir dades del servidor
  Order = await getData(url, "Order");
  Orderdetail = await getData(url, "Orderdetail");
  Client = await getData(url, "Client");
  Product = await getData(url, "Product");

  carregarClients();
  carregarProductes();
  configurarAutoPreu();
  configurarCalculPreuFinal();
  inicialitzarData();

  //  CONFIGURACIÓ BOTÓ TANCAR SESSIÓ 
  document.querySelectorAll('.iconaTancarSessio').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (confirm("Vols tancar sessió?")) tancarSessio();
    });
  });
}
function tancarSessio() {
  localStorage.removeItem('usuari');
  window.location.href = '../login.html';
}

//  Carregar clients i productes 
function carregarClients() {
  let select = document.getElementById("client");
  select.replaceChildren();

  let op = new Option("Selecciona un client...", "");
  op.style.color = "black";
  select.appendChild(op);

  // Ordenar alfabèticament
  Client.sort((a, b) => (a.name + a.surname).localeCompare(b.name + b.surname));

  Client.forEach(c => {
    let option = new Option(`${c.name} ${c.surname}`, c.id);
    option.style.color = "black";
    select.appendChild(option);
  });
}

function carregarProductes() {
  document.querySelectorAll(".productSelect").forEach(select => {
    select.replaceChildren();

    let op = new Option("Selecciona un producte...", "");
    op.style.color = "black";
    select.appendChild(op);

    // Ordenar productes alfabèticament
    Product.sort((a, b) => a.name.localeCompare(b.name));

    Product.forEach(p => {
      let option = new Option(p.name, p.id);
      option.style.color = "black";
      select.appendChild(option);
    });
  });
}


//  Auto preu i recalcular 
function configurarAutoPreu() {
  document.querySelectorAll(".productSelect").forEach(select => {
    select.addEventListener("change", function () {
      let fila = this.closest(".product-line");
      let preuInput = fila.querySelector(".price");
      let descInput = fila.querySelector(".discount");
      let finalInput = fila.querySelector(".finalPrice");
      let quantInput = fila.querySelector(".quantity");


      let id = Number(this.value);
      if (!id) {
        preuInput.value = descInput.value = finalInput.value = "";
        return;
      }

      let prod = Product.find(p => Number(p.id) === id);
      if (!prod || typeof prod.price === "undefined") {
        preuInput.value = descInput.value = finalInput.value = "";
        return;
      }

      let descompte = buscarDescomptePerProducte(id);

      preuInput.value = Number(prod.price).toFixed(2);
      descInput.value = descompte.toFixed(2);

      recalcularFila(fila);

      quantInput.addEventListener("input", () => recalcularFila(fila));
    });
  });
}

function recalcularFila(fila) {
  let quant = fila.querySelector(".quantity");
  let preu = fila.querySelector(".price");
  let descompte = fila.querySelector(".discount");
  let final = fila.querySelector(".finalPrice");


  let total = (parseFloat(quant.value) || 0) * (parseFloat(preu.value) || 0) * (1 - (parseFloat(descompte.value) || 0) / 100);
  final.value = total.toFixed(2);
}

function configurarCalculPreuFinal() {
  document.querySelectorAll(".product-line").forEach(fila => {
    let quant = fila.querySelector(".quantity");
    let preu = fila.querySelector(".price");
    let descompte = fila.querySelector(".discount");
    let finalPrice = fila.querySelector(".finalPrice");


    [quant, preu, descompte].forEach(input => {
      input.addEventListener("input", () => recalcularFila(fila));
    });
  });
}

//  Afegir producte 
function afegirProducte(e) {
  esborrarError();
  let fila = e.target.closest(".product-line");

  let productSelect = fila.querySelector(".productSelect");
  let quant = fila.querySelector(".quantity");
  let preu = fila.querySelector(".price");
  let desc = fila.querySelector(".discount");
  let finalPrice = fila.querySelector(".finalPrice");

  if (!productSelect.value) { errorMissatge("Selecciona un producte"); return; }
  if (!quant.value || Number(quant.value) <= 0) { errorMissatge("Quantitat invàlida"); return; }
  if (!preu.value || Number(preu.value) <= 0) { errorMissatge("Preu no definit per al producte"); return; }

  let preuFinal = Number(quant.value) * Number(preu.value) * (1 - Number(desc.value) / 100);
  finalPrice.value = preuFinal.toFixed(2);

  let nou = {
    producte: Number(productSelect.value),
    quantitat: Number(quant.value),
    preu: Number(preu.value),
    descompte: Number(desc.value),
    preuFinal: preuFinal
  };

  productesActuals.push(nou);
  mostrarProductes(productesActuals);

  // Netejar inputs
  quant.value = 1;
  preu.value = desc.value = finalPrice.value = "";
  productSelect.value = "";
}
//MostrarProductes
function mostrarProductes(productes) {
  let cont = document.getElementById("productesAfegits");
  cont.replaceChildren();

  if (!productes || productes.length === 0) return;

  let total = 0;

  productes.forEach((p, i) => {
    let tr = document.createElement("tr");

    let prodObj = Product.find(x => Number(x.id) === Number(p.producte));
    let nom = prodObj ? prodObj.name : "Desconegut";

    // Crea les cel·les
    let valors = [
      { label: "ID:", value: i + 1 },
      { label: "Producte:", value: nom },
      { label: "Quantitat:", value: p.quantitat },
      { label: "Preu:", value: p.preu.toFixed(2) },
      { label: "Descompte:", value: p.descompte.toFixed(2) },
      { label: "Preu Final:", value: p.preuFinal.toFixed(2) }
    ];

    valors.forEach(v => {
      let td = document.createElement("td");
      td.textContent = v.value;
      td.setAttribute("data-label", v.label);
      tr.appendChild(td);
    });


    // Accions
    let tdAcc = document.createElement("td");
    let btn = document.createElement("button");

    btn.innerHTML = '<i class="fa-solid fa-trash" style="color: #931621;"></i>';
    btn.classList.add("btn", "btn-sm");
    btn.style.background = "transparent";
    btn.style.border = "none";

    btn.addEventListener("click", (e) => {
      e.preventDefault();  
      eliminarProducte(i);
    });

    tdAcc.appendChild(btn);

    tr.appendChild(tdAcc);

    cont.appendChild(tr);

    total += p.preuFinal;
  });

  // Fila del Total
  let trTotal = document.createElement("tr");
  trTotal.style.backgroundColor = "var(--color-secundari)";
  trTotal.style.color = "white";

  let tdTotalLabel = document.createElement("td");
  tdTotalLabel.colSpan = 5;
  tdTotalLabel.style.textAlign = "right";
  tdTotalLabel.innerHTML = "<strong>Total:</strong>";
  trTotal.appendChild(tdTotalLabel);

  let tdTotalValor = document.createElement("td");
  tdTotalValor.innerHTML = `<strong>${total.toFixed(2)} €</strong>`;
  trTotal.appendChild(tdTotalValor);

  trTotal.appendChild(document.createElement("td"));

  cont.appendChild(trTotal);
}

// Funció que aplica colors personalitzats al calendari
function aplicarColors() {
  $(".ui-datepicker-month, .ui-datepicker-year, .ui-datepicker th span").css({
    "color": "black"
  });
}

// Funció per inicialitzar el Datepicker en el teu input #date
function inicialitzarData() {
  let dateInput = $("#date");

  dateInput.datepicker({
    dateFormat: "dd-mm-yy",
    dayNamesMin: ["Dg", "Dl", "Dm", "Dc", "Dj", "Dv", "Ds"], // Dies abreviats
    monthNames: ["Gener", "Febrer", "Març", "Abril", "Maig", "Juny",
      "Juliol", "Agost", "Setembre", "Octubre", "Novembre", "Desembre"], // Mesos
    firstDay: 1, // Dilluns primer dia de la setmana
    showAnim: "fadeIn",
    showOn: "focus", // Obrir al fer clic
    // Eliminem changeMonth i changeYear per no mostrar selects
    beforeShow: function (input, inst) {
      setTimeout(() => {
        aplicarColors();
      }, 0);
    },
    onChangeMonthYear: function () {
      setTimeout(() => {
        aplicarColors();
      }, 0);
    }
  });
  // Posa la data actual per defecte
  dateInput.datepicker("setDate", new Date());

}

// Funcions per formatar i parsejar dates dd-mm-yyyy
function formatDataDDMMYYYY(dataString) {
  if (!dataString) return "Error";
  dataString = dataString.split(" ")[0];
  if (dataString.includes("-")) return dataString;
  const [yyyy, mm, dd] = dataString.split("-");
  return `${dd}-${mm}-${yyyy}`;

}

function parseDateDDMMYYYY(dateString) {
  const [dd, mm, yyyy] = dateString.split("-");
  return new Date(`${yyyy}-${mm}-${dd}`);
}

//  Eliminar producte 
/*function eliminarProducte(index) {
  productesActuals.splice(index, 1);
  mostrarProductes(productesActuals);
}*/

// Eliminar producte amb confirmació
/*function eliminarProducte(index) {
    productesActuals.splice(index, 1);
    mostrarProductes(productesActuals);
    // Si l'usuari prem "Cancel·lar", no passa res
}*/
function eliminarProducte(index) {
  const modal = document.getElementById("modalEliminar");
  modal.style.display = "flex"; // Mostra el modal

  const btnConfirm = document.getElementById("btnEliminarConfirm");
  const btnCancel = document.getElementById("btnEliminarCancel");

  // Funció per tancar modal i netejar listeners
  function tancarModal() {
    modal.style.display = "none";
    btnConfirm.removeEventListener("click", confirmar);
    btnCancel.removeEventListener("click", tancarModal);
  }

  // Funció de confirmació que elimina només el producte seleccionat
  function confirmar() {
    productesActuals.splice(index, 1);  // elimina el producte correcte
    mostrarProductes(productesActuals); // actualitza la taula
    tancarModal();
  }

  btnConfirm.addEventListener("click", confirmar);
  btnCancel.addEventListener("click", tancarModal);
}






//  Funcions de validació i errors 
function esborrarError() {
  document.getElementById("missatgeError").replaceChildren();
}

function errorMissatge(msg) {
  let cont = document.getElementById("missatgeError");
  let p = document.createElement("p");
  p.style.color = "red";
  p.textContent = msg;
  cont.appendChild(p);
}

//  Validació de formulari 
function validarFormulari(e) {
  e.preventDefault();  // Evitem recàrrega
  esborrarError();

  let totValid = validarClient() && validarPagament() && validarProductes();

  if (totValid) {
    enviarFormulari();  // Crida la teva funció d’enviament
  }
  // Si hi ha errors, queden mostrats en #missatgeError
  return totValid;
}


//  Enviar formulari a la base de dades 
async function enviarFormulari() {
  esborrarError();

  let clientSelect = document.getElementById("client");
  if (!clientSelect.value) { errorMissatge("Selecciona un client"); return; }

  let dateValue = document.getElementById("date").value;
  let [dd, mm, yyyy] = dateValue.split("-");

  let d = new Date(Date.UTC(yyyy, mm - 1, dd));

  let dataIso = d.toISOString();
  //const dataIso = new Date(dateValue).toISOString();

  crearComanda(clientSelect.value, document.getElementById("payment").value, document.getElementById("shipping").value, dataIso, productesActuals)

  // Netejar formulari i productes en memòria
  productesActuals = [];
  document.forms[0].reset();
  document.getElementById("productesAfegits").replaceChildren();

  let msg = document.createElement("p");
  msg.style.color = "green";
  msg.textContent = "Comanda guardada correctament a la base de dades.";
  document.getElementById("missatgeError").appendChild(msg);


}

//  Funció descompte 
function buscarDescomptePerProducte(productId) {
  let mapeoDescuentos = { 201: [1, 2, 3, 4, 5], 202: [11, 12, 13, 14, 15], 203: [16, 17, 18, 19, 20], 204: [21, 22, 23, 24, 25] };
  for (let [orderId, productIds] of Object.entries(mapeoDescuentos)) {
    if (productIds.includes(Number(productId))) {
      let detalls = Orderdetail.filter(o => Number(o.product_id) === Number(orderId));
      if (detalls.length > 0) return Math.max(...detalls.map(d => Number(d.discount || 0)));
    }
  }
  return 0;
}

function error(element, missatge) {
  let cont = document.getElementById("missatgeError");
  let p = document.createElement("p");
  p.style.color = "red";
  p.style.fontWeight = "bold";
  p.textContent = missatge;
  cont.appendChild(p);

  element.classList.add("error");
  element.focus();
}

function esborrarError() {
  let cont = document.getElementById("missatgeError");
  cont.textContent = "";
  let formulari = document.forms[0];
  for (let i = 0; i < formulari.elements.length; i++) {
    formulari.elements[i].classList.remove("error");
  }
}
function validarClient() {
  let element = document.getElementById("client");
  if (!element.value) {
    error(element, "Has de seleccionar un client.");
    return false;
  }
  return true;
}

function validarPagament() {
  let element = document.getElementById("payment");
  if (!element.value) {
    error(element, "Has de seleccionar un tipus de pagament.");
    return false;
  }
  return true;
}



function validarProductes() {
  if (productesActuals.length === 0) {
    error(document.getElementById("productsTable"), "Has d’afegir almenys un producte.");
    return false;
  }
  return true;
}
