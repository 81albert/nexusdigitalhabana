// js/products.js

export const PRODUCTS = [
  {
  id: 1,
  name: "Impresora EPSON Ecotank Multifuncional ET-2800",
  slug: "epson-ecotank-et-2800",
  category: "componentes",
  subcategory: "almacenamiento",

  familyId: null,
  familyKey: null,
  familyValue: null,
  familySort: 0,

  description: "Impresora multifuncional con sistema de tanques de tinta recargables. Imprime, copia y escanea con un costo por página ultra bajo.",
  price: 29.99,

  type: "variable",
  defaultVariationId: "negro",
  variations: [
    {
      id: "negro",
      label: "Negro",
      price: 29.99,
      images: [
        "assets/img/et-2800-black-01.webp",
        "assets/img/et-2800-black-02.webp"
      ]
    },
    {
      id: "blanco",
      label: "Blanco",
      price: 34.99,
      images: [
        "assets/img/et-2800-white-01.webp",
        "assets/img/et-2800-white-02.webp"
      ]
    }
  ],

  images: [
    "assets/img/et-2800-black-01.webp",
    "assets/img/et-2800-black-02.webp"
  ],

  overviewBlocks: [
    {
      type: "banner",
      image: "assets/img/product-demo-banner1.webp",
      title: "Rendimiento extremo",
      text: "Velocidad y estabilidad para cargas exigentes."
    },
    {
      type: "banner",
      image: "assets/img/product-demo-banner2.webp",
      text: "Ideal para PC gaming, edición y multitarea."
    }
  ],
  specs: [
    "Impresora multifuncional: imprime, copia y escanea.",
    "Sistema de tanques de tinta recargables EcoTank.",
    "Conectividad Wi-Fi y USB.",
    "Resolución de impresión: hasta 5760 x 1440 dpi."
  ],
  featured: true,
  createdAt: "2026-01-10"
},

  // ── Familia: Crucial P310 (512GB y 1TB) ──
  {
    id: 2,
    name: "Crucial P310 500GB NVMe M.2 SSD",
    slug: "crucial-p310-500gb",
    category: "componentes",
    subcategory: "almacenamiento",

    familyId: "crucial-p310",
    familyKey: "Capacidad",
    familyValue: "500GB",
    familySort: 512,

    description: "SSD NVMe M.2 2280 con lectura secuencial de hasta 7100 MB/s. Ideal para gaming y cargas de trabajo exigentes.",
    price: 42.00,

    type: "simple",
    images: [
      "assets/img/crucialp310-500gb-01.webp",
      "assets/img/crucialp310-500gb-02.webp"
    ],

    overviewBlocks: [
      {
        type: "banner",
        image: "assets/img/product-demo-banner1.webp",
        title: "Velocidad PCIe Gen4",
        text: "Hasta 7100 MB/s de lectura secuencial."
      }
    ],
    specs: [
      "Interfaz: NVMe M.2 2280 PCIe Gen4",
      "Lectura secuencial: hasta 7100 MB/s",
      "Escritura secuencial: hasta 3900 MB/s",
      "Capacidad: 500GB"
    ],
    featured: false,
    createdAt: "2026-02-01"
  },
  {
    id: 3,
    name: "Crucial P310 1TB NVMe M.2 SSD",
    slug: "crucial-p310-1tb",
    category: "componentes",
    subcategory: "almacenamiento",

    familyId: "crucial-p310",
    familyKey: "Capacidad",
    familyValue: "1TB",
    familySort: 1024,

    description: "SSD NVMe M.2 2280 con lectura secuencial de hasta 7100 MB/s. Máxima capacidad para profesionales y gamers.",
    price: 69.00,

    type: "simple",
    images: [
      "assets/img/crucialp310-1tb-01.webp",
      "assets/img/crucialp310-1tb-02.webp"
    ],

    overviewBlocks: [
      {
        type: "banner",
        image: "assets/img/product-demo-banner2.webp",
        title: "Almacenamiento sin límites",
        text: "1TB de capacidad NVMe para todo tu contenido."
      }
    ],
    specs: [
      "Interfaz: NVMe M.2 2280 PCIe Gen4",
      "Lectura secuencial: hasta 7100 MB/s",
      "Escritura secuencial: hasta 6000 MB/s",
      "Capacidad: 1TB"
    ],
    featured: false,
    createdAt: "2026-02-01"
  }
];

export function getProductBySlug(slug) {
  return PRODUCTS.find(p => p.slug === slug);
}

// Índice de familias (se construye una vez en runtime)
const FAMILY_INDEX = {};
PRODUCTS.forEach(p => {
  if (!p.familyId) return;
  if (!FAMILY_INDEX[p.familyId]) FAMILY_INDEX[p.familyId] = [];
  FAMILY_INDEX[p.familyId].push(p);
});
Object.values(FAMILY_INDEX).forEach(arr =>
  arr.sort((a, b) => (a.familySort ?? 0) - (b.familySort ?? 0))
);

// Devuelve los productos hermanos (incluye el actual). Array vacío si no tiene familia.
export function getProductSiblings(product) {
  if (!product || !product.familyId) return [];
  return FAMILY_INDEX[product.familyId] || [];
}