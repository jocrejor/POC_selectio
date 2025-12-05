// ====================================================================
// FUNCIONS AUXILIARS - SESSIÓ I CARRET
// ====================================================================

// 1. Crear o obtindre ID de carret via UUID
function obtenerOCrearCartId() {
    let cartId = localStorage.getItem('cartId');
    if (!cartId) {
        cartId = crypto.randomUUID();
        localStorage.setItem('cartId', cartId);
    }
    return cartId;
}

// 2. Obtindre usuari loguejat
function obtenerUserId() {
    const client = localStorage.getItem("currentUser");
    if (!client) return null;
    try {
        return JSON.parse(client).id;
    } catch {
        return null;
    }
}

// ====================================================================
// LOGIN
// ====================================================================

async function login(email, password) {

    const clients = await getData(url, `Client?email=${email}&password=${password}`);

    if (clients && Array.isArray(clients) && clients.length > 0) {
        const client = clients[0];
        localStorage.setItem("currentUser", JSON.stringify(client));
        await vincularCarretUsuari(client.id);
        return true;
    }

    return false;
}

// Vincula el carret al client després de login
async function vincularCarretUsuari(userId) {
    const cartId = obtenerOCrearCartId();
    let carts = await getData(url, "Cart");

    if (!Array.isArray(carts)) carts = [carts];
    let cart = carts.find(c => c.session_id === cartId);

    if (cart) {
        await updateId(url, "Cart", cart.id, {
            User_agent: { id: userId }
        });
    }
}

// ====================================================================
// CREAR O OBTINDRE CARRET
// ====================================================================

async function obtenerOCrearCart() {
    const cartId = obtenerOCrearCartId();
    const userId = obtenerUserId();

    let carts = await getData(url, "Cart");
    if (!carts) carts = [];
    if (!Array.isArray(carts)) carts = [carts];

    // Buscar carret existent per session_id
    let cart = carts.find(c => c.session_id === cartId);

    if (cart) {
        // Actualitzar usuari si cal
        if (userId && (!cart.User_agent || cart.User_agent.id !== userId)) {
            cart = await updateId(url, "Cart", cart.id, {
                User_agent: { id: userId }
            });
        }
        return cart;
    }

    // Crear carret nou
    const nouCart = {
        session_id: cartId,
        date: new Date().toISOString(),
        total_amount: 0
    };

    if (userId) nouCart.User_agent = { id: userId };

    const creat = await postData(url, "Cart", nouCart);
    return creat;
}

// ====================================================================
// ACTUALITZAR TOTAL DEL CARRET
// ====================================================================

async function actualitzarTotalCarret(cartId) {
    let detalls = await getData(url, "Cartdetail");
    if (!detalls) detalls = [];
    if (!Array.isArray(detalls)) detalls = [detalls];

    detalls = detalls.filter(d => d.Cart?.id === cartId);

    const total = Math.round(detalls.reduce((s, d) => s + (d.price * d.quantity), 0) * 100) / 100;

    await updateId(url, "Cart", cartId, {
        total_amount: total
    });
}

// ====================================================================
// ARRANCAR PÀGINA
// ====================================================================
document.addEventListener("DOMContentLoaded", main);

async function main() {
    const products = (await getData(url, "Product"));
    const images = (await getData(url, "Productimage")) ;
    const productSales = (await getData(url, "ProductSale"));
    const sales = (await getData(url, "Sale"));

    mostrarProductes(products, images, productSales, sales);
}

// ====================================================================
// MOSTRAR PRODUCTES
// ====================================================================

function mostrarProductes(productes, imatges, ofertesProductes, ofertes) {
    const container = document.getElementById("productes-container");
    if (!container) {
        console.error("No s'ha trobat el contenidor #productes-container");
        return;
    }

    if (!Array.isArray(productes) || productes.length === 0) {
        const msg = document.createElement("strong");
        msg.textContent = "No hi ha productes";
        container.appendChild(msg);
        return;
    }

    // Netejar container
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }

    productes.forEach(p => {
        const div = document.createElement("div");
        div.className = "producte-item";

        // Imatge
        const imgs = imatges.filter(img => img.product_id === p.id).sort((a, b) => a.order - b.order);
        const imgUrl = imgs[0]?.url ?? "https://freesvg.org/img/Simple-Image-Not-Found-Icon.png";

        const img = document.createElement("img");
        img.src = imgUrl;
        img.width = 120;
        img.height = 120;
        img.style.objectFit = "cover";
        div.appendChild(img);

        const pName = document.createElement("p");
        const strong = document.createElement("strong");
        strong.textContent = p.name;
        pName.appendChild(strong);
        div.appendChild(pName);

        const pDesc = document.createElement("p");
        pDesc.textContent = p.description;
        div.appendChild(pDesc);

        // Oferta
        const now = new Date();
        const saleIds = ofertesProductes.filter(ps => ps.product_id === p.id).map(ps => ps.sale_id);

        const ofertaActiva = ofertes.find(s => {
            const ini = new Date(s.start_date);
            const fin = new Date(s.end_date);
            return saleIds.includes(s.id) && ini <= now && now <= fin;
        });

        let preuFinal = p.price;
        let txtOferta = "Descompte: 0%";

        if (ofertaActiva) {
            preuFinal = p.price * (1 - ofertaActiva.discount_percent / 100);
            txtOferta = `Descompte: ${ofertaActiva.discount_percent}% (${ofertaActiva.description})`;
        }

        const pPrice = document.createElement("p");
        pPrice.textContent = `Preu: ${preuFinal.toFixed(2)} €`;
        pPrice.style = "font-weight:bold;font-size:18px;color:#28a745;";
        div.appendChild(pPrice);

        const pSale = document.createElement("p");
        pSale.textContent = txtOferta;
        pSale.style = "color:#ff3333;";
        div.appendChild(pSale);

        // Botó afegir carret
        const btn = document.createElement("button");
        btn.textContent = "Afegir al carret";
        btn.addEventListener("click", () => afegirAlCarret(p, preuFinal, ofertaActiva));
        div.appendChild(btn);

        container.appendChild(div);
    });
}

// ====================================================================
// AFEGIR AL CARRET
// ====================================================================

async function afegirAlCarret(producte, preuFinal, oferta) {
    const cart = await obtenerOCrearCart();
    if (!cart) {
        showModal("Error al crear/obrir el carret");
        return;
    }

    let detalls = await getData(url, "Cartdetail");
    if (!detalls) detalls = [];
    if (!Array.isArray(detalls)) detalls = [detalls];

    detalls = detalls.filter(d => d.Cart?.id === cart.id);

    // Ja existeix aquest producte?
    const existent = detalls.find(d => d.Product?.id === producte.id);

    if (existent) {
        await updateId(url, "Cartdetail", existent.id, {
            quantity: existent.quantity + 1
        });
    } else {
        await postData(url, "Cartdetail", {
            Cart: { id: cart.id },
            Product: { id: producte.id },
            quantity: 1,
            price: preuFinal,
            discount: oferta ? oferta.discount_percent : 0
        });
    }

    await actualitzarTotalCarret(cart.id);
    
    showModal(`Producte "${producte.name}" afegit al carret!`);
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
    closeButton.addEventListener('click', () => {
        modalOverlay.style.display = 'none'; 
        if (onClose) onClose();
    });
    modalContent.appendChild(closeButton);

    modalOverlay.textContent = ''; 
    modalOverlay.appendChild(modalContent); 
    modalOverlay.style.display = 'flex'; 
}