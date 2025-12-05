//El document està carregat, cridem a la funció principal del main
document.addEventListener("DOMContentLoaded", main);

//  Funcions helpers per API 
async function getData(baseUrl, endpoint) {
    let response = await fetch(`${baseUrl}/${endpoint}`);
    if (!response.ok) throw new Error(`Error carregant ${endpoint}: ${response.status}`);
    return await response.json();
}
// Funció per enviar dades a la API
async function postData(baseUrl, endpoint, data) {
    let response = await fetch(`${baseUrl}/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
    if (!response.ok) {
        let text = await response.text();
        throw new Error(`Error POST ${endpoint}: ${text}`);
    }
    return await response.json();
}
// Funció per actualitzar una entrada existent (PUT)
async function updateId(baseUrl, endpoint, id, data) {
    let response = await fetch(`${baseUrl}/${endpoint}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
    if (!response.ok) {
        let text = await response.text();
        throw new Error(`Error PUT ${endpoint} id ${id}: ${text}`);
    }
    return await response.json();
}
// Funció per eliminar una entrada per id (DELETE)
async function deleteId(baseUrl, endpoint, id) {
    let response = await fetch(`${baseUrl}/${endpoint}/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" }
    });
    if (!response.ok) {
        let text = await response.text();
        throw new Error(`No s'ha pogut eliminar ${endpoint} amb id ${id}: ${text}`);
    }
    return await response.json();
}

//  Funció principal 
async function main() {
    let urlParams = new URLSearchParams(window.location.search);
    let comandaId = urlParams.get("id");

    if (!comandaId) {
        alert("No s'ha seleccionat cap comanda per modificar.");
        window.location.href = "index.html";
        return;
    }

    //  Carregar dades 
    let Order = await getData(url, "Order") || [];
    let Client = await getData(url, "Client") || [];
    let Product = await getData(url, "Product") || [];
    let Orderdetail = await getData(url, "Orderdetail") || [];

    let comanda = Order.find(o => Number(o.id) === Number(comandaId));
    if (!comanda) {
        alert("Comanda no trobada.");
        window.location.href = "index.html";
        return;
    }

    //  Utilitats
    //format de la data dd-mm-yyyy 
    function formatDateISO(d) {
        if (!d) return "";
        let dateObj = new Date(d);
        if (isNaN(dateObj)) return d;

        let dia = String(dateObj.getDate()).padStart(2, '0');
        let mes = String(dateObj.getMonth() + 1).padStart(2, '0');
        let any = dateObj.getFullYear();

        return `${dia}-${mes}-${any}`;
    }

    //Buscar descompte aplicable segons producte
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

    //  Omplir formulari 
    document.getElementById("date").value = formatDateISO(comanda.date || comanda.order_date || comanda.data);
    document.getElementById("payment").value = comanda.payment || comanda.pagament || "";
    document.getElementById("shipping").value = comanda.shipping_amount || comanda.enviament || 0;

    //  Select clients 
    let clientSelect = document.getElementById("client");
    clientSelect.replaceChildren();
    Client.forEach(c => {
        let op = new Option(`${c.name} ${c.surname}`, c.id);
        if (Number(c.id) === Number(comanda.client_id)) op.selected = true;
        clientSelect.appendChild(op);
    });

    //  Crear fila producte 
    function crearFilaProducte(p) {
        let tr = document.createElement("tr");
        tr.className = "product-line";

        // Product select
        let tdProd = document.createElement("td");
        let select = document.createElement("select");
        select.name = "product_id[]";
        select.classList.add("product-select");
        select.required = true;
        select.appendChild(new Option("Selecciona producte...", ""));
        Product.forEach(pr => {
            let op = new Option(pr.name, pr.id);
            if (p && (Number(p.product_id || p.producte) === Number(pr.id))) op.selected = true;
            select.appendChild(op);
        });
        tdProd.appendChild(select);
    tdProd.setAttribute("data-label", "Producte:"); // afegim etiqueta per mòbil
        tr.appendChild(tdProd);

        // Quantitat
        let tdQuant = document.createElement("td");
        let inputQuant = document.createElement("input");
        inputQuant.type = "number";
        inputQuant.name = "quantity[]";
        inputQuant.min = 1;
        inputQuant.required = true;
        inputQuant.value = p && (p.quantity || p.quantitat) ? (p.quantity || p.quantitat) : 1;
        inputQuant.classList.add("product-quant");
        tdQuant.appendChild(inputQuant);
        tdQuant.setAttribute("data-label", "Quantitat:"); // mòbil

        tr.appendChild(tdQuant);

        // Preu unitari
        let tdPreu = document.createElement("td");
        let inputPreu = document.createElement("input");
        inputPreu.type = "number";
        inputPreu.step = "0.01";
        inputPreu.name = "price[]";
        inputPreu.min = 0;
        inputPreu.required = true;
        inputPreu.value = p && (p.price || p.unit_price || p.preu) ? Number(p.price || p.unit_price || p.preu).toFixed(2) : 0;
        inputPreu.classList.add("product-price");
        tdPreu.appendChild(inputPreu);
            tdPreu.setAttribute("data-label", "Preu: "); // mòbil

        tr.appendChild(tdPreu);

        // Descompte
        let tdDesc = document.createElement("td");
        let inputDesc = document.createElement("input");
        inputDesc.type = "number";
        inputDesc.step = "0.01";
        inputDesc.name = "discount[]";
        inputDesc.min = 0;
        inputDesc.readOnly = true;
        let descompteInicial = p && (p.discount || p.descompte) ? Number(p.discount || p.descompte) : buscarDescomptePerProducte(p?.product_id || p?.producte);
        inputDesc.value = descompteInicial.toFixed(2);
        inputDesc.classList.add("product-discount");
        tdDesc.appendChild(inputDesc);
            tdDesc.setAttribute("data-label", "Descompte:"); // mòbil

        tr.appendChild(tdDesc);

        // Preu final
        let tdFinal = document.createElement("td");
        let inputFinal = document.createElement("input");
        inputFinal.type = "number";
        inputFinal.step = "0.01";
        inputFinal.name = "finalPrice[]";
        inputFinal.readOnly = true;
        inputFinal.classList.add("product-final-price");
        tdFinal.appendChild(inputFinal);
            tdFinal.setAttribute("data-label", "Subtotal:"); // mòbil

        tr.appendChild(tdFinal);

        // Botó eliminar
        let tdAcc = document.createElement("td");
        let btn = document.createElement("button");

        btn.innerHTML = '<i class="fa-solid fa-trash" style="color: #931621;"></i>';
        btn.classList.add("btn", "btn-sm");
        btn.style.background = "transparent";
        btn.style.border = "none";

        btn.addEventListener("click", () => eliminarProducte(i));

        tdAcc.appendChild(btn);
        tr.appendChild(tdAcc);

        btn.addEventListener("click", () => {
            tr.remove();
            calcularTotal();
        });
        tdAcc.appendChild(btn);
        tr.appendChild(tdAcc);

        // Recalcular
        function recalcular() {
            let q = parseFloat(inputQuant.value) || 0;
            let pr = parseFloat(inputPreu.value) || 0;
            let d = parseFloat(inputDesc.value) || 0;
            inputFinal.value = (q * pr * (1 - d / 100)).toFixed(2);
            calcularTotal();
        }

        select.addEventListener("change", () => {
            let id = Number(select.value);
            let prod = Product.find(pr => pr.id === id);
            if (!prod) return;
            inputPreu.value = Number(prod.price || 0).toFixed(2);
            inputDesc.value = prod.discount ? Number(prod.discount).toFixed(2) : buscarDescomptePerProducte(id);
            recalcular();
        });

        inputQuant.addEventListener("input", recalcular);
        inputPreu.addEventListener("input", recalcular);

        document.getElementById("productsTable").appendChild(tr);

        if (select.value) select.dispatchEvent(new Event("change"));
    }

    //  Carregar productes existents 
    let llista = Orderdetail.filter(od => Number(od.order_id) === Number(comandaId));
    if (llista.length === 0) {
        crearFilaProducte({});
    } else {
        llista.forEach(p => crearFilaProducte(p));
    }

    //  Afegir producte nou 
    document.getElementById("afegirProducte")?.addEventListener("click", e => {
        e.preventDefault();
        crearFilaProducte({});
    });

    //  Calcular total 
    function calcularTotal() {
        let total = 0;
        document.querySelectorAll(".product-final-price").forEach(f => {
            total += parseFloat(f.value) || 0;
        });
        document.getElementById("totalComanda")?.remove();
        let totalElem = document.createElement("p");
        totalElem.id = "totalComanda";
        totalElem.innerHTML = `<strong class="total-text">Total: ${total.toFixed(2)} €</strong>`;
        document.getElementById("productsTable").parentNode.appendChild(totalElem);
    }

    calcularTotal();

    //  Guardar modificacions 
    document.getElementById("pedidoForm").addEventListener("submit", async e => {
        e.preventDefault();

        let nousProductes = [];
        document.querySelectorAll(".product-line").forEach(tr => {
            let select = tr.querySelector(".product-select");
            let inputQuant = tr.querySelector(".product-quant");
            let inputPreu = tr.querySelector(".product-price");
            let inputDesc = tr.querySelector(".product-discount");

            if (!select.value) return;

            nousProductes.push({
                order_id: Number(comanda.id),
                product_id: Number(select.value),
                quantity: parseFloat(inputQuant.value) || 0,
                unit_price: parseFloat(inputPreu.value) || 0,
                discount: parseFloat(inputDesc.value) || 0
            });
        });

        // Actualitzar camps generals
        comanda.date = document.getElementById("date").value;
        comanda.payment = document.getElementById("payment").value;
        comanda.shipping_amount = parseFloat(document.getElementById("shipping").value) || 0;
        comanda.client_id = Number(document.getElementById("client").value);

        try {
            //  Esborrar detalls antics
            let detallsAntics = Orderdetail.filter(d => Number(d.order_id) === Number(comanda.id));
            for (let d of detallsAntics) {
                await deleteId(url, "Orderdetail", d.id);
            }

            //  Afegir nous detalls
            for (let p of nousProductes) {
                await postData(url, "Orderdetail", p);
            }

            //  Actualitzar la comanda
            await updateId(url, "Order", comanda.id, comanda);

            alert("Comanda actualitzada correctament!");
            window.location.href = "index.html";
        } catch (err) {
            console.error("Error actualitzant la comanda:", err);
            alert("Hi ha hagut un error en actualitzar la comanda.");
        }
    });

    //  Botó tornar 
    document.getElementById("tornar")?.addEventListener("click", e => {
        e.preventDefault();
        window.location.href = "index.html";
    });

}
