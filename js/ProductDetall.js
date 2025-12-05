document.addEventListener("DOMContentLoaded", main)

async function main () {
  // Obtenir els paràmetres de la URL
  const params = new URLSearchParams(window.location.search);
  const productId = parseInt(params.get("id"));
  const container = document.getElementById("productDetail");

  //Obtenir les dades de la API
  let ProductDataRaw = await getData(url,"Product");
  let ProductData = ProductDataRaw; 
  let ProductimageData = await getData(url,"Productimage");
  let SaleData = await getData(url,"Sale");
  let ProductSaleData = await getData(url,"ProductSale");
  let AttributeData = await getData(url,"Attribute");
  let ProductattributeData = await getData(url,"Productattribute");
  let FamilyData = await getData(url,"Family");

  // Buscar el producte amb eixe ID
  const product = ProductData.find(p => p.id == productId);

  // Si no existeix el producte, mostrar missatge d'error
  if (!product) {
    const errorMsg = document.createElement("p");
    errorMsg.className = "missatge-error";
    errorMsg.appendChild(document.createTextNode("Producte no trobat"));
    container.appendChild(errorMsg);
    return;
  }

  // Obtenir la família del producte
  const family = FamilyData.find(f => f.id == product.family_id);

  // Contenidor principal
  const divPrincipal = document.createElement("div");
  divPrincipal.className = "contenidor-detall-producte col-12";

  // ====== MIGAS DE PAN (Breadcrumbs) ======
  const rowBreadcrumbs = document.createElement("div");
  rowBreadcrumbs.className = "row row-breadcrumbs";

  const colBreadcrumbs = document.createElement("div");
  colBreadcrumbs.className = "col-12";

  const breadcrumbs = document.createElement("nav");
  breadcrumbs.className = "breadcrumbs";
  breadcrumbs.setAttribute("aria-label", "breadcrumb");

  const breadcrumbList = document.createElement("ul");
  breadcrumbList.className = "breadcrumb-list";

  // Inici
  const liInici = document.createElement("li");
  liInici.className = "breadcrumb-item";
  const linkInici = document.createElement("a");
  linkInici.href = "./Index.html";
  linkInici.appendChild(document.createTextNode("Inici"));
  liInici.appendChild(linkInici);

  // Separador
  const sep1 = document.createElement("span");
  sep1.className = "breadcrumb-separator";
  sep1.appendChild(document.createTextNode(" / "));
  liInici.appendChild(sep1);

  // Productes
  const liProductes = document.createElement("li");
  liProductes.className = "breadcrumb-item";
  const linkProductes = document.createElement("a");
  linkProductes.href = "./Product.html";
  linkProductes.appendChild(document.createTextNode("Productes"));
  liProductes.appendChild(linkProductes);

  // Separador
  const sep2 = document.createElement("span");
  sep2.className = "breadcrumb-separator";
  sep2.appendChild(document.createTextNode(" / "));
  liProductes.appendChild(sep2);

  // Família (si existeix)
  if (family) {
    const liFamilia = document.createElement("li");
    liFamilia.className = "breadcrumb-item";
    const linkFamilia = document.createElement("a");
    linkFamilia.href = `Familia.html?id=${family.id}`;
    linkFamilia.appendChild(document.createTextNode(family.name));
    liFamilia.appendChild(linkFamilia);

    const sep3 = document.createElement("span");
    sep3.className = "breadcrumb-separator";
    sep3.appendChild(document.createTextNode(" / "));
    liFamilia.appendChild(sep3);

    breadcrumbList.appendChild(liInici);
    breadcrumbList.appendChild(liProductes);
    breadcrumbList.appendChild(liFamilia);
  } else {
    breadcrumbList.appendChild(liInici);
    breadcrumbList.appendChild(liProductes);
  }

  // Producte actual (sense enllaç)
  const liProducte = document.createElement("li");
  liProducte.className = "breadcrumb-item breadcrumb-active";
  liProducte.setAttribute("aria-current", "page");
  liProducte.appendChild(document.createTextNode(product.name));

  breadcrumbList.appendChild(liProducte);
  breadcrumbs.appendChild(breadcrumbList);
  colBreadcrumbs.appendChild(breadcrumbs);
  rowBreadcrumbs.appendChild(colBreadcrumbs);

  // ====== ROW 1: TÍTOL ======
  const rowTitol = document.createElement("div");
  rowTitol.className = "row row-titol";
  
  const colTitol = document.createElement("div");
  colTitol.className = "col-12";
  
  const pNom = document.createElement("h1");
  pNom.className = "titol-producte";
  pNom.appendChild(document.createTextNode(product.name));
  
  colTitol.appendChild(pNom);
  rowTitol.appendChild(colTitol);

  // ====== ROW 2: IMATGE + PREU I BOTONS ======
  const rowImatgeAccions = document.createElement("div");
  rowImatgeAccions.className = "row row-imatge-accions";

  // Columna de la imatge (col-8)
  const colImatge = document.createElement("div");
  colImatge.className = "col-8 contenidor-img";

  // Carrusel d'imatges
  const productImg = ProductimageData.filter(img => img.product_id == product.id);
  let imgActual = 0;
  const carrusel = document.createElement("div");
  carrusel.className = "contenidor-carrusel";

  const img = document.createElement("img");
  img.className = "imatge-carrusel";

  if(productImg.length > 0){
    img.src = productImg[imgActual].url;
  }else {
    img.src = "https://png.pngtree.com/png-vector/20221125/ourmid/pngtree-no-image-available-icon-flatvector-illustration-pic-design-profile-vector-png-image_40966566.jpg";
  }
  carrusel.appendChild(img);

  // Crear botons de navegació del carrusel amb icones Font Awesome
  const btnAnt = document.createElement("button");
  btnAnt.className = "boto-carrusel boto-carrusel-anterior";
  const iconAnt = document.createElement("i");
  iconAnt.className = "fa-solid fa-caret-left";
  btnAnt.appendChild(iconAnt);

  const btnSeg = document.createElement("button");
  btnSeg.className = "boto-carrusel boto-carrusel-seguent";
  const iconSeg = document.createElement("i");
  iconSeg.className = "fa-solid fa-caret-right";
  btnSeg.appendChild(iconSeg);

  // Funcions per a canviar d'imatge
  btnAnt.onclick = () => {
    if (productImg.length === 0) return;
    imgActual = (imgActual - 1 + productImg.length) % productImg.length;
    img.src = productImg[imgActual].url;
  };

  btnSeg.onclick = () => {
    if (productImg.length === 0) return;
    imgActual = (imgActual + 1) % productImg.length;
    img.src = productImg[imgActual].url;
  };

  carrusel.appendChild(btnAnt);
  carrusel.appendChild(btnSeg);
  colImatge.appendChild(carrusel);

  // Columna del preu i botons (col-4)
  const colPreuBotons = document.createElement("div");
  colPreuBotons.className = "col-4 contenidor-preu-botons";

  // Preu i ofertes
  const now = new Date();
  const saleIds = [];
  ProductSaleData.forEach(ps => {
    if (ps.product_id === product.id) {
      saleIds.push(ps.sale_id);
    }
  });

  const oPrice = SaleData.filter(s => 
    saleIds.includes(s.id) &&
    new Date(s.start_date) <= now &&
    now <= new Date(s.end_date)
  );

  const pPrice = document.createElement("h2");
  pPrice.className = "preu-producte";

  if(oPrice.length > 0){
    const oferta = oPrice[0];
    const priceWithDiscount = product.price * (1 - oferta.discount_percent / 100);
    pPrice.classList.add("preu-producte-descompte");
    pPrice.appendChild(document.createTextNode(`${priceWithDiscount.toFixed(2)} € - ${oferta.discount_percent}% (${oferta.description})`));
  } else {
    pPrice.classList.add("preu-producte-normal");
    pPrice.appendChild(document.createTextNode(`${product.price.toFixed(2)} €`));
  }

  colPreuBotons.appendChild(pPrice);

  // Contenidor de botons
  const contenidorBT = document.createElement("div");
  contenidorBT.className = "contenidor-botons-utils";

  // Botó afegir al carret
  const btn = document.createElement("button");
  btn.classList.add("boto-afegir-carret", "button");
  btn.appendChild(document.createTextNode("Afegir al carret"));
  contenidorBT.appendChild(btn);

  // Botó comparar
  const compBtn = document.createElement("button");
  compBtn.appendChild(document.createTextNode("Comparar"));
  compBtn.classList.add("boto-afegir-comparador", "button");
  compBtn.onclick = () => {
    window.location.href = "#";
  }
  contenidorBT.appendChild(compBtn);

  // Botó tornar
  const btnVol = document.createElement("button");
  btnVol.classList.add("boto-tornar-inici", "button");
  btnVol.appendChild(document.createTextNode("Tornar a la pàgina principal"));
  btnVol.onclick = () => {
    window.location.href = "Product.html";
  };
  contenidorBT.appendChild(btnVol);

  colPreuBotons.appendChild(contenidorBT);

  // Afegir columnes a la row
  rowImatgeAccions.appendChild(colImatge);
  rowImatgeAccions.appendChild(colPreuBotons);

  // ====== ROW 3: DESCRIPCIÓ (nova row separada) ======
  const rowDescripcio = document.createElement("div");
  rowDescripcio.className = "row row-descripcio";

  const colDescripcio = document.createElement("div");
  colDescripcio.className = "col-12 contenidor-descripcio";

  const tDesc = document.createElement("h2");
  tDesc.className = "titol-descripcio";
  tDesc.appendChild(document.createTextNode("Descripció"));
  colDescripcio.appendChild(tDesc);

  const pDesc = document.createElement("p");
  pDesc.className = "text-descripcio";
  pDesc.appendChild(document.createTextNode(product.description));
  colDescripcio.appendChild(pDesc);

  rowDescripcio.appendChild(colDescripcio);

  // ====== ROW 4: ATRIBUTS (nova row separada) ======
  const rowAtributs = document.createElement("div");
  rowAtributs.className = "row row-atributs";

  const colAtributs = document.createElement("div");
  colAtributs.className = "col-12 contenidor-atributs";

  const atributosFamilia = AttributeData.filter(a => a.family_id == product.family_id);
  if (atributosFamilia.length > 0) {
    const tAtributs = document.createElement("h2");
    tAtributs.className = "titol-atributs";
    tAtributs.appendChild(document.createTextNode("Sobre este producte"));
    colAtributs.appendChild(tAtributs);

    const ul = document.createElement("ul");
    ul.className = "llista-atributs";

    atributosFamilia.forEach(attr => {
      const valor = ProductattributeData.find(
        pAttri => pAttri.product_id == product.id && pAttri.attribute_id === attr.id
      );

      const li = document.createElement("li");
      li.className = "item-atribut";

      if (valor) {
        li.appendChild(document.createTextNode(`${attr.name}: ${valor.value}`));
      } else {
        li.appendChild(document.createTextNode(`${attr.name}: -`));
      }

      ul.appendChild(li);
    });

    colAtributs.appendChild(ul);
  }

  rowAtributs.appendChild(colAtributs);

  // Afegir totes les rows al contenidor principal
  divPrincipal.appendChild(rowBreadcrumbs);  // Migas de pan
  divPrincipal.appendChild(rowTitol);
  divPrincipal.appendChild(rowImatgeAccions);
  divPrincipal.appendChild(rowDescripcio);
  divPrincipal.appendChild(rowAtributs);

  // Afegir tot al contenidor del DOM
  container.appendChild(divPrincipal);
}