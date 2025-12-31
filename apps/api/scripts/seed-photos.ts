import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import { generateSlug, getUniqueSlug } from "../constants/seed-utils";
import { DEFAULT_STOCK } from "../constants/seed-constants";
import { GLOSSY_PHOTO_PRODUCTS, MATT_PHOTO_PRODUCTS, GLOSSY_LAMINATION_PRODUCTS } from "../constants/seed-data";

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Glossy Photo Products Data
const glossyPhotoProducts = GLOSSY_PHOTO_PRODUCTS;

// Matt Photo Products Data
const mattPhotoProducts = MATT_PHOTO_PRODUCTS;

// Glossy Lamination Products Data
const glossyLaminationProducts = GLOSSY_LAMINATION_PRODUCTS;

async function main() {
    console.log("🌱 Seeding photo printout and lamination products...");

    // Create or get categories
    const photoPrintoutCategory = await prisma.category.upsert({
        where: { slug: "photo-printout" },
        update: {},
        create: {
            name: "Photo Printout",
            slug: "photo-printout",
            description: "Photo printing services with glossy and matt finishes in various sizes",
        },
    });

    const photoLaminationCategory = await prisma.category.upsert({
        where: { slug: "photo-lamination" },
        update: {},
        create: {
            name: "Photo Lamination",
            slug: "photo-lamination",
            description: "Glossy lamination services for photos in various sizes",
        },
    });

    console.log("✅ Categories created/updated");

    // Create Glossy Photo Products
    console.log("\n📸 Creating glossy photo products...");
    for (const photo of glossyPhotoProducts) {
        const name = `Glossy Photo ${photo.size}`;
        const slug = await getUniqueSlug(prisma, generateSlug(name));
        await prisma.product.create({
            data: {
                name,
                slug,
                description: `Glossy photo print in ${photo.size} size. Prices are same for both color and black & white.`,
                shortDescription: `Glossy photo print - ${photo.size}`,
                basePrice: photo.price,
                categoryId: photoPrintoutCategory.id,
                stock: DEFAULT_STOCK,
                minOrderQuantity: 1,
                specifications: {
                    create: [
                        { key: "Photo Type", value: "Glossy", displayOrder: 0 },
                        { key: "Size", value: photo.size, displayOrder: 1 },
                        { key: "Print Type", value: "Color & B/W (Same Price)", displayOrder: 2 },
                        { key: "Price", value: `Rs ${photo.price}`, displayOrder: 3 },
                    ],
                },
                attributes: {
                    create: [
                        { attributeType: "photo_type", attributeValue: "glossy" },
                        { attributeType: "size", attributeValue: photo.size.toLowerCase().replace(/x/g, "-") },
                        { attributeType: "product_type", attributeValue: "photo" },
                    ],
                },
                tags: {
                    create: [
                        { tag: "photo" },
                        { tag: "glossy" },
                        { tag: photo.size.toLowerCase().replace(/x/g, "-") },
                    ],
                },
            },
        });
        console.log(`  ✅ Created: ${name}`);
    }

    // Create Matt Photo Products
    console.log("\n📸 Creating matt photo products...");
    for (const photo of mattPhotoProducts) {
        const name = `Matt Photo ${photo.size}`;
        const slug = await getUniqueSlug(prisma, generateSlug(name));
        await prisma.product.create({
            data: {
                name,
                slug,
                description: `Matt photo print in ${photo.size} size. Prices are same for both color and black & white.`,
                shortDescription: `Matt photo print - ${photo.size}`,
                basePrice: photo.price,
                categoryId: photoPrintoutCategory.id,
                stock: DEFAULT_STOCK,
                minOrderQuantity: 1,
                specifications: {
                    create: [
                        { key: "Photo Type", value: "Matt", displayOrder: 0 },
                        { key: "Size", value: photo.size, displayOrder: 1 },
                        { key: "Print Type", value: "Color & B/W (Same Price)", displayOrder: 2 },
                        { key: "Price", value: `Rs ${photo.price}`, displayOrder: 3 },
                    ],
                },
                attributes: {
                    create: [
                        { attributeType: "photo_type", attributeValue: "matt" },
                        { attributeType: "size", attributeValue: photo.size.toLowerCase().replace(/x/g, "-") },
                        { attributeType: "product_type", attributeValue: "photo" },
                    ],
                },
                tags: {
                    create: [
                        { tag: "photo" },
                        { tag: "matt" },
                        { tag: photo.size.toLowerCase().replace(/x/g, "-") },
                    ],
                },
            },
        });
        console.log(`  ✅ Created: ${name}`);
    }

    // Create Glossy Lamination Products
    console.log("\n🔄 Creating glossy lamination products...");
    for (const lamination of glossyLaminationProducts) {
        const name = `Glossy Lamination ${lamination.size}`;
        const slug = await getUniqueSlug(prisma, generateSlug(name));
        await prisma.product.create({
            data: {
                name,
                slug,
                description: `Glossy lamination service for ${lamination.size} size photos`,
                shortDescription: `Glossy lamination - ${lamination.size}`,
                basePrice: lamination.price,
                categoryId: photoLaminationCategory.id,
                stock: DEFAULT_STOCK,
                minOrderQuantity: 1,
                specifications: {
                    create: [
                        { key: "Lamination Type", value: "Glossy", displayOrder: 0 },
                        { key: "Size", value: lamination.size, displayOrder: 1 },
                        { key: "Price", value: `Rs ${lamination.price}`, displayOrder: 2 },
                    ],
                },
                attributes: {
                    create: [
                        { attributeType: "lamination_type", attributeValue: "glossy" },
                        { attributeType: "size", attributeValue: lamination.size.toLowerCase().replace(/x/g, "-") },
                        { attributeType: "product_type", attributeValue: "photo" },
                    ],
                },
                tags: {
                    create: [
                        { tag: "lamination" },
                        { tag: "glossy" },
                        { tag: "photo" },
                        { tag: lamination.size.toLowerCase().replace(/x/g, "-") },
                    ],
                },
            },
        });
        console.log(`  ✅ Created: ${name}`);
    }

    console.log("\n🎉 All photo printout and lamination products seeded successfully!");
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

