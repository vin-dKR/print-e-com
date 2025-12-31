import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import { generateSlug, getUniqueSlug } from "../constants/seed-utils";
import { DEFAULT_STOCK } from "../constants/seed-constants";
import { PAMPHLET_PRODUCTS, BROCHURE_PRODUCTS, BROCHURE_FOLD_TYPES } from "../constants/seed-data";

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Pamphlet (Poster) Products Data
const pamphletProducts = PAMPHLET_PRODUCTS;

// Brochure Products Data
const brochureProducts = BROCHURE_PRODUCTS;

// Brochure Fold Types
const brochureFoldTypes = BROCHURE_FOLD_TYPES;

async function main() {
    console.log("🌱 Seeding pamphlet and brochure products...");

    // Create or get categories
    const pamphletCategory = await prisma.category.upsert({
        where: { slug: "pamphlet" },
        update: {},
        create: {
            name: "Pamphlet (Poster)",
            slug: "pamphlet",
            description: "Pamphlet and poster printing services with various paper types and color options",
        },
    });

    const brochureCategory = await prisma.category.upsert({
        where: { slug: "brochure" },
        update: {},
        create: {
            name: "Brochure",
            slug: "brochure",
            description: "Brochure printing services in various sizes with multiple fold options",
        },
    });

    console.log("✅ Categories created/updated");

    // Create Pamphlet (Poster) Products
    console.log("\n📄 Creating pamphlet (poster) products...");
    for (const pamphlet of pamphletProducts) {
        const name = `Pamphlet (Poster) - ${pamphlet.description}`;
        const slug = await getUniqueSlug(prisma, generateSlug(name));
        await prisma.product.create({
            data: {
                name,
                slug,
                description: `Pamphlet/Poster printing - ${pamphlet.description}. Minimum order quantity: ${pamphlet.minQuantity} pieces.`,
                shortDescription: `Pamphlet - ${pamphlet.description}`,
                basePrice: pamphlet.pricePerPiece,
                categoryId: pamphletCategory.id,
                stock: DEFAULT_STOCK,
                minOrderQuantity: pamphlet.minQuantity,
                specifications: {
                    create: [
                        { key: "Product Type", value: "Pamphlet (Poster)", displayOrder: 0 },
                        { key: "Description", value: pamphlet.description, displayOrder: 1 },
                        { key: "Price Per Piece", value: `Rs ${pamphlet.pricePerPiece}`, displayOrder: 2 },
                        { key: "Minimum Quantity", value: `${pamphlet.minQuantity} pieces`, displayOrder: 3 },
                        { key: `Price for ${pamphlet.minQuantity} Pieces`, value: `Rs ${pamphlet.totalPrice}`, displayOrder: 4 },
                    ],
                },
                attributes: {
                    create: [
                        { attributeType: "product_type", attributeValue: "pamphlet" },
                        { attributeType: "print_type", attributeValue: pamphlet.description.toLowerCase().includes("multi") ? "multi-color" : "single-color" },
                    ],
                },
                tags: {
                    create: [
                        { tag: "pamphlet" },
                        { tag: "poster" },
                        { tag: pamphlet.description.toLowerCase().includes("multi") ? "multi-color" : "single-color" },
                    ],
                },
            },
        });
        console.log(`  ✅ Created: ${name}`);
    }

    // Create Brochure Products
    console.log("\n📰 Creating brochure products...");
    for (const brochure of brochureProducts) {
        const name = `Brochure - ${brochure.paperSize}`;
        const slug = await getUniqueSlug(prisma, generateSlug(name));
        
        const specifications = [
            { key: "Product Type", value: "Brochure", displayOrder: 0 },
            { key: "Paper Size", value: brochure.paperSize, displayOrder: 1 },
            { key: "Size Description", value: brochure.sizeDescription, displayOrder: 2 },
            { key: "Price Per Piece", value: `Rs ${brochure.pricePerPiece}`, displayOrder: 3 },
            { key: "Minimum Quantity", value: `${brochure.minQuantity} pieces`, displayOrder: 4 },
            { key: `Price for ${brochure.minQuantity} Pieces`, value: `Rs ${brochure.totalPrice}`, displayOrder: 5 },
        ];

        // Add fold types information
        specifications.push({
            key: "Available Fold Types",
            value: brochureFoldTypes.join("; "),
            displayOrder: 6,
        });

        await prisma.product.create({
            data: {
                name,
                slug,
                description: `Brochure printing in ${brochure.paperSize} size. ${brochure.sizeDescription}. Minimum order quantity: ${brochure.minQuantity} pieces. Available fold types: ${brochureFoldTypes.join(", ")}.`,
                shortDescription: `Brochure - ${brochure.paperSize}`,
                basePrice: brochure.pricePerPiece,
                categoryId: brochureCategory.id,
                stock: DEFAULT_STOCK,
                minOrderQuantity: brochure.minQuantity,
                specifications: {
                    create: specifications,
                },
                attributes: {
                    create: [
                        { attributeType: "product_type", attributeValue: "brochure" },
                        { attributeType: "paper_size", attributeValue: brochure.paperSize.toLowerCase().replace(/[^a-z0-9]/g, "-") },
                    ],
                },
                tags: {
                    create: [
                        { tag: "brochure" },
                        { tag: brochure.paperSize.toLowerCase().replace(/[^a-z0-9]/g, "-") },
                    ],
                },
            },
        });
        console.log(`  ✅ Created: ${name}`);
    }

    console.log("\n🎉 All pamphlet and brochure products seeded successfully!");
}

main()
    .catch((e) => {
        console.error("❌ Seeding failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });

