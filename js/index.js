document.addEventListener("DOMContentLoaded", main);

async function main() {
  const llistaFamilies = document.getElementById("llistaFamilies");
  const productList = document.getElementById("productList");
  const paginacioContainer = document.getElementById("paginacio");

  // ==================== BOTONES DE ORDEN ====================
  const btnOrdenarAsc = document.getElementById("ordenarAsc");
  const btnOrdenarDesc = document.getElementById("ordenarDesc");

  // ==================== Cargar datos desde la API ====================
  const FamilyData = (await getData(url,"Family")).flat();
  const ProductData = (await getData(url,"Product")).flat();
  const ProductimageData = await getData(url,"Productimage");
  const SaleData = await getData(url,"Sale");
  const ProductSaleData = await getData(url,"ProductSale");

  // Variables de paginación
  let pagActual = 1;
  const productesPerPagina = 10;
  let productesActuals = ProductData;

  // ==================== CREAR LISTA DE FAMILIAS + SUBFAMILIAS ====================
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
    if(fills.length > 0){
      const flechaD = document.createElement("i");
      flechaD.classList.add("fa-solid","fa-arrow-right");
      li.appendChild(flechaD);
    }

    const textNode = document.createTextNode("".repeat(nivell) + familiaPare.name);
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
    while(li && li.tagName !== "LI") li = li.parentElement;
    if(!li) return;

    document.querySelectorAll(".familia-item").forEach(item => item.classList.remove("activa"));
    li.classList.add("activa");

    const sub = li.querySelector("ul");
    if(sub) sub.classList.toggle("ocult");

    const idFamilia = parseInt(li.dataset.id);
    if (isNaN(idFamilia)) productesActuals = ProductData;
    else {
      const allIds = getAllFamilyIds(idFamilia);
      productesActuals = ProductData.filter(p => allIds.includes(p.family_id));
    }

    pagActual = 1;
    mostrarPagina(pagActual, productesActuals);
  });

  function getAllFamilyIds(familyId) {
    let ids = [familyId];
    const children = FamilyData.filter(f => f.parent_id === familyId);
    children.forEach(child => ids = ids.concat(getAllFamilyIds(child.id)));
    return ids;
  }

  // ==================== FUNCIONES DE ORDEN ====================
  btnOrdenarAsc.addEventListener("click", () => {
    productesActuals.sort((a,b) => a.price - b.price);
    pagActual = 1;
    mostrarPagina(pagActual, productesActuals);
  });

  btnOrdenarDesc.addEventListener("click", () => {
    productesActuals.sort((a,b) => b.price - a.price);
    pagActual = 1;
    mostrarPagina(pagActual, productesActuals);
  });

  // ==================== MOSTRAR PRODUCTES ====================
  function mostrarPagina(page, productes) {
    const inici = (page - 1) * productesPerPagina;
    const fi = inici + productesPerPagina;
    const productesPagina = productes.slice(inici, fi);
    mostrarProductes(productesPagina);
    mostrarBotonsPaginacio(productes);
  }

  function mostrarProductes(productes) {
    productList.replaceChildren();
    productes.forEach(product => {
      const div = document.createElement("div");
      div.className = "targeta-producte";

      const h2 = document.createElement("h2");
      h2.appendChild(document.createTextNode(product.name));
      div.appendChild(h2);

      const productImg = ProductimageData.find(img => img.product_id == product.id);
      const img = document.createElement("img");
      img.src = productImg ? productImg.url : "https://png.pngtree.com/png-vector/20221125/ourmid/pngtree-no-image-available-icon-flatvector-illustration-pic-design-profile-vector-png-image_40966566.jpg";
      img.alt = product.name;
      div.appendChild(img);

      const now = new Date();
      const saleIds = [];
      ProductSaleData.forEach(ps => { if (ps.product_id === product.id) saleIds.push(ps.sale_id); });

      const oPrice = SaleData.filter(s =>
        saleIds.includes(s.id) &&
        new Date(s.start_date) <= now &&
        now <= new Date(s.end_date)
      );

      const pPrice = document.createElement("p");
      pPrice.className = "preu-producte";

      if(oPrice.length > 0){
        const oferta = oPrice[0];
        const priceWithDiscount = product.price * (1 - oferta.discount_percent / 100);
        pPrice.classList.add("preu-producte-descompte");
        pPrice.appendChild(document.createTextNode(`Preu: ${priceWithDiscount.toFixed(2)} € - ${oferta.discount_percent}% (${oferta.description})`));
      } else {
        pPrice.classList.add("preu-producte-normal");
        pPrice.appendChild(document.createTextNode(`Preu: ${product.price.toFixed(2)} €`));
      }

      div.appendChild(pPrice);

      const btnContainer = document.createElement("div");
      btnContainer.classList.add("botons-producte");

      const veureBtn = document.createElement("button");
      veureBtn.appendChild(document.createTextNode("Detall del producte"));
      veureBtn.classList.add("btn-veure", "btn-afegir");
      veureBtn.onclick = () => window.location.href = `product.html?id=${product.id}`;

      const afegirBtn = document.createElement("button");
      afegirBtn.appendChild(document.createTextNode("Afegir al carret"));
      afegirBtn.classList.add("btn-afegir");
      afegirBtn.onclick = () => afegirAlCarret(product);

      const compBtn = document.createElement("button");
      compBtn.appendChild(document.createTextNode("Comparador"));
      compBtn.classList.add("btn-afegir");
      compBtn.onclick = () => window.location.href = `#`;

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

  // ==================== PAGINACIÓN ====================
  function mostrarBotonsPaginacio(productes) {
    paginacioContainer.replaceChildren();
    const totalPagines = Math.ceil(productes.length / productesPerPagina);
    if (totalPagines <= 1) return;

    const prevBtn = document.createElement("button");
    prevBtn.appendChild(document.createTextNode("⟨ Anterior"));
    prevBtn.disabled = pagActual === 1;
    prevBtn.onclick = () => {
      pagActual--;
      mostrarPagina(pagActual, productesActuals);
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
    paginacioContainer.appendChild(prevBtn);

    const pageInfo = document.createElement("span");
    pageInfo.appendChild(document.createTextNode(`Pàgina ${pagActual} de ${totalPagines}`));
    paginacioContainer.appendChild(pageInfo);

    const nextBtn = document.createElement("button");
    nextBtn.appendChild(document.createTextNode("Següent ⟩"));
    nextBtn.disabled = pagActual === totalPagines;
    nextBtn.onclick = () => {
      pagActual++;
      mostrarPagina(pagActual, productesActuals);
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
    paginacioContainer.appendChild(nextBtn);
  }

  mostrarPagina(pagActual, productesActuals);
}
