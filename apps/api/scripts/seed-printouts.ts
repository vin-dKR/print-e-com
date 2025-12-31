import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import { generateSlug, getUniqueSlug } from "../constants/seed-utils";
import { DEFAULT_STOCK } from "../constants/seed-constants";
import { A4_PRINTOUTS, A3_PRINTOUTS, LAMINATION_PRODUCTS, BINDING_PRODUCTS, PageBasedPrice, TypeBasedPrice } from "../constants/seed-data";

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });


// A4 Printout Products Data
const a4Printouts = A4_PRINTOUTS;

// A3 Printout Products Data
const a3Printouts = A3_PRINTOUTS;

// Lamination Products
const laminationProducts = LAMINATION_PRODUCTS;

// Binding Products
const bindingProducts = BINDING_PRODUCTS;

// Type guard functions
function isPageBasedPrice(price: PageBasedPrice | TypeBasedPrice): price is PageBasedPrice {
    return 'pages' in price;
}

function isTypeBasedPrice(price: PageBasedPrice | TypeBasedPrice): price is TypeBasedPrice {
    return 'type' in price;
}

async function main() {
    console.log("🌱 Seeding printout products...");

    // Create or get categories
    const printoutA4Category = await prisma.category.upsert({
        where: { slug: "printout-a4" },
        update: {},
        create: {
            name: "Printout A4",
            slug: "printout-a4",
            description: "A4 size printout services with various paper types and printing options",
        },
    });

    const printoutA3Category = await prisma.category.upsert({
        where: { slug: "printout-a3" },
        update: {},
        create: {
            name: "Printout A3",
            slug: "printout-a3",
            description: "A3 size printout services with various paper types and printing options",
        },
    });

    const laminationCategory = await prisma.category.upsert({
        where: { slug: "lamination" },
        update: {},
        create: {
            name: "Lamination",
            slug: "lamination",
            description: "Lamination services for A4 and A3 documents",
        },
    });

    const bindingCategory = await prisma.category.upsert({
        where: { slug: "binding" },
        update: {},
        create: {
            name: "Binding",
            slug: "binding",
            description: "Binding services including spiral, wiro, glue, and hard binding",
        },
    });

    console.log("✅ Categories created/updated");

    // Create A4 Printout Products
    console.log("\n📄 Creating A4 printout products...");
    for (const printout of a4Printouts) {
        const paperType = printout.paperType;
        
        // B/W Single
        const bwSingleName = `A4 ${paperType} B/W Single Side Printout`;
        const bwSingleSlug = await getUniqueSlug(prisma, generateSlug(bwSingleName));
        await prisma.product.create({
            data: {
                name: bwSingleName,
                slug: bwSingleSlug,
                description: `Black and white single side printout on ${paperType} A4 paper`,
                shortDescription: `B/W single side printout - ${paperType}`,
                basePrice: printout.prices.bwSingle,
                categoryId: printoutA4Category.id,
                stock: DEFAULT_STOCK,
                minOrderQuantity: 1,
                specifications: {
                    create: [
                        { key: "Paper Size", value: "A4", displayOrder: 0 },
                        { key: "Paper Type", value: paperType, displayOrder: 1 },
                        { key: "Print Type", value: "Black & White", displayOrder: 2 },
                        { key: "Sides", value: "Single Side", displayOrder: 3 },
                        { key: "Price Per Page", value: `Rs ${printout.prices.bwSingle}`, displayOrder: 4 },
                    ],
                },
                attributes: {
                    create: [
                        { attributeType: "paper_size", attributeValue: "a4" },
                        { attributeType: "paper_type", attributeValue: paperType.toLowerCase().replace(/\s+/g, "-") },
                        { attributeType: "print_type", attributeValue: "bw" },
                        { attributeType: "sides", attributeValue: "single" },
                    ],
                },
                tags: {
                    create: [
                        { tag: "printout" },
                        { tag: "a4" },
                        { tag: "bw" },
                    ],
                },
            },
        });
        console.log(`  ✅ Created: ${bwSingleName}`);

        // B/W Both
        const bwBothName = `A4 ${paperType} B/W Both Sides Printout`;
        const bwBothSlug = await getUniqueSlug(prisma, generateSlug(bwBothName));
        await prisma.product.create({
            data: {
                name: bwBothName,
                slug: bwBothSlug,
                description: `Black and white both sides printout on ${paperType} A4 paper`,
                shortDescription: `B/W both sides printout - ${paperType}`,
                basePrice: printout.prices.bwBoth,
                categoryId: printoutA4Category.id,
                stock: DEFAULT_STOCK,
                minOrderQuantity: 1,
                specifications: {
                    create: [
                        { key: "Paper Size", value: "A4", displayOrder: 0 },
                        { key: "Paper Type", value: paperType, displayOrder: 1 },
                        { key: "Print Type", value: "Black & White", displayOrder: 2 },
                        { key: "Sides", value: "Both Sides", displayOrder: 3 },
                        { key: "Price Per Page", value: `Rs ${printout.prices.bwBoth}`, displayOrder: 4 },
                    ],
                },
                attributes: {
                    create: [
                        { attributeType: "paper_size", attributeValue: "a4" },
                        { attributeType: "paper_type", attributeValue: paperType.toLowerCase().replace(/\s+/g, "-") },
                        { attributeType: "print_type", attributeValue: "bw" },
                        { attributeType: "sides", attributeValue: "both" },
                    ],
                },
                tags: {
                    create: [
                        { tag: "printout" },
                        { tag: "a4" },
                        { tag: "bw" },
                    ],
                },
            },
        });
        console.log(`  ✅ Created: ${bwBothName}`);

        // Color Single
        const colorSingleName = `A4 ${paperType} Color Single Side Printout`;
        const colorSingleSlug = await getUniqueSlug(prisma, generateSlug(colorSingleName));
        await prisma.product.create({
            data: {
                name: colorSingleName,
                slug: colorSingleSlug,
                description: `Color single side printout on ${paperType} A4 paper`,
                shortDescription: `Color single side printout - ${paperType}`,
                basePrice: printout.prices.colorSingle,
                categoryId: printoutA4Category.id,
                stock: DEFAULT_STOCK,
                minOrderQuantity: 1,
                specifications: {
                    create: [
                        { key: "Paper Size", value: "A4", displayOrder: 0 },
                        { key: "Paper Type", value: paperType, displayOrder: 1 },
                        { key: "Print Type", value: "Color", displayOrder: 2 },
                        { key: "Sides", value: "Single Side", displayOrder: 3 },
                        { key: "Price Per Page", value: `Rs ${printout.prices.colorSingle}`, displayOrder: 4 },
                    ],
                },
                attributes: {
                    create: [
                        { attributeType: "paper_size", attributeValue: "a4" },
                        { attributeType: "paper_type", attributeValue: paperType.toLowerCase().replace(/\s+/g, "-") },
                        { attributeType: "print_type", attributeValue: "color" },
                        { attributeType: "sides", attributeValue: "single" },
                    ],
                },
                tags: {
                    create: [
                        { tag: "printout" },
                        { tag: "a4" },
                        { tag: "color" },
                    ],
                },
            },
        });
        console.log(`  ✅ Created: ${colorSingleName}`);

        // Color Both
        const colorBothName = `A4 ${paperType} Color Both Sides Printout`;
        const colorBothSlug = await getUniqueSlug(prisma, generateSlug(colorBothName));
        await prisma.product.create({
            data: {
                name: colorBothName,
                slug: colorBothSlug,
                description: `Color both sides printout on ${paperType} A4 paper`,
                shortDescription: `Color both sides printout - ${paperType}`,
                basePrice: printout.prices.colorBoth,
                categoryId: printoutA4Category.id,
                stock: DEFAULT_STOCK,
                minOrderQuantity: 1,
                specifications: {
                    create: [
                        { key: "Paper Size", value: "A4", displayOrder: 0 },
                        { key: "Paper Type", value: paperType, displayOrder: 1 },
                        { key: "Print Type", value: "Color", displayOrder: 2 },
                        { key: "Sides", value: "Both Sides", displayOrder: 3 },
                        { key: "Price Per Page", value: `Rs ${printout.prices.colorBoth}`, displayOrder: 4 },
                    ],
                },
                attributes: {
                    create: [
                        { attributeType: "paper_size", attributeValue: "a4" },
                        { attributeType: "paper_type", attributeValue: paperType.toLowerCase().replace(/\s+/g, "-") },
                        { attributeType: "print_type", attributeValue: "color" },
                        { attributeType: "sides", attributeValue: "both" },
                    ],
                },
                tags: {
                    create: [
                        { tag: "printout" },
                        { tag: "a4" },
                        { tag: "color" },
                    ],
                },
            },
        });
        console.log(`  ✅ Created: ${colorBothName}`);
    }

    // Create A3 Printout Products
    console.log("\n📄 Creating A3 printout products...");
    for (const printout of a3Printouts) {
        const paperType = printout.paperType;
        
        // B/W Single
        const bwSingleName = `A3 ${paperType} B/W Single Side Printout`;
        const bwSingleSlug = await getUniqueSlug(prisma, generateSlug(bwSingleName));
        await prisma.product.create({
            data: {
                name: bwSingleName,
                slug: bwSingleSlug,
                description: `Black and white single side printout on ${paperType} A3 paper`,
                shortDescription: `B/W single side printout - ${paperType}`,
                basePrice: printout.prices.bwSingle,
                categoryId: printoutA3Category.id,
                stock: DEFAULT_STOCK,
                minOrderQuantity: 1,
                specifications: {
                    create: [
                        { key: "Paper Size", value: "A3", displayOrder: 0 },
                        { key: "Paper Type", value: paperType, displayOrder: 1 },
                        { key: "Print Type", value: "Black & White", displayOrder: 2 },
                        { key: "Sides", value: "Single Side", displayOrder: 3 },
                        { key: "Price Per Page", value: `Rs ${printout.prices.bwSingle}`, displayOrder: 4 },
                    ],
                },
                attributes: {
                    create: [
                        { attributeType: "paper_size", attributeValue: "a3" },
                        { attributeType: "paper_type", attributeValue: paperType.toLowerCase().replace(/\s+/g, "-") },
                        { attributeType: "print_type", attributeValue: "bw" },
                        { attributeType: "sides", attributeValue: "single" },
                    ],
                },
                tags: {
                    create: [
                        { tag: "printout" },
                        { tag: "a3" },
                        { tag: "bw" },
                    ],
                },
            },
        });
        console.log(`  ✅ Created: ${bwSingleName}`);

        // B/W Both
        const bwBothName = `A3 ${paperType} B/W Both Sides Printout`;
        const bwBothSlug = await getUniqueSlug(prisma, generateSlug(bwBothName));
        await prisma.product.create({
            data: {
                name: bwBothName,
                slug: bwBothSlug,
                description: `Black and white both sides printout on ${paperType} A3 paper`,
                shortDescription: `B/W both sides printout - ${paperType}`,
                basePrice: printout.prices.bwBoth,
                categoryId: printoutA3Category.id,
                stock: DEFAULT_STOCK,
                minOrderQuantity: 1,
                specifications: {
                    create: [
                        { key: "Paper Size", value: "A3", displayOrder: 0 },
                        { key: "Paper Type", value: paperType, displayOrder: 1 },
                        { key: "Print Type", value: "Black & White", displayOrder: 2 },
                        { key: "Sides", value: "Both Sides", displayOrder: 3 },
                        { key: "Price Per Page", value: `Rs ${printout.prices.bwBoth}`, displayOrder: 4 },
                    ],
                },
                attributes: {
                    create: [
                        { attributeType: "paper_size", attributeValue: "a3" },
                        { attributeType: "paper_type", attributeValue: paperType.toLowerCase().replace(/\s+/g, "-") },
                        { attributeType: "print_type", attributeValue: "bw" },
                        { attributeType: "sides", attributeValue: "both" },
                    ],
                },
                tags: {
                    create: [
                        { tag: "printout" },
                        { tag: "a3" },
                        { tag: "bw" },
                    ],
                },
            },
        });
        console.log(`  ✅ Created: ${bwBothName}`);

        // Color Single
        const colorSingleName = `A3 ${paperType} Color Single Side Printout`;
        const colorSingleSlug = await getUniqueSlug(prisma, generateSlug(colorSingleName));
        await prisma.product.create({
            data: {
                name: colorSingleName,
                slug: colorSingleSlug,
                description: `Color single side printout on ${paperType} A3 paper`,
                shortDescription: `Color single side printout - ${paperType}`,
                basePrice: printout.prices.colorSingle,
                categoryId: printoutA3Category.id,
                stock: DEFAULT_STOCK,
                minOrderQuantity: 1,
                specifications: {
                    create: [
                        { key: "Paper Size", value: "A3", displayOrder: 0 },
                        { key: "Paper Type", value: paperType, displayOrder: 1 },
                        { key: "Print Type", value: "Color", displayOrder: 2 },
                        { key: "Sides", value: "Single Side", displayOrder: 3 },
                        { key: "Price Per Page", value: `Rs ${printout.prices.colorSingle}`, displayOrder: 4 },
                    ],
                },
                attributes: {
                    create: [
                        { attributeType: "paper_size", attributeValue: "a3" },
                        { attributeType: "paper_type", attributeValue: paperType.toLowerCase().replace(/\s+/g, "-") },
                        { attributeType: "print_type", attributeValue: "color" },
                        { attributeType: "sides", attributeValue: "single" },
                    ],
                },
                tags: {
                    create: [
                        { tag: "printout" },
                        { tag: "a3" },
                        { tag: "color" },
                    ],
                },
            },
        });
        console.log(`  ✅ Created: ${colorSingleName}`);

        // Color Both
        const colorBothName = `A3 ${paperType} Color Both Sides Printout`;
        const colorBothSlug = await getUniqueSlug(prisma, generateSlug(colorBothName));
        await prisma.product.create({
            data: {
                name: colorBothName,
                slug: colorBothSlug,
                description: `Color both sides printout on ${paperType} A3 paper`,
                shortDescription: `Color both sides printout - ${paperType}`,
                basePrice: printout.prices.colorBoth,
                categoryId: printoutA3Category.id,
                stock: DEFAULT_STOCK,
                minOrderQuantity: 1,
                specifications: {
                    create: [
                        { key: "Paper Size", value: "A3", displayOrder: 0 },
                        { key: "Paper Type", value: paperType, displayOrder: 1 },
                        { key: "Print Type", value: "Color", displayOrder: 2 },
                        { key: "Sides", value: "Both Sides", displayOrder: 3 },
                        { key: "Price Per Page", value: `Rs ${printout.prices.colorBoth}`, displayOrder: 4 },
                    ],
                },
                attributes: {
                    create: [
                        { attributeType: "paper_size", attributeValue: "a3" },
                        { attributeType: "paper_type", attributeValue: paperType.toLowerCase().replace(/\s+/g, "-") },
                        { attributeType: "print_type", attributeValue: "color" },
                        { attributeType: "sides", attributeValue: "both" },
                    ],
                },
                tags: {
                    create: [
                        { tag: "printout" },
                        { tag: "a3" },
                        { tag: "color" },
                    ],
                },
            },
        });
        console.log(`  ✅ Created: ${colorBothName}`);
    }

    // Create Lamination Products
    console.log("\n🔄 Creating lamination products...");
    for (const lamination of laminationProducts) {
        for (const option of lamination.options) {
            const name = `${lamination.size} ${option.type} Lamination`;
            const slug = await getUniqueSlug(prisma, generateSlug(name));
            await prisma.product.create({
                data: {
                    name,
                    slug,
                    description: `${option.type} lamination service for ${lamination.size} documents`,
                    shortDescription: `${option.type} lamination - ${lamination.size}`,
                    basePrice: option.price,
                    categoryId: laminationCategory.id,
                    stock: DEFAULT_STOCK,
                    minOrderQuantity: 1,
                    specifications: {
                        create: [
                            { key: "Paper Size", value: lamination.size, displayOrder: 0 },
                            { key: "Lamination Type", value: option.type, displayOrder: 1 },
                            { key: "Price", value: `Rs ${option.price}`, displayOrder: 2 },
                        ],
                    },
                    attributes: {
                        create: [
                            { attributeType: "paper_size", attributeValue: lamination.size.toLowerCase() },
                            { attributeType: "lamination_type", attributeValue: option.type.toLowerCase().replace(/\s+/g, "-") },
                        ],
                    },
                    tags: {
                        create: [
                            { tag: "lamination" },
                            { tag: lamination.size.toLowerCase() },
                        ],
                    },
                },
            });
            console.log(`  ✅ Created: ${name}`);
        }
    }

    // Create Binding Products
    console.log("\n📚 Creating binding products...");
    for (const binding of bindingProducts) {
        for (const bindingType of binding.bindings) {
            if (bindingType.type === "Hard Binding") {
                // Hard binding has different structure
                for (const hardBinding of bindingType.prices) {
                    if (isTypeBasedPrice(hardBinding)) {
                        const name = `${binding.size} Hard Binding${hardBinding.type ? ` - ${hardBinding.type}` : ''}`;
                        const slug = await getUniqueSlug(prisma, generateSlug(name));
                        await prisma.product.create({
                            data: {
                                name,
                                slug,
                                description: `Hard binding service for ${binding.size} documents${hardBinding.type ? ` - ${hardBinding.type}` : ''}`,
                                shortDescription: `Hard binding - ${binding.size}${hardBinding.type ? ` (${hardBinding.type})` : ''}`,
                                basePrice: hardBinding.price,
                                categoryId: bindingCategory.id,
                                stock: DEFAULT_STOCK,
                                minOrderQuantity: 1,
                                specifications: {
                                    create: [
                                        { key: "Paper Size", value: binding.size, displayOrder: 0 },
                                        { key: "Binding Type", value: "Hard Binding", displayOrder: 1 },
                                        { key: "Option", value: hardBinding.type || "Standard", displayOrder: 2 },
                                        { key: "Price", value: `Rs ${hardBinding.price}`, displayOrder: 3 },
                                    ],
                                },
                                attributes: {
                                    create: [
                                        { attributeType: "paper_size", attributeValue: binding.size.toLowerCase() },
                                        { attributeType: "binding_type", attributeValue: "hard-binding" },
                                    ],
                                },
                                tags: {
                                    create: [
                                        { tag: "binding" },
                                        { tag: "hard-binding" },
                                        { tag: binding.size.toLowerCase() },
                                    ],
                                },
                            },
                        });
                        console.log(`  ✅ Created: ${name}`);
                    }
                }
            } else {
                // Other binding types (Spiral, Wiro, Glue)
                for (const priceOption of bindingType.prices) {
                    if (isPageBasedPrice(priceOption)) {
                        const name = `${binding.size} ${bindingType.type} ${priceOption.pages}`;
                        const slug = await getUniqueSlug(prisma, generateSlug(name));
                        await prisma.product.create({
                            data: {
                                name,
                                slug,
                                description: `${bindingType.type} service for ${binding.size} documents - ${priceOption.pages}`,
                                shortDescription: `${bindingType.type} - ${priceOption.pages}`,
                                basePrice: priceOption.price,
                                categoryId: bindingCategory.id,
                                stock: DEFAULT_STOCK,
                                minOrderQuantity: 1,
                                specifications: {
                                    create: [
                                        { key: "Paper Size", value: binding.size, displayOrder: 0 },
                                        { key: "Binding Type", value: bindingType.type, displayOrder: 1 },
                                        { key: "Page Range", value: priceOption.pages, displayOrder: 2 },
                                        { key: "Price", value: `Rs ${priceOption.price}`, displayOrder: 3 },
                                    ],
                                },
                                attributes: {
                                    create: [
                                        { attributeType: "paper_size", attributeValue: binding.size.toLowerCase() },
                                        { attributeType: "binding_type", attributeValue: bindingType.type.toLowerCase().replace(/\s+/g, "-") },
                                    ],
                                },
                                tags: {
                                    create: [
                                        { tag: "binding" },
                                        { tag: bindingType.type.toLowerCase().replace(/\s+/g, "-") },
                                        { tag: binding.size.toLowerCase() },
                                    ],
                                },
                            },
                        });
                        console.log(`  ✅ Created: ${name}`);
                    }
                }
            }
        }
    }

    console.log("\n🎉 All printout products seeded successfully!");
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

