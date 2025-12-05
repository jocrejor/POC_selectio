
let Family = [
  {
    "id": 1,
    "name": "Equipos informáticos",
    "image": "equipos_informaticos.jpg",
    "description": "Categoría principal de dispositivos y componentes de computación.",
    "parent_id": null
  },
  {
    "id": 2,
    "name": "Ordenadores",
    "image": "ordenadores.jpg",
    "description": "Equipos de cómputo que procesan información.",
    "parent_id": 1
  },
  {
    "id": 3,
    "name": "Periféricos",
    "image": "perifericos.jpg",
    "description": "Dispositivos que complementan el funcionamiento del ordenador.",
    "parent_id": 1
  },
  {
    "id": 4,
    "name": "Portátiles",
    "image": "portatiles.jpg",
    "description": "Ordenadores compactos y transportables.",
    "parent_id": 2
  },
  {
    "id": 5,
    "name": "Sobremesa",
    "image": "sobremesa.jpg",
    "description": "Ordenadores fijos de mayor potencia y capacidad de expansión.",
    "parent_id": 2
  },
  {
    "id": 6,
    "name": "Ratones",
    "image": "ratones.jpg",
    "description": "Periféricos de entrada para controlar el cursor.",
    "parent_id": 3
  },
  {
    "id": 7,
    "name": "Teclados",
    "image": "teclados.jpg",
    "description": "Periféricos de entrada para introducir texto y comandos.",
    "parent_id": 3
  },
  {
    "id": 8,
    "name": "Monitores",
    "image": "monitores.jpg",
    "description": "Periféricos de salida que muestran información visual.",
    "parent_id": 3
  },
  {
    "id": 9,
    "name": "Gaming Laptop",
    "image": "gaming_laptop.jpg",
    "description": "Portátil de alto rendimiento diseñado para videojuegos.",
    "parent_id": 4
  },
  {
    "id": 10,
    "name": "Mini PC",
    "image": "mini_pc.jpg",
    "description": "Ordenador de sobremesa compacto y eficiente en energía.",
    "parent_id": 5
  }
]

let Product = [
  { "id": 1, "name": "HP Pavilion 15", "price": 799.99, "description": "Portátil con procesador Intel Core i7, 16GB RAM y SSD 512GB.", "family_id": 4, "active": true },
  { "id": 2, "name": "Lenovo IdeaPad 3", "price": 599.00, "description": "Portátil ligero con AMD Ryzen 5 y pantalla Full HD.", "family_id": 4, "active": true },
  { "id": 3, "name": "Asus ZenBook 14", "price": 999.99, "description": "Ultraportátil con pantalla OLED y chasis de aluminio.", "family_id": 4, "active": true },
  { "id": 4, "name": "Acer Aspire 5", "price": 549.99, "description": "Portátil equilibrado para uso doméstico y oficina.", "family_id": 4, "active": true },
  { "id": 5, "name": "Gaming Laptop MSI Katana", "price": 1199.00, "description": "Portátil gamer con RTX 4060 y pantalla de 144Hz.", "family_id": 4, "active": true },

  { "id": 6, "name": "Dell OptiPlex 7010", "price": 649.50, "description": "Sobremesa compacto con procesador Intel i5.", "family_id": 5, "active": true },
  { "id": 7, "name": "HP Envy Desktop", "price": 899.99, "description": "PC de sobremesa de alto rendimiento con diseño moderno.", "family_id": 5, "active": true },
  { "id": 8, "name": "Lenovo ThinkCentre M70", "price": 749.00, "description": "Sobremesa empresarial con excelente fiabilidad.", "family_id": 5, "active": true },
  { "id": 9, "name": "Asus ROG Strix G10", "price": 1099.00, "description": "PC gamer con RTX 4070 y refrigeración avanzada.", "family_id": 5, "active": true },
  { "id": 10, "name": "Mini PC Intel NUC", "price": 499.99, "description": "PC compacto con bajo consumo energético.", "family_id": 5, "active": true },

  { "id": 11, "name": "Logitech MX Master 3", "price": 89.99, "description": "Ratón inalámbrico ergonómico con funciones avanzadas.", "family_id": 6, "active": true },
  { "id": 12, "name": "Razer DeathAdder V2", "price": 59.99, "description": "Ratón gamer con sensor óptico de alta precisión.", "family_id": 6, "active": true },
  { "id": 13, "name": "HP Wireless Mouse 200", "price": 19.99, "description": "Ratón inalámbrico básico para uso diario.", "family_id": 6, "active": true },
  { "id": 14, "name": "Apple Magic Mouse 2", "price": 99.00, "description": "Ratón multitáctil con batería recargable.", "family_id": 6, "active": true },
  { "id": 15, "name": "Logitech G Pro X Superlight", "price": 149.00, "description": "Ratón gamer ultraligero de alto rendimiento.", "family_id": 6, "active": true },

  { "id": 16, "name": "Corsair K70 RGB TKL", "price": 129.95, "description": "Teclado mecánico compacto con iluminación RGB.", "family_id": 7, "active": true },
  { "id": 17, "name": "Logitech G213 Prodigy", "price": 69.99, "description": "Teclado de membrana para gaming con iluminación.", "family_id": 7, "active": true },
  { "id": 18, "name": "Razer BlackWidow V4", "price": 179.99, "description": "Teclado mecánico RGB con switches verdes.", "family_id": 7, "active": true },
  { "id": 19, "name": "SteelSeries Apex 5", "price": 99.99, "description": "Teclado híbrido mecánico con pantalla OLED.", "family_id": 7, "active": true },
  { "id": 20, "name": "Apple Magic Keyboard", "price": 119.00, "description": "Teclado inalámbrico con batería recargable.", "family_id": 7, "active": true },

  { "id": 21, "name": "Samsung Odyssey G5", "price": 299.00, "description": "Monitor curvo QHD de 27 pulgadas.", "family_id": 8, "active": true },
  { "id": 22, "name": "LG UltraGear 32GN600", "price": 349.99, "description": "Monitor gaming de 32'' con 165Hz y HDR10.", "family_id": 8, "active": true },
  { "id": 23, "name": "Dell UltraSharp U2723QE", "price": 599.00, "description": "Monitor profesional 4K con panel IPS.", "family_id": 8, "active": true },
  { "id": 24, "name": "Asus ProArt PA278QV", "price": 399.00, "description": "Monitor de edición gráfica calibrado de fábrica.", "family_id": 8, "active": true },
  { "id": 25, "name": "BenQ Zowie XL2411K", "price": 229.99, "description": "Monitor eSports de 24'' y 144Hz.", "family_id": 8, "active": true },

  { "id": 26, "name": "MacBook Pro 14", "price": 1999.00, "description": "Portátil profesional con chip Apple M3 Pro.", "family_id": 9, "active": true },
  { "id": 27, "name": "ASUS ROG Zephyrus G14", "price": 1799.00, "description": "Portátil gamer de 14'' con GPU RTX 4060.", "family_id": 9, "active": true },
  { "id": 28, "name": "Lenovo Legion 5 Pro", "price": 1699.00, "description": "Portátil gaming QHD con sistema de refrigeración avanzado.", "family_id": 9, "active": true },
  { "id": 29, "name": "Acer Nitro 5", "price": 1099.00, "description": "Portátil gamer con gran relación calidad-precio.", "family_id": 9, "active": true },
  { "id": 30, "name": "HP Omen 16", "price": 1499.00, "description": "Portátil gamer con RTX 4070 y pantalla 165Hz.", "family_id": 9, "active": true },

  { "id": 31, "name": "Intel NUC 13 Pro", "price": 599.00, "description": "Mini PC con procesador Intel i7 de 13ª generación.", "family_id": 10, "active": false },
  { "id": 32, "name": "Beelink SER5", "price": 449.00, "description": "Mini PC compacto con Ryzen 7 5800H y SSD 512GB.", "family_id": 10, "active": true },
  { "id": 33, "name": "MINISFORUM UM790 Pro", "price": 649.00, "description": "Mini PC de alto rendimiento con AMD Ryzen 9.", "family_id": 10, "active": true },
  { "id": 34, "name": "Geekom Mini IT13", "price": 729.00, "description": "Mini PC versátil con puertos múltiples y 32GB RAM.", "family_id": 10, "active": true },
  { "id": 35, "name": "CHUWI HeroBox Pro", "price": 299.00, "description": "Mini PC económico para tareas de oficina.", "family_id": 10, "active": true },

  { "id": 36, "name": "iMac 24'' M3", "price": 1599.00, "description": "Ordenador todo en uno con chip M3 y pantalla Retina.", "family_id": 2, "active": true },
  { "id": 37, "name": "Dell XPS Tower", "price": 1299.00, "description": "Ordenador de alto rendimiento para tareas exigentes.", "family_id": 2, "active": true },
  { "id": 38, "name": "Lenovo ThinkStation P3", "price": 1899.00, "description": "Workstation profesional con tarjeta gráfica dedicada.", "family_id": 2, "active": true },
  { "id": 39, "name": "HP All-in-One 24", "price": 749.00, "description": "PC todo en uno con pantalla Full HD.", "family_id": 2, "active": true },
  { "id": 40, "name": "Asus ExpertCenter D5", "price": 899.00, "description": "Sobremesa de oficina silencioso y compacto.", "family_id": 2, "active": true },

  { "id": 41, "name": "Impresora HP LaserJet M140w", "price": 129.99, "description": "Impresora láser inalámbrica compacta.", "family_id": 3, "active": true },
  { "id": 42, "name": "Auriculares Logitech H390", "price": 49.99, "description": "Auriculares USB con micrófono y cancelación de ruido.", "family_id": 3, "active": true },
  { "id": 43, "name": "Webcam Logitech C920", "price": 89.99, "description": "Cámara Full HD para videollamadas y streaming.", "family_id": 3, "active": true },
  { "id": 44, "name": "Micrófono Blue Yeti", "price": 139.99, "description": "Micrófono profesional USB para grabación.", "family_id": 3, "active": true },
  { "id": 45, "name": "Altavoces Creative Pebble V3", "price": 59.99, "description": "Altavoces USB compactos con Bluetooth.", "family_id": 3, "active": true },

  { "id": 46, "name": "Placa base ASUS Prime B550M-A", "price": 129.00, "description": "Placa base para procesadores AMD Ryzen.", "family_id": 1, "active": true },
  { "id": 47, "name": "Tarjeta gráfica NVIDIA RTX 4080", "price": 1399.00, "description": "GPU de alto rendimiento para juegos y diseño 3D.", "family_id": 1, "active": true },
  { "id": 48, "name": "Fuente de alimentación Corsair RM750x", "price": 129.00, "description": "Fuente modular de 750W con certificación Gold.", "family_id": 1, "active": true },
  { "id": 49, "name": "Memoria RAM Kingston Fury 32GB", "price": 149.00, "description": "Kit DDR5 de alto rendimiento.", "family_id": 1, "active": true },
  { "id": 50, "name": "SSD Samsung 990 PRO 1TB", "price": 189.99, "description": "Unidad de almacenamiento NVMe de última generación.", "family_id": 1, "active": true }
];


let Productimage = [

{ "id": 1,"name":"hp_pavilion_15_front", "url":"https://img.pccomponentes.com/articles/1073/10733273/1864-hp-pavilion-15-eg3014ns-intel-core-i7-1355u-16gb-512gb-ssd-156.jpg","order": 1,"product_id": 1},
{ "id": 2,"name":"hp_pavilion_15_side", "url":"https://img.pccomponentes.com/articles/1073/10733273/3451-hp-pavilion-15-eg3014ns-intel-core-i7-1355u-16gb-512gb-ssd-156-mejor-precio.jpg","order": 2,"product_id": 1},
{ "id": 3,"name":"hp_pavilion_15_back", "url":"https://thumb.pccomponentes.com/w-530-530/articles/1093/10936069/3890-hp-15-fd0279ns-156-intel-core-i5-1335u-16gb-1tb-ssd-iris-xe-graphics-mejor-precio.jpg","order": 3,"product_id": 1},
{ "id": 4,"name":"lenovo_ideaPad_3_front", "url":"https://img.pccomponentes.com/articles/1074/10741770/1109-lenovo-ideapad-3-15alc6-amd-ryzen-7-5700u-16-gb-512-gb-ssd-156.jpg","order": 1,"product_id": 2},
{ "id": 5,"name":"lenovo_ideaPad_3_side", "url":"https://img.pccomponentes.com/articles/1074/10741770/5640-lenovo-ideapad-3-15alc6-amd-ryzen-7-5700u-16-gb-512-gb-ssd-156-caracteristicas.jpg","order": 2,"product_id": 2},
{ "id": 6,"name":"lenovo_ideaPad_3_back", "url":"https://img.pccomponentes.com/articles/1074/10741770/6578-lenovo-ideapad-3-15alc6-amd-ryzen-7-5700u-16-gb-512-gb-ssd-156-opiniones.jpg","order": 3,"product_id": 2},
{ "id": 7,"name":"asus_zenBook_14_front", "url":"https://thumb.pccomponentes.com/w-530-530/articles/1086/10868929/1210-asus-zenbook-14-oled-ux3405ca-pz284w-intel-core-ultra-7-255h-16gb-1tb-ssd-14-tactil-948d8a05-42bb-4815-9307-b6b810efc605.jpg","order": 1,"product_id": 3},
{ "id": 8,"name":"asus_zenBook_14_side", "url":"https://thumb.pccomponentes.com/w-530-530/articles/1086/10868929/3189-asus-zenbook-14-oled-ux3405ca-pz284w-intel-core-ultra-7-255h-16gb-1tb-ssd-14-tactil-mejor-precio.jpg","order": 2,"product_id": 3},
{ "id": 9,"name":"asus_zenBook_14_back", "url":"https://thumb.pccomponentes.com/w-530-530/articles/1086/10868929/6112-asus-zenbook-14-oled-ux3405ca-pz284w-intel-core-ultra-7-255h-16gb-1tb-ssd-14-tactil-opiniones.jpg","order": 3,"product_id": 3},
{ "id": 10,"name":"acer_aspire_5_front", "url":"https://thumb.pccomponentes.com/w-530-530/articles/1072/10726971/1293-acer-aspire-3-a315-58-32ee-intel-core-i3-1115g4-8gb-512gb-ssd-156-9d76b4ca-0ba6-4186-8cdc-bbe79b8703d7.jpg","order": 1,"product_id": 4},
{ "id": 11,"name":"acer_aspire_5_side", "url":"https://thumb.pccomponentes.com/w-530-530/articles/1072/10726971/291-acer-aspire-3-a315-58-32ee-intel-core-i3-1115g4-8gb-512gb-ssd-156-comprar.jpg","order": 2,"product_id": 4},
{ "id": 12,"name":"acer_aspire_5_back", "url":"https://thumb.pccomponentes.com/w-530-530/articles/1072/10726971/517-acer-aspire-3-a315-58-32ee-intel-core-i3-1115g4-8gb-512gb-ssd-156-caracteristicas.jpg","order": 3,"product_id": 4},
{ "id": 13,"name":"gaming_laptop_MSI_katana_front", "url":"https://thumb.pccomponentes.com/w-530-530/articles/1081/10810260/1528-msi-raider-ge68-hx-14vgg-267xes-intel-core-i9-14900hx-32gb-1tb-ssd-rtx-4070-16.jpg","order": 1,"product_id": 5},
{ "id": 14,"name":"gaming_laptop_MSI_katana_side", "url":"https://thumb.pccomponentes.com/w-530-530/articles/1081/10810260/285-msi-raider-ge68-hx-14vgg-267xes-intel-core-i9-14900hx-32gb-1tb-ssd-rtx-4070-16-comprar.jpg","order": 2,"product_id": 5},
{ "id": 15,"name":"gaming_laptop_MSI_katana_back", "url":"https://thumb.pccomponentes.com/w-530-530/articles/1081/10810260/6336-msi-raider-ge68-hx-14vgg-267xes-intel-core-i9-14900hx-32gb-1tb-ssd-rtx-4070-16-opiniones.jpg","order": 3,"product_id": 5}
]


let Order = [
  { "id": 1, "date": "2025-10-01 14:30", "payment": "Credit Card", "total_amount": 120.50, "shipping_amount": 5.00, "client_id": 101 },
  { "id": 2, "date": "2025-10-05 09:15", "payment": "PayPal", "total_amount": 75.99, "shipping_amount": 0.00, "client_id": 102 },
  { "id": 3, "date": "2025-10-07 18:45", "payment": "Bizum", "total_amount": 230.00, "shipping_amount": 10.00, "client_id": 103 },
  { "id": 4, "date": "2025-10-09 11:00", "payment": "Bank Transfer", "total_amount": 150.75, "shipping_amount": 7.50, "client_id": 104 },
  { "id": 5, "date": "2025-10-11 16:20", "payment": "Credit Card", "total_amount": 89.90, "shipping_amount": 0.00, "client_id": 105 },
  { "id": 6, "date": "2025-10-12 19:05", "payment": "PayPal", "total_amount": 300.00, "shipping_amount": 15.00, "client_id": 106 }
];

let Orderdetail = [
  { "id": 1, "order_id": 1, "product_id": 201, "discount": 0.00, "quantity": 2, "price": 25.00 },
  { "id": 2, "order_id": 1, "product_id": 202, "discount": 5.00, "quantity": 1, "price": 75.50 },
  { "id": 3, "order_id": 2, "product_id": 203, "discount": 0.00, "quantity": 3, "price": 20.00 },
  { "id": 4, "order_id": 3, "product_id": 201, "discount": 10.00, "quantity": 5, "price": 25.00 },
  { "id": 5, "order_id": 3, "product_id": 204, "discount": 0.00, "quantity": 2, "price": 50.00 }
];


let Client = [
  {
    "id": 1,
    "taxidtype": "DNI",
    "taxid": "12345678A",
    "name": "Jose",
    "surname": "López",
    "email": "jose@example.com",
    "password": "123456",
    "phone": "+34600111222",
    "birth_date": "1995-05-15",
    "address": "Calle Mayor 12",
    "cp": "28013",
    "country_id": 1,
    "province_id": 1,
    "city_id": 1
  },
  {
    "id": 2,
    "taxidtype": "NIE",
    "taxid": "X2345678B",
    "name": "Alejandro",
    "surname": "Pérez",
    "email": "alex@example.com",
    "password": "123456",
    "phone": "+34600333444",
    "birth_date": "1990-09-22",
    "address": "Avenida del Sol 45",
    "cp": "08021",
    "country_id": 1,
    "province_id": 2,
    "city_id": 3
  },
  {
    "id": 3,
    "taxidtype": "DNI",
    "taxid": "87654321C",
    "name": "Marta",
    "surname": "Sánchez",
    "email": "marta@example.com",
    "password": "123456",
    "phone": "+34600555666",
    "birth_date": "1988-12-01",
    "address": "Plaza España 7",
    "cp": "41001",
    "country_id": 1,
    "province_id": 3,
    "city_id": 5
  },
  {
    "id": 4,
    "taxidtype": "DNI",
    "taxid": "23456789D",
    "name": "Carlos",
    "surname": "Díaz",
    "email": "carlos@example.com",
    "password": "123456",
    "phone": "+34600777888",
    "birth_date": "1992-03-10",
    "address": "Calle Luna 9",
    "cp": "46002",
    "country_id": 1,
    "province_id": 4,
    "city_id": 7
  },
  {
    "id": 5,
    "taxidtype": "NIE",
    "taxid": "Y3456789E",
    "name": "Lucía",
    "surname": "Fernández",
    "email": "lucia@example.com",
    "password": "123456",
    "phone": "+34600999000",
    "birth_date": "1998-07-25",
    "address": "Calle Estrella 21",
    "cp": "50001",
    "country_id": 1,
    "province_id": 5,
    "city_id": 9
  }
];

let Register = [
  {
    id: 1,
    session_id: "abc123xyz",
    user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3",
    client_id: 1,
    comparator_id: 2,
    favorite_id: 3,
    date_start: "2025-10-01 00:00",
    date_end: "2025-10-31 23:59"
  },
  {
    id: 2,
    session_id: "def456uvw",
    user_agent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Safari/605.1.15",
    client_id: 2,
    comparator_id: 3,
    favorite_id: 4,
    date_start: "2025-10-05 00:00",
    date_end: "2025-11-05 23:59"
  },
  {
    id: 3,
    session_id: "ghi789rst",
    user_agent: "Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.106 Mobile Safari/537.36",
    client_id: 3,
    comparator_id: 4,
    favorite_id: 5,
    date_start: "2025-10-10 00:00",
    date_end: "2025-11-10 23:59"
  },
  {
    id: 4,
    session_id: "abc123xyz",
    user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/116.0.5845.96 Safari/537.36",
    client_id: 4,
    comparator_id: 5,
    favorite_id: 6,
    date_start: "2025-10-10 00:00",
    date_end: "2025-11-10 23:59"
  },
  {
    id: 5,
    session_id: "jkl456uvw",
    user_agent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Firefox/119.0",
    client_id: 5,
    comparator_id: 6,
    favorite_id: 7,
    date_start: "2025-10-10 00:00",
    date_end: "2025-11-10 23:59"
  },
  {
    id: 6,
    session_id: "mno789pqr",
    user_agent: "Mozilla/5.0 (Linux; Android 12; Pixel 6) Chrome/115.0.5790.171 Mobile Safari/537.36",
    client_id: 6,
    comparator_id: 7,
    favorite_id: 8,
    date_start: "2025-10-10 00:00",
    date_end: "2025-11-10 23:59"
  },
  {
    id: 7,
    session_id: "stu234vwx",
    user_agent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148",
    client_id: 7,
    comparator_id: 8,
    favorite_id: 9,
    date_start: "2025-10-10 00:00",
    date_end: "2025-11-10 23:59"
  },
  {
    id: 8,
    session_id: "yza567bcd",
    user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0",
    client_id: 8,
    comparator_id: 9,
    favorite_id: 10,
    date_start: "2025-10-10 00:00",
    date_end: "2025-11-10 23:59"
  },
  {
    id: 9,
    session_id: "efg890hij",
    user_agent: "Mozilla/5.0 (Linux; Android 13; SM-S911B) Chrome/120.0.6099.71 Mobile Safari/537.36",
    client_id: 9,
    comparator_id: 10,
    favorite_id: 11,
    date_start: "2025-10-10 00:00",
    date_end: "2025-11-10 23:59"
  },
  {
    id: 10,
    session_id: "klm321nop",
    user_agent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15 Safari/605.1.15",
    client_id: 10,
    comparator_id: 11,
    favorite_id: 12,
    date_start: "2025-10-10 00:00",
    date_end: "2025-11-10 23:59"
  },
  {
    id: 11,
    session_id: "qrs654tuv",
    user_agent: "Mozilla/5.0 (Windows NT 11.0; Win64; x64) Chrome/121.0.6151.100 Safari/537.36",
    client_id: 11,
    comparator_id: 12,
    favorite_id: 13,
    date_start: "2025-10-10 00:00",
    date_end: "2025-11-10 23:59"
  },
  {
    id: 12,
    session_id: "wxy987zab",
    user_agent: "Mozilla/5.0 (Linux; Android 14; Pixel 8 Pro) Chrome/122.0.6167.120 Mobile Safari/537.36",
    client_id: 12,
    comparator_id: 13,
    favorite_id: 14,
    date_start: "2025-10-10 00:00",
    date_end: "2025-11-10 23:59"
  },
  {
    id: 13,
    session_id: "cde432fgh",
    user_agent: "Mozilla/5.0 (Windows NT 10.0; WOW64) Edge/117.0.2045.31",
    client_id: 13,
    comparator_id: 14,
    favorite_id: 15,
    date_start: "2025-10-10 00:00",
    date_end: "2025-11-10 23:59"
  },
  {
    id: 14,
    session_id: "ijk765lmn",
    user_agent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_5) Chrome/115.0.5790.114 Safari/537.36",
    client_id: 14,
    comparator_id: 15,
    favorite_id: 16,
    date_start: "2025-10-10 00:00",
    date_end: "2025-11-10 23:59"
  },
  {
    id: 15,
    session_id: "opq098rst",
    user_agent: "Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Safari/605.1.15",
    client_id: 15,
    comparator_id: 16,
    favorite_id: 17,
    date_start: "2025-10-10 00:00",
    date_end: "2025-11-10 23:59"
  },
  {
    id: 16,
    session_id: "uvw321xyz",
    user_agent: "Mozilla/5.0 (Linux; Android 11; Redmi Note 10) Chrome/120.0.6099.112 Mobile Safari/537.36",
    client_id: 16,
    comparator_id: 17,
    favorite_id: 18,
    date_start: "2025-10-10 00:00",
    date_end: "2025-11-10 23:59"
  },
  {
    id: 17,
    session_id: "abc654def",
    user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/119.0.6045.200 Safari/537.36",
    client_id: 17,
    comparator_id: 18,
    favorite_id: 19,
    date_start: "2025-10-10 00:00",
    date_end: "2025-11-10 23:59"
  },
  {
    id: 18,
    session_id: "ghi987jkl",
    user_agent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 12_6) Safari/605.1.15",
    client_id: 18,
    comparator_id: 19,
    favorite_id: 20,
    date_start: "2025-10-10 00:00",
    date_end: "2025-11-10 23:59"
  },
  {
    id: 19,
    session_id: "mno210pqr",
    user_agent: "Mozilla/5.0 (Linux; Android 13; OnePlus 11) Chrome/121.0.6153.81 Mobile Safari/537.36",
    client_id: 19,
    comparator_id: 20,
    favorite_id: 21,
    date_start: "2025-10-10 00:00",
    date_end: "2025-11-10 23:59"
  },
  {
    id: 20,
    session_id: "stu543vwx",
    user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0",
    client_id: 20,
    comparator_id: 21,
    favorite_id: 22,
    date_start: "2025-10-10 00:00",
    date_end: "2025-11-10 23:59"
  },
  {
    id: 21,
    session_id: "yza876bcd",
    user_agent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_1) Chrome/123.0.6262.58 Safari/537.36",
    client_id: 21,
    comparator_id: 22,
    favorite_id: 23,
    date_start: "2025-10-10 00:00",
    date_end: "2025-11-10 23:59"
  },
  {
    id: 22,
    session_id: "efg109hij",
    user_agent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) Safari/605.1.15",
    client_id: 22,
    comparator_id: 23,
    favorite_id: 24,
    date_start: "2025-10-10 00:00",
    date_end: "2025-11-10 23:59"
  },
  {
    id: 23,
    session_id: "klm432nop",
    user_agent: "Mozilla/5.0 (Linux; Android 10; SM-A505F) Chrome/117.0.5938.89 Mobile Safari/537.36",
    client_id: 23,
    comparator_id: 24,
    favorite_id: 25,
    date_start: "2025-10-10 00:00",
    date_end: "2025-11-10 23:59"
  },
  {
    id: 24,
    session_id: "qrs765tuv",
    user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Edg/118.0.2088.46",
    client_id: 24,
    comparator_id: 25,
    favorite_id: 26,
    date_start: "2025-10-10 00:00",
    date_end: "2025-11-10 23:59"
  },
  {
    id: 25,
    session_id: "wxy098zab",
    user_agent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_6) Firefox/118.0",
    client_id: 25,
    comparator_id: 26,
    favorite_id: 27,
    date_start: "2025-10-10 00:00",
    date_end: "2025-11-10 23:59"
  },
  {
    id: 26,
    session_id: "cde321fgh",
    user_agent: "Mozilla/5.0 (Linux; Android 12; Galaxy A54) Chrome/120.0.6099.100 Mobile Safari/537.36",
    client_id: 26,
    comparator_id: 27,
    favorite_id: 28,
    date_start: "2025-10-10 00:00",
    date_end: "2025-11-10 23:59"
  },
  {
    id: 27,
    session_id: "ijk654lmn",
    user_agent: "Mozilla/5.0 (Windows NT 11.0; Win64; x64) Chrome/124.0.6360.42 Safari/537.36",
    client_id: 27,
    comparator_id: 28,
    favorite_id: 29,
    date_start: "2025-10-10 00:00",
    date_end: "2025-11-10 23:59"
  },
  {
    id: 28,
    session_id: "opq987rst",
    user_agent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 12_3) Safari/605.1.15",
    client_id: 28,
    comparator_id: 29,
    favorite_id: 30,
    date_start: "2025-10-10 00:00",
    date_end: "2025-11-10 23:59"
  },
  {
    id: 29,
    session_id: "uvw210xyz",
    user_agent: "Mozilla/5.0 (Linux; Android 14; SM-S926B) Chrome/122.0.6167.140 Mobile Safari/537.36",
    client_id: 29,
    comparator_id: 30,
    favorite_id: 31,
    date_start: "2025-10-10 00:00",
    date_end: "2025-11-10 23:59"
  },
  {
    id: 30,
    session_id: "abc543def",
    user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:122.0) Gecko/20100101 Firefox/122.0",
    client_id: 30,
    comparator_id: 31,
    favorite_id: 32,
    date_start: "2025-10-10 00:00",
    date_end: "2025-11-10 23:59"
  }
];

let Rol = [
  { "id": 1, "name": "Admin" },
  { "id": 2, "name": "Usuari" }
];

let User = [
  { "id": 1, "name": "Laura Martínez", "email": "laura.martinez@fakecommerce.com", "nickname": "lauram", "password": "Lm2025!", "rol_id": 1 },
  { "id": 2, "name": "Carlos Gómez", "email": "carlos.gomez@fakecommerce.com", "nickname": "carlosg", "password": "Cg_admin$", "rol_id": 1 },
  { "id": 3, "name": "María López", "email": "maria.lopez@fakecommerce.com", "nickname": "marial", "password": "Mlopez#25", "rol_id": 2 },
  { "id": 4, "name": "Javier Ruiz", "email": "javier.ruiz@fakecommerce.com", "nickname": "javiruiz", "password": "Jr_Store123", "rol_id": 2 },
  { "id": 5, "name": "Ana Torres", "email": "ana.torres@fakecommerce.com", "nickname": "anatorres", "password": "AnT@2025", "rol_id": 2 },
  { "id": 6, "name": "David Fernández", "email": "david.fernandez@fakecommerce.com", "nickname": "davidf", "password": "Df_pass99", "rol_id": 2 },
  { "id": 7, "name": "Lucía Navarro", "email": "lucia.navarro@fakecommerce.com", "nickname": "lucianav", "password": "Lnav2025!", "rol_id": 2 },
  { "id": 8, "name": "Pedro Ortega", "email": "pedro.ortega@fakecommerce.com", "nickname": "pedroo", "password": "Po_Tienda#", "rol_id": 2 },
  { "id": 9, "name": "Sofía Ramos", "email": "sofia.ramos@fakecommerce.com", "nickname": "sofiar", "password": "Sr_Admin!", "rol_id": 1 },
  { "id": 10, "name": "Miguel Sánchez", "email": "miguel.sanchez@fakecommerce.com", "nickname": "miguels", "password": "Ms_admin@25", "rol_id": 1 }
];
const Attribute = [

  { id: 1, name: "Procesador", family_id: 1 },
  { id: 2, name: "Número de núcleos", family_id: 1 },
  { id: 3, name: "Frecuencia CPU", family_id: 1 },
  { id: 4, name: "Memoria RAM", family_id: 1 },
  { id: 5, name: "Tarjeta gráfica", family_id: 1 },
  { id: 6, name: "Placa base", family_id: 1 },
  { id: 7, name: "Tipo de refrigeración", family_id: 1 },

  { id: 8, name: "Capacidad disco duro", family_id: 6 },
  { id: 9, name: "Tipo de disco (SSD/HDD)", family_id: 6 },
  { id: 10, name: "Velocidad de lectura/escritura", family_id: 6 },
  { id: 11, name: "Ranuras de expansión", family_id: 6 },

  { id: 12, name: "Resolución pantalla", family_id: 4 },
  { id: 13, name: "Tipo de pantalla", family_id: 4 },
  { id: 14, name: "Tamaño pantalla", family_id: 4 },
  { id: 15, name: "Brillo", family_id: 4 },
  { id: 16, name: "Contraste", family_id: 4 },

  { id: 17, name: "Puertos USB", family_id: 3 },
  { id: 18, name: "Puerto HDMI", family_id: 3 },
  { id: 19, name: "Bluetooth", family_id: 3 },
  { id: 20, name: "Wi-Fi", family_id: 3 },
  { id: 21, name: "NFC", family_id: 3 },

  { id: 22, name: "Capacidad batería", family_id: 5 },
  { id: 23, name: "Tipo de batería", family_id: 5 },
  { id: 24, name: "Duración batería", family_id: 5 },
  { id: 25, name: "Carga rápida", family_id: 5 },

  { id: 26, name: "Sistema operativo", family_id: 2 },
  { id: 27, name: "Versión OS", family_id: 2 },
  { id: 28, name: "Software incluido", family_id: 2 },
  { id: 29, name: "Compatibilidad con aplicaciones", family_id: 2 },
  { id: 30, name: "Actualizaciones automáticas", family_id: 2 }
];



const Productattribute = [
  
  { product_id: 1, attribute_id: 1, value: "Negro" },
  { product_id: 1, attribute_id: 3, value: "0.2 kg" },
  { product_id: 1, attribute_id: 5, value: "SoundBeat" },
  { product_id: 1, attribute_id: 12, value: "6 horas" },
  { product_id: 1, attribute_id: 18, value: "IPX4" },


  { product_id: 2, attribute_id: 2, value: "42 pulgadas" },
  { product_id: 2, attribute_id: 4, value: "Plástico y aluminio" },
  { product_id: 2, attribute_id: 5, value: "SmartVision" },
  { product_id: 2, attribute_id: 10, value: "A+" },
  { product_id: 2, attribute_id: 14, value: "Netflix, YouTube" },

 
  { product_id: 3, attribute_id: 1, value: "Gris" },
  { product_id: 3, attribute_id: 3, value: "1.4 kg" },
  { product_id: 3, attribute_id: 6, value: "AB14" },
  { product_id: 3, attribute_id: 13, value: "Wi-Fi 6" },
  { product_id: 3, attribute_id: 16, value: "3.2 GHz" },

  
  { product_id: 4, attribute_id: 2, value: "4 cm diámetro" },
  { product_id: 4, attribute_id: 4, value: "Silicona" },
  { product_id: 4, attribute_id: 5, value: "PulseFit" },
  { product_id: 4, attribute_id: 13, value: "Bluetooth 5.1" },
  { product_id: 4, attribute_id: 18, value: "IP68" },


  { product_id: 5, attribute_id: 1, value: "Negro" },
  { product_id: 5, attribute_id: 3, value: "1.2 kg" },
  { product_id: 5, attribute_id: 5, value: "Photon" },
  { product_id: 5, attribute_id: 11, value: "6000x4000 px" },
  { product_id: 5, attribute_id: 8, value: "Photon Ltd." },

  
  { product_id: 6, attribute_id: 1, value: "Blanco" },
  { product_id: 6, attribute_id: 2, value: "15 pulgadas" },
  { product_id: 6, attribute_id: 5, value: "EcoBook" },
  { product_id: 6, attribute_id: 12, value: "12 horas" },
  { product_id: 6, attribute_id: 16, value: "3.5 GHz" },

  
  { product_id: 7, attribute_id: 1, value: "Azul" },
  { product_id: 7, attribute_id: 2, value: "Pequeño" },
  { product_id: 7, attribute_id: 5, value: "AquaSound" },
  { product_id: 7, attribute_id: 15, value: "600 mAh" },
  { product_id: 7, attribute_id: 18, value: "IPX7" },

 
  { product_id: 8, attribute_id: 2, value: "27 pulgadas" },
  { product_id: 8, attribute_id: 4, value: "Aluminio" },
  { product_id: 8, attribute_id: 5, value: "UltraVision" },
  { product_id: 8, attribute_id: 11, value: "4K UHD" },
  { product_id: 8, attribute_id: 17, value: "230 V" },


  { product_id: 9, attribute_id: 1, value: "Rojo" },
  { product_id: 9, attribute_id: 3, value: "1.1 kg" },
  { product_id: 9, attribute_id: 5, value: "FirePhone" },
  { product_id: 9, attribute_id: 7, value: "2 años" },
  { product_id: 9, attribute_id: 9, value: "China" },


  { product_id: 10, attribute_id: 2, value: "12 pulgadas" },
  { product_id: 10, attribute_id: 4, value: "Aluminio" },
  { product_id: 10, attribute_id: 5, value: "MiniTab" },
  { product_id: 10, attribute_id: 12, value: "8 horas" },
  { product_id: 10, attribute_id: 15, value: "128 GB" },

 
  { product_id: 11, attribute_id: 1, value: "Plateado" },
  { product_id: 11, attribute_id: 3, value: "1.5 kg" },
  { product_id: 11, attribute_id: 5, value: "ProLaptop" },
  { product_id: 11, attribute_id: 13, value: "Wi-Fi 6E" },
  { product_id: 11, attribute_id: 16, value: "3.8 GHz" },


  { product_id: 12, attribute_id: 2, value: "20 cm" },
  { product_id: 12, attribute_id: 4, value: "Plástico" },
  { product_id: 12, attribute_id: 5, value: "GardenSensor" },
  { product_id: 12, attribute_id: 12, value: "24 horas" },
  { product_id: 12, attribute_id: 18, value: "IP65" },

 
  { product_id: 13, attribute_id: 1, value: "Verde" },
  { product_id: 13, attribute_id: 3, value: "2 kg" },
  { product_id: 13, attribute_id: 5, value: "EcoSpeaker" },
  { product_id: 13, attribute_id: 15, value: "1200 mAh" },
  { product_id: 13, attribute_id: 18, value: "IPX6" },

 
  { product_id: 14, attribute_id: 2, value: "32 pulgadas" },
  { product_id: 14, attribute_id: 4, value: "Aluminio" },
  { product_id: 14, attribute_id: 5, value: "VisionPlus" },
  { product_id: 14, attribute_id: 10, value: "A" },
  { product_id: 14, attribute_id: 14, value: "YouTube, Prime Video" },

 
  { product_id: 15, attribute_id: 1, value: "Negro" },
  { product_id: 15, attribute_id: 3, value: "0.5 kg" },
  { product_id: 15, attribute_id: 5, value: "MiniSpeaker" },
  { product_id: 15, attribute_id: 12, value: "7 horas" },
  { product_id: 15, attribute_id: 18, value: "IPX5" },

 
  { product_id: 16, attribute_id: 2, value: "10 pulgadas" },
  { product_id: 16, attribute_id: 4, value: "Aluminio" },
  { product_id: 16, attribute_id: 5, value: "TabLite" },
  { product_id: 16, attribute_id: 12, value: "10 horas" },
  { product_id: 16, attribute_id: 15, value: "64 GB" },

 
  { product_id: 17, attribute_id: 1, value: "Blanco" },
  { product_id: 17, attribute_id: 3, value: "0.3 kg" },
  { product_id: 17, attribute_id: 5, value: "SoundMini" },
  { product_id: 17, attribute_id: 15, value: "500 mAh" },
  { product_id: 17, attribute_id: 18, value: "IPX3" },

 
  { product_id: 18, attribute_id: 2, value: "17 pulgadas" },
  { product_id: 18, attribute_id: 4, value: "Aluminio" },
  { product_id: 18, attribute_id: 5, value: "ProDisplay" },
  { product_id: 18, attribute_id: 11, value: "Full HD" },
  { product_id: 18, attribute_id: 17, value: "220 V" },

  
  { product_id: 19, attribute_id: 1, value: "Gris claro" },
  { product_id: 19, attribute_id: 3, value: "0.9 kg" },
  { product_id: 19, attribute_id: 5, value: "AlphaWatch" },
  { product_id: 19, attribute_id: 12, value: "5 días" },
  { product_id: 19, attribute_id: 18, value: "IP67" },


  { product_id: 20, attribute_id: 2, value: "22 pulgadas" },
  { product_id: 20, attribute_id: 4, value: "Plástico" },
  { product_id: 20, attribute_id: 5, value: "SmartMonitor" },
  { product_id: 20, attribute_id: 10, value: "A+" },
  { product_id: 20, attribute_id: 14, value: "Netflix, Hulu" },


  { product_id: 21, attribute_id: 1, value: "Azul marino" },
  { product_id: 21, attribute_id: 3, value: "1.3 kg" },
  { product_id: 21, attribute_id: 5, value: "OceanSpeaker" },
  { product_id: 21, attribute_id: 15, value: "1000 mAh" },
  { product_id: 21, attribute_id: 18, value: "IPX7" },


  { product_id: 22, attribute_id: 2, value: "19 pulgadas" },
  { product_id: 22, attribute_id: 4, value: "Aluminio" },
  { product_id: 22, attribute_id: 5, value: "VisionMax" },
  { product_id: 22, attribute_id: 11, value: "2K" },
  { product_id: 22, attribute_id: 17, value: "230 V" },


  { product_id: 23, attribute_id: 1, value: "Rojo brillante" },
  { product_id: 23, attribute_id: 3, value: "0.6 kg" },
  { product_id: 23, attribute_id: 5, value: "FireMini" },
  { product_id: 23, attribute_id: 12, value: "9 horas" },
  { product_id: 23, attribute_id: 18, value: "IPX4" },


  { product_id: 24, attribute_id: 2, value: "16 pulgadas" },
  { product_id: 24, attribute_id: 4, value: "Aluminio" },
  { product_id: 24, attribute_id: 5, value: "TabPro" },
  { product_id: 24, attribute_id: 12, value: "11 horas" },
  { product_id: 24, attribute_id: 15, value: "256 GB" },

  { product_id: 25, attribute_id: 1, value: "Negro mate" },
  { product_id: 25, attribute_id: 3, value: "0.8 kg" },
  { product_id: 25, attribute_id: 5, value: "StealthPhone" },
  { product_id: 25, attribute_id: 7, value: "2 años" },
  { product_id: 25, attribute_id: 9, value: "USA" }
];

const Sale = [
  { id: 1, description: "Black Friday Tech", discount_percent: 35.00, coupon: "BLACKFRIDAY25", start_date: "2025-11-25 00:00:00", end_date: "2025-11-30 23:59:59", created_at: "2025-10-15 00:00:00" },
  { id: 2, description: "Cyber Monday", discount_percent: 30.00, coupon: "CYBER2025", start_date: "2025-12-01 00:00:00", end_date: "2025-12-02 23:59:59", created_at: "2025-10-20 00:00:00" },
  { id: 3, description: "Navidad Tecnológica", discount_percent: 25.00, coupon: "XMAS25", start_date: "2025-12-20 00:00:00", end_date: "2025-12-27 23:59:59", created_at: "2025-11-01 00:00:00" },
  { id: 4, description: "Rebajas de Enero", discount_percent: 20.00, coupon: "ENERO20", start_date: "2026-01-05 00:00:00", end_date: "2026-01-20 23:59:59", created_at: "2025-12-28 00:00:00" },
  { id: 5, description: "Semana del Gamer", discount_percent: 18.00, coupon: "GAMER18", start_date: "2025-09-15 00:00:00", end_date: "2025-09-22 23:59:59", created_at: "2025-09-01 00:00:00" },
  { id: 6, description: "Ofertas de Halloween", discount_percent: 22.00, coupon: "HALLOWEEN22", start_date: "2025-10-25 00:00:00", end_date: "2025-11-02 23:59:59", created_at: "2025-10-10 00:00:00" },
  { id: 7, description: "Semana del Portátil", discount_percent: 15.00, coupon: "LAPTOP15", start_date: "2025-03-10 00:00:00", end_date: "2025-03-17 23:59:59", created_at: "2025-02-28 00:00:00" },
  { id: 8, description: "Verano Tecnológico", discount_percent: 20.00, coupon: "SUMMER20", start_date: "2025-07-01 00:00:00", end_date: "2025-07-15 23:59:59", created_at: "2025-06-10 00:00:00" },
  { id: 9, description: "Back to School", discount_percent: 18.50, coupon: "SCHOOL18", start_date: "2025-09-01 00:00:00", end_date: "2025-09-10 23:59:59", created_at: "2025-08-20 00:00:00" },
  { id: 10, description: "Ofertas de Primavera", discount_percent: 17.00, coupon: "SPRING17", start_date: "2025-04-10 00:00:00", end_date: "2025-04-20 23:59:59", created_at: "2025-04-01 00:00:00" },
  { id: 11, description: "Semana del PC Sobremesa", discount_percent: 15.50, coupon: "DESKTOP15", start_date: "2025-02-10 00:00:00", end_date: "2025-02-20 23:59:59", created_at: "2025-01-30 00:00:00" },
  { id: 12, description: "Fin de Semana Gamer", discount_percent: 19.00, coupon: "WEEKEND19", start_date: "2025-05-03 00:00:00", end_date: "2025-05-05 23:59:59", created_at: "2025-04-25 00:00:00" },
  { id: 13, description: "Semana del Monitor", discount_percent: 16.00, coupon: "MONITOR16", start_date: "2025-06-10 00:00:00", end_date: "2025-06-20 23:59:59", created_at: "2025-06-01 00:00:00" },
  { id: 14, description: "Ofertas de San Valentín", discount_percent: 14.00, coupon: "LOVE14", start_date: "2025-02-10 00:00:00", end_date: "2025-02-15 23:59:59", created_at: "2025-01-25 00:00:00" },
  { id: 15, description: "Día del Padre", discount_percent: 10.00, coupon: "PADRE10", start_date: "2025-03-14 00:00:00", end_date: "2025-03-20 23:59:59", created_at: "2025-03-01 00:00:00" },
  { id: 16, description: "Semana del Ratón y Teclado", discount_percent: 12.00, coupon: "PERIPHERAL12", start_date: "2025-05-15 00:00:00", end_date: "2025-05-25 23:59:59", created_at: "2025-05-01 00:00:00" },
  { id: 17, description: "Ofertas de Fin de Curso", discount_percent: 20.00, coupon: "CURSO20", start_date: "2025-06-20 00:00:00", end_date: "2025-06-30 23:59:59", created_at: "2025-06-05 00:00:00" },
  { id: 18, description: "Semana del Hardware", discount_percent: 13.00, coupon: "HARDWARE13", start_date: "2025-03-01 00:00:00", end_date: "2025-03-08 23:59:59", created_at: "2025-02-15 00:00:00" },
  { id: 19, description: "Fin de Temporada Invierno", discount_percent: 19.00, coupon: "WINTER19", start_date: "2025-02-20 00:00:00", end_date: "2025-02-28 23:59:59", created_at: "2025-02-10 00:00:00" },
  { id: 20, description: "Semana del Cliente", discount_percent: 15.00, coupon: "CLIENT15", start_date: "2025-08-10 00:00:00", end_date: "2025-08-17 23:59:59", created_at: "2025-07-30 00:00:00" },
  { id: 21, description: "Ofertas del Día del Trabajador", discount_percent: 18.00, coupon: "MAYO18", start_date: "2025-05-01 00:00:00", end_date: "2025-05-03 23:59:59", created_at: "2025-04-20 00:00:00" },
  { id: 22, description: "Fin de Semana Apple", discount_percent: 15.00, coupon: "APPLE15", start_date: "2025-09-20 00:00:00", end_date: "2025-09-22 23:59:59", created_at: "2025-09-10 00:00:00" },
  { id: 23, description: "Semana ASUS ROG", discount_percent: 17.00, coupon: "ROG17", start_date: "2025-04-01 00:00:00", end_date: "2025-04-10 23:59:59", created_at: "2025-03-20 00:00:00" },
  { id: 24, description: "Ofertas Flash Junio", discount_percent: 10.00, coupon: "FLASH10", start_date: "2025-06-01 00:00:00", end_date: "2025-06-03 23:59:59", created_at: "2025-05-25 00:00:00" },
  { id: 25, description: "Aniversario TendaFake", discount_percent: 25.00, coupon: "BIRTHDAY25", start_date: "2025-08-01 00:00:00", end_date: "2025-08-07 23:59:59", created_at: "2025-07-15 00:00:00" },
  { id: 26, description: "Semana del Mini PC", discount_percent: 14.00, coupon: "MINIPC14", start_date: "2025-11-05 00:00:00", end_date: "2025-11-12 23:59:59", created_at: "2025-10-25 00:00:00" },
  { id: 27, description: "Promoción Día del Soltero", discount_percent: 30.00, coupon: "11NOV30", start_date: "2025-11-11 00:00:00", end_date: "2025-11-12 23:59:59", created_at: "2025-10-28 00:00:00" },
  { id: 28, description: "Semana del Software", discount_percent: 10.50, coupon: "SOFT10", start_date: "2025-04-15 00:00:00", end_date: "2025-04-22 23:59:59", created_at: "2025-04-05 00:00:00" },
  { id: 29, description: "Fin de Semana del Accesorio", discount_percent: 12.00, coupon: "ACCES12", start_date: "2025-05-10 00:00:00", end_date: "2025-05-12 23:59:59", created_at: "2025-05-01 00:00:00" },
  { id: 30, description: "Ofertas de Año Nuevo", discount_percent: 22.00, coupon: "NEWYEAR22", start_date: "2025-12-31 00:00:00", end_date: "2026-01-03 23:59:59", created_at: "2025-12-15 00:00:00" }
];

const ProductSale = [
  // Black Friday - grandes descuentos
  { sale_id: 1, product_id: 5 },  // Gaming Laptop MSI Katana
  { sale_id: 1, product_id: 9 },  // Asus ROG Strix G10
  { sale_id: 1, product_id: 27 }, // ASUS ROG Zephyrus G14

  // Cyber Monday - portátiles y sobremesas
  { sale_id: 2, product_id: 1 },  // HP Pavilion 15
  { sale_id: 2, product_id: 2 },  // Lenovo IdeaPad 3
  { sale_id: 2, product_id: 6 },  // Dell OptiPlex 7010

  // Navidad Tecnológica
  { sale_id: 3, product_id: 21 }, // Samsung Odyssey G5
  { sale_id: 3, product_id: 25 }, // BenQ Zowie XL2411K
  { sale_id: 3, product_id: 30 }, // HP Omen 16

  // Rebajas de Enero
  { sale_id: 4, product_id: 10 }, // Mini PC Intel NUC
  { sale_id: 4, product_id: 31 }, // Intel NUC 13 Pro
  { sale_id: 4, product_id: 32 }, // Beelink SER5

  // Semana del Gamer
  { sale_id: 5, product_id: 27 }, // ASUS ROG Zephyrus G14
  { sale_id: 5, product_id: 28 }, // Lenovo Legion 5 Pro
  { sale_id: 5, product_id: 29 }, // Acer Nitro 5

  // Halloween
  { sale_id: 6, product_id: 47 }, // Tarjeta gráfica NVIDIA RTX 4080
  { sale_id: 6, product_id: 49 }, // Memoria RAM Kingston Fury 32GB
  { sale_id: 6, product_id: 48 }, // Fuente Corsair RM750x

  // Semana del Portátil
  { sale_id: 7, product_id: 3 },  // Asus ZenBook 14
  { sale_id: 7, product_id: 4 },  // Acer Aspire 5
  { sale_id: 7, product_id: 26 }, // MacBook Pro 14

  // Verano Tecnológico
  { sale_id: 8, product_id: 34 }, // Geekom Mini IT13
  { sale_id: 8, product_id: 35 }, // CHUWI HeroBox Pro
  { sale_id: 8, product_id: 20 }, // Apple Magic Keyboard

  // Back to School
  { sale_id: 9, product_id: 1 },  // HP Pavilion 15
  { sale_id: 9, product_id: 2 },  // Lenovo IdeaPad 3
  { sale_id: 9, product_id: 24 }, // Asus ProArt PA278QV

  // Ofertas de Primavera
  { sale_id: 10, product_id: 8 }, // Lenovo ThinkCentre M70
  { sale_id: 10, product_id: 7 }, // HP Envy Desktop
  { sale_id: 10, product_id: 6 }, // Dell OptiPlex 7010

  // Día del Padre
  { sale_id: 15, product_id: 43 }, // Webcam Logitech C920
  { sale_id: 15, product_id: 44 }, // Micrófono Blue Yeti
  { sale_id: 15, product_id: 45 }, // Altavoces Creative Pebble V3

  // San Valentín
  { sale_id: 14, product_id: 13 }, // HP Wireless Mouse 200
  { sale_id: 14, product_id: 17 }, // Logitech G213 Prodigy
  { sale_id: 14, product_id: 19 }, // SteelSeries Apex 5

  // Semana del Monitor
  { sale_id: 13, product_id: 21 }, // Samsung Odyssey G5
  { sale_id: 13, product_id: 22 }, // LG UltraGear 32GN600
  { sale_id: 13, product_id: 23 }, // Dell UltraSharp U2723QE

  // Semana del Mini PC
  { sale_id: 26, product_id: 31 }, // Intel NUC 13 Pro
  { sale_id: 26, product_id: 32 }, // Beelink SER5
  { sale_id: 26, product_id: 35 }, // CHUWI HeroBox Pro

  // Día del Soltero (11.11)
  { sale_id: 27, product_id: 5 },  // Gaming Laptop MSI Katana
  { sale_id: 27, product_id: 9 },  // Asus ROG Strix G10
  { sale_id: 27, product_id: 47 }, // RTX 4080

  // Aniversario TendaFake
  { sale_id: 25, product_id: 1 },
  { sale_id: 25, product_id: 10 },
  { sale_id: 25, product_id: 20 },

  // Año Nuevo
  { sale_id: 30, product_id: 3 },
  { sale_id: 30, product_id: 7 },
  { sale_id: 30, product_id: 28 }
];

let Favorite = [
  { "id": 1, "name": "Portátiles Gaming", "client_id ": 1, "comparator_id": 1 },
  { "id": 2, "name": "Monitores 4K", "client_id ": 2, "comparator_id": 2 },
  { "id": 3, "name": "Ratones Inalámbricos", "client_id ": 3, "comparator_id": 3 },
  { "id": 4, "name": "Teclados Mecánicos RGB", "client_id ": 4, "comparator_id": 4 },
  { "id": 5, "name": "Mini PCs Compactos", "client_id ": 5, "comparator_id": 5 },
  { "id": 6, "name": "Sobremesas para Oficina", "client_id ": 1, "comparator_id": 6 },
  { "id": 7, "name": "Auriculares con Micrófono", "client_id ": 2, "comparator_id": 7 },
  { "id": 8, "name": "Impresoras Láser", "client_id ": 3, "comparator_id": 8 },
  { "id": 9, "name": "Tarjetas Gráficas NVIDIA", "client_id ": 4, "comparator_id": 9 },
  { "id": 10, "name": "SSD de Alta Velocidad",  "client_id ": 5, "comparator_id": 10 }
];


let Comparator = [
  { "id": 1, "session_id": "sess_001", "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)", "client_id": 1 },
  { "id": 2, "session_id": "sess_002", "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_3)", "client_id": 2 },
  { "id": 3, "session_id": "sess_003", "user_agent": "Mozilla/5.0 (Linux; Android 12; SM-G991B)", "client_id": 3 },
  { "id": 4, "session_id": "sess_004", "user_agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X)", "client_id": 4 },
  { "id": 5, "session_id": "sess_005", "user_agent": "Mozilla/5.0 (Windows NT 11.0; Win64; x64)", "client_id": 5 },
  { "id": 6, "session_id": "sess_006", "user_agent": "Mozilla/5.0 (X11; Ubuntu; Linux x86_64)", "client_id": 1 },
  { "id": 7, "session_id": "sess_007", "user_agent": "Mozilla/5.0 (Linux; Android 11; Pixel 6)", "client_id": 2 },
  { "id": 8, "session_id": "sess_008", "user_agent": "Mozilla/5.0 (iPad; CPU OS 15_4 like Mac OS X)", "client_id": 3 },
  { "id": 9, "session_id": "sess_009", "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; rv:109.0) Gecko/20100101 Firefox/117.0", "client_id": 4 },
  { "id": 10, "session_id": "sess_010", "user_agent": "Mozilla/5.0 (Linux; Android 10; SM-A505F)", "client_id": 5 },
  { "id": 11, "session_id": "sess_011", "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0)", "client_id": 1 },
  { "id": 12, "session_id": "sess_012", "user_agent": "Mozilla/5.0 (Windows NT 10.0; WOW64)", "client_id": 2 },
  { "id": 13, "session_id": "sess_013", "user_agent": "Mozilla/5.0 (Linux; Android 13; OnePlus 10)", "client_id": 3 },
  { "id": 14, "session_id": "sess_014", "user_agent": "Mozilla/5.0 (X11; Fedora; Linux x86_64)", "client_id": 4 },
  { "id": 15, "session_id": "sess_015", "user_agent": "Mozilla/5.0 (Windows NT 11.0; Win64; x64; Edge/120.0)", "client_id": 5 }
];

  



