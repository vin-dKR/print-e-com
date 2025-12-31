import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import { generateSlug, getUniqueSlug } from "../constants/seed-utils";
import { DEFAULT_STOCK } from "../constants/seed-constants";
import { LETTER_HEAD_PRODUCTS, HARD_BINDING_PRICE } from "../constants/seed-data";

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Letter Head Products Data
const letterHeadProducts = LETTER_HEAD_PRODUCTS;

// Binding Options
const hardBindingPrice = HARD_BINDING_PRICE;

async function main() {
    console.log("🌱 Seeding letter head products...");

    // Create or get categories
    const letterHeadCategory = await prisma.category.upsert({
        where: { slug: "letter-head" },
        update: {},
        create: {
            name: "Letter Head",
            slug: "letter-head",
            description: "Letter head printing services with various paper types and printing options",
        },
    });

    const letterHeadBindingCategory = await prisma.category.upsert({
        where: { slug: "letter-head-binding" },
        update: {},
        create: {
            name: "Letter Head Binding",
            slug: "letter-head-binding",
            description: "Binding services for letter heads",
        },
    });

    console.log("✅ Categories created/updated");

    // Create Letter Head Products
    console.log("\n📄 Creating letter head products...");
    for (const letterHead of letterHeadProducts) {
        for (const option of letterHead.options) {
            const name = `Letter Head ${letterHead.paperType} - ${option.printType}`;
            const slug = await getUniqueSlug(prisma, generateSlug(name));
            
            const specifications = [
                { key: "Paper Type", value: letterHead.paperType, displayOrder: 0 },
                { key: "Print Type", value: option.printType, displayOrder: 1 },
                { key: "Price Per Piece", value: `Rs ${option.pricePerPiece}`, displayOrder: 2 },
                { key: "Minimum Quantity", value: `${option.minQuantity} pieces`, displayOrder: 3 },
                { key: `Price for ${option.minQuantity} Pieces`, value: `Rs ${option.totalPrice}`, displayOrder: 4 },
            ];

            if (option.glueOption) {
                specifications.push({
                    key: "Glue Option",
                    value: option.glueOption,
                    displayOrder: 5,
                });
            }

            await prisma.product.create({
                data: {
                    name,
                    slug,
                    description: `Letter head printing on ${letterHead.paperType} paper - ${option.printType} printing. Minimum order quantity: ${option.minQuantity} pieces.${option.glueOption ? ` Glue option: ${option.glueOption}.` : ''}`,
                    shortDescription: `Letter Head - ${letterHead.paperType} (${option.printType})`,
                    basePrice: option.pricePerPiece,
                    categoryId: letterHeadCategory.id,
                    stock: DEFAULT_STOCK,
                    minOrderQuantity: option.minQuantity,
                    specifications: {
                        create: specifications,
                    },
                    attributes: {
                        create: [
                            { attributeType: "product_type", attributeValue: "letter-head" },
                            { attributeType: "paper_type", attributeValue: letterHead.paperType.toLowerCase().replace(/\s+/g, "-") },
                            { attributeType: "print_type", attributeValue: option.printType.toLowerCase().replace(/\s+/g, "-") },
                        ],
                    },
                    tags: {
                        create: [
                            { tag: "letter-head" },
                            { tag: letterHead.paperType.toLowerCase().replace(/\s+/g, "-") },
                            { tag: option.printType.toLowerCase().replace(/\s+/g, "-") },
                        ],
                    },
                },
            });
            console.log(`  ✅ Created: ${name}`);
        }
    }

    // Create Hard Binding Product for Letter Head
    console.log("\n📚 Creating letter head binding product...");
    const bindingName = "Letter Head Hard Binding";
    const bindingSlug = await getUniqueSlug(prisma, generateSlug(bindingName));
    await prisma.product.create({
        data: {
            name: bindingName,
            slug: bindingSlug,
            description: "Hard binding service for letter heads",
            shortDescription: "Letter Head Hard Binding",
            basePrice: hardBindingPrice,
            categoryId: letterHeadBindingCategory.id,
            stock: 9999,
            minOrderQuantity: 1,
            specifications: {
                create: [
                    { key: "Product Type", value: "Letter Head", displayOrder: 0 },
                    { key: "Binding Type", value: "Hard Binding", displayOrder: 1 },
                    { key: "Price", value: `Rs ${hardBindingPrice}`, displayOrder: 2 },
                ],
            },
            attributes: {
                create: [
                    { attributeType: "product_type", attributeValue: "letter-head" },
                    { attributeType: "binding_type", attributeValue: "hard-binding" },
                ],
            },
            tags: {
                create: [
                    { tag: "letter-head" },
                    { tag: "binding" },
                    { tag: "hard-binding" },
                ],
            },
        },
    });
    console.log(`  ✅ Created: ${bindingName}`);

    console.log("\n🎉 All letter head products seeded successfully!");
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

