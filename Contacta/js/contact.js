// ---------------------------------------------
// CONFIGURACIÓ
// ---------------------------------------------
const API_URL = url; 
let dadesContactes = []; 
let indexEdicio = null;

// ---------------------------------------------
// GENERAR NUEVO ID SECUENCIAL
// ---------------------------------------------
function generarNuevoId() {
  if (dadesContactes.length === 0) {
    return "1"; // Primer ID
  }
  
  // Convertir todos los IDs a número para obtener el máximo
  const maxId = Math.max(...dadesContactes.map(contacte => parseInt(contacte.id)));
  return (maxId + 1).toString(); // ID como string
}


// ---------------------------------------------
// INICI
// ---------------------------------------------
document.addEventListener("DOMContentLoaded", principal);

async function principal() {
  await carregarContactes();
  configurarFormulari();
}

// ---------------------------------------------
// CARREGAR CONTACTES DE L'API
// ---------------------------------------------
async function carregarContactes() {
  try {
    const resposta = await getData(API_URL, "Contact");

    // Solució a la doble matriu [[...]]
    dadesContactes = Array.isArray(resposta[0]) ? resposta[0] : resposta;

    // Ordenar por ID para asegurar la secuencia correcta
    dadesContactes.sort((a, b) => parseInt(a.id) - parseInt(b.id));

    //mostrarContactes();
  } catch (e) {
    console.error("Error carregant contactes:", e);
    alert("No s'han pogut carregar els contactes.");
  }
}

// ---------------------------------------------
// MOSTRAR CONTACTES
// ---------------------------------------------
function mostrarContactes() {
  const llista = document.getElementById("contactList");
  
  // Netejar la llista sense innerHTML
  while (llista.firstChild) {
    llista.removeChild(llista.firstChild);
  }

  if (dadesContactes.length === 0) {
    const p = document.createElement("p");
    p.appendChild(document.createTextNode("No hi ha contactes guardats."));
    llista.appendChild(p);
    return;
  }

  dadesContactes.forEach((c, i) => {
    const div = document.createElement("div");
    div.classList.add("item-contacte-llista");

    // Crear capsalera
    const capsalera = document.createElement("div");
    capsalera.classList.add("capsalera-item-contacte");

    // Crear h3 amb nom i ID
    const h3 = document.createElement("h3");
    h3.appendChild(document.createTextNode(`${c.name} (ID: ${c.id})`));
    capsalera.appendChild(h3);

    // Crear div d'accions
    const accions = document.createElement("div");
    accions.classList.add("accions-contacte-llista");

    // Botó editar
    const botoEditar = document.createElement("button");
    botoEditar.appendChild(document.createTextNode("Editar"));
    botoEditar.onclick = () => editarContacte(i);
    accions.appendChild(botoEditar);

    // Botó eliminar
    const botoEliminar = document.createElement("button");
    botoEliminar.appendChild(document.createTextNode("Eliminar"));
    botoEliminar.onclick = () => eliminarContacte(i);
    accions.appendChild(botoEliminar);

    capsalera.appendChild(accions);
    div.appendChild(capsalera);

    // Crear paràgrafs amb informació
    const pTel = document.createElement("p");
    const strongTel = document.createElement("strong");
    strongTel.appendChild(document.createTextNode("Tel:"));
    pTel.appendChild(strongTel);
    pTel.appendChild(document.createTextNode(` ${c.phone}`));
    div.appendChild(pTel);

    const pEmail = document.createElement("p");
    const strongEmail = document.createElement("strong");
    strongEmail.appendChild(document.createTextNode("Email:"));
    pEmail.appendChild(strongEmail);
    pEmail.appendChild(document.createTextNode(` ${c.email}`));
    div.appendChild(pEmail);

    const pMissatge = document.createElement("p");
    const strongMissatge = document.createElement("strong");
    strongMissatge.appendChild(document.createTextNode("Missatge:"));
    pMissatge.appendChild(strongMissatge);
    pMissatge.appendChild(document.createTextNode(` ${c.subject}`));
    div.appendChild(pMissatge);

    const pData = document.createElement("p");
    const strongData = document.createElement("strong");
    strongData.appendChild(document.createTextNode("Data:"));
    pData.appendChild(strongData);
    pData.appendChild(document.createTextNode(` ${c.date}`));
    div.appendChild(pData);

    llista.appendChild(div);
  });
}

// ---------------------------------------------
// CONFIGURAR FORMULARI
// ---------------------------------------------
function configurarFormulari() {
  const formulari = document.getElementById("contactForm");
  const botoCancelar = document.getElementById("cancelEdit");

  formulari.addEventListener("submit", async (e) => {
    e.preventDefault();
    await guardarContacte();
  });

  botoCancelar.addEventListener("click", netejarFormulari);
}

// ---------------------------------------------
// GUARDAR CONTACTE (AFEGIR O EDITAR)
// ---------------------------------------------
async function guardarContacte() {
  const contacte = {
    name: document.getElementById("name").value,
    phone: document.getElementById("phone").value,
    email: document.getElementById("email").value,
    subject: document.getElementById("subject").value,
    date: document.getElementById("date").value,
  };

  try {
    if (indexEdicio === null) {
      await afegirContacte(contacte);
      alert("Contacte afegit correctament.");
    } else {
      // Para edición, mantener el ID existente
      contacte.id = dadesContactes[indexEdicio].id;
      await actualitzarContacte(indexEdicio, contacte);
      alert("Contacte actualitzat.");
    }

    await carregarContactes();
    netejarFormulari();
  } catch (e) {
    console.error(e);
    alert("Error en guardar el contacte.");
  }
}

// ---------------------------------------------
// AFEGIR CONTACTE (POST)
// ---------------------------------------------
async function afegirContacte(contacte) {
  // Generar nuevo ID secuencial antes de enviar
  contacte.id = generarNuevoId();
  console.log("Afegint contacte amb ID:", contacte.id);
  return await postData(API_URL, "Contact", contacte);
}

// ---------------------------------------------
// ACTUALITZAR CONTACTE (PATCH)
// ---------------------------------------------
async function actualitzarContacte(index, contacte) {
  const id = dadesContactes[index].id;
  return await updateId(API_URL, "Contact", id, contacte);
}

// ---------------------------------------------
// ELIMINAR CONTACTE (DELETE)
// ---------------------------------------------
async function eliminarContacte(index) {
  if (!confirm("Segur que vols eliminar este contacte?")) return;

  const id = dadesContactes[index].id;
  await deleteData(API_URL, "Contact", id);

  await carregarContactes();
}

// ---------------------------------------------
// EDITAR CONTACTE
// ---------------------------------------------
function editarContacte(index) {
  const c = dadesContactes[index];
  indexEdicio = index;

  document.getElementById("name").value = c.name;
  document.getElementById("phone").value = c.phone;
  document.getElementById("email").value = c.email;
  document.getElementById("subject").value = c.subject;
  document.getElementById("date").value = c.date;

  document.getElementById("cancelEdit").style.display = "inline-block";
}

// ---------------------------------------------
// NETEJAR FORMULARI
// ---------------------------------------------
function netejarFormulari() {
  indexEdicio = null;
  document.getElementById("contactForm").reset();
  document.getElementById("cancelEdit").style.display = "none";
}