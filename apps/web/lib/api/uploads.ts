/**
 * Uploads API functions
 */

import { uploadFile, ApiResponse } from '../api-client';

export interface UploadFileResult {
    key: string; // S3 key (path)
    url: string; // Presigned URL
    filename: string;
    size: number;
    mimetype: string;
}

export interface UploadFilesResponse {
    files: UploadFileResult[];
    sessionId?: string;
}

/**
 * Upload files to S3 (temporary location for cart)
 * Returns S3 keys that can be stored in cart items
 */
export async function uploadOrderFilesToS3(
    files: File[]
): Promise<ApiResponse<UploadFilesResponse>> {
    return uploadFile<UploadFilesResponse>(
        '/upload/order-files',
        files
    );
}

