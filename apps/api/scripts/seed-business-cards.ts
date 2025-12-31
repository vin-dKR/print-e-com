import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import { generateSlug, getUniqueSlug } from "../constants/seed-utils";
import { DEFAULT_STOCK, PAPER_COLORS } from "../constants/seed-constants";
import { BUSINESS_CARD_PRODUCTS, DESIGN_MAKING_CHARGE } from "../constants/seed-data";

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Business Card Products Data
const businessCardProducts = BUSINESS_CARD_PRODUCTS;

// Design Making Charge
const designMakingCharge = DESIGN_MAKING_CHARGE;

async function main() {
    console.log("🌱 Seeding business card products...");

    // Create or get categories
    const businessCardCategory = await prisma.category.upsert({
        where: { slug: "business-card" },
        update: {},
        create: {
            name: "Business Card",
            slug: "business-card",
            description: "Business card printing services with various premium paper types",
        },
    });

    const designServiceCategory = await prisma.category.upsert({
        where: { slug: "design-service" },
        update: {},
        create: {
            name: "Design Service",
            slug: "design-service",
            description: "Design services for printing products",
        },
    });

    console.log("✅ Categories created/updated");

    // Create Business Card Products
    console.log("\n💼 Creating business card products...");
    for (const card of businessCardProducts) {
        // Single Side Business Card
        const singleSideName = `Business Card ${card.paperType} - Single Side`;
        const singleSideSlug = await getUniqueSlug(prisma, generateSlug(singleSideName));
        await prisma.product.create({
            data: {
                name: singleSideName,
                slug: singleSideSlug,
                description: `Business card printing on ${card.paperType} - Single side printing. Minimum order quantity: 100 pieces.`,
                shortDescription: `Business Card - ${card.paperType} (Single Side)`,
                basePrice: card.pricePerPiece,
                categoryId: businessCardCategory.id,
                stock: DEFAULT_STOCK,
                minOrderQuantity: 100,
                specifications: {
                    create: [
                        { key: "Paper Type", value: card.paperType, displayOrder: 0 },
                        { key: "Printing Side", value: "Single Side", displayOrder: 1 },
                        { key: "Price Per Piece", value: `Rs ${card.pricePerPiece}`, displayOrder: 2 },
                        { key: "Minimum Quantity", value: "100 pieces", displayOrder: 3 },
                        { key: "Price for 100 Pieces", value: `Rs ${card.priceSingleSide100}`, displayOrder: 4 },
                    ],
                },
                attributes: {
                    create: [
                        { attributeType: "product_type", attributeValue: "business-card" },
                        { attributeType: "paper_type", attributeValue: card.paperType.toLowerCase().replace(/\s+/g, "-") },
                        { attributeType: "printing_side", attributeValue: "single" },
                    ],
                },
                tags: {
                    create: [
                        { tag: "business-card" },
                        { tag: "single-side" },
                    ],
                },
            },
        });
        console.log(`  ✅ Created: ${singleSideName}`);

        // Both Sides Business Card
        const bothSideName = `Business Card ${card.paperType} - Both Sides`;
        const bothSideSlug = await getUniqueSlug(prisma, generateSlug(bothSideName));
        await prisma.product.create({
            data: {
                name: bothSideName,
                slug: bothSideSlug,
                description: `Business card printing on ${card.paperType} - Both sides printing. Minimum order quantity: 100 pieces.`,
                shortDescription: `Business Card - ${card.paperType} (Both Sides)`,
                basePrice: card.pricePerPiece,
                categoryId: businessCardCategory.id,
                stock: DEFAULT_STOCK,
                minOrderQuantity: 100,
                specifications: {
                    create: [
                        { key: "Paper Type", value: card.paperType, displayOrder: 0 },
                        { key: "Printing Side", value: "Both Sides", displayOrder: 1 },
                        { key: "Price Per Piece", value: `Rs ${card.pricePerPiece}`, displayOrder: 2 },
                        { key: "Minimum Quantity", value: "100 pieces", displayOrder: 3 },
                        { key: "Price for 100 Pieces", value: `Rs ${card.priceBothSide100}`, displayOrder: 4 },
                    ],
                },
                attributes: {
                    create: [
                        { attributeType: "product_type", attributeValue: "business-card" },
                        { attributeType: "paper_type", attributeValue: card.paperType.toLowerCase().replace(/\s+/g, "-") },
                        { attributeType: "printing_side", attributeValue: "both" },
                    ],
                },
                tags: {
                    create: [
                        { tag: "business-card" },
                        { tag: "both-sides" },
                    ],
                },
            },
        });
        console.log(`  ✅ Created: ${bothSideName}`);
    }

    // Create Design Making Charge Product
    console.log("\n🎨 Creating design service product...");
    const designName = "Business Card Design Making";
    const designSlug = await getUniqueSlug(prisma, generateSlug(designName));
    await prisma.product.create({
        data: {
            name: designName,
            slug: designSlug,
            description: "Design making service for business cards. This is a one-time charge for creating custom designs.",
            shortDescription: "Business Card Design Making Service",
            basePrice: designMakingCharge,
            categoryId: designServiceCategory.id,
            stock: 9999,
            minOrderQuantity: 1,
            specifications: {
                create: [
                    { key: "Service Type", value: "Design Making", displayOrder: 0 },
                    { key: "Product Type", value: "Business Card", displayOrder: 1 },
                    { key: "Price", value: `Rs ${designMakingCharge}`, displayOrder: 2 },
                    { key: "Note", value: "One-time charge per design", displayOrder: 3 },
                ],
            },
            attributes: {
                create: [
                    { attributeType: "service_type", attributeValue: "design-making" },
                    { attributeType: "product_type", attributeValue: "business-card" },
                ],
            },
            tags: {
                create: [
                    { tag: "design" },
                    { tag: "business-card" },
                    { tag: "service" },
                ],
            },
        },
    });
    console.log(`  ✅ Created: ${designName}`);

    console.log("\n🎉 All business card products seeded successfully!");
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

