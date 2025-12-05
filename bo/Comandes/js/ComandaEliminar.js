//  Inicialització 
document.addEventListener("DOMContentLoaded", mostrarPedidos);

//  Funcions helpers per API 
async function getData(baseUrl, endpoint) {
    let response = await fetch(`${baseUrl}/${endpoint}`);
    if (!response.ok) throw new Error(`Error carregant ${endpoint}: ${response.status}`);
    return await response.json();
}

async function deleteId(baseUrl, endpoint, id) {
    const response = await fetch(`${baseUrl}/${endpoint}/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" }
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`No s'ha pogut eliminar ${endpoint} amb id ${id}: ${text}`);
    }

    // Comprovar si hi ha cos
    const text = await response.text();
    return text ? JSON.parse(text) : null;
}


//  MOSTRAR COMANDES EN TAULA 
async function mostrarPedidos() {
    //  Recuperar dades
    let pedidos = await getData(url, "Order") || [];
    let clients = await getData(url, "Client") || [];

    // Seleccionar el tbody de la taula
    let taula = document.querySelector("#listaPedidos table tbody");

    if (!taula) {
        //console.error("ERROR: No s'ha trobat el <tbody> dins #listaPedidos table");
        return;
    }

    // Netejar totes les files
    taula.innerHTML = "";

    // Omplir taula
    pedidos.forEach((pedido) => {
        let fila = document.createElement("tr");

        // ID
        let celId = document.createElement("td");
        celId.textContent = pedido.id;

        // Data
        let celData = document.createElement("td");
        celData.textContent = pedido.date || pedido.datetime || "";

        // Client
        let client = clients.find(c => Number(c.id) === Number(pedido.client_id));
        let celClient = document.createElement("td");
        celClient.textContent = client ? `${client.name} ${client.surname}` : "Desconegut";

        // Total
        let celTotal = document.createElement("td");
        celTotal.textContent = `${pedido.total?.toFixed(2) || 0}€`;

        // Accions
        let celAccions = document.createElement("td");
        let botoEliminar = document.createElement("button");
        botoEliminar.textContent = "Eliminar";
        botoEliminar.onclick = () => eliminarPedido(pedido.id);
        celAccions.appendChild(botoEliminar);

        // Afegir cel·les a la fila
        fila.appendChild(celId);
        fila.appendChild(celData);
        fila.appendChild(celClient);
        fila.appendChild(celTotal);
        fila.appendChild(celAccions);

        // Afegir fila a la taula
        taula.appendChild(fila);
    });
}

//  ELIMINAR UNA COMANDA 
async function eliminarPedido(pedidoId) {
    if (!confirm(`Estàs segur/segura que vols eliminar la comanda ID ${pedidoId}?`)) {
        console.log("Eliminació cancel·lada per l'usuari");
        return;
    }

    try {
        // Esborrar detalls de la comanda
        let Orderdetail = await getData(url, "Orderdetail") || [];
        let detallsComanda = Orderdetail.filter(d => Number(d.order_id) === Number(pedidoId));

        for (let d of detallsComanda) {
            await deleteId(url, "Orderdetail", d.id);
        }

        // Esborrar la comanda
        await deleteId(url, "Order", pedidoId);

        alert("Comanda eliminada correctament");

        //  Recarregar taula
        await mostrarPedidos();
    } catch (err) {
        console.error("Error eliminant la comanda:", err);
        alert("Hi ha hagut un error en eliminar la comanda");
    }
}
