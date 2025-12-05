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

async function main(){
    // Obtenim el usuari loguejat desde LocalStorage
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    
    if (!currentUser || !currentUser.id) {
        alert("Has de registrar-te");
        window.location.href = "../Login.html";
        return;
    }
    
    // Carrega el client per l'Id
    client = await getIdData(url, "Client", currentUser.id);
    
    if (client) {
        await carregarLocation();
        carregaDades();
    } else {
        alert("No hi ha clients registrats");
    }

      // Botó modificar 
    document.getElementById("modificar").addEventListener("click", async () => {
        if (!client) {
            alert("No hi ha dades carregades");
            return;
        }

        
        const data = {
            name: document.getElementById("name").value,
            surname: document.getElementById("surname").value,
            taxidtype: document.getElementById("taxidtype_display").value,
            taxid: document.getElementById("taxid").value,
            birth_date: document.getElementById("birth_date").value,
            phone: document.getElementById("phone").value,
            email: document.getElementById("email").value,
            address: document.getElementById("address").value,
            cp: document.getElementById("cp").value,
            country_id: document.getElementById("country_id").value,
            province_id: document.getElementById("province_id").value,
            city_id: document.getElementById("city_id").value
        };

        await updateId(url, "Client", client.id, data);
        window.location.href = "./registreModificar.html";
    });

    /*carregarDadesInicials();*/

    // Botón "Ves a la home"
    document.getElementById("torna").addEventListener("click", () => {
        window.location.href = "../index.html";
    });
}


//--------------------------------------------------------------------------------------------------------------------------------------------------------------------
// CARREGA LOCATION
//--------------------------------------------------------------------------------------------------------------------------------------------------------------------


/*async function carregarDadesInicials () {

  const provinceSelect = document.getElementById("province_id");
  const provinceID = provinceSelect.value;

  const citySelect = document.getElementById("city_id");
  const cityID = citySelect.value;

  let cli = localStorage.getItem("currentUser");
  if (cli) cli = JSON.parse(cli);

  if (provinceID === "") {

    let province = await getData(url, "Province");
    let provincia_guardada = cli.province_id;

    let provinciesFiltrades = province.filter(p => p.id == provincia_guardada);

    if (provinciesFiltrades.length > 0) {
      let prov = provinciesFiltrades[0];

      const option = document.createElement("option");
      option.setAttribute("value", prov.id);

      const textProvince = document.createTextNode(prov.name);
      option.appendChild(textProvince);

      provinceSelect.appendChild(option);
    }
  }

  if (cityID === "") {

    let city = await getData(url, "City");
    let ciutat_guardada = cli.city_id;

    let ciutatsFiltrades = city.filter(c => c.id == ciutat_guardada);

    if (ciutatsFiltrades.length > 0) {
      let c = ciutatsFiltrades[0];

      const option = document.createElement("option");
      option.setAttribute("value", c.id);

      const textCity = document.createTextNode(c.name);
      option.appendChild(textCity);

      citySelect.appendChild(option);
    }
  }
} */


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
// JQUERY
//--------------------------------------------------------------------------------------------------------------------------------------------------------------------


  $( function() {
    $( document ).tooltip();
  } );