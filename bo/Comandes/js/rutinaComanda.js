

async function crearComanda (client = JSON.parse(localStorage.getItem("currentUser")).id ,payment,shipping_amount,data = new Date().toISOString(),arrProducts){

  //let dateParts = data.split("-");
  //let dateStr = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
  //let ara = new Date();
  //let hora = `${String(ara.getHours()).padStart(2, '0')}:${String(ara.getMinutes()).padStart(2, '0')}:${String(ara.getSeconds()).padStart(2, '0')}`;

let comanda = {
    date: data,
    payment: payment,
    shipping_amount: shipping_amount,
    client_id: client
  };

  try {
    // Crear comanda i obtenir id
    let comandaCreada = await postData(url, "Order", comanda);

    // Afegir productes
    for (let p of arrProducts) {
      let detall = {
        order_id: comandaCreada.id,
        product_id: p.producte,
        quantitat: p.quantitat,
        preu: p.preu,
        descompte: p.descompte,
        preuFinal: p.preuFinal
      };
      await postData(url, "Orderdetail", detall);
    };

  } catch (err) {
    console.error(err);
    errorMissatge("Hi ha hagut un error al guardar la comanda.");
  }

}
