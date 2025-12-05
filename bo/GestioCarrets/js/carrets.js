document.addEventListener("DOMContentLoaded", main);

async function main() {
    thereIsUser('../Login.html')

    await mostrarInfoCliente();
    await mostrarCarret();

    // Botó finalitzar comanda
    const btnFinalitzar = document.getElementById("btnFinalitzar");
    if (btnFinalitzar) {
        btnFinalitzar.addEventListener("click", async () => {
            await finalitzarComanda();
        });
    }

    // Botons "Seguir comprant"
    const btnsSeguirComprant = document.querySelectorAll("#btnSeguirComprant");
    btnsSeguirComprant.forEach(btn => {
        btn.addEventListener("click", () => {
            window.location.href = 'listarproductes.html';
        });
    });

    // Botó Login 
    const btnLogin = document.querySelector('button[data-action="login"]');
    if (btnLogin) {
        btnLogin.addEventListener("click", mostrarFormularioLogin);
    }

    // Botó Tancar sessió
    const btnTancarSessio = document.querySelector('button[data-action="logout"]');
    if (btnTancarSessio) {
        btnTancarSessio.addEventListener("click", cerrarSesion);
    }

    // Actualitzar visibilitat dels botons segons l'estat de sessió
    actualitzarBotonsNav();
}

// ====================================================================
// SESSIÓ I LOGIN
// ====================================================================

function obtenerUser() {
    const user = localStorage.getItem("currentUser");
    if (!user) return null;
    return JSON.parse(user);
}

function obtenerOCrearCartId() {
    let cartId = localStorage.getItem('cartId');
    if (!cartId) {
        cartId = crypto.randomUUID();
        localStorage.setItem('cartId', cartId);
    }
    return cartId;
}

async function obtenerOCrearCart() {
    const sessionId = obtenerOCrearCartId();
    const user = obtenerUser();

    let carts = await getData(url, "Cart");
    if (!Array.isArray(carts)) carts = [carts];
    let cart = carts.find(c => c.session_id === sessionId);

    if (cart) {
        if (user && (!cart.User_agent || cart.User_agent.id !== user.id)) {
            cart = await updateId(url, "Cart", cart.id, {
                User_agent: { id: user.id }
            });
        }
        return cart;
    }

    const nou = {
        session_id: sessionId,
        total_amount: 0,
        date: new Date().toISOString()
    };

    if (user) nou.User_agent = { id: user.id };

    return await postData(url, "Cart", nou);
}

// ====================================================================
// FUNCIONS DE NAVEGACIÓ/LOGIN
// ====================================================================

function mostrarFormularioLogin() {
    // Redirigir a la pàgina de login
    window.location.href = '../Login.html';
}

function cerrarSesion() {
    if (confirm("Vols tancar sessió?")) {
        // Esborrar l'usuari actiu del localStorage
        localStorage.removeItem("currentUser");
        
        // Missatge de confirmació
        showModal("Sessió tancada correctament", () => {
            // Recarregar la pàgina per actualitzar la informació
            window.location.reload();
        });
    }
}

function actualitzarBotonsNav() {
    const user = obtenerUser();
    const btnLogin = document.querySelector('button[data-action="login"]');
    const btnLogout = document.querySelector('button[data-action="logout"]');

    if (user) {
        // Hi ha usuari logat
        if (btnLogin) btnLogin.style.display = 'none';
        if (btnLogout) btnLogout.style.display = 'inline-block';
    } else {
        // No hi ha usuari logat
        if (btnLogin) btnLogin.style.display = 'inline-block';
        if (btnLogout) btnLogout.style.display = 'none';
    }
}

async function mostrarInfoCliente() {
    const cont = document.getElementById("infoClient");
    while (cont.firstChild) {
        cont.removeChild(cont.firstChild);
    }

    const user = obtenerUser();
    const cartId = obtenerOCrearCartId();

    const box = document.createElement("div");
    box.style.cssText = "padding:10px;background:#f0f0f0;border-radius:5px;margin-bottom:20px;";

    const h3 = document.createElement("h3");
    
    if (user) {
        h3.textContent = "Informació del client";
        box.appendChild(h3);

        const pNom = document.createElement("p");
        const strongNom = document.createElement("strong");
        strongNom.textContent = "Nom: ";
        pNom.appendChild(strongNom);
        pNom.appendChild(document.createTextNode(`${user.name} ${user.surname}`));
        box.appendChild(pNom);

        const pEmail = document.createElement("p");
        const strongEmail = document.createElement("strong");
        strongEmail.textContent = "Email: ";
        pEmail.appendChild(strongEmail);
        pEmail.appendChild(document.createTextNode(user.email));
        box.appendChild(pEmail);

        const pTelefon = document.createElement("p");
        const strongTelefon = document.createElement("strong");
        strongTelefon.textContent = "Telèfon: ";
        pTelefon.appendChild(strongTelefon);
        pTelefon.appendChild(document.createTextNode(user.phone));
        box.appendChild(pTelefon);

        const pAdreca = document.createElement("p");
        const strongAdreca = document.createElement("strong");
        strongAdreca.textContent = "Adreça: ";
        pAdreca.appendChild(strongAdreca);
        pAdreca.appendChild(document.createTextNode(`${user.address}, ${user.cp}`));
        box.appendChild(pAdreca);
    } else {
        box.style.background = "#fff3cd";
        h3.textContent = "Sessió anònima";
        box.appendChild(h3);

        const pId = document.createElement("p");
        const strongId = document.createElement("strong");
        strongId.textContent = "ID Carret: ";
        pId.appendChild(strongId);
        pId.appendChild(document.createTextNode(cartId));
        box.appendChild(pId);

        const pEm = document.createElement("p");
        const em = document.createElement("em");
        em.textContent = "Per a guardar les comandes, inicia sessió.";
        pEm.appendChild(em);
        box.appendChild(pEm);
    }

    cont.appendChild(box);
}


// ====================================================================
// MOSTRAR CARRET
// ====================================================================

async function mostrarCarret() {
    const cart = await obtenerOCrearCart();
    if (!cart) return;

    let detalls = await getData(url, "Cartdetail");
    if (!Array.isArray(detalls)) detalls = [detalls];
    detalls = detalls.filter(d => d.Cart?.id === cart.id);

    let productes = await getData(url, "Product");
    let imatges = await getData(url, "Productimage");

    const divBuit = document.getElementById("carretBuit");
    const divContent = document.getElementById("contingutCarret");
    const elements = document.getElementById("elementsCarret");
    const totalSpan = document.getElementById("total");

    if (detalls.length === 0) {
        divBuit.style.display = "block";
        divContent.style.display = "none";
        return;
    }

    divBuit.style.display = "none";
    divContent.style.display = "block";
    while (elements.firstChild) {
        elements.removeChild(elements.firstChild);
    }

    let total = 0;

    detalls.forEach(d => {
        const prod = productes.find(p => p.id === d.Product.id);
        const img = imatges.find(i => i.product_id === prod.id);

        total += d.price * d.quantity;

        const div = document.createElement("div");
        div.className = "item-carret";
        div.style.cssText = `
            display:flex;align-items:center;gap:15px;
            border:1px solid #ccc;padding:10px;margin-bottom:10px;
            border-radius:5px;
        `;

        // Imatge
        const imgEl = document.createElement("img");
        imgEl.src = img?.url ?? "https://freesvg.org/img/Simple-Image-Not-Found-Icon.png";
        imgEl.width = 80;
        imgEl.height = 80;
        imgEl.style.objectFit = "cover";
        div.appendChild(imgEl);

        // Informació del producte
        const divInfo = document.createElement("div");
        divInfo.style.flex = "1";

        const pNom = document.createElement("p");
        const strongNom = document.createElement("strong");
        strongNom.textContent = prod.name;
        pNom.appendChild(strongNom);
        divInfo.appendChild(pNom);

        const pPreu = document.createElement("p");
        pPreu.textContent = `Preu: ${d.price.toFixed(2)} €`;
        divInfo.appendChild(pPreu);

        div.appendChild(divInfo);

        // Controls de quantitat
        const divControls = document.createElement("div");
        divControls.style.cssText = "display:flex;align-items:center;gap:10px;";

        const btnRestar = document.createElement("button");
        btnRestar.className = "btnRestar";
        btnRestar.textContent = "-";
        btnRestar.addEventListener("click", async () => {
            if (d.quantity > 1) {
                await updateId(url, "Cartdetail", d.id, {
                    quantity: d.quantity - 1
                });
            } else {
                await deleteData(url, "Cartdetail", d.id);
            }
            await mostrarCarret();
        });
        divControls.appendChild(btnRestar);

        const spanQuantitat = document.createElement("span");
        const strongQuantitat = document.createElement("strong");
        strongQuantitat.textContent = d.quantity;
        spanQuantitat.appendChild(strongQuantitat);
        divControls.appendChild(spanQuantitat);

        const btnSumar = document.createElement("button");
        btnSumar.className = "btnSumar";
        btnSumar.textContent = "+";
        btnSumar.addEventListener("click", async () => {
            await updateId(url, "Cartdetail", d.id, {
                quantity: d.quantity + 1
            });
            await mostrarCarret();
        });
        divControls.appendChild(btnSumar);

        div.appendChild(divControls);

        // Preu total
        const spanTotal = document.createElement("span");
        spanTotal.style.cssText = "min-width:80px;text-align:right;font-weight:bold;";
        spanTotal.textContent = `${(d.price * d.quantity).toFixed(2)} €`;
        div.appendChild(spanTotal);

        // Botó eliminar
        const btnEliminar = document.createElement("button");
        btnEliminar.className = "btnEliminar";
        btnEliminar.style.cssText = "background:#dc3545;color:white;border:none;padding:5px 10px;border-radius:5px;";
        btnEliminar.textContent = "✖";
        btnEliminar.addEventListener("click", async () => {
            await deleteData(url, "Cartdetail", d.id);
            await mostrarCarret();
        });
        div.appendChild(btnEliminar);

        elements.appendChild(div);
    });

    await updateId(url, "Cart", cart.id, { total_amount: total });

    totalSpan.textContent = total.toFixed(2) + " €";
}


// ====================================================================
// FINALITZAR COMANDA
// ====================================================================

async function finalitzarComanda() {
    const user = obtenerUser();
    if (!user) {
        showModal("Has d'iniciar sessió per finalitzar la compra.");
        return;
    }

    const cart = await obtenerOCrearCart();
    if (!cart) return;

    showModal("Compra finalitzada correctament!", () => {
        window.location.href = 'finalitzar.html';
    });
}


// ====================================================================
// MODAL
// ====================================================================

function showModal(message, onClose = null) {
    let modalOverlay = document.getElementById('modalOverlay');
    if (!modalOverlay) {
        modalOverlay = document.createElement('div');
        modalOverlay.id = 'modalOverlay';
        modalOverlay.className = 'modal-overlay';
        document.body.appendChild(modalOverlay);
    }

    const modalContent = document.createElement('div');
    modalContent.className = 'modal';

    const messageP = document.createElement('p');
    messageP.className = 'modal-message';
    messageP.textContent = message;
    modalContent.appendChild(messageP);

    const closeButton = document.createElement('button');
    closeButton.className = 'modal-button';
    closeButton.textContent = 'Acceptar';
    closeButton.addEventListener("click", () => {
        modalOverlay.style.display = 'none';
        if (onClose) onClose();
    });
    modalContent.appendChild(closeButton);

    while (modalOverlay.firstChild) {
        modalOverlay.removeChild(modalOverlay.firstChild);
    }
    modalOverlay.appendChild(modalContent);
    modalOverlay.style.display = 'flex';
}