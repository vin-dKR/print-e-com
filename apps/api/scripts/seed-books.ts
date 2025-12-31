import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import { generateSlug, getUniqueSlug } from "../constants/seed-utils";
import { DEFAULT_STOCK } from "../constants/seed-constants";
import { BOOK_PRINTOUTS, BOOK_BINDING_PRODUCTS, PageBasedPrice } from "../constants/seed-data";

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Book Printout Products Data
const bookPrintouts = BOOK_PRINTOUTS;

// Book Binding Products
const bookBindingProducts = BOOK_BINDING_PRODUCTS;

async function main() {
    console.log("🌱 Seeding book printout products...");

    // Create or get categories
    const bookPrintoutCategory = await prisma.category.upsert({
        where: { slug: "book-printout" },
        update: {},
        create: {
            name: "Book Printout",
            slug: "book-printout",
            description: "Book printout services with various paper sizes (A5, B5, A4, A3) and printing options",
        },
    });

    const bookBindingCategory = await prisma.category.upsert({
        where: { slug: "book-binding" },
        update: {},
        create: {
            name: "Book Binding",
            slug: "book-binding",
            description: "Binding services for books including glue binding and hard binding",
        },
    });

    console.log("✅ Categories created/updated");

    // Create Book Printout Products
    console.log("\n📚 Creating book printout products...");
    for (const printout of bookPrintouts) {
        const paperSize = printout.paperSize;
        const paperType = printout.paperType;
        
        // B/W Single
        const bwSingleName = `Book ${paperSize} ${paperType} B/W Single Side Printout`;
        const bwSingleSlug = await getUniqueSlug(prisma, generateSlug(bwSingleName));
        await prisma.product.create({
            data: {
                name: bwSingleName,
                slug: bwSingleSlug,
                description: `Black and white single side book printout on ${paperType} ${paperSize} paper`,
                shortDescription: `Book B/W single side printout - ${paperSize} ${paperType}`,
                basePrice: printout.prices.bwSingle,
                categoryId: bookPrintoutCategory.id,
                stock: DEFAULT_STOCK,
                minOrderQuantity: 1,
                specifications: {
                    create: [
                        { key: "Paper Size", value: paperSize, displayOrder: 0 },
                        { key: "Paper Type", value: paperType, displayOrder: 1 },
                        { key: "Print Type", value: "Black & White", displayOrder: 2 },
                        { key: "Sides", value: "Single Side", displayOrder: 3 },
                        { key: "Product Type", value: "Book", displayOrder: 4 },
                        { key: "Price Per Page", value: `Rs ${printout.prices.bwSingle}`, displayOrder: 5 },
                    ],
                },
                attributes: {
                    create: [
                        { attributeType: "paper_size", attributeValue: paperSize.toLowerCase() },
                        { attributeType: "paper_type", attributeValue: paperType.toLowerCase().replace(/\s+/g, "-") },
                        { attributeType: "print_type", attributeValue: "bw" },
                        { attributeType: "sides", attributeValue: "single" },
                        { attributeType: "product_type", attributeValue: "book" },
                    ],
                },
                tags: {
                    create: [
                        { tag: "book" },
                        { tag: "printout" },
                        { tag: paperSize.toLowerCase() },
                        { tag: "bw" },
                    ],
                },
            },
        });
        console.log(`  ✅ Created: ${bwSingleName}`);

        // B/W Both
        const bwBothName = `Book ${paperSize} ${paperType} B/W Both Sides Printout`;
        const bwBothSlug = await getUniqueSlug(prisma, generateSlug(bwBothName));
        await prisma.product.create({
            data: {
                name: bwBothName,
                slug: bwBothSlug,
                description: `Black and white both sides book printout on ${paperType} ${paperSize} paper`,
                shortDescription: `Book B/W both sides printout - ${paperSize} ${paperType}`,
                basePrice: printout.prices.bwBoth,
                categoryId: bookPrintoutCategory.id,
                stock: DEFAULT_STOCK,
                minOrderQuantity: 1,
                specifications: {
                    create: [
                        { key: "Paper Size", value: paperSize, displayOrder: 0 },
                        { key: "Paper Type", value: paperType, displayOrder: 1 },
                        { key: "Print Type", value: "Black & White", displayOrder: 2 },
                        { key: "Sides", value: "Both Sides", displayOrder: 3 },
                        { key: "Product Type", value: "Book", displayOrder: 4 },
                        { key: "Price Per Page", value: `Rs ${printout.prices.bwBoth}`, displayOrder: 5 },
                    ],
                },
                attributes: {
                    create: [
                        { attributeType: "paper_size", attributeValue: paperSize.toLowerCase() },
                        { attributeType: "paper_type", attributeValue: paperType.toLowerCase().replace(/\s+/g, "-") },
                        { attributeType: "print_type", attributeValue: "bw" },
                        { attributeType: "sides", attributeValue: "both" },
                        { attributeType: "product_type", attributeValue: "book" },
                    ],
                },
                tags: {
                    create: [
                        { tag: "book" },
                        { tag: "printout" },
                        { tag: paperSize.toLowerCase() },
                        { tag: "bw" },
                    ],
                },
            },
        });
        console.log(`  ✅ Created: ${bwBothName}`);

        // Color Single
        const colorSingleName = `Book ${paperSize} ${paperType} Color Single Side Printout`;
        const colorSingleSlug = await getUniqueSlug(prisma, generateSlug(colorSingleName));
        await prisma.product.create({
            data: {
                name: colorSingleName,
                slug: colorSingleSlug,
                description: `Color single side book printout on ${paperType} ${paperSize} paper`,
                shortDescription: `Book color single side printout - ${paperSize} ${paperType}`,
                basePrice: printout.prices.colorSingle,
                categoryId: bookPrintoutCategory.id,
                stock: DEFAULT_STOCK,
                minOrderQuantity: 1,
                specifications: {
                    create: [
                        { key: "Paper Size", value: paperSize, displayOrder: 0 },
                        { key: "Paper Type", value: paperType, displayOrder: 1 },
                        { key: "Print Type", value: "Color", displayOrder: 2 },
                        { key: "Sides", value: "Single Side", displayOrder: 3 },
                        { key: "Product Type", value: "Book", displayOrder: 4 },
                        { key: "Price Per Page", value: `Rs ${printout.prices.colorSingle}`, displayOrder: 5 },
                    ],
                },
                attributes: {
                    create: [
                        { attributeType: "paper_size", attributeValue: paperSize.toLowerCase() },
                        { attributeType: "paper_type", attributeValue: paperType.toLowerCase().replace(/\s+/g, "-") },
                        { attributeType: "print_type", attributeValue: "color" },
                        { attributeType: "sides", attributeValue: "single" },
                        { attributeType: "product_type", attributeValue: "book" },
                    ],
                },
                tags: {
                    create: [
                        { tag: "book" },
                        { tag: "printout" },
                        { tag: paperSize.toLowerCase() },
                        { tag: "color" },
                    ],
                },
            },
        });
        console.log(`  ✅ Created: ${colorSingleName}`);

        // Color Both
        const colorBothName = `Book ${paperSize} ${paperType} Color Both Sides Printout`;
        const colorBothSlug = await getUniqueSlug(prisma, generateSlug(colorBothName));
        await prisma.product.create({
            data: {
                name: colorBothName,
                slug: colorBothSlug,
                description: `Color both sides book printout on ${paperType} ${paperSize} paper`,
                shortDescription: `Book color both sides printout - ${paperSize} ${paperType}`,
                basePrice: printout.prices.colorBoth,
                categoryId: bookPrintoutCategory.id,
                stock: DEFAULT_STOCK,
                minOrderQuantity: 1,
                specifications: {
                    create: [
                        { key: "Paper Size", value: paperSize, displayOrder: 0 },
                        { key: "Paper Type", value: paperType, displayOrder: 1 },
                        { key: "Print Type", value: "Color", displayOrder: 2 },
                        { key: "Sides", value: "Both Sides", displayOrder: 3 },
                        { key: "Product Type", value: "Book", displayOrder: 4 },
                        { key: "Price Per Page", value: `Rs ${printout.prices.colorBoth}`, displayOrder: 5 },
                    ],
                },
                attributes: {
                    create: [
                        { attributeType: "paper_size", attributeValue: paperSize.toLowerCase() },
                        { attributeType: "paper_type", attributeValue: paperType.toLowerCase().replace(/\s+/g, "-") },
                        { attributeType: "print_type", attributeValue: "color" },
                        { attributeType: "sides", attributeValue: "both" },
                        { attributeType: "product_type", attributeValue: "book" },
                    ],
                },
                tags: {
                    create: [
                        { tag: "book" },
                        { tag: "printout" },
                        { tag: paperSize.toLowerCase() },
                        { tag: "color" },
                    ],
                },
            },
        });
        console.log(`  ✅ Created: ${colorBothName}`);
    }

    // Create Book Binding Products
    console.log("\n📖 Creating book binding products...");
    for (const bindingType of bookBindingProducts) {
        for (const priceOption of bindingType.prices) {
            const name = `Book ${bindingType.type} ${priceOption.pages}`;
            const slug = await getUniqueSlug(prisma, generateSlug(name));
            await prisma.product.create({
                data: {
                    name,
                    slug,
                    description: `${bindingType.type} service for books - ${priceOption.pages}`,
                    shortDescription: `Book ${bindingType.type} - ${priceOption.pages}`,
                    basePrice: priceOption.price,
                    categoryId: bookBindingCategory.id,
                    stock: DEFAULT_STOCK,
                    minOrderQuantity: 1,
                    specifications: {
                        create: [
                            { key: "Product Type", value: "Book", displayOrder: 0 },
                            { key: "Binding Type", value: bindingType.type, displayOrder: 1 },
                            { key: "Page Range", value: priceOption.pages, displayOrder: 2 },
                            { key: "Price", value: `Rs ${priceOption.price}`, displayOrder: 3 },
                        ],
                    },
                    attributes: {
                        create: [
                            { attributeType: "product_type", attributeValue: "book" },
                            { attributeType: "binding_type", attributeValue: bindingType.type.toLowerCase().replace(/\s+/g, "-") },
                        ],
                    },
                    tags: {
                        create: [
                            { tag: "book" },
                            { tag: "binding" },
                            { tag: bindingType.type.toLowerCase().replace(/\s+/g, "-") },
                        ],
                    },
                },
            });
            console.log(`  ✅ Created: ${name}`);
        }
    }

    console.log("\n🎉 All book printout products seeded successfully!");
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

