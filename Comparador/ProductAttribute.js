class ProductAttribute {
    constructor(id, product_id, attribute_id, value) {
        this._id = id;
        this._product_id = product_id;
        this._attribute_id = attribute_id;
        this._value = value;
    }

    static async carregarProductAtributs(apiUrl) {
        const resp = await fetch(`${apiUrl}/Productattribute`);
        let data = await resp.json();
        
        return data.map(pa => new ProductAttribute(
            pa.id,
            pa.product_id,
            pa.attribute_id,
            pa.value
        ));
    }

    // Getters
    get id() { return this._id; }
    get product_id() { return this._product_id; }
    get attribute_id() { return this._attribute_id; }
    get value() { return this._value; }

    // Setters
    set id(v) { this._id = v; }
    set product_id(v) { this._product_id = v; }
    set attribute_id(v) { this._attribute_id = v; }
    set value(v) { this._value = v; }
}
