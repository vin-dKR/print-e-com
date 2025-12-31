import "dotenv/config";
import { exec } from "child_process";
import { promisify } from "util";

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
];

async function runSeedScript(scriptName: string): Promise<void> {
    console.log(`\n${"=".repeat(60)}`);
    console.log(`🚀 Running: ${scriptName}`);
    console.log(`${"=".repeat(60)}\n`);

    try {
        const { stdout, stderr } = await execAsync(`bun run ${scriptName}`, {
            cwd: process.cwd(),
        });

        if (stdout) {
            console.log(stdout);
        }

        if (stderr) {
            console.error(stderr);
        }

        console.log(`\n✅ Completed: ${scriptName}\n`);
    } catch (error: any) {
        console.error(`\n❌ Error running ${scriptName}:`, error.message);
        if (error.stdout) {
            console.error("STDOUT:", error.stdout);
        }
        if (error.stderr) {
            console.error("STDERR:", error.stderr);
        }
        throw error;
    }
}

async function main() {
    console.log("🌱 Starting master seed script...");
    console.log(`📦 Will run ${seedScripts.length} seed scripts\n`);

    const startTime = Date.now();
    let successCount = 0;
    let failCount = 0;

    for (const script of seedScripts) {
        try {
            await runSeedScript(script);
            successCount++;
        } catch (error) {
            failCount++;
            console.error(`\n⚠️  Failed to run ${script}, continuing with next script...\n`);
        }
    }

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log("\n" + "=".repeat(60));
    console.log("📊 Seed Summary");
    console.log("=".repeat(60));
    console.log(`✅ Successful: ${successCount}/${seedScripts.length}`);
    console.log(`❌ Failed: ${failCount}/${seedScripts.length}`);
    console.log(`⏱️  Total Time: ${duration}s`);
    console.log("=".repeat(60));

    if (failCount > 0) {
        console.log("\n⚠️  Some seed scripts failed. Please check the errors above.");
        process.exit(1);
    } else {
        console.log("\n🎉 All seed scripts completed successfully!");
        process.exit(0);
    }
}

main().catch((error) => {
    console.error("❌ Fatal error in master seed script:", error);
    process.exit(1);
});

