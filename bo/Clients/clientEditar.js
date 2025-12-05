document.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(window.location.search);
    const id = parseInt(params.get("id"), 10);

    if (!id) {
        alert("ID de client no vàlid!");
        window.location.href = "index.html";
        return;
    }

    // OBTINDRE EL CLIENT DEL SERVIDOR
    const client = await getIdData(url, "Client", id);

    if (!client) {
        alert("No s'ha trobat el client!");
        window.location.href = "index.html";
        return;
    }

    //  OMPLIR FORMULARI
    document.getElementById("id").value = client.id;
    document.getElementById("name").value = client.name;
    document.getElementById("surname").value = client.surname;
    document.getElementById("email").value = client.email;
    document.getElementById("phone").value = client.phone;
    document.getElementById("address").value = client.address;
    document.getElementById("cp").value = client.cp;

    //  ACTUALITZAR CLIENT
    document.getElementById("formEditar").addEventListener("submit", async (e) => {
        e.preventDefault();

        const dadesActualitzades = {
            name: document.getElementById("name").value,
            surname: document.getElementById("surname").value,
            email: document.getElementById("email").value,
            phone: document.getElementById("phone").value,
            address: document.getElementById("address").value,
            cp: document.getElementById("cp").value
        };

        const resultat = await updateId(url, "Client", id, dadesActualitzades);

        if (resultat) {
            alert("✅ Client actualitzat correctament!");
            window.location.href = "index.html";
        } else {
            alert("❌ Error actualitzant el client!");
        }
    });
});

