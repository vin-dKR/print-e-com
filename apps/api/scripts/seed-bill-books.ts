import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import { generateSlug, getUniqueSlug } from "../constants/seed-utils";
import { DEFAULT_STOCK, PAPER_COLORS } from "../constants/seed-constants";
import { BILL_BOOK_PRODUCTS, HARD_BINDING_PRICE } from "../constants/seed-data";

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Bill Book Products Data
const billBookProducts = BILL_BOOK_PRODUCTS;

// Binding Options
const hardBindingPrice = HARD_BINDING_PRICE;

async function main() {
    console.log("🌱 Seeding bill book products...");

    // Create or get categories
    const billBookCategory = await prisma.category.upsert({
        where: { slug: "bill-book" },
        update: {},
        create: {
            name: "Bill Book",
            slug: "bill-book",
            description: "Bill book printing services with various paper colors (Non-GST and GST)",
        },
    });

    const billBookBindingCategory = await prisma.category.upsert({
        where: { slug: "bill-book-binding" },
        update: {},
        create: {
            name: "Bill Book Binding",
            slug: "bill-book-binding",
            description: "Binding services for bill books",
        },
    });

    console.log("✅ Categories created/updated");

    // Create Bill Book Products
    console.log("\n📋 Creating bill book products...");
    for (const billBook of billBookProducts) {
        for (const color of PAPER_COLORS) {
            const name = `${billBook.type} - ${color} Paper`;
            const slug = await getUniqueSlug(prisma, generateSlug(name));
            await prisma.product.create({
                data: {
                    name,
                    slug,
                    description: `${billBook.type} on ${color} paper. Minimum order quantity: ${billBook.minQuantity} pieces. Binding: ${billBook.binding}.`,
                    shortDescription: `${billBook.type} - ${color} Paper`,
                    basePrice: billBook.pricePerPiece,
                    categoryId: billBookCategory.id,
                    stock: DEFAULT_STOCK,
                    minOrderQuantity: billBook.minQuantity,
                    specifications: {
                        create: [
                            { key: "Bill Book Type", value: billBook.type, displayOrder: 0 },
                            { key: "Paper Color", value: color, displayOrder: 1 },
                            { key: "Price Per Piece", value: `Rs ${billBook.pricePerPiece}`, displayOrder: 2 },
                            { key: "Minimum Quantity", value: `${billBook.minQuantity} pieces`, displayOrder: 3 },
                            { key: `Price for ${billBook.minQuantity} Pieces`, value: `Rs ${billBook.totalPrice}`, displayOrder: 4 },
                            { key: "Binding", value: billBook.binding, displayOrder: 5 },
                        ],
                    },
                    attributes: {
                        create: [
                            { attributeType: "product_type", attributeValue: "bill-book" },
                            { attributeType: "bill_book_type", attributeValue: billBook.type.toLowerCase().replace(/\s+/g, "-").replace(/[()]/g, "") },
                            { attributeType: "paper_color", attributeValue: color.toLowerCase() },
                        ],
                    },
                    tags: {
                        create: [
                            { tag: "bill-book" },
                            { tag: billBook.type.toLowerCase().replace(/\s+/g, "-").replace(/[()]/g, "") },
                            { tag: color.toLowerCase() },
                        ],
                    },
                },
            });
            console.log(`  ✅ Created: ${name}`);
        }
    }

    // Create Hard Binding Product for Bill Book
    console.log("\n📚 Creating bill book binding product...");
    const bindingName = "Bill Book Hard Binding";
    const bindingSlug = await getUniqueSlug(prisma, generateSlug(bindingName));
    await prisma.product.create({
        data: {
            name: bindingName,
            slug: bindingSlug,
            description: "Hard binding service for bill books",
            shortDescription: "Bill Book Hard Binding",
            basePrice: hardBindingPrice,
            categoryId: billBookBindingCategory.id,
            stock: 9999,
            minOrderQuantity: 1,
            specifications: {
                create: [
                    { key: "Product Type", value: "Bill Book", displayOrder: 0 },
                    { key: "Binding Type", value: "Hard Binding", displayOrder: 1 },
                    { key: "Price", value: `Rs ${hardBindingPrice}`, displayOrder: 2 },
                ],
            },
            attributes: {
                create: [
                    { attributeType: "product_type", attributeValue: "bill-book" },
                    { attributeType: "binding_type", attributeValue: "hard-binding" },
                ],
            },
            tags: {
                create: [
                    { tag: "bill-book" },
                    { tag: "binding" },
                    { tag: "hard-binding" },
                ],
            },
        },
    });
    console.log(`  ✅ Created: ${bindingName}`);

    console.log("\n🎉 All bill book products seeded successfully!");
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

