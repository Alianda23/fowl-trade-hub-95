
export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  image: string;
  video?: string;
  mediaType?: 'image' | 'video' | 'both';
  stock: number;
  sellerId?: string;
  sellerName?: string;
  sellerEmail?: string;
  createdAt?: string;
}

export const categories = [
  "Live Poultry",
  "Poultry Products",
  "Feeds & Supplements",
  "Equipment & Supplies",
  "Health Products"
];

export const productTypes = {
  "Live Poultry": [
    "Broiler Chicken",
    "Layers Chicken",
    "Indigenous Chicken",
    "Ducks",
    "Turkey",
    "Quails",
    "Geese",
    "Pigeons",
    "Guinea Fowls"
  ],
  "Poultry Products": [
    "Table Eggs",
    "Fertilized Eggs",
    "Whole Chicken",
    "Chicken Parts",
    "Duck Meat",
    "Turkey Meat",
    "Quail Eggs",
    "Smoked Chicken",
    "Chicken Sausages",
    "Minced Chicken"
  ],
  "Feeds & Supplements": [
    "Chick Starter Crumbs",
    "Grower Mash",
    "Layer Mash",
    "Broiler Starter Crumbs",
    "Broiler Finisher Pellets",
    "Organic Feeds",
    "Vitamin Supplements",
    "Mineral Blocks",
    "Grits",
    "Premixes"
  ],
  "Equipment & Supplies": [
    "Chicken Cages",
    "Egg Incubators",
    "Water Drinkers",
    "Poultry Feeders",
    "Egg Trays",
    "Brooding Lamps",
    "Vaccination Syringes",
    "Feather Pluckers",
    "Automatic Drinkers",
    "Nesting Boxes"
  ],
  "Health Products": [
    "Newcastle Vaccine",
    "Gumboro Vaccine",
    "Fowl Pox Vaccine",
    "Antibiotics",
    "Dewormers",
    "Disinfectants",
    "Vitamins",
    "Anti-Mite Sprays",
    "Probiotics",
    "First Aid Kits"
  ]
};

export const products: Product[] = [
  // Live Poultry
  {
    id: "chicks-day-old",
    name: "Day-old Chicks",
    category: "Live Poultry",
    price: 100,
    description: "Healthy day-old chicks for starting your poultry farm",
    image: "https://images.unsplash.com/photo-1517022812141-23620dba5c23",
    stock: 50,
    sellerId: "sample-seller-1",
    sellerName: "Sample Poultry Farm"
  },
  {
    id: "broilers",
    name: "Broilers",
    category: "Live Poultry",
    price: 450,
    description: "Ready for meat production, 6-8 weeks old",
    image: "https://images.unsplash.com/photo-1535268647677-300dbf3d78d1",
    stock: 30,
    sellerId: "sample-seller-2",
    sellerName: "Broiler Express"
  },
  // Poultry Products
  {
    id: "eggs-tray",
    name: "Tray of Eggs",
    category: "Poultry Products",
    price: 360,
    description: "Fresh farm eggs, tray of 30",
    image: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9",
    stock: 100,
    sellerId: "sample-seller-1", 
    sellerName: "Sample Poultry Farm"
  },
  // Feeds & Supplements
  {
    id: "chick-starter",
    name: "Chick Starter Feed",
    category: "Feeds & Supplements",
    price: 2500,
    description: "High-quality starter feed for chicks, 50kg bag",
    image: "https://images.unsplash.com/photo-1466721591366-2d5fba72006d",
    stock: 25,
    sellerId: "sample-seller-3",
    sellerName: "Poultry Feed Suppliers"
  }
];
