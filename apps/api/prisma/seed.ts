import "dotenv/config";
import bcrypt from "bcryptjs";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

type Category = Awaited<ReturnType<typeof prisma.category.upsert>>;

async function main() {
    console.log("🌱 Seeding database...");

    // Create admin user
    const hashedPassword = await bcrypt.hash("admin123", 10);
    const admin = await prisma.admin.upsert({
        where: { username: "admin" },
        update: {},
        create: {
            username: "admin",
            email: "admin@example.com",
            password: hashedPassword,
            name: "Admin User",
            isActive: true,
        },
    });
    console.log("✅ Created admin user:", admin.username);

    // Create categories
    const categories = [
        { name: "T-Shirt", slug: "t-shirt", description: "Custom printed t-shirts" },
        { name: "Mug", slug: "mug", description: "Custom printed mugs" },
        { name: "Hoodie", slug: "hoodie", description: "Custom printed hoodies" },
        { name: "Poster", slug: "poster", description: "Custom printed posters" },
        { name: "Sticker", slug: "sticker", description: "Custom printed stickers" },
    ];

    const createdCategories: Category[] = [];
    for (const cat of categories) {
        const category = await prisma.category.upsert({
            where: { slug: cat.slug },
            update: {},
            create: cat,
        });
        createdCategories.push(category);
        console.log(`✅ Created category: ${category.name}`);
    }

    // Create sample products
    const tshirtCategory = createdCategories.find((c) => c.slug === "t-shirt");
    const mugCategory = createdCategories.find((c) => c.slug === "mug");

    if (tshirtCategory) {
        const tshirt = await prisma.product.create({
            data: {
                name: "Premium Cotton T-Shirt",
                description: "High-quality 100% cotton t-shirt with custom printing",
                basePrice: 599,
                categoryId: tshirtCategory.id,
                images: ["https://via.placeholder.com/400x400?text=T-Shirt"],
                isActive: true,
                variants: {
                    create: [
                        { name: "Small", priceModifier: 0, available: true },
                        { name: "Medium", priceModifier: 0, available: true },
                        { name: "Large", priceModifier: 50, available: true },
                        { name: "XL", priceModifier: 100, available: true },
                    ],
                },
            },
        });
        console.log(`✅ Created product: ${tshirt.name}`);
    }

    if (mugCategory) {
        const mug = await prisma.product.create({
            data: {
                name: "Ceramic Coffee Mug",
                description: "11oz ceramic mug with custom design printing",
                basePrice: 299,
                categoryId: mugCategory.id,
                images: ["https://via.placeholder.com/400x400?text=Mug"],
                isActive: true,
                variants: {
                    create: [
                        { name: "White", priceModifier: 0, available: true },
                        { name: "Black", priceModifier: 20, available: true },
                        { name: "Red", priceModifier: 20, available: true },
                    ],
                },
            },
        });
        console.log(`✅ Created product: ${mug.name}`);
    }

    console.log("🎉 Seeding completed!");
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

