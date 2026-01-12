/**
 * Cleanup Script: Delete temporary S3 files older than 7 days
 *
 * This script should be run daily (via cron job or scheduled task)
 * to clean up temporary order files that were never moved to final order folders.
 *
 * Usage:
 *   bun scripts/cleanup-s3-temp-files.ts
 *
 * Environment Variables Required:
 *   - AWS_REGION
 *   - AWS_S3_BUCKET_NAME
 *   - AWS_ACCESS_KEY_ID
 *   - AWS_SECRET_ACCESS_KEY
 *   - AWS_S3_ORDERS_FILE_FOLDER (default: "orders-file")
 */

import { S3Client, ListObjectsV2Command, DeleteObjectsCommand } from "@aws-sdk/client-s3";
import dotenv from "dotenv";

dotenv.config();

const s3Client = new S3Client({
    region: process.env.AWS_REGION || "us-east-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
    },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || "";
const ORDERS_FILE_FOLDER = process.env.AWS_S3_ORDERS_FILE_FOLDER || "orders-file";
const TEMP_FOLDER_PREFIX = `${ORDERS_FILE_FOLDER}/`;
const DAYS_TO_KEEP = 7; // Delete files older than 7 days
const BATCH_SIZE = 1000; // S3 delete limit per request

if (!BUCKET_NAME) {
    console.error("❌ AWS_S3_BUCKET_NAME environment variable is required");
    process.exit(1);
}

/**
 * Get all temporary files from S3
 */
async function listTempFiles(): Promise<Array<{ key: string; lastModified: Date }>> {
    const tempFiles: Array<{ key: string; lastModified: Date }> = [];
    let continuationToken: string | undefined;

    do {
        const command = new ListObjectsV2Command({
            Bucket: BUCKET_NAME,
            Prefix: TEMP_FOLDER_PREFIX,
            ContinuationToken: continuationToken,
        });

        const response = await s3Client.send(command);

        if (response.Contents) {
            for (const object of response.Contents) {
                // Include all files in orders-file folder
                if (object.Key && object.LastModified) {
                    tempFiles.push({
                        key: object.Key,
                        lastModified: object.LastModified,
                    });
                }
            }
        }

        continuationToken = response.NextContinuationToken;
    } while (continuationToken);

    return tempFiles;
}

/**
 * Filter files older than the threshold
 */
function filterOldFiles(
    files: Array<{ key: string; lastModified: Date }>,
    daysOld: number
): Array<string> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    return files
        .filter((file) => file.lastModified < cutoffDate)
        .map((file) => file.key);
}

/**
 * Delete files from S3 in batches
 */
async function deleteFiles(keys: string[]): Promise<number> {
    if (keys.length === 0) {
        return 0;
    }

    let deletedCount = 0;

    // Process in batches
    for (let i = 0; i < keys.length; i += BATCH_SIZE) {
        const batch = keys.slice(i, i + BATCH_SIZE);

        const command = new DeleteObjectsCommand({
            Bucket: BUCKET_NAME,
            Delete: {
                Objects: batch.map((key) => ({ Key: key })),
                Quiet: false,
            },
        });

        try {
            const response = await s3Client.send(command);
            if (response.Deleted) {
                deletedCount += response.Deleted.length;
                console.log(`✅ Deleted ${response.Deleted.length} files (batch ${Math.floor(i / BATCH_SIZE) + 1})`);
            }
            if (response.Errors && response.Errors.length > 0) {
                console.error("❌ Errors deleting some files:", response.Errors);
            }
        } catch (error) {
            console.error(`❌ Error deleting batch starting at index ${i}:`, error);
        }
    }

    return deletedCount;
}

/**
 * Main cleanup function
 */
async function cleanupTempFiles() {
    console.log("🧹 Starting S3 order file cleanup...");
    console.log(`📅 Deleting files older than ${DAYS_TO_KEEP} days`);
    console.log(`📁 Scanning folder: ${TEMP_FOLDER_PREFIX}`);
    console.log("");

    try {
        // List all temp files
        console.log("📋 Listing temporary files...");
        const allTempFiles = await listTempFiles();
        console.log(`   Found ${allTempFiles.length} temporary files`);

        // Filter old files
        const oldFiles = filterOldFiles(allTempFiles, DAYS_TO_KEEP);
        console.log(`   Found ${oldFiles.length} files older than ${DAYS_TO_KEEP} days`);

        if (oldFiles.length === 0) {
            console.log("✅ No files to delete");
            return;
        }

        // Delete old files
        console.log("");
        console.log("🗑️  Deleting old files...");
        const deletedCount = await deleteFiles(oldFiles);

        console.log("");
        console.log("✅ Cleanup completed!");
        console.log(`   Deleted: ${deletedCount} files`);
        console.log(`   Remaining: ${allTempFiles.length - deletedCount} files`);
    } catch (error) {
        console.error("❌ Cleanup failed:", error);
        process.exit(1);
    }
}

// Run cleanup if script is executed directly
if (import.meta.main) {
    cleanupTempFiles()
        .then(() => {
            console.log("");
            console.log("✨ Script completed successfully");
            process.exit(0);
        })
        .catch((error) => {
            console.error("❌ Script failed:", error);
            process.exit(1);
        });
}

export { cleanupTempFiles };

