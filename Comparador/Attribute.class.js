class Attribute {
    constructor(id, name, type) {
        this._id = id;
        this._name = name;
        this._type = type;
    }

    static async carregarAtributs(apiUrl) {
        const resp = await fetch(`${apiUrl}/Attribute`);
        let data = await resp.json();
        
        // Si data és un array d'arrays, agafar el primer array
        if (Array.isArray(data) && data.length > 0 && Array.isArray(data[0])) {
            data = data[0];
        }

        return data.map(a => new Attribute(
            a.id,
            a.name,
            a.type
        ));
    }

    // Getters
    get id() { return this._id; }
    get name() { return this._name; }
    get type() { return this._type; }

    // Setters
    set id(v) { this._id = v; }
    set name(v) { this._name = v; }
    set type(v) { this._type = v; }
}
