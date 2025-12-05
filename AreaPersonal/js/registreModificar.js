//--------------------------------------------------------------------------------------------------------------------------------------------------------------------
// VARIABLES GLOBALS
//--------------------------------------------------------------------------------------------------------------------------------------------------------------------

let client = null;
let country = [];
let province = [];
let city = [];

document.addEventListener("DOMContentLoaded", main);


//--------------------------------------------------------------------------------------------------------------------------------------------------------------------
// FUNCIÓ PRINCIPAL
//--------------------------------------------------------------------------------------------------------------------------------------------------------------------

async function main() {
    // Obtenim el usuari loguejat desde LocalStorage
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));

    await carregarLocation();

    // Carreguem client del localStorage
    client = JSON.parse(localStorage.getItem("client") || "null");

    if (!currentUser || !currentUser.id) {
            alert("Has de registrar-te");
            window.location.href = "../Login.html";
            return;
        }

    // Carrega el client per l'Id
    client = await getIdData(url, "Client", currentUser.id);
    
    if (client) {
        carregaDades();
    } else {
        alert("No hi ha clients registrats");
    }

    // Formulari
    const formulari = document.getElementById("formClient");
    formulari.addEventListener("submit", validar, false);

    // Botó torna
    const btnTorna = document.getElementById("torna");
    btnTorna.addEventListener("click", () => {
        window.location.href = "./index.html";
    });
}


//--------------------------------------------------------------------------------------------------------------------------------------------------------------------
// CARREGA DADES DEL FORMULARI
//--------------------------------------------------------------------------------------------------------------------------------------------------------------------

function carregaDades(){
    // Inputs normals
    document.getElementById("id").value = client.id || "";
    document.getElementById("name").value = client.name || "";
    document.getElementById("surname").value = client.surname || "";
    document.getElementById("taxidtype_display").value = client.taxidtype || "";
    document.getElementById("taxid").value = client.taxid || "";
    document.getElementById("birth_date").value = client.birth_date || "";
    document.getElementById("phone").value = client.phone || "";
    document.getElementById("email").value = client.email || "";
    document.getElementById("address").value = client.address || "";
    document.getElementById("cp").value = client.cp || "";

    // Selects
    document.getElementById("country_id").value = client.country_id || "";
    document.getElementById("province_id").value = client.province_id || "";
    document.getElementById("city_id").value = client.city_id || ""; 
}


//--------------------------------------------------------------------------------------------------------------------------------------------------------------------
// GUARDAR CANVIS
//--------------------------------------------------------------------------------------------------------------------------------------------------------------------

async function guardarCanvis() {
    // Creem el usuari amb les dades actualitzades
    const datosActualizados = {
        name: document.getElementById("name").value.trim(),
        surname: document.getElementById("surname").value.trim(),
        taxidtype: document.getElementById("taxidtype").value,
        taxid: document.getElementById("taxid").value.trim(),
        birth_date: document.getElementById("birth_date").value,
        phone: document.getElementById("phone").value.trim(),
        email: document.getElementById("email").value.trim(),
        address: document.getElementById("address").value.trim(),
        cp: document.getElementById("cp").value.trim(),
        country_id: document.getElementById("country_id").value,
        province_id: document.getElementById("province_id").value,
        city_id: document.getElementById("city_id").value,
        password: document.getElementById("password").value
    };

    // Actualitza les dades de la base de dades
    const resultado = await updateId(url, "Client", client.id, datosActualizados);
    
    // Actualizar el client
    client.name = datosActualizados.name;
    client.surname = datosActualizados.surname;
    client.taxidtype = datosActualizados.taxidtype;
    client.taxid = datosActualizados.taxid;
    client.birth_date = datosActualizados.birth_date;
    client.phone = datosActualizados.phone;
    client.email = datosActualizados.email;
    client.address = datosActualizados.address;
    client.cp = datosActualizados.cp;
    client.country_id = datosActualizados.country_id;
    client.province_id = datosActualizados.province_id;
    client.city_id = datosActualizados.city_id;
    client.password = datosActualizados.password;
    
    // Actualizar el localStorage
    localStorage.setItem("currentUser", JSON.stringify(client));
    
    return true;
}

//--------------------------------------------------------------------------------------------------------------------------------------------------------------------
// VALIDACIONS
//--------------------------------------------------------------------------------------------------------------------------------------------------------------------

function validarNom() {
  let element = document.getElementById("name");

  if (!element.checkValidity()) {
    if (element.validity.valueMissing) {
      error(element, "Has d'introduïr un nom");
    }
    if (element.validity.patternMismatch) {
      error(element, "El nom ha de tindre entre 3 i 15 caracters");
    }
    return false;
  }
  return true;
}


function validarCognom() {
  let element = document.getElementById("surname");

  if (!element.checkValidity()) {
    if (element.validity.valueMissing) {
      error(element, "Has d'introduïr un cognom");
    }
    if (element.validity.patternMismatch) {
      error(element, "El cognom ha de tindre entre 3 i 15 caracters");
    }
    return false;
  }
  return true;
}


function validarTaxidType() {
  const element = document.getElementById("taxidtype");

  if (!element.checkValidity()) {
    if (element.validity.valueMissing) {
      error(element, "Has de seleccionar un tipus de document");
    }
    return false;
  }
  return true;
}


function validarTaxid() {
  let element = document.getElementById("taxid");

  if (!element.checkValidity()) {
    if (element.validity.valueMissing) {
      error(element, "Has d'introduïr un número de document vàlid");
    }
    if (element.validity.patternMismatch) {
      error(element, "El format del document no és vàlid");
    }
    return false;
  }
  return true;
}


function validarDataNeixement() {
  let element = document.getElementById("birth_date");
  if (!element.checkValidity()) {
    if (element.validity.valueMissing) {
      error(element, "Deus d'introduïr una data");
    }
    if (element.validity.rangeUnderflow) {
      error(element, "La data mínima ha de ser superior al 01/01/1900.");
    }
    if (element.validity.rangeOverflow) {
      error(element, "La data màxima ha de ser inferior al 01/01/2007");
    }
    return false;
  }
  return true;
}


function validarTelefon() {
  let element = document.getElementById("phone");

  if (!element.checkValidity()) {
    if (element.validity.valueMissing) {
      error(element, "Has d'introduïr un telèfon");
    }
    if (element.validity.patternMismatch) {
      error(element, "El telèfon ha de tindre entre 7 i 20 números");
    }
    return false;
  }
  return true;
}


function validarEmail() {
  let element = document.getElementById("email");

  if (!element.checkValidity()) {
    if (element.validity.valueMissing) {
      error(element, "Has d'introduïr un email");
    } else if (element.validity.typeMismatch) {
      error(element, "El format del email no és vàlid");
    }
    return false;
  }
  return true;
}


function validarAddress() {
  let element = document.getElementById("address");

  if (!element.checkValidity()) {
    if (element.validity.valueMissing) {
      error(element, "Has d'introduïr una adreça");
    }
    if (element.validity.patternMismatch) {
      error(element, "L'adreça ha de tindre un format vàlid");
    }
    return false;
  }
  return true;
}


function validarCp() {
  let element = document.getElementById("cp");

  if (!element.checkValidity()) {
    if (element.validity.valueMissing) {
      error(element, "Has d'introduïr un codi postal");
    }
    if (element.validity.patternMismatch) {
      error(element, "El codi postal no és vàlid");
    }
    return false;
  }
  return true;
}


function validarCountry() {
  const element = document.getElementById("country_id");

  if (!element.checkValidity()) {
    if (element.validity.valueMissing) {
      error(element, "Has de seleccionar un país");
    }
    return false;
  }
  return true;
}


function validarProvince() {
  const element = document.getElementById("province_id");

  if (!element.checkValidity()) {
    if (element.validity.valueMissing) {
      error(element, "Has de seleccionar una província");
    }
    return false;
  }
  return true;
}


function validarCity() {
  const element = document.getElementById("city_id");

  if (!element.checkValidity()) {
    if (element.validity.valueMissing) {
      error(element, "Has de seleccionar una ciutat");
    }
    return false;
  }
  return true;
}


function validarContrasenya() {
  const element = document.getElementById("password");
  const repetirElement = document.getElementById("repetir_password");

  // Validem el primer camp (password)
  if (!element.checkValidity()) {
    if (element.validity.valueMissing) {
      error(element, "Has d'introduir una contrasenya");
    } else if (element.validity.tooShort) {
      error(element, "La contrasenya ha de tenir almenys 6 caràcters");
    } else if (element.validity.patternMismatch) {
      error(element, "Ha de contenir lletra, número i símbol (@$!%*#?&)");
    }
    return false;
  }

  // Validem que s'haja repetit la contrasenya
  if (!repetirElement.checkValidity()) {
    if (repetirElement.validity.valueMissing) {
      error(repetirElement, "Has de repetir la contrasenya");
    }
    return false;
  }

  // Comprovem que coincidixquen
  if (element.value !== repetirElement.value) {
    error(repetirElement, "Les contrasenyes no coincideixen");
    return false;
  }
  return true;
}

//--------------------------------------------------------------------------------------------------------------------------------------------------------------------
// FUNCIÓ PRINCIPAL VALIDAR
//--------------------------------------------------------------------------------------------------------------------------------------------------------------------

async function validar(e) {
    e.preventDefault();
    esborrarError();

    if (
        validarNom() &&
        validarCognom() &&
        validarTaxidType() &&
        validarTaxid() &&
        validarDataNeixement() &&
        validarTelefon() &&
        validarEmail() &&
        validarAddress() &&
        validarCp() &&
        validarCountry() &&
        validarProvince() &&
        validarCity() &&
        validarContrasenya() &&
        confirm("Confirma si vols enviar el formulari")
    ) {
        await guardarCanvis(e);
        window.location = "./index.html";
    } else {
        return false;
    }
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


//--------------------------------------------------------------------------------------------------------------------------------------------------------------------
// SELECTS DE LOCALITZACIÓ
//--------------------------------------------------------------------------------------------------------------------------------------------------------------------

async function carregarLocation() {

  const countrySelect = document.getElementById("country_id");
  const provinceSelect = document.getElementById("province_id");
  const citySelect = document.getElementById("city_id");
  
  // Netejem els selects

  countrySelect.replaceChildren();
  provinceSelect.replaceChildren();
  citySelect.replaceChildren();

  // Creem una opció per defecte
  const optionCountry = document.createElement("option");
  optionCountry.value = "";
  const textCountry = document.createTextNode("--Selecciona un país--");
  optionCountry.appendChild(textCountry);

  // Afegim l'opció al select
  countrySelect.appendChild(optionCountry);

  // Carreguem paísos
  country = await getData(url, "Country");

  country.forEach(c => {
      const option = document.createElement("option");
      option.setAttribute("value", c.id);
      const textCountry = document.createTextNode(c.name);
      option.appendChild(textCountry);
      countrySelect.appendChild(option);
  });


  // Quan triem un país
  countrySelect.addEventListener("change", async () => {
    let countryId = parseInt(countrySelect.value);
    // Esborrar les provincies i les ciutats perque no carreguen
    provinceSelect.replaceChildren();
    citySelect.replaceChildren();


    // Creem una opció per defecte
    const optionProvince = document.createElement("option");
    optionProvince.value = "";
    const textProvince = document.createTextNode("--Selecciona una provincia--");
    optionProvince.appendChild(textProvince);

    // Afegim l'opció al select
    provinceSelect.appendChild(optionProvince);

    // Carreguem les provincies
    province = await getData(url, "Province");

    // Filtra les provincies pel pais seleccionat
    let provinciesFiltrades = province.filter(p => p.country_id == countryId);
    console.log(provinciesFiltrades);
    provinciesFiltrades.forEach(province => {
      const option = document.createElement("option");
      option.setAttribute("value", province.id);
      const textProvince = document.createTextNode(province.name);
      option.appendChild(textProvince);
      provinceSelect.appendChild(option);
    });


    // Quan canvie la província
    provinceSelect.addEventListener("change", async() => {
      let provinceId = parseInt(provinceSelect.value);
      // Esborrem ciutats antigues
      citySelect.replaceChildren();

      // Creem l'opció per defecte
      const optionCity = document.createElement("option");
      optionCity.value = "";
      const textCity = document.createTextNode("--Selecciona una ciutat--");
      optionCity.appendChild(textCity);
      
      //Afegim l'opció al select
      citySelect.appendChild(optionCity);

      // Carreguem les ciutats
      city = await getData (url, "City");

      // Filtrem les ciutats segons la provincia
      let ciutats = city.filter(city => city.province_id == provinceId);
      console.log(ciutats);
      ciutats.forEach(city => {
        const option = document.createElement("option");
        option.setAttribute("value", city.id);
        const textCity = document.createTextNode(city.name);
        option.appendChild(textCity);
        citySelect.appendChild(option);
      });
    });
  })
}


//--------------------------------------------------------------------------------------------------------------------------------------------------------------------
// JQUERY
//--------------------------------------------------------------------------------------------------------------------------------------------------------------------


  $( function() {
    $( document ).tooltip();
  } );