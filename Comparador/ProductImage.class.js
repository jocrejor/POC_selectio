class ProductImage {
    constructor(id, name, url, order, product_id) {
        this._id = id;
        this._name = name;
        this._url = url;
        this._order = order;
        this._product_id = product_id;
    }

    static async carregarProductImages(apiUrl) {
        const resp = await fetch(`${apiUrl}/Productimage`);
        let data = await resp.json();
        
        // Si data és un array d'arrays, agafar el primer array
        if (Array.isArray(data) && data.length > 0 && Array.isArray(data[0])) {
            data = data[0];
        }

        return data.map(pi => new ProductImage(
            pi.id,
            pi.name,
            pi.url,
            pi.order,
            pi.product_id
        ));
    }

    // Getters
    get id() { return this._id; }
    get name() { return this._name; }
    get url() { return this._url; }
    get order() { return this._order; }
    get product_id() { return this._product_id; }

    // Setters
    set id(v) { this._id = v; }
    set name(v) { this._name = v; }
    set url(v) { this._url = v; }
    set order(v) { this._order = v; }
    set product_id(v) { this._product_id = v; }

    // Mètode per obtenir la URL de la imatge
    getImageUrl() {
        return this.url;
    }

    // Mètode toJSON per serialitzar l'objecte
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            url: this.url,
            order: this.order,
            product_id: this.product_id
        };
    }
}
