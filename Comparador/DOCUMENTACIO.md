# Documentació del Comparador de Productes - ComparadorMillor

## Índex
1. [Visió General](#visió-general)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Flux de Funcionament](#flux-de-funcionament)
4. [Classes i Estructura](#classes-i-estructura)
5. [Fitxers i Components](#fitxers-i-components)
6. [Funcionalitats Principals](#funcionalitats-principals)
7. [API i Connexions](#api-i-connexions)
8. [LocalStorage i Persistència](#localstorage-i-persistència)
9. [Interfície d'Usuari](#interfície-dusuari)
10. [Disseny Responsiu](#disseny-responsiu)

---

## Visió General

El **ComparadorMillor** és una aplicació web responsiva que permet als usuaris comparar múltiples productes de forma visual i dinàmica. Els usuaris poden:
- Seleccionar productes d'un llistat
- Afegir-los a un comparador amb nom personalitzat
- Veure les característiques tècniques en una taula comparativa amb columnes fixades
- Fixar (pin) un producte com a referència a la primera posició
- Eliminar productes del comparador
- Visualitzar productes relacionats en un carrusel dinàmic
- Afegir productes directament des del carrusel al comparador o al carret
- Guardar comparadors amb noms personalitzats
- Marcar comparadors com a preferits
- Navegació amb scroll horitzontal intel·ligent per cel·les

---

## Arquitectura del Sistema

### Diagrama de Components

```
┌─────────────────────────────────────────────────────────────┐
│                    APLICACIÓ COMPARADOR                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────┐         ┌──────────────────┐          │
│  │ llistarProductes │   ───>  │   comparador     │          │
│  │     .html        │         │      .html       │          │
│  └──────────────────┘         └──────────────────┘          │
│           │                            │                    │
│           │                            │                    │
│  ┌────────▼───────────────────────────▼─────────────┐       │
│  │              Classes de Dades                    │       │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐        │       │
│  │  │ Product  │  │  Family  │  │Attribute │        │       │
│  │  └──────────┘  └──────────┘  └──────────┘        │       │
│  │  ┌──────────────────┐  ┌────────────────┐        │       │
│  │  │ProductAttribute  │  │ProductImage    │        │       │
│  │  └──────────────────┘  └────────────────┘        │       │
│  └──────────────────────────────────────────────────┘       │
│                           │                                 │
│  ┌────────────────────────▼────────────────────────┐        │
│  │         Classe Principal: Comparador            │        │
│  │  - Gestió de productes seleccionats             │        │
│  │  - Generació de taules comparatives             │        │
│  │  - Persistència LocalStorage                    │        │
│  │  - Gestió de producte ancorat (pin)             │        │
│  │  - Columnes fixades (sticky columns)            │        │
│  └─────────────────────────────────────────────────┘        │
│                           │                                 │
│  ┌────────────────────────▼────────────────────────┐        │
│  │       comparadorFuncions.js (Logic Layer)       │        │
│  │  - carregarComparador() - càrrega sequencial    │        │
│  │  - carregarCarrusel() - productes relacionats   │        │
│  │  - scrollTable() - scroll dinàmic per cel·les   │        │
│  │  - crearTargetaProducte() - carrusel items      │        │
│  │  - toggleFavorit() - gestió preferits           │        │
│  │  - guardarComparador() - persistència           │        │
│  └─────────────────────────────────────────────────┘        │
│                           │                                 │
│  ┌────────────────────────▼────────────────────────┐        │
│  │              API REST Backend                   │        │
│  │         https://api.serverred.es                │        │
│  └─────────────────────────────────────────────────┘        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Flux de Funcionament

### 1. Flux Inicial: Llistat de Productes

```
Usuari arriba a llistarProductes.html
    │
    ▼
DOMContentLoaded es dispara
    │
    ▼
comparador.js carrega les dades de l'API:
    - Product.carregarProductes()
    - Family.carregarFamilies()
    - Attribute.carregarAtributs()
    - ProductAttribute.carregarProductAtributs()
    - ProductImage.carregarProductImages()
    │
    ▼
Es genera la taula amb tots els productes
    │
    ▼
Per cada producte, es crea un botó "Comparar"
    │
    ▼
Usuari clica "Comparar" en un producte
    │
    ▼
comparador.afegirProducte(producte)
    - Comprova si ja està al comparador
    - Afegeix el producte a l'array
    - Guarda a localStorage
    │
    ▼
Redirigeix a comparador.html
```

### 2. Flux del Comparador

```
Usuari arriba a comparador.html
    │
    ▼
DOMContentLoaded es dispara
    │
    ▼
carregarComparador() (comparadorFuncions.js)
    │
    ├──> Carrega dades de l'API 
    │       - await Product.carregarProductes()
    │       - await Family.carregarFamilies()
    │       - await Attribute.carregarAtributs()
    │       - await ProductAttribute.carregarProductAtributs()
    │       - await ProductImage.carregarProductImages()
    │
    ├──> Crea instància de Comparador
    │
    ├──> comparador.carregarLocalStorage()
    │       - Recupera productes guardats
    │       - Recupera pinnedProductId
    │
    ├──> comparador.generarTaula()
    │       │
    │       ├──> Ordena productes (pinned primer)
    │       │
    │       ├──> Genera <thead> amb:
    │       │    - Botó X (eliminar) 
    │       │    - Botó pin (anclar) 
    │       │    - Imatges de productes
    │       │    - Nom dels productes
    │       │    - Botó "Afegir al carret"
    │       │
    │       └──> Genera <tbody> amb:
    │            - Fila de preus
    │            - Files d'atributs (només els comuns)
    │            - Primera columna sticky (left: 0)
    │            - Segona columna sticky si hi ha pin (left: clamp())
    │
    └──> Insereix taula a #comparadorContingut
         │
         └──> updateScrollButtons()
                - Activa/desactiva botons de scroll
    │
    ▼
carregarCarrusel() (comparadorFuncions.js)
    │
    ├──> Filtra productes de la mateixa família
    │
    ├──> Exclou productes ja al comparador
    │
    ├──> Crea targetes per cada producte relacionat amb:
    │    - Botó "Afegir a comparar"
    │    - Botó "Afegir al carret"
    │    (Els dos botons estan costat a costat)
    │
    └──> Mostra carrusel si hi ha productes
    │
    ▼
carregarNomComparador()
    - Recupera nom guardat de localStorage
    │
    ▼
carregarEstatFavorit()
    - Recupera estat de preferit de localStorage
```

### 3. Flux d'Interaccions

#### 3.1 Eliminar Producte

```
Usuari clica botó X d'un producte
    │
    ▼
comparador.eliminarProducte(producteId)
    - Filtra l'array de productes
    - Si és el producte ancorat, elimina el pin
    - Guarda a localStorage
    │
    ▼
Crida directament carregarComparador() i carregarCarrusel()
(NO s'utilitzen CustomEvents)
    │
    ▼
Taula i carrusel es regeneren
```

#### 3.2 Anclar Producte (Pin)

```
Usuari clica icona de chincheta
    │
    ▼
comparador.pinProducte(producteId)
    - Actualitza pinnedProductId
    - Guarda a localStorage
    │
    ▼
Crida directament carregarComparador() i carregarCarrusel()
(NO s'utilitzen CustomEvents)
    │
    ▼
comparador.obtenirProductes()
    - Reordena l'array
    - Producte ancorat es mou a la primera posició
    │
    ▼
Taula es regenera amb el nou ordre
    - Segona columna esdevé sticky
```

#### 3.3 Afegir Producte des del Carrusel

```
Usuari clica "Afegir a comparar" en targeta del carrusel
    │
    ▼
comparador.afegirProducte(producte)
    │
    ▼
Crida directament carregarComparador() i carregarCarrusel()
(NO s'utilitzen CustomEvents)
    │
    ▼
Taula i carrusel es regeneren
    - Producte apareix a la taula
    - Producte desapareix del carrusel
```

#### 3.4 Scroll Horitzontal

```
Usuari clica botons ◄ o ►
    │
    ▼
scrollTable(direction)
    - Calcula ample dinàmic de la cel·la (firstCell.offsetWidth)
    - Fa scroll exactament l'ample d'una cel·la
    - Scroll suau (smooth behavior)
    │
    ▼
updateScrollButtons()
    - Desactiva botó esquerre si scrollLeft ≤ 1
    - Desactiva botó dret si està al final
```

#### 3.5 Gestió del Nom del Comparador

```
Usuari edita el camp de nom
    │
    ▼
Event 'input' en #nomComparador
    │
    ▼
localStorage.setItem('nomComparador', value)
    - Guardesa automàticament mentre escriu
```

#### 3.6 Marcar com a Preferit

```
Usuari clica botó de cor
    │
    ▼
toggleFavorit()
    - Canvia classe 'favorit-actiu'
    - Canvia icona (fa-regular ↔ fa-solid)
    - Canvia colors (blanc/gris ↔ vermell/rosa)
    │
    ▼
localStorage.setItem('comparadorFavorit', 'true'/'false')
```

#### 3.7 Guardar Comparador

```
Usuari clica "Guardar"
    │
    ▼
guardarComparador()
    - Obté nom del comparador
    - Obté productes actuals
    - Obté pinnedProductId
    - Obté estat favorit
    - Crea objecte amb data actual
    │
    ▼
comparadorsGuardats = localStorage.getItem('comparadorsGuardats') || []
    │
    ▼
comparadorsGuardats.push(nouComparador)
    │
    ▼
localStorage.setItem('comparadorsGuardats', JSON.stringify(...))
    │
    ▼
Alert de confirmació
```

---

## Classes i Estructura

### 1. Classe `Comparador` (comparador.class.js)

**Propietats:**
```javascript
{
    productes: [
        { product: Product, sessionId: string }
    ],
    sessionId: string,        // UUID únic per sessió
    pinnedProductId: number   // ID del producte ancorat
}
```

**Mètodes:**

| Mètode | Descripció | Paràmetres | Retorn |
|--------|------------|------------|--------|
| `constructor()` | Inicialitza el comparador | - | - |
| `afegirProducte(producte)` | Afegeix un producte al comparador | `Product` | `boolean` |
| `eliminarProducte(producteId)` | Elimina un producte | `number` | - |
| `pinProducte(producteId)` | Ancora un producte | `number` | - |
| `guardarLocalStorage()` | Guarda l'estat a localStorage | - | - |
| `carregarLocalStorage()` | Carrega l'estat des de localStorage | - | - |
| `obtenirProductes()` | Retorna productes ordenats (pinned primer) | - | `Product[]` |
| `generarTaula(productAttributes, attributes, productImages)` | Genera la taula HTML del comparador | `productAttributes[]`, `attributes[]`, `productImages[]` | `HTMLTableElement` |

**Per què `generarTaula()` no necessita el paràmetre `productes`?**

El mètode obté els productes internament cridant `this.obtenirProductes()`, que ja gestiona:
- Recuperar els productes de l'array intern `this.productes`
- Ordenar-los (producte ancorat primer si existeix)
- Retornar l'array ordenat

Això manté l'encapsulació de la classe i evita passar dades redundants.

**Lògica d'afegirProducte:**
1. Comprova si el producte ja està al comparador
2. (Comentat) Comprova compatibilitat per família
3. Afegeix el producte a l'array
4. Guarda a localStorage

**Lògica de generarTaula:**
1. Obté productes ordenats cridant `this.obtenirProductes()` (intern)
   - Els productes ja estan a `this.productes`
   - Si hi ha un producte ancorat, el posa primer
2. Crea `<table>` amb border-collapse
3. Genera `<thead>`:
   - Primera columna: "Característiques" (sempre sticky)
   - Resta de columnes: Un producte per columna amb:
     - Botó X (eliminar) - posició esquerra
     - Icona chincheta (pin) - posició esquerra després del X
     - Imatge del producte
     - Nom del producte
     - Botó "Afegir al carret"
4. Genera `<tbody>`:
   - Primera fila: Preus
   - Resta de files: Atributs comuns entre productes
   - Només mostra atributs que comparteixen TOTS els productes
5. Afegeix classes CSS:
   - `sticky-col-1`: Primera columna (característiques) - left: 0
   - `sticky-col-2`: Segona columna (primer producte) - left: clamp(15rem, 20vw, 17.5rem)
6. Retorna la taula

**Important sobre sticky columns:**
- Primera columna SEMPRE sticky (noms d'atributs)
- Segona columna sticky NOMÉS si hi ha un producte ancorat
- Les columnes sticky tenen z-index més alt per quedar sobre les altres
- Background amb !important per evitar conflictes CSS

### 2. Classe `Product` (Product.class.js)

**Propietats:**
```javascript
{
    _id: number,
    _name: string,
    _price: number,
    _description: string,
    _family_id: number,
    _active: boolean
}
```

**Mètodes estàtics:**
- `carregarProductes(apiUrl)`: Fetch GET `/Product` i mapeja a objectes Product

**Mètodes d'instància:**
- `isCompatible(otherProduct)`: Comprova si tenen la mateixa family_id
- `getAttributes(productAttributes, attributes)`: Retorna els atributs del producte
- `getfamilyName(families)`: Retorna el nom de la família
- `toJSON()`: Serialitza l'objecte

### 3. Classe `Family` (Family.class.js)

**Propietats:**
```javascript
{
    _id: number,
    _name: string,
    _active: boolean
}
```

**Mètodes estàtics:**
- `carregarFamilies(apiUrl)`: Fetch GET `/Family`

### 4. Classe `Attribute` (Attribute.class.js)

**Propietats:**
```javascript
{
    _id: number,
    _name: string,
    _type: string
}
```

**Mètodes estàtics:**
- `carregarAtributs(apiUrl)`: Fetch GET `/Attribute`

### 5. Classe `ProductAttribute` (ProductAttribute.js)

**Propietats:**
```javascript
{
    _id: number,
    _product_id: number,
    _attribute_id: number,
    _value: string
}
```

**Mètodes estàtics:**
- `carregarProductAtributs(apiUrl)`: Fetch GET `/Productattribute`

### 6. Classe `ProductImage` (ProductImage.class.js)

**Propietats:**
```javascript
{
    _id: number,
    _name: string,
    _url: string,
    _order: number,
    _product_id: number
}
```

**Mètodes estàtics:**
- `carregarProductImages(apiUrl)`: Fetch GET `/Productimage`

**Mètodes d'instància:**
- `getImageUrl()`: Retorna la URL de la imatge
- `toJSON()`: Serialitza l'objecte

---

## Fitxers i Components

### Fitxers HTML

#### 1. `llistarProductes.html`
**Propòsit:** Pàgina inicial on es mostren tots els productes disponibles

**Estructura:**
```html
<h1>Home</h1>
<button>Veure Comparador</button>
<table>
    <thead>
        <tr>
            <th>Accions</th>
            <th>id</th>
            <th>Nom</th>
            <th>Descripció</th>
            <th>Preu</th>
        </tr>
    </thead>
    <tbody id="productListTable">
        <!-- Generat dinàmicament -->
    </tbody>
</table>
```

**Scripts carregats:**
- Product.class.js
- Family.class.js
- Attribute.class.js
- ProductAttribute.js
- ProductImage.class.js
- comparador.class.js
- comparador.js (genera la taula)

#### 2. `comparador.html`
**Propòsit:** Pàgina del comparador amb taula comparativa, controls de gestió i carrusel

**Estructura:**
```html
<div class="comparador-page">
    <div class="comparador-header">
        <h1>Comparador de Productes</h1>
        <button class="btn-tornar">Tornar</button>
    </div>
    
    <!-- Barra de controls del comparador -->
    <div class="comparador-controls">
        <div class="controls-left">
            <input type="text" id="nomComparador" placeholder="Nom del comparador">
            <button id="btnFavorit">❤</button>
            <button onclick="guardarComparador()">💾 Guardar</button>
        </div>
        <div class="controls-right">
            <button onclick="window.location.href='llistarProductes.html'">

            </button>
        </div>
    </div>
    
    <div class="table-wrapper">
        <button class="scroll-btn-left">◄</button>
        <div class="table-scroll-container" id="tableContainer">
            <div id="comparadorContingut">
                <!-- Taula generada dinàmicament -->
            </div>
        </div>
        <button class="scroll-btn-right">►</button>
    </div>
    
    <div class="carrusel-wrapper">
        <h2>Podria interessar-te també:</h2>
        <div class="carrusel-container">
            <button class="scroll-btn-left">◄</button>
            <div class="carrusel-scroll" id="carruselContingut">
                <!-- Productes relacionats amb 2 botons cadascun -->
            </div>
            <button class="scroll-btn-right">►</button>
        </div>
    </div>
</div>
```

**Scripts carregats:**
- Totes les classes de dades
- comparador.class.js
- comparadorFuncions.js (gestiona la lògica de la pàgina)
- Font Awesome (per icones de chincheta)

### Fitxers JavaScript

#### 1. `comparador.js`
**Propòsit:** Genera la taula de productes a `llistarProductes.html`

**Variables globals:**
```javascript
let productes = [];
let families = [];
let atributs = [];
let productAtributs = [];
let productImages = [];
const comparador = new Comparador();
```

**Flux d'execució:**
1. DOMContentLoaded
2. Carrega totes les dades de l'API sequencialment (NO Promise.all)
3. Itera sobre cada producte i crea una fila amb:
   - Botó "Comparar" → afegeix producte i redirigeix
   - Index
   - Nom
   - Descripció
   - Preu

**Important:** NO utilitza CustomEvents per comunicar-se amb comparador.html

#### 2. `comparadorFuncions.js`
**Propòsit:** Gestiona tota la lògica de `comparador.html` (capa de lògica separada)

**Funcions principals:**

| Funció | Descripció |
|--------|------------|
| `carregarComparador()` | Carrega dades de l'API SEQUENCIALMENT (no Promise.all) i genera la taula comparativa |
| `scrollTable(direction)` | Fa scroll horitzontal exactament l'ample d'una cel·la (dinàmic) |
| `updateScrollButtons()` | Activa/desactiva botons de scroll segons posició |
| `carregarCarrusel()` | Carrega productes relacionats al carrusel (mateixa família) |
| `crearTargetaProducte()` | Crea una targeta HTML per un producte del carrusel amb 2 botons |
| `scrollCarrusel(direction)` | Fa scroll del carrusel dinàmicament |
| `updateCarruselButtons()` | Activa/desactiva botons del carrusel |
| `carregarNomComparador()` | Recupera el nom guardat de localStorage |
| `carregarEstatFavorit()` | Recupera l'estat de preferit de localStorage |
| `toggleFavorit()` | Canvia entre favorit/no favorit amb animació visual |
| `guardarComparador()` | Guarda el comparador complet a comparadorsGuardats |

**Event Listeners:**
- `DOMContentLoaded` → carrega comparador, carrusel, nom i estat favorit
- `input` en #nomComparador → guarda automàticament el nom
- `scroll` en tableContainer → updateScrollButtons
- `scroll` en carruselContingut → updateCarruselButtons

**Important:** 
- NO s'utilitzen CustomEvents
- Totes les recàrregues són cridades directes a les funcions
- Càrrega sequencial de l'API per claredat (await una per una)


## Funcionalitats Principals

### 1. Afegir Productes al Comparador

**On:** `llistarProductes.html`

**Com funciona:**
1. Usuari veu la taula de productes
2. Clica botó "Comparar" d'un producte
3. `comparador.afegirProducte(producte)` executa:
   ```javascript
   if (this.productes.some(p => p.product.id === producte.id)) {
       alert("El producte ja està al comparador.");
       return false;
   }
   this.productes.push({ product: producte, sessionId: this.sessionId });
   this.guardarLocalStorage();
   return true;
   ```
4. Si retorna `true`, redirigeix a `comparador.html`

**Validacions:**
- No permet duplicats
- (Comentada) Compatibilitat per família

### 2. Visualitzar Comparació

**On:** `comparador.html`

**Taula generada:**
```
┌─────────────────┬──────────────┬──────────────┬──────────────┐
│Característiques │  Producte 1  │  Producte 2  │  Producte 3  │
│  (sticky)       │ (sticky si   │              │              │
│                 │   ancorat)   │              │              │
├─────────────────┼──────────────┼──────────────┼──────────────┤
│ [X] [📌]        │ [X] [📌]     │ [X] [📌]     │ [X] [📌]     │
│                 │              │              │              │
│ [Imatge]        │ [Imatge]     │ [Imatge]     │ [Imatge]     │
│ Nom Producte    │ Nom Prod.    │ Nom Prod.    │ Nom Prod.    │
│ [+Carret]       │ [+Carret]    │ [+Carret]    │ [+Carret]    │
├─────────────────┼──────────────┼──────────────┼──────────────┤
│ Preu            │   100€       │   150€       │   120€       │
├─────────────────┼──────────────┼──────────────┼──────────────┤
│ Pantalla        │   6.1"       │   6.5"       │   6.3"       │
├─────────────────┼──────────────┼──────────────┼──────────────┤
│ RAM             │   8GB        │   12GB       │   8GB        │
├─────────────────┼──────────────┼──────────────┼──────────────┤
│ Emmagatzematge  │   128GB      │   256GB      │   128GB      │
└─────────────────┴──────────────┴──────────────┴──────────────┘
     ↑                   ↑
  sticky left: 0    sticky left: clamp() (si ancorat)
```

**Característiques:**
- Primera columna sempre visible (sticky, left: 0)
- Segona columna sticky NOMÉS si hi ha producte ancorat
- Scroll horitzontal suau per cel·les
- Botons X i 📌 a l'esquerra de cada producte
- Botons ◄ ► per navegar exactament una cel·la
- Scroll dinàmic: calcula offsetWidth de cada cel·la

### 3. Anclar Producte (Pin)

**On:** `comparador.html`

**Com funciona:**
1. Cada producte té una icona de chincheta
2. Usuari clica la chincheta
3. `comparador.pinProducte(producteId)` executa:
   ```javascript
   this.pinnedProductId = producteId;
   this.guardarLocalStorage();
   ```
4. Dispara event `recarregarComparador`
5. `comparador.obtenirProductes()` reordena:
   ```javascript
   if (this.pinnedProductId) {
       const pinnedIndex = productes.findIndex(p => p.id === this.pinnedProductId);
       if (pinnedIndex > 0) {
           const pinnedProduct = productes.splice(pinnedIndex, 1)[0];
           productes.unshift(pinnedProduct);
       }
   }
   ```
6. Taula es regenera amb el producte ancorat a la primera posició
7. Segona columna es fa sticky

**Indicadors visuals:**
- Chincheta verda (#4CAF50) si està ancorat
- Chincheta grisa (#999) si no està ancorat
- Segona columna amb `sticky-col-2` class

### 4. Eliminar Productes

**On:** `comparador.html`

**Com funciona:**
1. Cada producte té un botó X
2. Usuari clica X
3. `comparador.eliminarProducte(producteId)` executa:
   ```javascript
   this.productes = this.productes.filter(p => p.product.id !== producteId);
   if (this.pinnedProductId === producteId) {
       this.pinnedProductId = null;
   }
   this.guardarLocalStorage();
   ```
4. Dispara event `recarregarComparador`
5. Taula i carrusel es regeneren

### 5. Scroll Horitzontal Intel·ligent

**On:** `comparador.html`

**Com funciona:**

**Detecció automàtica d'ample de cel·la:**
```javascript
function scrollTable(direction) {
    const container = document.getElementById('tableContainer');
    const table = container.querySelector('table');
    
    // Obtenir l'ample dinàmic de la primera cel·la de dades
    const firstCell = table.querySelector('th:nth-child(2), td:nth-child(2)');
    const cellWidth = firstCell.offsetWidth;
    
    // Scroll exactament l'ample d'una cel·la
    const scrollAmount = direction * cellWidth;
    
    container.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
    });
    
    setTimeout(() => {updateScrollButtons();}, 350);
}
```

**Gestió de botons:**
```javascript
function updateScrollButtons() {
    const container = document.getElementById('tableContainer');
    const btnLeft = document.querySelector('.table-wrapper .scroll-btn-left');
    const btnRight = document.querySelector('.table-wrapper .scroll-btn-right');
    
    const scrollLeft = container.scrollLeft;
    const maxScroll = container.scrollWidth - container.clientWidth;
    
    btnLeft.disabled = scrollLeft <= 1;
    btnRight.disabled = maxScroll <= 5 || scrollLeft >= maxScroll - 5;
}
```

**Triggers:**
- Click en botons ◄ ►
- Scroll manual de l'usuari
- Després de cada transició (setTimeout 350ms)

**Avantatges:**
- Scroll responsiu: s'adapta a l'ample real de les cel·les
- Una cel·la per vegada: navegació precisa
- Smooth behavior: transició suau
- Botons intel·ligents: es desactiven quan no es pot fer més scroll

### 6. Carrusel de Productes Relacionats

**On:** `comparador.html`

**Què mostra:**
- Productes de la mateixa família que els del comparador
- Exclou productes ja afegits al comparador
- Només es mostra si hi ha productes relacionats disponibles

**Lògica de filtratge:**
```javascript
async function carregarCarrusel() {
    // Obtenir família del primer producte del comparador
    const productesComparador = comparador.obtenirProductes();
    if (productesComparador.length === 0) return;
    
    const familyId = productesComparador[0].family_id;
    
    // Filtrar productes de la mateixa família
    const productesRelacionats = productes.filter(p => 
        p.family_id === familyId && 
        !productesComparador.some(pc => pc.id === p.id)
    );
    
    // Crear targetes per cada producte
    productesRelacionats.forEach(producte => {
        const targeta = crearTargetaProducte(producte, productImages);
        carruselContingut.appendChild(targeta);
    });
}
```

**Targeta de producte:**
```html
<div class="carrusel-item">
    <img src="[url]" alt="[nom]">
    <h3>[Nom del producte]</h3>
    <p class="preu">[Preu]€</p>
    <div class="carrusel-botons">
        <button class="btn-afegir-carrusel" onclick="afegirProducteComparador()">
            Afegir a comparar
        </button>
        <button class="btn-afegir-carrusel" onclick="afegirAlCarret()">
            Afegir al carret
        </button>
    </div>
</div>
```

**Característiques:**
- Dos botons per producte: "Afegir a comparar" i "Afegir al carret"
- Botons en layout flex costat a costat (flex: 1 cadascun)
- Imatges responsive
- Preus destacats
- Scroll horitzontal suau amb botons ◄ ►

**Interacció:**
1. Usuari clica "Afegir a comparar"
2. Producte s'afegeix al comparador
3. Es crida directament `carregarComparador()` i `carregarCarrusel()`
4. Taula s'actualitza amb el nou producte
5. Producte desapareix del carrusel (ja està al comparador)

**Scroll del carrusel:**
```javascript
function scrollCarrusel(direction) {
    const container = document.getElementById('carruselContingut');
    const firstItem = container.querySelector('.carrusel-item');
    if (!firstItem) return;
    
    const itemWidth = firstItem.offsetWidth;
    const gap = parseFloat(getComputedStyle(container).gap) || 0;
    const scrollAmount = direction * (itemWidth + gap);
    
    container.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
    });
}
```

---

## API i Connexions

### URL Base
```javascript
const apiUrl = 'https://api.serverred.es';
```

### Endpoints

| Endpoint | Mètode | Retorn | Classe |
|----------|--------|--------|--------|
| `/Product` | GET | Array de productes | `Product` |
| `/Family` | GET | Array de famílies | `Family` |
| `/Attribute` | GET | Array d'atributs | `Attribute` |
| `/Productattribute` | GET | Array de relacions producte-atribut | `ProductAttribute` |
| `/Productimage` | GET | Array d'imatges de productes | `ProductImage` |

### Format de Resposta

**Tots els endpoints retornen:**
```javascript
[
    [
        { ...objecte1 },
        { ...objecte2 },
        ...
    ]
]
// o simplement
[
    { ...objecte1 },
    { ...objecte2 },
    ...
]
```

**Normalització:**
```javascript
static async carregarProductes(apiUrl) {
    const resp = await fetch(`${apiUrl}/Product`);
    let data = await resp.json();
    
    // Si data és un array d'arrays, agafar el primer array
    if (Array.isArray(data) && data.length > 0 && Array.isArray(data[0])) {
        data = data[0];
    }
    
    return data.map(p => new Product(...));
}
```

### Gestió d'Errors

**Exemple en comparador.js:**
```javascript
try {
    productes = await Product.carregarProductes(apiUrl);
    families = await Family.carregarFamilies(apiUrl);
    // ...
} catch (error) {
    console.error('Error carregant dades:', error);
    taula.innerHTML = '<tr><td colspan="5">Error carregant dades de l\'API</td></tr>';
    return;
}
```

### Optimització amb Càrrega Sequencial

**Nota important:** El projecte actual NO utilitza Promise.all, sinó càrrega sequencial per claredat:

```javascript
async function carregarComparador() {
    try {
        const productes = await Product.carregarProductes(apiUrl);
        const families = await Family.carregarFamilies(apiUrl);
        const attributes = await Attribute.carregarAtributs(apiUrl);
        const productAttributes = await ProductAttribute.carregarProductAtributs(apiUrl);
        const productImages = await ProductImage.carregarProductImages(apiUrl);
        
        // ... resta del codi
    } catch (error) {
        console.error('Error carregant el comparador:', error);
    }
}
```

**Avantatges:**
- Codi més fàcil de llegir i depurar
- Errors més fàcils de traces
- Ordre d'execució explícit i predictible

---

## LocalStorage i Persistència

### Clau de LocalStorage
```javascript
localStorage.setItem('comparador', JSON.stringify(data));
```

### Estructura de Dades Guardades

```javascript
{
    sessionId: "550e8400-e29b-41d4-a716-446655440000",  // UUID
    pinnedProductId: 5,  // null si no hi ha producte ancorat
    productes: [
        {
            id: 1,
            name: "iPhone 14",
            price: 999,
            description: "...",
            family_id: 2,
            active: true
        },
        {
            id: 5,
            name: "Samsung Galaxy S23",
            // ...
        }
    ]
}
```

### Operacions

#### 1. Guardar
```javascript
guardarLocalStorage() {
    localStorage.setItem('comparador', JSON.stringify({
        sessionId: this.sessionId,
        productes: this.productes.map(p => p.product),
        pinnedProductId: this.pinnedProductId
    }));
}
```

**Quan es guarda:**
- Després d'afegir un producte
- Després d'eliminar un producte
- Després d'anclar/desanclar un producte

#### 2. Carregar
```javascript
carregarLocalStorage() {
    const data = localStorage.getItem('comparador');
    if (!data) return;
    
    const obj = JSON.parse(data);
    this.sessionId = obj.sessionId;
    this.pinnedProductId = obj.pinnedProductId || null;
    this.productes = obj.productes.map(product => ({ 
        product: product, 
        sessionId: this.sessionId 
    }));
}
```

**Quan es carrega:**
- A l'inicialitzar el comparador en `comparador.html`
- A l'inicialitzar el comparador en `llistarProductes.html`

#### 3. Netejar (no implementat explícitament)
```javascript
// Possible implementació futura
netejarComparador() {
    this.productes = [];
    this.pinnedProductId = null;
    localStorage.removeItem('comparador');
}
```

### Persistència entre Pàgines

**Flux:**
```
llistarProductes.html
    │
    ├─> Usuari afegeix Producte A
    │   └─> localStorage.setItem('comparador', {...})
    │
    ├─> Redirigeix a comparador.html
    │
comparador.html
    │
    ├─> DOMContentLoaded
    │   └─> comparador.carregarLocalStorage()
    │       └─> localStorage.getItem('comparador')
    │           └─> Producte A apareix a la taula
    │
    ├─> Usuari afegeix Producte B des del carrusel
    │   └─> localStorage.setItem('comparador', {...})
    │
    ├─> Usuari refresca la pàgina (F5)
    │   └─> comparador.carregarLocalStorage()
    │       └─> Productes A i B apareixen
```

### LocalStorage Addicional

**Nom del comparador:**
```javascript
localStorage.setItem('nomComparador', 'Comparativa mòbils 2025');
localStorage.getItem('nomComparador');
```

**Estat de preferit:**
```javascript
localStorage.setItem('comparadorFavorit', 'true');
localStorage.getItem('comparadorFavorit'); // 'true' o 'false'
```

**Comparadors guardats:**
```javascript
{
    comparadorsGuardats: [
        {
            nom: "Comparativa mòbils 2025",
            productes: [...],
            pinnedProductId: 5,
            esFavorit: true,
            data: "2025-11-27T10:30:00.000Z"
        },
        {
            nom: "Portàtils gaming",
            productes: [...],
            pinnedProductId: null,
            esFavorit: false,
            data: "2025-11-26T15:20:00.000Z"
        }
    ]
}
```

---

## Interfície d'Usuari

### Barra de Controls del Comparador

**Ubicació:** Dalt de la taula del comparador

**Components:**

1. **Esquerra:**
   - Input text editable pel nom
   - Botó de preferit (cor)
   - Botó de guardar (disquet)

2. **Dreta:**
   - Botó d'afegir producte (plus)

**Estils:**
- Fons gris clar (#f8f8f8)
- Border i border-radius per separació visual
- Flex layout amb space-between
- Totalment responsiu

### Taula Comparativa

**Layout:**
- Primera columna sticky (noms atributs)
- Segona columna sticky si producte ancorat
- Scroll horitzontal per cel·les
- Botons X i 📌 en cada columna de producte
- Imatges responsive
- Preus destacats

### Carrusel de Productes Relacionats

**Layout:**
- Títol "Podria interessar-te també:"
- Items amb min/max width responsive
- Dos botons per producte (flex costat a costat)
- Botons de navegació ◄ ►
- Scroll suau amb gap entre items

### Colors i Estils

**Botons principals:**
- Blau (#007bff) per accions primàries
- Verd (#28a745) per guardar
- Vermell (#ff4757) per preferits actius
- Gris (#666) per accions secundàries

**Estats:**
- :hover amb canvis de color
- :disabled amb opacity reduïda
- .favorit-actiu amb fons rosa

---

## Disseny Responsiu

### Unitats Utilitzades

**Absolutament NO es fan servir px fixos**, tot és responsiu:

- `clamp(min, preferit, max)` - Valors adaptatius
- `rem` - Relatius a font-size root
- `em` - Relatius al font-size del pare
- `vw` - Viewport width
- `%` - Percentatges

**Exemples:**
```css
/* Taula */
min-width: clamp(15rem, 20vw, 17.5rem);
padding: clamp(0.75rem, 2vw, 1rem);

/* Botons */
font-size: clamp(0.875rem, 2vw, 1rem);
padding: 0.625em 1.5em;

/* Sticky columns */
left: clamp(15rem, 20vw, 17.5rem);

/* Carrusel */
min-width: clamp(12rem, 25vw, 16rem);
gap: clamp(1rem, 2vw, 1.5rem);

/* Input nom */
min-width: clamp(12rem, 20vw, 15rem);
```

### NO hi ha Animacions

**Important:** Tot el CSS està lliure d'animacions:
- NO `transition`
- NO `transform`
- NO `animation`
- NO `@keyframes`

**Raó:** Preferència de l'usuari per interfície directa sense efectes.

### Breakpoints Implícits

Amb `clamp()` no calen media queries explícites:
- Pantalles petites: usa el valor mínim
- Pantalles mitjanes: usa el valor preferit (vw)
- Pantalles grans: usa el valor màxim

### Scroll Dinàmic

El scroll s'adapta automàticament:
```javascript
const cellWidth = firstCell.offsetWidth; // Dinàmic!
const scrollAmount = direction * cellWidth;
```

No hi ha valors hardcoded com `280px`, tot es calcula en temps real.

---

## Comunicació entre Components

### NO es fan servir CustomEvents

**Important:** El projecte NO utilitza `CustomEvent` ni `dispatchEvent`.

**Abans (eliminat):**
```javascript
// ❌ Això NO s'utilitza
document.dispatchEvent(new CustomEvent('recarregarComparador'));
document.addEventListener('recarregarComparador', async () => {
    await carregarComparador();
});
```

**Ara (correcte):**
```javascript
// ✅ Cridades directes
async function eliminarProducte(id) {
    comparador.eliminarProducte(id);
    await carregarComparador();
    await carregarCarrusel();
}
```

### Flux de Comunicació

```
comparador.class.js (Model)
         │
         │ métodes: afegirProducte(), eliminarProducte(), pinProducte()
         │
         ▼
comparadorFuncions.js (Controller)
         │
         │ funcions: carregarComparador(), carregarCarrusel()
         │
         ▼
comparador.html (View)
```

**Patró:** Model-View-Controller simple amb cridades directes

---

## Estructura Final de Fitxers

```
ComparadorMillor/
├── comparador.html                 # Vista principal del comparador
├── llistarProductes.html          # Vista de llistat de productes
├── comparadorFuncions.js          # Lògica del comparador (controller)
├── comparador.js                  # Lògica del llistat
├── comparador.class.js            # Classe model Comparador
├── Product.class.js               # Classe model Product
├── Family.class.js                # Classe model Family
├── Attribute.class.js             # Classe model Attribute
├── ProductAttribute.js            # Classe model ProductAttribute
├── ProductImage.class.js          # Classe model ProductImage
├── style.css                      # Estils 100% responsiu
└── DOCUMENTACIO.md                # Aquest document
```

---

## Resum de Funcionalitats Actuals

✅ **Implementat i funcionant:**

1. Comparador de productes amb taula dinàmica
2. Columnes fixades (sticky) - primera sempre, segona si hi ha pin
3. Pin de producte per anclar-lo a primera posició
4. Eliminar productes del comparador
5. Carrusel de productes relacionats (mateixa família)
6. Dos botons per producte del carrusel (comparar + carret)
7. Scroll horitzontal intel·ligent per cel·les
8. Nom editable del comparador amb guardesa automàtica
9. Sistema de preferits amb toggle visual
10. Guardar comparadors complets amb timestamp
11. Botó per afegir més productes
12. Disseny 100% responsiu sense px
13. Zero animacions/transitions
14. Comunicació directa sense CustomEvents
15. Càrrega sequencial de l'API

📦 **Persistència:**
- Comparador actual en `comparador`
- Nom en `nomComparador`
- Estat favorit en `comparadorFavorit`
- Històric en `comparadorsGuardats`

🎨 **Disseny:**
- Totalment responsiu amb clamp(), rem, em, vw
- Columnes sticky amb z-index adequat
- Botons amb icones Font Awesome
- Colors consistents i accessibles
- Cap animació ni transició

---

**Data d'actualització:** 27 de novembre de 2025

