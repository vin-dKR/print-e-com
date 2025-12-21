/**
 * Script to populate nullable fields added in migration
 * Run this after running db:push or db:migrate
 * 
 * Usage: bun prisma/populate-migration-fields.ts
 */

import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

/**
 * Generate slug from product name
 */
function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
        .substring(0, 100); // Limit length
}

async function populateFields() {
    console.log("🔄 Populating migration fields...");

    try {
        // 1. Populate product slugs
        const productsWithoutSlug = await prisma.product.findMany({
            where: { slug: null },
        });

        console.log(`📦 Found ${productsWithoutSlug.length} products without slugs`);

        for (const product of productsWithoutSlug) {
            const slug = generateSlug(product.name);
            let uniqueSlug = slug;
            let counter = 1;

            // Ensure slug is unique
            while (await prisma.product.findUnique({ where: { slug: uniqueSlug } })) {
                uniqueSlug = `${slug}-${counter}`;
                counter++;
            }

            await prisma.product.update({
                where: { id: product.id },
                data: { slug: uniqueSlug },
            });

            console.log(`✅ Updated product "${product.name}" with slug: ${uniqueSlug}`);
        }

        // 2. Populate order subtotals (set to total for existing orders)
        const ordersWithoutSubtotal = await prisma.order.findMany({
            where: { subtotal: null },
        });

        console.log(`📋 Found ${ordersWithoutSubtotal.length} orders without subtotals`);

        for (const order of ordersWithoutSubtotal) {
            await prisma.order.update({
                where: { id: order.id },
                data: { subtotal: order.total }, // Set subtotal = total for existing orders
            });

            console.log(`✅ Updated order ${order.id} with subtotal: ${order.total}`);
        }

        console.log("🎉 Migration field population completed!");
    } catch (error) {
        console.error("❌ Error populating fields:", error);
        throw error;
    }
}

populateFields()
    .catch((e) => {
        console.error("❌ Script failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });

