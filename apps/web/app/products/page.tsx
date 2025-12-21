"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard from "../components/ProductCard";
import ProductFilters from "../components/ProductFilters";
import Pagination from "../components/Pagination";

interface Product {
  id: string;
  brand: string;
  name: string;
  price: number;
  image?: string;
  size?: string;
  color?: string;
  category?: string;
  tags?: string[];
}

// Sample products data - this would come from an API
const allProducts: Product[] = [
  {
    id: "1",
    brand: "Velour & Vogue",
    name: "Luminous Lip Velvet...",
    price: 28.99,
    size: "M",
    color: "Red",
    category: "Fashion",
    tags: ["Fashion", "Beauty"],
  },
  {
    id: "2",
    brand: "Velour & Vogue",
    name: "Custom Photo Calendar",
    price: 28.99,
    size: "L",
    color: "Blue",
    category: "Home & Kitchen",
    tags: ["Home", "Accessories"],
  },
  {
    id: "3",
    brand: "Velour & Vogue",
    name: "Rubber Stamps with Logo",
    price: 28.99,
    size: "S",
    color: "Black",
    category: "Office",
    tags: ["Office", "Business"],
  },
  {
    id: "4",
    brand: "Velour & Vogue",
    name: "DB Solution Backpack",
    price: 28.99,
    size: "L",
    color: "Black",
    category: "Fashion",
    tags: ["Fashion", "Bags"],
  },
  {
    id: "5",
    brand: "Velour & Vogue",
    name: "Puffer Jacket",
    price: 28.99,
    size: "XL",
    color: "Black",
    category: "Fashion",
    tags: ["Fashion", "Hats"],
  },
  {
    id: "6",
    brand: "Velour & Vogue",
    name: "TechPro Business Cards",
    price: 28.99,
    size: "M",
    color: "White",
    category: "Office",
    tags: ["Office", "Business"],
  },
  {
    id: "7",
    brand: "Velour & Vogue",
    name: "King's Coffeehouse Notepad",
    price: 28.99,
    size: "M",
    color: "Black",
    category: "Office",
    tags: ["Office", "Accessories"],
  },
  {
    id: "8",
    brand: "Velour & Vogue",
    name: "Red Polo Shirt",
    price: 28.99,
    size: "L",
    color: "Red",
    category: "Fashion",
    tags: ["Fashion", "Denim"],
  },
  {
    id: "9",
    brand: "Velour & Vogue",
    name: "Arena Architecture Cap",
    price: 28.99,
    size: "M",
    color: "Black",
    category: "Fashion",
    tags: ["Fashion", "Hats"],
  },
  {
    id: "10",
    brand: "Velour & Vogue",
    name: "Navy Blue Polo Shirt",
    price: 28.99,
    size: "XL",
    color: "Dark Blue",
    category: "Fashion",
    tags: ["Fashion", "Denim"],
  },
  {
    id: "11",
    brand: "Velour & Vogue",
    name: "Tri-fold Flyers",
    price: 28.99,
    size: "M",
    color: "Green",
    category: "Office",
    tags: ["Office", "Business"],
  },
  {
    id: "12",
    brand: "Velour & Vogue",
    name: "Rapid Edge Sports Bottle",
    price: 28.99,
    size: "L",
    color: "White",
    category: "Sports",
    tags: ["Sports", "Accessories"],
  },
  {
    id: "13",
    brand: "Velour & Vogue",
    name: "Fastbox Paper Pouch",
    price: 28.99,
    size: "M",
    color: "Brown",
    category: "Home & Kitchen",
    tags: ["Home", "Bags"],
  },
  {
    id: "14",
    brand: "Velour & Vogue",
    name: "Natural Care Pouch",
    price: 28.99,
    size: "M",
    color: "Brown",
    category: "Home & Kitchen",
    tags: ["Home", "Bags"],
  },
  {
    id: "15",
    brand: "Velour & Vogue",
    name: "Branded Hoodies",
    price: 28.99,
    size: "XL",
    color: "Black",
    category: "Fashion",
    tags: ["Fashion", "Denim"],
  },
  {
    id: "16",
    brand: "Velour & Vogue",
    name: "My Home Super Market Tote",
    price: 28.99,
    size: "L",
    color: "White",
    category: "Fashion",
    tags: ["Fashion", "Bags"],
  },
  {
    id: "17",
    brand: "Velour & Vogue",
    name: "Custom Food Containers",
    price: 28.99,
    size: "M",
    color: "White",
    category: "Home & Kitchen",
    tags: ["Home", "Accessories"],
  },
  {
    id: "18",
    brand: "Velour & Vogue",
    name: "Arihant Logistics Bag",
    price: 28.99,
    size: "L",
    color: "White",
    category: "Home & Kitchen",
    tags: ["Home", "Bags"],
  },
  {
    id: "19",
    brand: "Velour & Vogue",
    name: "Green Shop Packaging",
    price: 28.99,
    size: "M",
    color: "White",
    category: "Home & Kitchen",
    tags: ["Home", "Bags"],
  },
  {
    id: "20",
    brand: "Velour & Vogue",
    name: "Decor Textile Tape",
    price: 28.99,
    size: "M",
    color: "Blue",
    category: "Home & Kitchen",
    tags: ["Home", "Accessories"],
  },
  {
    id: "21",
    brand: "Velour & Vogue",
    name: "Custom Stamps Set",
    price: 28.99,
    size: "S",
    color: "Black",
    category: "Office",
    tags: ["Office", "Business"],
  },
  // Additional products with diverse attributes
  {
    id: "22",
    brand: "Minimog",
    name: "Premium Cotton T-Shirt",
    price: 24.99,
    size: "M",
    color: "White",
    category: "Fashion",
    tags: ["Fashion", "Denim"],
  },
  {
    id: "23",
    brand: "Retrolie Brook",
    name: "Vintage Denim Jacket",
    price: 89.99,
    size: "L",
    color: "Dark Blue",
    category: "Fashion",
    tags: ["Fashion", "Denim"],
  },
  {
    id: "24",
    brand: "Learts",
    name: "Leather Belt with Logo",
    price: 45.99,
    size: "M",
    color: "Brown",
    category: "Fashion",
    tags: ["Fashion", "Belt"],
  },
  {
    id: "25",
    brand: "Vagabond",
    name: "Canvas Backpack",
    price: 65.99,
    size: "L",
    color: "Dark Green",
    category: "Fashion",
    tags: ["Fashion", "Bags"],
  },
  {
    id: "26",
    brand: "Abby",
    name: "Designer Sunglasses",
    price: 35.99,
    size: "M",
    color: "Black",
    category: "Fashion",
    tags: ["Fashion", "Sunglasses"],
  },
  {
    id: "27",
    brand: "Minimog",
    name: "Beach Sandals",
    price: 29.99,
    size: "M",
    color: "Coral",
    category: "Fashion",
    tags: ["Fashion", "Sandal", "Beachwear"],
  },
  {
    id: "28",
    brand: "Retrolie Brook",
    name: "Snapback Baseball Cap",
    price: 22.99,
    size: "M",
    color: "Red",
    category: "Fashion",
    tags: ["Fashion", "Hats"],
  },
  {
    id: "29",
    brand: "Learts",
    name: "Premium Business Cards",
    price: 19.99,
    size: "S",
    color: "White",
    category: "Office",
    tags: ["Office", "Business"],
  },
  {
    id: "30",
    brand: "Vagabond",
    name: "Custom Logo Stickers",
    price: 12.99,
    size: "S",
    color: "Yellow",
    category: "Office",
    tags: ["Office", "Business"],
  },
  {
    id: "31",
    brand: "Abby",
    name: "Printed Notepads Set",
    price: 15.99,
    size: "M",
    color: "Pink",
    category: "Office",
    tags: ["Office", "Accessories"],
  },
  {
    id: "32",
    brand: "Minimog",
    name: "Custom Mouse Pads",
    price: 18.99,
    size: "M",
    color: "Black",
    category: "Electronics",
    tags: ["Electronics", "Accessories"],
  },
  {
    id: "33",
    brand: "Retrolie Brook",
    name: "Phone Case with Logo",
    price: 25.99,
    size: "M",
    color: "Purple",
    category: "Electronics",
    tags: ["Electronics", "Accessories"],
  },
  {
    id: "34",
    brand: "Learts",
    name: "Ceramic Coffee Mug",
    price: 16.99,
    size: "M",
    color: "White",
    category: "Home & Kitchen",
    tags: ["Home", "Accessories"],
  },
  {
    id: "35",
    brand: "Vagabond",
    name: "Custom Apron",
    price: 32.99,
    size: "L",
    color: "Light Blue",
    category: "Home & Kitchen",
    tags: ["Home", "Accessories"],
  },
  {
    id: "36",
    brand: "Abby",
    name: "Printed Kitchen Towels",
    price: 14.99,
    size: "M",
    color: "Orange",
    category: "Home & Kitchen",
    tags: ["Home", "Accessories"],
  },
  {
    id: "37",
    brand: "Minimog",
    name: "Yoga Mat with Design",
    price: 42.99,
    size: "L",
    color: "Light Green",
    category: "Sports",
    tags: ["Sports", "Accessories"],
  },
  {
    id: "38",
    brand: "Retrolie Brook",
    name: "Gym Water Bottle",
    price: 21.99,
    size: "L",
    color: "Dark Blue",
    category: "Sports",
    tags: ["Sports", "Accessories"],
  },
  {
    id: "39",
    brand: "Learts",
    name: "Custom Sports Jersey",
    price: 55.99,
    size: "XL",
    color: "Red",
    category: "Sports",
    tags: ["Sports", "Fashion"],
  },
  {
    id: "40",
    brand: "Vagabond",
    name: "Lipstick Case",
    price: 18.99,
    size: "S",
    color: "Pink",
    category: "Beauty",
    tags: ["Beauty", "Fashion"],
  },
  {
    id: "41",
    brand: "Abby",
    name: "Custom Makeup Bag",
    price: 28.99,
    size: "M",
    color: "Coral",
    category: "Beauty",
    tags: ["Beauty", "Bags"],
  },
  {
    id: "42",
    brand: "Minimog",
    name: "Premium Polo Shirt",
    price: 39.99,
    size: "L",
    color: "Navy Blue",
    category: "Fashion",
    tags: ["Fashion", "Denim"],
  },
  {
    id: "43",
    brand: "Retrolie Brook",
    name: "Designer Tote Bag",
    price: 48.99,
    size: "L",
    color: "Brown",
    category: "Fashion",
    tags: ["Fashion", "Bags"],
  },
  {
    id: "44",
    brand: "Learts",
    name: "Custom Hoodie",
    price: 59.99,
    size: "XL",
    color: "Black",
    category: "Fashion",
    tags: ["Fashion", "Denim"],
  },
  {
    id: "45",
    brand: "Vagabond",
    name: "Printed Beach Towel",
    price: 34.99,
    size: "L",
    color: "Light Blue",
    category: "Fashion",
    tags: ["Fashion", "Beachwear"],
  },
  {
    id: "46",
    brand: "Abby",
    name: "Custom Keychain",
    price: 8.99,
    size: "S",
    color: "Yellow",
    category: "Fashion",
    tags: ["Fashion", "Accessories"],
  },
  {
    id: "47",
    brand: "Minimog",
    name: "Logo Embossed Wallet",
    price: 38.99,
    size: "M",
    color: "Black",
    category: "Fashion",
    tags: ["Fashion", "Accessories"],
  },
  {
    id: "48",
    brand: "Retrolie Brook",
    name: "Custom Lanyard",
    price: 6.99,
    size: "M",
    color: "Red",
    category: "Office",
    tags: ["Office", "Accessories"],
  },
  {
    id: "49",
    brand: "Learts",
    name: "Printed Envelopes Set",
    price: 11.99,
    size: "M",
    color: "White",
    category: "Office",
    tags: ["Office", "Business"],
  },
  {
    id: "50",
    brand: "Vagabond",
    name: "Custom Letterhead",
    price: 24.99,
    size: "M",
    color: "White",
    category: "Office",
    tags: ["Office", "Business"],
  },
  {
    id: "51",
    brand: "Abby",
    name: "USB Drive with Logo",
    price: 22.99,
    size: "S",
    color: "Black",
    category: "Electronics",
    tags: ["Electronics", "Accessories"],
  },
  {
    id: "52",
    brand: "Minimog",
    name: "Custom Laptop Sleeve",
    price: 45.99,
    size: "L",
    color: "Dark Blue",
    category: "Electronics",
    tags: ["Electronics", "Bags"],
  },
  {
    id: "53",
    brand: "Retrolie Brook",
    name: "Printed Placemats",
    price: 19.99,
    size: "M",
    color: "Orange",
    category: "Home & Kitchen",
    tags: ["Home", "Accessories"],
  },
  {
    id: "54",
    brand: "Learts",
    name: "Custom Table Runner",
    price: 28.99,
    size: "L",
    color: "Light Green",
    category: "Home & Kitchen",
    tags: ["Home", "Accessories"],
  },
  {
    id: "55",
    brand: "Vagabond",
    name: "Logo Printed Pillows",
    price: 35.99,
    size: "L",
    color: "Coral",
    category: "Home & Kitchen",
    tags: ["Home", "Accessories"],
  },
  {
    id: "56",
    brand: "Abby",
    name: "Custom Duffle Bag",
    price: 52.99,
    size: "L",
    color: "Dark Green",
    category: "Sports",
    tags: ["Sports", "Bags"],
  },
  {
    id: "57",
    brand: "Minimog",
    name: "Gym Bag with Logo",
    price: 48.99,
    size: "L",
    color: "Black",
    category: "Sports",
    tags: ["Sports", "Bags"],
  },
  {
    id: "58",
    brand: "Retrolie Brook",
    name: "Custom Headband",
    price: 12.99,
    size: "M",
    color: "Pink",
    category: "Sports",
    tags: ["Sports", "Fashion"],
  },
  {
    id: "59",
    brand: "Learts",
    name: "Beauty Product Labels",
    price: 16.99,
    size: "S",
    color: "White",
    category: "Beauty",
    tags: ["Beauty", "Business"],
  },
  {
    id: "60",
    brand: "Vagabond",
    name: "Custom Perfume Bottle",
    price: 68.99,
    size: "M",
    color: "Purple",
    category: "Beauty",
    tags: ["Beauty", "Fashion"],
  },
  {
    id: "61",
    brand: "Abby",
    name: "Premium Cotton Tank Top",
    price: 26.99,
    size: "M",
    color: "Light Blue",
    category: "Fashion",
    tags: ["Fashion", "Beachwear"],
  },
  {
    id: "62",
    brand: "Minimog",
    name: "Designer Watch Strap",
    price: 42.99,
    size: "M",
    color: "Brown",
    category: "Fashion",
    tags: ["Fashion", "Accessories"],
  },
  {
    id: "63",
    brand: "Retrolie Brook",
    name: "Custom Bandana",
    price: 14.99,
    size: "M",
    color: "Red",
    category: "Fashion",
    tags: ["Fashion", "Accessories"],
  },
  {
    id: "64",
    brand: "Learts",
    name: "Logo Printed Umbrella",
    price: 32.99,
    size: "L",
    color: "Dark Blue",
    category: "Fashion",
    tags: ["Fashion", "Accessories"],
  },
  {
    id: "65",
    brand: "Vagabond",
    name: "Custom Face Mask",
    price: 9.99,
    size: "M",
    color: "Black",
    category: "Fashion",
    tags: ["Fashion", "Accessories"],
  },
  {
    id: "66",
    brand: "Abby",
    name: "Printed Postcards",
    price: 7.99,
    size: "S",
    color: "White",
    category: "Office",
    tags: ["Office", "Business"],
  },
  {
    id: "67",
    brand: "Minimog",
    name: "Custom Folder Set",
    price: 18.99,
    size: "M",
    color: "Yellow",
    category: "Office",
    tags: ["Office", "Business"],
  },
  {
    id: "68",
    brand: "Retrolie Brook",
    name: "Logo Stamped Notebook",
    price: 22.99,
    size: "M",
    color: "Orange",
    category: "Office",
    tags: ["Office", "Accessories"],
  },
  {
    id: "69",
    brand: "Learts",
    name: "Custom Pen Set",
    price: 19.99,
    size: "S",
    color: "Black",
    category: "Office",
    tags: ["Office", "Accessories"],
  },
  {
    id: "70",
    brand: "Vagabond",
    name: "Wireless Charger with Logo",
    price: 38.99,
    size: "M",
    color: "White",
    category: "Electronics",
    tags: ["Electronics", "Accessories"],
  },
  {
    id: "71",
    brand: "Abby",
    name: "Custom Power Bank",
    price: 44.99,
    size: "M",
    color: "Dark Blue",
    category: "Electronics",
    tags: ["Electronics", "Accessories"],
  },
  {
    id: "72",
    brand: "Minimog",
    name: "Printed Curtains",
    price: 58.99,
    size: "L",
    color: "Light Green",
    category: "Home & Kitchen",
    tags: ["Home", "Accessories"],
  },
  {
    id: "73",
    brand: "Retrolie Brook",
    name: "Custom Shower Curtain",
    price: 32.99,
    size: "L",
    color: "Light Blue",
    category: "Home & Kitchen",
    tags: ["Home", "Accessories"],
  },
  {
    id: "74",
    brand: "Learts",
    name: "Logo Printed Coasters",
    price: 15.99,
    size: "S",
    color: "Brown",
    category: "Home & Kitchen",
    tags: ["Home", "Accessories"],
  },
  {
    id: "75",
    brand: "Vagabond",
    name: "Custom Yoga Block",
    price: 24.99,
    size: "M",
    color: "Purple",
    category: "Sports",
    tags: ["Sports", "Accessories"],
  },
  {
    id: "76",
    brand: "Abby",
    name: "Resistance Bands Set",
    price: 28.99,
    size: "M",
    color: "Coral",
    category: "Sports",
    tags: ["Sports", "Accessories"],
  },
  {
    id: "77",
    brand: "Minimog",
    name: "Custom Nail Polish Set",
    price: 32.99,
    size: "S",
    color: "Pink",
    category: "Beauty",
    tags: ["Beauty", "Fashion"],
  },
  {
    id: "78",
    brand: "Retrolie Brook",
    name: "Logo Printed Compact Mirror",
    price: 18.99,
    size: "S",
    color: "Coral",
    category: "Beauty",
    tags: ["Beauty", "Accessories"],
  },
  {
    id: "79",
    brand: "Learts",
    name: "Premium Denim Shorts",
    price: 49.99,
    size: "M",
    color: "Dark Blue",
    category: "Fashion",
    tags: ["Fashion", "Denim", "Beachwear"],
  },
  {
    id: "80",
    brand: "Vagabond",
    name: "Custom Beach Hat",
    price: 28.99,
    size: "M",
    color: "Yellow",
    category: "Fashion",
    tags: ["Fashion", "Hats", "Beachwear"],
  },
  {
    id: "81",
    brand: "Abby",
    name: "Designer Scarf",
    price: 35.99,
    size: "L",
    color: "Purple",
    category: "Fashion",
    tags: ["Fashion", "Accessories"],
  },
  {
    id: "82",
    brand: "Minimog",
    name: "Custom Tie",
    price: 38.99,
    size: "M",
    color: "Dark Blue",
    category: "Fashion",
    tags: ["Fashion", "Accessories"],
  },
  {
    id: "83",
    brand: "Retrolie Brook",
    name: "Logo Printed Socks",
    price: 12.99,
    size: "M",
    color: "Red",
    category: "Fashion",
    tags: ["Fashion", "Accessories"],
  },
  {
    id: "84",
    brand: "Learts",
    name: "Custom Presentation Folder",
    price: 24.99,
    size: "L",
    color: "Black",
    category: "Office",
    tags: ["Office", "Business"],
  },
  {
    id: "85",
    brand: "Vagabond",
    name: "Logo Stamped Envelopes",
    price: 13.99,
    size: "M",
    color: "White",
    category: "Office",
    tags: ["Office", "Business"],
  },
  {
    id: "86",
    brand: "Abby",
    name: "Custom Desk Organizer",
    price: 36.99,
    size: "M",
    color: "Orange",
    category: "Office",
    tags: ["Office", "Accessories"],
  },
  {
    id: "87",
    brand: "Minimog",
    name: "Bluetooth Speaker with Logo",
    price: 68.99,
    size: "M",
    color: "Black",
    category: "Electronics",
    tags: ["Electronics", "Accessories"],
  },
  {
    id: "88",
    brand: "Retrolie Brook",
    name: "Custom Tablet Stand",
    price: 42.99,
    size: "M",
    color: "White",
    category: "Electronics",
    tags: ["Electronics", "Accessories"],
  },
  {
    id: "89",
    brand: "Learts",
    name: "Printed Bed Sheets",
    price: 78.99,
    size: "XL",
    color: "Light Blue",
    category: "Home & Kitchen",
    tags: ["Home", "Accessories"],
  },
  {
    id: "90",
    brand: "Vagabond",
    name: "Custom Throw Pillow",
    price: 28.99,
    size: "L",
    color: "Coral",
    category: "Home & Kitchen",
    tags: ["Home", "Accessories"],
  },
  {
    id: "91",
    brand: "Abby",
    name: "Logo Printed Blanket",
    price: 65.99,
    size: "XL",
    color: "Dark Green",
    category: "Home & Kitchen",
    tags: ["Home", "Accessories"],
  },
  {
    id: "92",
    brand: "Minimog",
    name: "Custom Tennis Racket Cover",
    price: 28.99,
    size: "L",
    color: "Red",
    category: "Sports",
    tags: ["Sports", "Accessories"],
  },
  {
    id: "93",
    brand: "Retrolie Brook",
    name: "Logo Printed Golf Balls",
    price: 24.99,
    size: "S",
    color: "White",
    category: "Sports",
    tags: ["Sports", "Accessories"],
  },
  {
    id: "94",
    brand: "Learts",
    name: "Custom Face Serum Bottle",
    price: 48.99,
    size: "S",
    color: "Pink",
    category: "Beauty",
    tags: ["Beauty", "Fashion"],
  },
  {
    id: "95",
    brand: "Vagabond",
    name: "Logo Printed Hair Brush",
    price: 22.99,
    size: "M",
    color: "Purple",
    category: "Beauty",
    tags: ["Beauty", "Accessories"],
  },
  {
    id: "96",
    brand: "Abby",
    name: "Premium Leather Jacket",
    price: 125.99,
    size: "XL",
    color: "Black",
    category: "Fashion",
    tags: ["Fashion", "Denim"],
  },
  {
    id: "97",
    brand: "Minimog",
    name: "Custom Windbreaker",
    price: 55.99,
    size: "L",
    color: "Dark Blue",
    category: "Fashion",
    tags: ["Fashion", "Beachwear"],
  },
  {
    id: "98",
    brand: "Retrolie Brook",
    name: "Designer Crossbody Bag",
    price: 72.99,
    size: "M",
    color: "Brown",
    category: "Fashion",
    tags: ["Fashion", "Bags"],
  },
  {
    id: "99",
    brand: "Learts",
    name: "Custom Wristwatch",
    price: 95.99,
    size: "M",
    color: "Black",
    category: "Fashion",
    tags: ["Fashion", "Accessories"],
  },
  {
    id: "100",
    brand: "Vagabond",
    name: "Premium Messenger Bag",
    price: 88.99,
    size: "L",
    color: "Dark Green",
    category: "Fashion",
    tags: ["Fashion", "Bags"],
  },
  // Groceries category products
  {
    id: "101",
    brand: "Minimog",
    name: "Organic Rice Pack",
    price: 12.99,
    size: "M",
    color: "Brown",
    category: "Groceries",
    tags: ["Groceries", "Food"],
  },
  {
    id: "102",
    brand: "Retrolie Brook",
    name: "Premium Olive Oil",
    price: 18.99,
    size: "M",
    color: "Yellow",
    category: "Groceries",
    tags: ["Groceries", "Food"],
  },
  {
    id: "103",
    brand: "Learts",
    name: "Organic Pasta Pack",
    price: 8.99,
    size: "M",
    color: "White",
    category: "Groceries",
    tags: ["Groceries", "Food"],
  },
  {
    id: "104",
    brand: "Vagabond",
    name: "Honey Jar",
    price: 14.99,
    size: "M",
    color: "Yellow",
    category: "Groceries",
    tags: ["Groceries", "Food"],
  },
  {
    id: "105",
    brand: "Abby",
    name: "Premium Coffee Beans",
    price: 24.99,
    size: "M",
    color: "Brown",
    category: "Groceries",
    tags: ["Groceries", "Food"],
  },
  // Premium Fruits category products
  {
    id: "106",
    brand: "Minimog",
    name: "Organic Apples Box",
    price: 15.99,
    size: "M",
    color: "Red",
    category: "Premium Fruits",
    tags: ["Fruits", "Organic"],
  },
  {
    id: "107",
    brand: "Retrolie Brook",
    name: "Fresh Strawberries",
    price: 12.99,
    size: "M",
    color: "Red",
    category: "Premium Fruits",
    tags: ["Fruits", "Fresh"],
  },
  {
    id: "108",
    brand: "Learts",
    name: "Premium Mangoes",
    price: 22.99,
    size: "L",
    color: "Yellow",
    category: "Premium Fruits",
    tags: ["Fruits", "Premium"],
  },
  {
    id: "109",
    brand: "Vagabond",
    name: "Organic Bananas",
    price: 9.99,
    size: "M",
    color: "Yellow",
    category: "Premium Fruits",
    tags: ["Fruits", "Organic"],
  },
  {
    id: "110",
    brand: "Abby",
    name: "Fresh Blueberries",
    price: 16.99,
    size: "M",
    color: "Dark Blue",
    category: "Premium Fruits",
    tags: ["Fruits", "Fresh"],
  },
  // Home Improvement category products
  {
    id: "111",
    brand: "Minimog",
    name: "Custom Tool Box",
    price: 45.99,
    size: "L",
    color: "Black",
    category: "Home Improvement",
    tags: ["Tools", "Home"],
  },
  {
    id: "112",
    brand: "Retrolie Brook",
    name: "Logo Printed Work Gloves",
    price: 18.99,
    size: "M",
    color: "Orange",
    category: "Home Improvement",
    tags: ["Tools", "Safety"],
  },
  {
    id: "113",
    brand: "Learts",
    name: "Custom Paint Brushes Set",
    price: 28.99,
    size: "M",
    color: "Brown",
    category: "Home Improvement",
    tags: ["Tools", "Painting"],
  },
  {
    id: "114",
    brand: "Vagabond",
    name: "Logo Stamped Measuring Tape",
    price: 12.99,
    size: "M",
    color: "Yellow",
    category: "Home Improvement",
    tags: ["Tools", "Measuring"],
  },
  {
    id: "115",
    brand: "Abby",
    name: "Custom Hammer",
    price: 32.99,
    size: "M",
    color: "Black",
    category: "Home Improvement",
    tags: ["Tools", "Hardware"],
  },
  {
    id: "116",
    brand: "Minimog",
    name: "Logo Printed Safety Helmet",
    price: 38.99,
    size: "L",
    color: "Yellow",
    category: "Home Improvement",
    tags: ["Tools", "Safety"],
  },
  {
    id: "117",
    brand: "Retrolie Brook",
    name: "Custom Screwdriver Set",
    price: 24.99,
    size: "M",
    color: "Black",
    category: "Home Improvement",
    tags: ["Tools", "Hardware"],
  },
  {
    id: "118",
    brand: "Learts",
    name: "Logo Stamped Wrench Set",
    price: 35.99,
    size: "M",
    color: "Black",
    category: "Home Improvement",
    tags: ["Tools", "Hardware"],
  },
];

const PRODUCTS_PER_PAGE = 20;

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Get search query and category from URL params
  const searchQuery = searchParams.get("search") || "";
  const categoryParam = searchParams.get("category") || "";

  // Normalize category from URL (e.g., "groceries" -> "Groceries", "home-kitchen" -> "Home & Kitchen")
  const normalizeCategory = (urlCategory: string): string => {
    const categoryMap: { [key: string]: string } = {
      groceries: "Groceries",
      "premium-fruits": "Premium Fruits",
      "home-kitchen": "Home & Kitchen",
      fashion: "Fashion",
      electronics: "Electronics",
      beauty: "Beauty",
      "home-improvement": "Home Improvement",
      "sports-toys-luggage": "Sports", // Map to Sports category (products use "Sports")
    };
    return categoryMap[urlCategory.toLowerCase()] || urlCategory;
  };

  const category = categoryParam ? normalizeCategory(categoryParam) : "";

  // Filter products based on search, category, and filters
  const filteredProducts = allProducts.filter((product) => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        product.name.toLowerCase().includes(query) ||
        product.brand.toLowerCase().includes(query) ||
        product.tags?.some((tag) => tag.toLowerCase().includes(query));
      if (!matchesSearch) return false;
    }

    // Category filter
    if (category) {
      if (product.category?.toLowerCase() !== category.toLowerCase()) {
        return false;
      }
    }

    // Size filter
    if (selectedSizes.length > 0) {
      if (!product.size || !selectedSizes.includes(product.size)) {
        return false;
      }
    }

    // Color filter
    if (selectedColors.length > 0) {
      if (!product.color || !selectedColors.includes(product.color)) {
        return false;
      }
    }

    // Price range filter
    if (selectedPriceRanges.length > 0) {
      const matchesPrice = selectedPriceRanges.some((range) => {
        const parts = range.replace("$", "").split("-").map(Number);
        const min = parts[0] ?? 0;
        const max = parts[1] ?? Infinity;
        return product.price >= min && product.price <= max;
      });
      if (!matchesPrice) return false;
    }

    // Brand filter
    if (selectedBrands.length > 0) {
      if (!selectedBrands.includes(product.brand)) {
        return false;
      }
    }

    // Tag filter
    if (selectedTags.length > 0) {
      if (
        !product.tags ||
        !selectedTags.some((tag) => product.tags?.includes(tag))
      ) {
        return false;
      }
    }

    return true;
  });

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const paginatedProducts = filteredProducts.slice(
    startIndex,
    startIndex + PRODUCTS_PER_PAGE
  );

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchQuery,
    category,
    selectedSizes,
    selectedColors,
    selectedPriceRanges,
    selectedBrands,
    selectedCollections,
    selectedTags,
  ]);

  const handleAddToCart = (productId: string) => {
    // Handle add to cart logic
    console.log("Add to cart:", productId);
  };

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Sidebar - Filters */}
          <aside className="w-full lg:w-64 shrink-0">
            <ProductFilters
              selectedSizes={selectedSizes}
              selectedColors={selectedColors}
              selectedPriceRanges={selectedPriceRanges}
              selectedBrands={selectedBrands}
              selectedCollections={selectedCollections}
              selectedTags={selectedTags}
              onSizeChange={setSelectedSizes}
              onColorChange={setSelectedColors}
              onPriceRangeChange={setSelectedPriceRanges}
              onBrandChange={setSelectedBrands}
              onCollectionChange={setSelectedCollections}
              onTagChange={setSelectedTags}
            />
          </aside>

          {/* Main Content - Product Grid */}
          <main className="flex-1">
            {/* Page Title */}
            <h1 className="text-4xl font-serif text-gray-900 mb-8 text-center lg:text-left">
              Print Your Dream
            </h1>

            {/* Results Count */}
            <p className="text-sm text-gray-600 mb-6">
              Showing {paginatedProducts.length} of {filteredProducts.length}{" "}
              products
              {searchQuery && ` for "${searchQuery}"`}
              {category && ` in ${category}`}
            </p>

            {/* Product Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {paginatedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  brand={product.brand}
                  name={product.name}
                  price={product.price}
                  image={product.image}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}

            {/* No Results Message */}
            {paginatedProducts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg mb-2">No products found</p>
                <p className="text-gray-500 text-sm">
                  Try adjusting your filters or search query
                </p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
