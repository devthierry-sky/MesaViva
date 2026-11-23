import type { PublicRestaurantMenu } from "@/src/types/menu";

export const demoMenu: PublicRestaurantMenu = {
  slug: "demo",
  name: "Hamburgueria de demonstração",
  tagline: "Fotos dos pratos para explorar em realidade aumentada",
  categories: [
    {
      id: "hamburgueres",
      name: "Hambúrgueres",
      description: "Feitos na hora e montados com ingredientes frescos.",
    },
    {
      id: "pizzas",
      name: "Pizzas",
      description: "Massa artesanal, molho da casa e ingredientes selecionados.",
    },
  ],
  products: [
    {
      id: "hamburguer-artesanal",
      categoryId: "hamburgueres",
      name: "Hambúrguer artesanal",
      description:
        "Pão com gergelim, carne bovina, queijo cheddar, tomate e alface.",
      priceCents: 3490,
      available: true,
      imageUrl: "/images/demo-burger.jpg",
      modelGlbUrl: "/models/demo-burger-photo.glb",
      modelAlt: "Foto de um hambúrguer artesanal sobre a mesa",
      illustrativePrice: true,
    },
    {
      id: "pizza-margherita",
      categoryId: "pizzas",
      name: "Pizza Margherita",
      description: "Molho de tomate, mozzarella derretida e manjericão fresco.",
      priceCents: 4290,
      available: true,
      imageUrl: "/images/demo-pizza.jpg",
      modelGlbUrl: "/models/demo-pizza-photo.glb",
      modelAlt: "Foto de pizza Margherita para visualizar na mesa",
      illustrativePrice: true,
    },
  ],
};

export function formatPrice(priceCents: number, locale = "pt-BR") {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "BRL",
  }).format(priceCents / 100);
}
