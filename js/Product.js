document.addEventListener("DOMContentLoaded", main);

async function main() {
  const llistaFamilies = document.getElementById("llistaFamilies");
  const productList = document.getElementById("productList");
  const paginacioContainer = document.getElementById("paginacio");
  const llistaMigues = document.getElementById("llistaMigues");

  // ==================== ASIDE RESPONSIVE ====================
  const toggleAside = document.getElementById("toggleAside");
  const closeAside = document.getElementById("closeAside");
  const aside = document.querySelector(".aside");

  if (toggleAside) {
    toggleAside.addEventListener("click", () => {
      aside.classList.toggle("open");
    });
  }

  if (closeAside) {
    closeAside.addEventListener("click", () => {
      aside.classList.remove("open");
    });
  }

  // Cerrar aside al hacer clic fuera (en todas las resoluciones)
  document.addEventListener("click", (e) => {
    if (aside.classList.contains("open") && 
        !aside.contains(e.target) && 
        !toggleAside.contains(e.target)) {
      aside.classList.remove("open");
    }
  });

  // ==================== BOTONES D'ORDRE ====================
  const btnOrdenarAsc = document.getElementById("ordenarAsc");
  const btnOrdenarDesc = document.getElementById("ordenarDesc");

  // ==================== BUSCADOR JQUERY ====================
  const buscador = $("#buscador");

  // ==================== Carregar dades de la API ====================
  const FamilyData = (await getData(url, "Family")).flat();
  const ProductData = (await getData(url, "Product")).flat();
  const ProductimageData = await getData(url, "Productimage");
  const SaleData = await getData(url, "Sale");
  const ProductSaleData = await getData(url, "ProductSale");

  // Variables de paginación
  let pagActual = 1;
  const productesPerPagina = 10;
  let productesActuals = ProductData;
  let productesFiltrats = ProductData;

  // ==================== LLEGIR PARÀMETRE DE LA URL ====================
  const urlParams = new URLSearchParams(window.location.search);
  const familiaIdFromUrl = urlParams.get('familia');

  // ==================== FUNCIONS PER LES MIGUES DE PA ====================
  
  function actualitzarMiguesDePa(idFamilia) {
    llistaMigues.replaceChildren();

    const migaInici = crearMigaItem("Inici", "index.html", false);
    llistaMigues.appendChild(migaInici);

    if (!idFamilia || isNaN(idFamilia)) {
      afegirSeparador(llistaMigues);
      const migaTots = crearMigaItem("Tots els equips", null, true);
      llistaMigues.appendChild(migaTots);
      return;
    }

    const camiComplert = obtenirCamiFamilia(idFamilia);
    
    camiComplert.forEach((familia, index) => {
      afegirSeparador(llistaMigues);
      const esUltima = index === camiComplert.length - 1;
      const miga = crearMigaItem(
        familia.name,
        null,
        esUltima
      );
      
      if (!esUltima) {
        miga.style.cursor = "pointer";
        miga.addEventListener("click", () => {
          const familiaLi = document.querySelector(`li[data-id="${familia.id}"]`);
          if (familiaLi) {
            familiaLi.click();
          }
        });
      }
      
      llistaMigues.appendChild(miga);
    });
  }

  function crearMigaItem(text, enllac, esActiva) {
    const li = document.createElement("li");
    li.classList.add("miga-item");
    
    if (esActiva) {
      li.classList.add("activa-miga");
      li.appendChild(document.createTextNode(text));
      li.style.cursor = "default";
    } else if (enllac) {
      const a = document.createElement("a");
      a.href = enllac;
      a.appendChild(document.createTextNode(text));
      a.classList.add("enllaç-miga");
      li.appendChild(a);
    } else {
      const span = document.createElement("span");
      span.appendChild(document.createTextNode(text));
      span.classList.add("enllaç-miga");
      li.appendChild(span);
    }
    
    return li;
  }

  function afegirSeparador(contenidor) {
    const li = document.createElement("li");
    li.classList.add("separador-miga");
    const icon = document.createElement("i");
    icon.className = "fa-solid fa-chevron-right";
    li.appendChild(icon);
    contenidor.appendChild(li);
  }

  function obtenirCamiFamilia(idFamilia) {
    const cami = [];
    let familiaActual = FamilyData.find(f => f.id === idFamilia);
    
    while (familiaActual) {
      cami.unshift(familiaActual);
      familiaActual = FamilyData.find(f => f.id === familiaActual.parent_id);
    }
    
    return cami;
  }

  // ==================== FUNCIÓ PER EXPANDIR PARES ====================
  function expandirParents(idFamilia) {
    const cami = obtenirCamiFamilia(idFamilia);
    
    // Expandir cada nivell del camí
    cami.forEach(familia => {
      const li = document.querySelector(`li[data-id="${familia.id}"]`);
      if (li) {
        const subLlista = li.querySelector("ul.sub-llista");
        if (subLlista) {
          subLlista.classList.remove("ocult");
        }
      }
    });
  }

  // ==================== CREACIO FAMILIES + SUBFAMILIAS ====================
  const opcioTotes = document.createElement("li");
  opcioTotes.appendChild(document.createTextNode("Tots els equips"));
  opcioTotes.classList.add("familia-item", "activa");
  opcioTotes.dataset.id = "";
  llistaFamilies.appendChild(opcioTotes);

  function crearNivell(familiaPare, nivell = 0) {
    const li = document.createElement("li");
    li.dataset.id = familiaPare.id;
    li.classList.add("familia-item");

    const fills = FamilyData.filter(f => f.parent_id === familiaPare.id);

    const textNode = document.createTextNode(" ".repeat(nivell * 2) + familiaPare.name);
    li.appendChild(textNode);

    if (fills.length > 0) {
      const ul = document.createElement("ul");
      ul.classList.add("sub-llista", "ocult");
      li.appendChild(ul);
      fills.forEach(sf => {
        const liFill = crearNivell(sf, nivell + 1);
        ul.appendChild(liFill);
      });
    }

    return li;
  }

  FamilyData.filter(f => f.parent_id === null).forEach(f => {
    const liRoot = crearNivell(f);
    llistaFamilies.appendChild(liRoot);
  });

  // ==================== EVENTO CLICK FAMILIAS ====================
  llistaFamilies.addEventListener("click", e => {
    let li = e.target;

    while (li && li.tagName !== "LI") li = li.parentElement;
    if (!li) return;

    document.querySelectorAll(".familia-item").forEach(item => item.classList.remove("activa"));
    li.classList.add("activa");

    const totesSubllistes = document.querySelectorAll("#llistaFamilies ul.sub-llista");

    totesSubllistes.forEach(ul => {
      if (!ul.contains(li)) {
        ul.classList.add("ocult");
      }
    });

    const sub = li.querySelector("ul");
    if (sub) sub.classList.remove("ocult");

    const idFamilia = parseInt(li.dataset.id);

    if (isNaN(idFamilia)) {
      productesFiltrats = ProductData;
    } else {
      const allIds = getAllFamilyIds(idFamilia);
      productesFiltrats = ProductData.filter(p => allIds.includes(p.family_id));
    }

    const textBusqueda = buscador.val().toLowerCase().trim();
    if (textBusqueda !== "") {
      productesActuals = productesFiltrats.filter(p => 
        p.name.toLowerCase().includes(textBusqueda) ||
        (p.description && p.description.toLowerCase().includes(textBusqueda))
      );
    } else {
      productesActuals = productesFiltrats;
    }

    actualitzarMiguesDePa(idFamilia);

    pagActual = 1;
    mostrarPagina(pagActual, productesActuals);

    const teSubllistat = li.querySelector("ul.sub-llista");
    if (!teSubllistat) {
      aside.classList.remove("open");
    }
  });

  function getAllFamilyIds(familyId) {
    let ids = [familyId];
    const children = FamilyData.filter(f => f.parent_id === familyId);
    children.forEach(child => ids = ids.concat(getAllFamilyIds(child.id)));
    return ids;
  }

  // ==================== FUNCIONS D'ORDRE====================
  btnOrdenarAsc.addEventListener("click", () => {
    productesActuals.sort((a, b) => a.price - b.price);
    pagActual = 1;
    mostrarPagina(pagActual, productesActuals);
  });

  btnOrdenarDesc.addEventListener("click", () => {
    productesActuals.sort((a, b) => b.price - a.price);
    pagActual = 1;
    mostrarPagina(pagActual, productesActuals);
  });

  // ==================== BUSCADOR JQUERY ====================
  buscador.on("input", function() {
    const textBusqueda = $(this).val().toLowerCase().trim();
    
    if (textBusqueda === "") {
      productesActuals = productesFiltrats;
    } else {
      productesActuals = productesFiltrats.filter(p => 
        p.name.toLowerCase().includes(textBusqueda) || 
        (p.description && p.description.toLowerCase().includes(textBusqueda))
      );
    }
    
    pagActual = 1;
    mostrarPagina(pagActual, productesActuals);
  });

  // ==================== ENSENYAR PRODUCTES ====================
  function mostrarPagina(page, productes) {
    const inici = (page - 1) * productesPerPagina;
    const fi = inici + productesPerPagina;
    const productesPagina = productes.slice(inici, fi);
    mostrarProductes(productesPagina);
    mostrarBotonsPaginacio(productes);
  }

  function mostrarProductes(productes) {
    productList.replaceChildren();
    
    if (productes.length === 0) {
      const missatge = document.createElement("p");
      missatge.classList.add("no-resultats");
      missatge.appendChild(document.createTextNode("No s'han trobat productes amb els criteris de cerca."));
      productList.appendChild(missatge);
      return;
    }

    productes.forEach(product => {

      const div = document.createElement("div");
      div.className = "targeta-producte";

      div.addEventListener("click", () => {
        window.location.href = `ProductDetall.html?id=${product.id}`;
      });

      const h2 = document.createElement("h2");
      h2.appendChild(document.createTextNode(product.name));
      div.appendChild(h2);

      const productImg = ProductimageData.find(img => img.product_id == product.id);
      const img = document.createElement("img");
      img.src = productImg ? productImg.url : "https://png.pngtree.com/png-vector/20221125/ourmid/pngtree-no-image-available-icon-flatvector-illustration-pic-design-profile-vector-png-image_40966566.jpg";
      img.alt = product.name;
      div.appendChild(img);

      const now = new Date();
      const saleIds = ProductSaleData.filter(ps => ps.product_id === product.id).map(ps => ps.sale_id);

      const oPrice = SaleData.filter(s =>
        saleIds.includes(s.id) &&
        new Date(s.start_date) <= now &&
        now <= new Date(s.end_date)
      );

      const pPrice = document.createElement("p");
      pPrice.className = "preu-producte";

      if (oPrice.length > 0) {
        const oferta = oPrice[0];
        const priceWithDiscount = product.price * (1 - oferta.discount_percent / 100);
        pPrice.classList.add("preu-producte-descompte");

        const priceSpan = document.createElement("span");
        priceSpan.classList.add("preu-final");
        priceSpan.appendChild(document.createTextNode(priceWithDiscount.toFixed(2) + " €"));
        pPrice.appendChild(priceSpan);

        pPrice.appendChild(document.createTextNode(" - "));

        const discountSpan = document.createElement("span");
        discountSpan.classList.add("descompte");
        discountSpan.appendChild(document.createTextNode(oferta.discount_percent + "%"));
        pPrice.appendChild(discountSpan);

        pPrice.appendChild(document.createTextNode(" ("));
        pPrice.appendChild(document.createTextNode(oferta.description));
        pPrice.appendChild(document.createTextNode(")"));

      } else {
        pPrice.classList.add("preu-producte-normal");
        pPrice.appendChild(document.createTextNode(product.price.toFixed(2) + " €"));
      }

      div.appendChild(pPrice);

      const btnContainer = document.createElement("div");
      btnContainer.classList.add("botons-producte");

      const veureBtn = document.createElement("button");
      veureBtn.classList.add("btn-veure", "btn-afegir", "button");
      veureBtn.title = "Detall del producte";
      const veureIcon = document.createElement("i");
      veureIcon.className = "fa-solid fa-info";
      veureBtn.appendChild(veureIcon);
      veureBtn.onclick = () =>
        window.location.href = `ProductDetall.html?id=${product.id}`;
      veureBtn.addEventListener("click", e => e.stopPropagation());

      const afegirBtn = document.createElement("button");
      afegirBtn.classList.add("btn-afegir", "button");
      afegirBtn.title = "Afegir al carret";
      const afegirIcon = document.createElement("i");
      afegirIcon.className = "fa-solid fa-cart-shopping";
      afegirBtn.appendChild(afegirIcon);
      afegirBtn.onclick = () => afegirAlCarret(product);
      afegirBtn.addEventListener("click", e => e.stopPropagation());

      const compBtn = document.createElement("button");
      compBtn.classList.add("btn-afegir", "button");
      compBtn.title = "Comparador";
      const compIcon = document.createElement("i");
      compIcon.className = "fa-solid fa-code-compare";
      compBtn.appendChild(compIcon);
      compBtn.onclick = () => window.location.href = `#`;
      compBtn.addEventListener("click", e => e.stopPropagation());

      btnContainer.appendChild(veureBtn);
      btnContainer.appendChild(afegirBtn);
      btnContainer.appendChild(compBtn);

      div.appendChild(btnContainer);

      productList.appendChild(div);
    });
  }

  function afegirAlCarret(producte) {
    alert(`Afegit al carret: ${producte.name}`);
  }

  // ==================== PAGINACIO ====================
  function mostrarBotonsPaginacio(productes) {
    paginacioContainer.replaceChildren();
    const totalPagines = Math.ceil(productes.length / productesPerPagina);
    if (totalPagines <= 1) return;

    const prevBtn = document.createElement("button");
    prevBtn.classList.add("button");
    prevBtn.title = "Anterior";
    const prevIcon = document.createElement("i");
    prevIcon.className = "fa-solid fa-forward fa-flip-horizontal";
    prevBtn.appendChild(prevIcon);
    prevBtn.disabled = pagActual === 1;
    prevBtn.onclick = () => {
      pagActual--;
      mostrarPagina(pagActual, productesActuals);
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
    paginacioContainer.appendChild(prevBtn);

    const pageInfo = document.createElement("span");
    pageInfo.appendChild(document.createTextNode(`${pagActual} de ${totalPagines}`));
    paginacioContainer.appendChild(pageInfo);

    const nextBtn = document.createElement("button");
    nextBtn.classList.add("button");
    nextBtn.title = "Següent";
    const nextIcon = document.createElement("i");
    nextIcon.className = "fa-solid fa-forward";
    nextBtn.appendChild(nextIcon);
    nextBtn.disabled = pagActual === totalPagines;
    nextBtn.onclick = () => {
      pagActual++;
      mostrarPagina(pagActual, productesActuals);
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
    paginacioContainer.appendChild(nextBtn);
  }

  // ==================== ACTIVAR FAMILIA DES DE LA URL ====================
  if (familiaIdFromUrl) {
    const idFamilia = parseInt(familiaIdFromUrl);
    
    if (!isNaN(idFamilia)) {
      // Expandir tots els pares de la familia
      expandirParents(idFamilia);
      
      // Trobar i activar el li de la familia
      const familiaLi = document.querySelector(`li[data-id="${idFamilia}"]`);
      
      if (familiaLi) {
        // Llevar clase activa de "Tots els equips"
        document.querySelectorAll(".familia-item").forEach(item => item.classList.remove("activa"));
        
        // Activar la familia seleccionada
        familiaLi.classList.add("activa");
        
        // Filtrar productes
        const allIds = getAllFamilyIds(idFamilia);
        productesFiltrats = ProductData.filter(p => allIds.includes(p.family_id));
        productesActuals = productesFiltrats;
        
        // Actualitzar migues de pa
        actualitzarMiguesDePa(idFamilia);
        
        // Mostrar productes
        mostrarPagina(pagActual, productesActuals);
      }
    }
  } else {
    // Si no hi ha paràmetre, mostrar tots els productes
    actualitzarMiguesDePa(null);
    mostrarPagina(pagActual, productesActuals);
  }
}