class Family {
    constructor(id, name, active){
        this._id = id;
        this._name = name;
        this._active = active;
    }

    static async carregarFamilies(apiUrl) {
        const resp = await fetch(`${apiUrl}/Family`);
        let data = await resp.json();
        
        // Si data és un array d'arrays, agafar el primer array
        if (Array.isArray(data) && data.length > 0 && Array.isArray(data[0])) {
            data = data[0];
        }
        
        return data.map(f => new Family(
            f.id,
            f.name,
            f.active
        ));
    }

    static fromJSON(obj) {
        return new Family(obj.id, obj.name, obj.active);
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            active: this.active
        };
    }

    get id(){ return this._id; }
    get name(){ return this._name; }
    get active(){ return this._active; }

    set id(id){ this._id = id; }
    set name(name){ this._name = name; }
    set active(active){ this._active = active; }
}
