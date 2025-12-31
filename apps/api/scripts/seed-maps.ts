import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import { generateSlug, getUniqueSlug } from "../constants/seed-utils";
import { DEFAULT_STOCK } from "../constants/seed-constants";
import { MAP_PRODUCTS } from "../constants/seed-data";

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Map Products Data
const mapProducts = MAP_PRODUCTS;

async function main() {
    console.log("🌱 Seeding map products...");

    // Create or get categories
    const mapCategory = await prisma.category.upsert({
        where: { slug: "map" },
        update: {},
        create: {
            name: "Map",
            slug: "map",
            description: "Map printing services in various sizes with B/W and color options",
        },
    });

    const mapLaminationCategory = await prisma.category.upsert({
        where: { slug: "map-lamination" },
        update: {},
        create: {
            name: "Map Lamination",
            slug: "map-lamination",
            description: "Lamination services for maps",
        },
    });

    console.log("✅ Categories created/updated");

    // Create Map Products
    console.log("\n🗺️ Creating map products...");
    for (const map of mapProducts) {
        for (const option of map.options) {
            const pricingType = option.pricingType ? ` - ${option.pricingType}` : '';
            const name = `Map ${map.paperSize} ${option.printType}${pricingType}`;
            const slug = await getUniqueSlug(prisma, generateSlug(name));
            
            const specifications = [
                { key: "Paper Size", value: map.paperSize, displayOrder: 0 },
                { key: "Paper Type", value: map.paperType, displayOrder: 1 },
                { key: "Print Type", value: option.printType, displayOrder: 2 },
            ];

            if (option.pricingType) {
                specifications.push({
                    key: "Pricing Type",
                    value: option.pricingType,
                    displayOrder: 3,
                });
                specifications.push({
                    key: "Price",
                    value: `Rs ${option.price}${option.pricingType === "Per Meter" ? " per meter" : ""}`,
                    displayOrder: 4,
                });
            } else {
                specifications.push({
                    key: "Price",
                    value: `Rs ${option.price}`,
                    displayOrder: 3,
                });
            }

            await prisma.product.create({
                data: {
                    name,
                    slug,
                    description: `Map printing in ${map.paperSize} size on ${map.paperType} paper - ${option.printType}${pricingType ? ` (${option.pricingType})` : ''}.`,
                    shortDescription: `Map - ${map.paperSize} ${option.printType}${pricingType}`,
                    basePrice: option.price,
                    categoryId: mapCategory.id,
                    stock: DEFAULT_STOCK,
                    minOrderQuantity: 1,
                    specifications: {
                        create: specifications,
                    },
                    attributes: {
                        create: [
                            { attributeType: "product_type", attributeValue: "map" },
                            { attributeType: "paper_size", attributeValue: map.paperSize.toLowerCase() },
                            { attributeType: "print_type", attributeValue: option.printType.toLowerCase().replace(/\//g, "-") },
                        ],
                    },
                    tags: {
                        create: [
                            { tag: "map" },
                            { tag: map.paperSize.toLowerCase() },
                            { tag: option.printType.toLowerCase().replace(/\//g, "-") },
                        ],
                    },
                },
            });
            console.log(`  ✅ Created: ${name}`);
        }

        // Create Lamination Product for this map size
        const laminationName = `Map ${map.paperSize} Lamination ${map.lamination.type}`;
        const laminationSlug = await getUniqueSlug(prisma, generateSlug(laminationName));
        await prisma.product.create({
            data: {
                name: laminationName,
                slug: laminationSlug,
                description: `${map.lamination.type} lamination service for ${map.paperSize} size maps`,
                shortDescription: `Map Lamination - ${map.paperSize} (${map.lamination.type})`,
                basePrice: map.lamination.price,
                categoryId: mapLaminationCategory.id,
                stock: DEFAULT_STOCK,
                minOrderQuantity: 1,
                specifications: {
                    create: [
                        { key: "Product Type", value: "Map", displayOrder: 0 },
                        { key: "Paper Size", value: map.paperSize, displayOrder: 1 },
                        { key: "Lamination Type", value: map.lamination.type, displayOrder: 2 },
                        { key: "Price", value: `Rs ${map.lamination.price}`, displayOrder: 3 },
                    ],
                },
                attributes: {
                    create: [
                        { attributeType: "product_type", attributeValue: "map" },
                        { attributeType: "lamination_type", attributeValue: map.lamination.type.toLowerCase().replace(/\s+/g, "-") },
                        { attributeType: "paper_size", attributeValue: map.paperSize.toLowerCase() },
                    ],
                },
                tags: {
                    create: [
                        { tag: "map" },
                        { tag: "lamination" },
                        { tag: map.paperSize.toLowerCase() },
                    ],
                },
            },
        });
        console.log(`  ✅ Created: ${laminationName}`);
    }

    console.log("\n🎉 All map products seeded successfully!");
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

