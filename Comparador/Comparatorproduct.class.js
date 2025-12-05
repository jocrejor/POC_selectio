class ComparatorProduct {
    static apiUrl = "https://api.serverred.es";

    constructor(comparator_id, product_id){
        this._comparator_id = comparator_id;
        this._product_id = product_id;
    }

    //getters i setters
    get comparator_id(){
        return this._comparator_id;
    }

    get product_id(){
        return this._product_id;
    }

    set comparator_id(value){
        this._comparator_id = value;
    }

    set product_id(value){
        this._product_id = value;
    }

    // Carregar tots els ComparatorProduct de l'API
    static async carregarComparatorProducts(apiUrl) {
        const resp = await fetch(`${apiUrl}/Comparatorproduct`);
        let data = await resp.json();

        // Normalitzar si ve com array d'arrays
        if (Array.isArray(data) && data.length > 0 && Array.isArray(data[0])) {
            data = data[0];
        }

        return data.map(cp => new ComparatorProduct(
            cp.comparator_id, 
            cp.product_id
        ));
    }

    // Crear una nova relació Comparator-Product
    static async crearComparatorProduct(apiUrl, comparator_id, product_id) {
        const data = {
            comparator_id: comparator_id,
            product_id: product_id
        };

        const resp = await fetch(`${apiUrl}/Comparatorproduct`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!resp.ok) {
            throw new Error('Error creant la relació comparator-product');
        }

        const result = await resp.json();
        return new ComparatorProduct(
            result.comparator_id,
            result.product_id
        );
    }

    // Obtenir productes d'un comparador
    static async obtenirProductesDeComparator(apiUrl, comparator_id) {
        const resp = await fetch(`${apiUrl}/Comparatorproduct?comparator_id=${comparator_id}`);
        let data = await resp.json();

        // Normalitzar si ve com array d'arrays
        if (Array.isArray(data) && data.length > 0 && Array.isArray(data[0])) {
            data = data[0];
        }

        return data.map(cp => new ComparatorProduct(
            cp.comparator_id,
            cp.product_id
        ));
    }

    // Eliminar una relació específica
    static async eliminarComparatorProduct(apiUrl, comparator_id, product_id) {
        const resp = await fetch(`${apiUrl}/Comparatorproduct/${comparator_id}/${product_id}`, {
            method: 'DELETE'
        });

        if (!resp.ok) {
            throw new Error('Error eliminant la relació comparator-product');
        }

        return true;
    }

    // Serialitzar
    toJSON() {
        return {
            comparator_id: this._comparator_id,
            product_id: this._product_id
        };
    }
}
