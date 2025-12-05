class Product{
    static apiUrl = "https://api.serverred.es";
    
    constructor(id, name, price, description, family_id, active){
        this._id = id;
        this._name = name;
        this._price = price;
        this._description = description;
        this._family_id = family_id;
        this._active = active;
    }


    

    static async carregarProductes(apiUrl) {
        const resp = await fetch(`${apiUrl}/Product`);
        let data = await resp.json();

        // Si data és un array d'arrays, agafar el primer array
        if (Array.isArray(data) && data.length > 0 && Array.isArray(data[0])) {
            data = data[0];
        }
        
        return data.map(p => {
            return new Product(
                p.id, 
                p.name, 
                p.price, 
                p.description, 
                p.family_id, 
                p.active
            );
        });
    }


    //getters i setters
    get id(){
        return this._id;
    }

    get name(){
        return this._name;
    }
    get price(){
        return this._price;
    }
    get description(){
        return this._description;
    }
    get family_id(){
        return this._family_id;
    }
    get active(){
        return this._active;
    }

    getfamilyName(familiea){
        const family = familiea.find(fam => fam.id === this.family_id);
        return family ? family.name : null;
    }
    
    
    isCompatible(otherProduct) {
    return this.family_id === otherProduct.family_id;
    }   

    getAttributes(productAttributes, attributes){

        const attrs = productAttributes.filter(pa => pa.product_id === this.id);

        return attrs.map(pa => {
            const attrInfo = attributes.find(a => a.id === pa.attribute_id);
            return {
                name: attrInfo ? attrInfo.name : "Atributo desconocido",
                value: pa.value
            };
        });

    } 


    toJSON() {
    return {
        id: this.id,
        name: this.name,
        price: this.price,
        description: this.description,
        family_id: this.family_id,
        active: this.active
    };
    }



    set id(value){
        this._id = value;
    }

    set name(value){
        this._name = value;
    }
    set price(value){
        this._price = value;
    }
    set description(value){
        this._description = value;
    }
    set family_id(value){
        this._family_id = value;
    }
    set active(value){
        this._active = value;
    }
}