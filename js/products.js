// js/products.js

export const PRODUCTS = [
  {
    id: 1,
    name: "Adaptador USB-C a HDMI 4K",
    slug: "adaptador-usb-c-hdmi-4k",
    category: "componentes",
    subcategory: "almacenamiento",
    description: "el Montech X3 no es un chasis para PC Gaming cualquiera; es una mejora en todos los aspectos en comparación con los chasis anteriores de la serie X. ¡El X3 ofrece la mejor relación calidad-precio de Montech!",
    price: 29.99,
    images: [
      "assets/img/product-demo.webp",
      "assets/img/product-demo-2.webp",
      "assets/img/product-demo-3.webp"
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
        // title opcional
        text: "Ideal para PC gaming, edición y multitarea."
      }
    ],
    specs: [
      "Adaptador USB-C a HDMI compatible con resolución 4K.",
      "Compatible con monitores y televisores.",
      "Plug & play, no requiere drivers."
    ],
    featured: true,
    createdAt: "2026-01-10"
  }
];

export function getProductBySlug(slug) {
  return PRODUCTS.find(p => p.slug === slug);
}