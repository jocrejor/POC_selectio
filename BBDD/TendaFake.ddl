
USE tendaFake;
 
-- ESborrar totes els taules 
DROP TABLE IF EXISTS Productimage;
DROP TABLE IF EXISTS Productattribute;
DROP TABLE IF EXISTS User;
DROP TABLE IF EXISTS Register;

DROP TABLE IF EXISTS Cartdetail; 
DROP TABLE IF EXISTS Orderdetail;
DROP TABLE IF EXISTS Comparator;
DROP TABLE IF EXISTS Favorite;
DROP TABLE IF EXISTS Productsale;
DROP TABLE IF EXISTS Sale;

 DROP TABLE IF EXISTS Cart;

 DROP TABLE IF EXISTS `Order`;
 DROP TABLE IF EXISTS Attribute;
 DROP TABLE IF EXISTS Client;
 DROP TABLE IF EXISTS City;
 DROP TABLE IF EXISTS Province;
 DROP TABLE IF EXISTS Country;

 DROP TABLE IF EXISTS Product;
 DROP TABLE IF EXISTS Family;
 DROP TABLE IF EXISTS Rol;

-- Taula: family
CREATE TABLE Family (
    id INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
    name VARCHAR(100) NOT NULL,
    image VARCHAR(200) NOT NULL,
    description VARCHAR(250) NOT NULL,
    parent_id INT,
    CONSTRAINT fk_parent FOREIGN KEY (parent_id) REFERENCES Family(id)
);


/* Taula: Product */
CREATE TABLE Product (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(150) NOT NULL,
    price DECIMAL(7,2),
    description TEXT,
    family_id INT,
    active BOOLEAN,
    FOREIGN KEY (family_id) REFERENCES Family(id)
);


/* Taula: Productimage */
CREATE TABLE Productimage (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255),
    url VARCHAR(255),
    `order` INT,
    product_id INT,
    FOREIGN KEY (product_id) REFERENCES Product(id)
);

-- Taula d'Atributs
CREATE TABLE Attribute (
    id INT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    family_id INT,
    FOREIGN KEY (family_id) REFERENCES Family(id)
);

-- Taula intermitja ProductAttribute per la relació N:N
CREATE TABLE Productattribute (
    product_id INT,
    attribute_id INT,
    value VARCHAR(255),
    PRIMARY KEY (product_id, attribute_id),
    FOREIGN KEY (product_id) REFERENCES Product(id),
    FOREIGN KEY (attribute_id) REFERENCES Attribute(id)
);


-- Taula: Rol
CREATE TABLE Rol (
    id INT PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

-- Taula: User
CREATE TABLE User (
    id INT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    nickname VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(30) NOT NULL,
    rol_id INT NOT NULL,
    CONSTRAINT fk_user_rol FOREIGN KEY (rol_id) REFERENCES Rol(id)
);veureMissatge


/* JSON de valors de pais- provincia - ciutat    
https://github.com/millan2993/countries/tree/master/json
*/

-- Taula: Country
CREATE TABLE Country (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

-- Taula: Province
CREATE TABLE Province (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    country_id INT NOT NULL,
    FOREIGN KEY (country_id) REFERENCES Country(id) ON DELETE CASCADE
);

-- Taula: City
CREATE TABLE City (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    province_id INT NOT NULL,
    FOREIGN KEY (province_id) REFERENCES Province(id) ON DELETE CASCADE
);

-- Taula: Sale
CREATE TABLE Sale (
    id INT AUTO_INCREMENT PRIMARY KEY,
    description VARCHAR(100) NOT NULL,
    discount_percent DECIMAL(5,2) NOT NULL CHECK (discount_percent >= 0 AND discount_percent <= 100),
    coupon VARCHAR(15),
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_dates CHECK (end_date > start_date)
);
-- Taula: Prductsale
CREATE TABLE Productsale (
    sale_id INT,
    product_id INT,
    PRIMARY KEY (sale_id, product_id),
    CONSTRAINT fk_sale_id FOREIGN KEY (sale_id) REFERENCES Sale(id), 
    CONSTRAINT fk_product_id FOREIGN KEY (product_id) REFERENCES Product(id)
);



-- Taula: client:
CREATE TABLE Client (
    id INT AUTO_INCREMENT PRIMARY KEY,
    taxidtype VARCHAR(6) NOT NULL,
    taxid VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    surname VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    birth_date DATE,
    address VARCHAR(100) NOT NULL,
    cp VARCHAR(15) NOT NULL,
    country_id INT NOT NULL,
    province_id INT NOT NULL,
    city_id INT NOT NULL,
    CONSTRAINT fk_country_client_id FOREIGN KEY (country_id) REFERENCES Country(id),
    CONSTRAINT fk_province_client_id FOREIGN KEY (province_id) REFERENCES Province(id),
    CONSTRAINT fk_city_client_id FOREIGN KEY (city_id) REFERENCES City(id)
);


-- Taula: Order ( Revisar ENUM)
CREATE TABLE `Order` (
    id INT PRIMARY KEY AUTO_INCREMENT,
    date DATETIME NOT NULL,
    payment ENUM('Credit Card', 'bizum', 'paypal', 'bank transfer') NOT NULL DEFAULT 'Credit Card',
    total_amount DECIMAL(10,2) NOT NULL,
    shipping_amount DECIMAL(10,2) DEFAULT 0.00,
    client_id INT NOT NULL,
    CONSTRAINT fk_client_id FOREIGN KEY (client_id) REFERENCES Client(id)
);

-- Taula: Orderdetail
CREATE TABLE Orderdetail (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    discount DECIMAL(5,2) DEFAULT 0.00,
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    CONSTRAINT fk_order_detail_id FOREIGN KEY (order_id) REFERENCES `Order`(id),
    CONSTRAINT fk_product_detail_id FOREIGN KEY (product_id) REFERENCES Product(id)
);



-- Taula: Cart

CREATE TABLE Cart (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sessionId VARCHAR(100) NOT NULL,
    date DATE NOT NULL,
    user_agent VARCHAR(255),
    total_amount DECIMAL(10,2) DEFAULT 0,
    client_id INT,
    CONSTRAINT fk_client_cart_id FOREIGN KEY (client_id) REFERENCES Client(id)
);

-- Taula Cartdetail 

CREATE TABLE Cartdetail (
    id INT PRIMARY KEY AUTO_INCREMENT,
    price DECIMAL(10,2) NOT NULL,
    discount DECIMAL(5,2) DEFAULT 0,
    quantity INT NOT NULL,
    cart_id INT NOT NULL,
    product_id INT NOT NULL,
    CONSTRAINT fk_cartdetail_cart  FOREIGN KEY (cart_id) REFERENCES Cart(id),
    CONSTRAINT fk_cartdetail_product  FOREIGN KEY (product_id) REFERENCES Product(id)
);
-- Taula: Comparator

CREATE TABLE Comparator(
    id INT PRIMARY KEY AUTO_INCREMENT ,
    session_id VARCHAR(100) NOT NULL,
    user_agent VARCHAR(100) NOT NULL,
    client_id INT,
    CONSTRAINT fk_comparator_client FOREIGN KEY (client_id) REFERENCES Client(id)
);


-- Taula: Comparator_Product

CREATE TABLE Comparator_Product(
    comparator_id INT,
    product_id INT,
    PRIMARY KEY (comparator_id, product_id),
    CONSTRAINT fk_cp_comparator FOREIGN KEY (comparator_id) REFERENCES Comparator(id) ON DELETE CASCADE,
    CONSTRAINT fk_cp_product FOREIGN KEY (product_id) REFERENCES Product(id)
);

-- Taula: Favorite
CREATE TABLE Favorite (
    id  INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR (255),
    client_id INT NOT NULL,
    comparator_id INT NOT NULL,
    CONSTRAINT fk_client_favorite_id FOREIGN KEY (client_id) REFERENCES Client(id),
    CONSTRAINT fk_comparator_favorite_id FOREIGN KEY (comparator_id) REFERENCES Comparator(id)
);


-- Taula: Register
CREATE TABLE Register (
    id  INT PRIMARY KEY AUTO_INCREMENT,
    session_id VARCHAR(100) NOT NULL,
    user_agent VARCHAR(100) NOT NULL,
    client_id INT NOT NULL, 
    comparator_id INT NOT NULL,
    favorite_id INT NOT NULL,
    date_start DATETIME,
    date_end DATETIME,
    CONSTRAINT fk_client_register_id FOREIGN KEY (client_id) REFERENCES Client(id),
    CONSTRAINT fk_comparator_register_id FOREIGN KEY (comparator_id) REFERENCES Comparator(id),
    CONSTRAINT fk_favorite_register_id FOREIGN KEY (favorite_id) REFERENCES Favorite(id)
);

- Taula: Comparator_Product

CREATE TABLE Register_Product(
    register_id INT,
    product_id INT,
    PRIMARY KEY (register_id, product_id),
    CONSTRAINT fk_cp_ FOREIGN KEY (register_id) REFERENCES Register(id),
    CONSTRAINT fk_cp_product FOREIGN KEY (product_id) REFERENCES Product(id)
);


/* CREATE TABLE Controlpanel (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    source ENUM('csv', 'api', 'manual', 'scraping') NOT NULL DEFAULT 'manual',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);*/