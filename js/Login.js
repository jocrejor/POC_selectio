document.addEventListener("DOMContentLoaded", main);

let clients = [];        
let clientActiu = null;  

async function main() {  
  await carregaClients();  
  comprovarSessio();

  const formulari = document.getElementById("formLogin");
  formulari.addEventListener("submit", validar, false);
}


//--------------------------------------------------------------------------------------------------------------------------------------------------------------------
// CARREGA CLIENTS I COMPROVA SESSIÓ
//--------------------------------------------------------------------------------------------------------------------------------------------------------------------

async function carregaClients() {
 clients = await getData(url, "Client");
}

// Guardem el client Actiu al localstorage
function comprovarSessio() {
  clientActiu = JSON.parse(localStorage.getItem("currentUser"));
  if (clientActiu) {
    window.location.href = "./AreaPersonal/index.html";
  }
}



//--------------------------------------------------------------------------------------------------------------------------------------------------------------------
// VALIDACIONS
//--------------------------------------------------------------------------------------------------------------------------------------------------------------------

// Validem l'usuari
function validarUser() {
  let element = document.getElementById("login_user");

  if (!element.checkValidity()) {
    if (element.validity.valueMissing) {
      error(element, "Has d'introduïr un usuari (email)");
    } else if (element.validity.typeMismatch) {
      error(element, "El format del email no és vàlid");
    }
    return false;
  }
  return true;
}


// Validem la contrasenya
function validarPass() {
  let element = document.getElementById("login_pass");

  if (!element.checkValidity()) {
    if (element.validity.valueMissing) {
      error(element, "Has d'introduïr una contrasenya");
    } else if (element.validity.tooShort) {
      error(element, "La contrasenya ha de tindre almenys 5 números");
    }
    return false;
  }
  return true;
}


// Validem el login
function validarLogin() {
  const emailInput = document.getElementById("login_user").value.trim();
  const passwordInput = document.getElementById("login_pass").value.trim();

  let clientTrobat = clients.find(
    (c) => c.email === emailInput && c.password === passwordInput
  );

  if (clientTrobat) {
    localStorage.setItem("currentUser", JSON.stringify(clientTrobat));
    window.location.href = "./Logout.html";
  } else {
    error(document.getElementById("login_user"), "Usuari o contrasenya incorrectes");
  }
}



function validar(e) {
  e.preventDefault(); 
  esborrarError();

  // Comprovem que els camps siguen vàlids
  if (!validarUser() || !validarPass()) {
    return false;
  }

  // Si els camps són vàlids comprovem les credencials
  const emailInput = document.getElementById("login_user").value.trim();
  const passwordInput = document.getElementById("login_pass").value.trim();

  let clientTrobat = null;

  for (let i = 0; i < clients.length; i++) {
    const c = clients[i];

    if (c.email === emailInput && c.password === passwordInput) {
      clientTrobat = c;
      break; 
    }
  }

  if (!clientTrobat) {
    error(document.getElementById("login_user"), "Usuari o contrasenya incorrectes");
    return false;
  }
  
    localStorage.setItem("currentUser", JSON.stringify(clientTrobat));
    window.location.href = "./AreaPersonal/index.html";

    return true;

  }


//--------------------------------------------------------------------------------------------------------------------------------------------------------------------
// FUNCIONS AUXILIARS
//--------------------------------------------------------------------------------------------------------------------------------------------------------------------

function error(element, missatge) {
  let miss = document.createTextNode(missatge);
  document.getElementById("missatgeError").appendChild(miss);
  element.classList.add("error");
  element.focus();
}


function esborrarError() {
  document.getElementById("missatgeError").textContent = "";
  let formulari = document.forms[0];
  for (let i = 0; i < formulari.elements.length; i++) {
    formulari.elements[i].classList.remove("error");
  }
}