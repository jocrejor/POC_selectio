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

    mostrarContactes();
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
  llista.innerHTML = "";

  if (dadesContactes.length === 0) {
    llista.innerHTML = "<p>No hi ha contactes guardats.</p>";
    return;
  }

  dadesContactes.forEach((c, i) => {
    const div = document.createElement("div");
    div.classList.add("item-contacte-llista");

    div.innerHTML = `
      <div class="capsalera-item-contacte">
        <h3>${c.name} (ID: ${c.id})</h3>
        <div class="accions-contacte-llista">
          <button onclick="editarContacte(${i})">Editar</button>
          <button onclick="eliminarContacte(${i})">Eliminar</button>
        </div>
      </div>

      <p><strong>Tel:</strong> ${c.phone}</p>
      <p><strong>Email:</strong> ${c.email}</p>
      <p><strong>Missatge:</strong> ${c.subject}</p>
      <p><strong>Data:</strong> ${c.date}</p>
    `;

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