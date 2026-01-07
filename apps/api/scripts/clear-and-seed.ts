import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function clearAllData() {
    console.log("🗑️  Clearing all data from database...\n");

    try {
        // Delete in order to respect foreign key constraints
        console.log("  📝 Deleting reviews...");
        await prisma.review.deleteMany({});
        console.log("  ✅ Reviews deleted");

        console.log("  📝 Deleting review helpful votes...");
        await prisma.reviewHelpfulVote.deleteMany({});
        console.log("  ✅ Review helpful votes deleted");

        console.log("  📝 Deleting recently viewed products...");
        await prisma.recentlyViewedProduct.deleteMany({});
        console.log("  ✅ Recently viewed products deleted");

        console.log("  📝 Deleting offer products...");
        await prisma.offerProduct.deleteMany({});
        console.log("  ✅ Offer products deleted");

        console.log("  📝 Deleting wishlist items...");
        await prisma.wishlistItem.deleteMany({});
        console.log("  ✅ Wishlist items deleted");

        console.log("  📝 Deleting cart items...");
        await prisma.cartItem.deleteMany({});
        console.log("  ✅ Cart items deleted");

        console.log("  📝 Deleting carts...");
        await prisma.cart.deleteMany({});
        console.log("  ✅ Carts deleted");

        console.log("  📝 Deleting order items...");
        await prisma.orderItem.deleteMany({});
        console.log("  ✅ Order items deleted");

        console.log("  📝 Deleting order status history...");
        await prisma.orderStatusHistory.deleteMany({});
        console.log("  ✅ Order status history deleted");

        console.log("  📝 Deleting payments...");
        await prisma.payment.deleteMany({});
        console.log("  ✅ Payments deleted");

        console.log("  📝 Deleting orders...");
        await prisma.order.deleteMany({});
        console.log("  ✅ Orders deleted");

        console.log("  📝 Deleting coupon usages...");
        await prisma.couponUsage.deleteMany({});
        console.log("  ✅ Coupon usages deleted");

        console.log("  📝 Deleting product tags...");
        await prisma.productTag.deleteMany({});
        console.log("  ✅ Product tags deleted");

        console.log("  📝 Deleting product attributes...");
        await prisma.productAttribute.deleteMany({});
        console.log("  ✅ Product attributes deleted");

        console.log("  📝 Deleting product specifications...");
        await prisma.productSpecification.deleteMany({});
        console.log("  ✅ Product specifications deleted");

        console.log("  📝 Deleting product images...");
        await prisma.productImage.deleteMany({});
        console.log("  ✅ Product images deleted");

        console.log("  📝 Deleting product variants...");
        await prisma.productVariant.deleteMany({});
        console.log("  ✅ Product variants deleted");

        console.log("  📝 Deleting products...");
        await prisma.product.deleteMany({});
        console.log("  ✅ Products deleted");

        console.log("  📝 Deleting addresses...");
        await prisma.address.deleteMany({});
        console.log("  ✅ Addresses deleted");

        console.log("  📝 Deleting users (except admins)...");
        await prisma.user.deleteMany({
            where: {
                isAdmin: false,
                isSuperAdmin: false,
            },
        });
        console.log("  ✅ Non-admin users deleted");

        console.log("  📝 Deleting coupons...");
        await prisma.coupon.deleteMany({});
        console.log("  ✅ Coupons deleted");

        console.log("  📝 Deleting offers...");
        await prisma.offer.deleteMany({});
        console.log("  ✅ Offers deleted");

        console.log("  📝 Deleting categories...");
        await prisma.category.deleteMany({});
        console.log("  ✅ Categories deleted");

        console.log("\n✅ All data cleared successfully!\n");
    } catch (error) {
        console.error("❌ Error clearing data:", error);
        throw error;
    }
}

async function runSeedScripts() {
    const { exec } = await import("child_process");
    const { promisify } = await import("util");
    const execAsync = promisify(exec);

    const seedScripts = [
        "seed:printouts",
        "seed:books",
        "seed:photos",
        "seed:business-cards",
        "seed:letter-heads",
        "seed:bill-books",
        "seed:pamphlets-brochures",
        "seed:maps",
        "seed:reviews",
    ];

    console.log("🌱 Running all seed scripts...\n");

    for (const script of seedScripts) {
        console.log(`\n${"=".repeat(60)}`);
        console.log(`🚀 Running: ${script}`);
        console.log(`${"=".repeat(60)}\n`);

        try {
            const { stdout, stderr } = await execAsync(`bun run ${script}`, {
                cwd: process.cwd(),
            });

            if (stdout) {
                console.log(stdout);
            }

            if (stderr) {
                console.error(stderr);
            }

            console.log(`\n✅ Completed: ${script}\n`);
        } catch (error: any) {
            console.error(`\n❌ Error running ${script}:`, error.message);
            if (error.stdout) {
                console.error("STDOUT:", error.stdout);
            }
            if (error.stderr) {
                console.error("STDERR:", error.stderr);
            }
            throw error;
        }
    }
}

async function main() {
    console.log("=".repeat(60));
    console.log("🔄 CLEAR DATA AND RESEED");
    console.log("=".repeat(60));
    console.log("\n⚠️  WARNING: This will delete ALL data from the database!");
    console.log("   (Database structure will be preserved)");
    console.log("   Press Ctrl+C within 5 seconds to cancel...\n");

    // Wait 5 seconds
    await new Promise((resolve) => setTimeout(resolve, 5000));

    const startTime = Date.now();

    try {
        // Step 1: Clear all data
        await clearAllData();

        // Step 2: Run all seed scripts
        await runSeedScripts();

        const endTime = Date.now();
        const duration = ((endTime - startTime) / 1000).toFixed(2);

        console.log("\n" + "=".repeat(60));
        console.log("🎉 DATA CLEARED AND RESEEDED COMPLETED!");
        console.log("=".repeat(60));
        console.log(`⏱️  Total Time: ${duration}s`);
        console.log("=".repeat(60));
        console.log("\n✅ All data has been cleared and reseeded successfully!");
    } catch (error) {
        console.error("\n❌ Fatal error:", error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
        await pool.end();
    }
}

main().catch((error) => {
    console.error("❌ Fatal error in clear script:", error);
    process.exit(1);
});

