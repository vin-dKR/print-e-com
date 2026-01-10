"use client";

import { useState, useRef } from "react";
import { Upload, File, AlertTriangle, X, Image as ImageIcon, FileText } from "lucide-react";

export interface FileDetail {
    file: File;
    type: 'image' | 'pdf';
    pageCount: number;
    id: string;
}

interface ProductDocumentUploadProps {
    onFileSelect: (files: File[], totalQuantity: number) => void;
    onQuantityChange?: (quantity: number) => void;
    acceptedTypes?: string;
    maxSizeMB?: number;
    maxFiles?: number;
    className?: string;
}

export default function ProductDocumentUpload({
    onFileSelect,
    onQuantityChange,
    acceptedTypes = "image/*,.pdf",
    maxSizeMB = 50,
    maxFiles,
    className = "",
}: ProductDocumentUploadProps) {
    const [uploadedFiles, setUploadedFiles] = useState<FileDetail[]>([]);
    const [totalQuantity, setTotalQuantity] = useState<number>(0);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Valid image types
    const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    const validPDFType = 'application/pdf';

    const isValidFileType = (file: File): boolean => {
        const isValidImage = validImageTypes.includes(file.type);
        const isValidPDF = file.type === validPDFType || file.name.toLowerCase().endsWith('.pdf');
        return isValidImage || isValidPDF;
    };

    const validateFileSize = (file: File, maxSizeMB: number): boolean => {
        const maxSizeBytes = maxSizeMB * 1024 * 1024;
        return file.size <= maxSizeBytes;
    };

    const countPDFPages = async (file: File): Promise<number> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const arrayBuffer = e.target?.result as ArrayBuffer;

                    try {
                        // Use pdfjs-dist for accurate page counting
                        const pdfjsLib = await import('pdfjs-dist');

                        // Set worker source - use CDN with proper protocol
                        if (typeof window !== 'undefined') {
                            pdfjsLib.GlobalWorkerOptions.workerSrc =
                                `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
                        } else {
                            pdfjsLib.GlobalWorkerOptions.workerSrc =
                                `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
                        }

                        const pdf = await pdfjsLib.getDocument({
                            data: arrayBuffer,
                            useWorkerFetch: false,
                            isEvalSupported: false,
                        }).promise;

                        const pageCount = pdf.numPages;
                        console.log(`PDF ${file.name} has ${pageCount} pages`);
                        resolve(pageCount);
                    } catch (pdfError) {
                        console.error('PDF.js error:', pdfError);
                        // Fallback: try regex approach
                        try {
                            const typedArray = new Uint8Array(arrayBuffer);
                            const text = new TextDecoder('utf-8', { fatal: false }).decode(typedArray.slice(0, 100000));

                            // Try to find page count in PDF structure
                            const countMatch = text.match(/\/Count\s+(\d+)/);
                            if (countMatch && countMatch[1]) {
                                const count = parseInt(countMatch[1], 10);
                                console.log(`PDF ${file.name} page count (regex): ${count}`);
                                resolve(count);
                                return;
                            }

                            // Alternative: count page objects
                            const pageMatches = text.match(/\/Type\s*\/Page[^s]/g);
                            if (pageMatches && pageMatches.length > 0) {
                                const count = pageMatches.length;
                                console.log(`PDF ${file.name} page count (object count): ${count}`);
                                resolve(count);
                                return;
                            }

                            reject(new Error('Unable to count PDF pages. Please check the PDF file is valid.'));
                        } catch (regexError) {
                            reject(new Error(`Failed to process PDF: ${pdfError instanceof Error ? pdfError.message : 'Unknown error'}`));
                        }
                    }
                } catch (err) {
                    console.error('Error counting PDF pages:', err);
                    reject(err instanceof Error ? err : new Error('Failed to read PDF file'));
                }
            };
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsArrayBuffer(file);
        });
    };

    const processFiles = async (files: File[]): Promise<{
        totalQuantity: number;
        fileDetails: FileDetail[];
    }> => {
        const fileDetails: FileDetail[] = [];
        let totalQuantity = 0;

        for (const file of files) {
            // Validate file type
            if (!isValidFileType(file)) {
                throw new Error(`Invalid file type: ${file.name}. Only images (JPG, PNG, WebP, GIF) and PDFs are allowed.`);
            }

            // Validate file size
            const maxSize = file.type.startsWith('image/') ? 10 : 50; // Images: 10MB, PDFs: 50MB
            if (!validateFileSize(file, maxSize)) {
                throw new Error(`File ${file.name} exceeds ${maxSize}MB size limit.`);
            }

            // Determine file type
            const isImage = validImageTypes.includes(file.type);
            const isPDF = file.type === validPDFType || file.name.toLowerCase().endsWith('.pdf');

            if (isImage) {
                // Image = 1 page
                fileDetails.push({
                    file,
                    type: 'image',
                    pageCount: 1,
                    id: `${Date.now()}-${Math.random()}`,
                });
                totalQuantity += 1;
            } else if (isPDF) {
                // Extract PDF page count
                try {
                    const pageCount = await countPDFPages(file);
                    fileDetails.push({
                        file,
                        type: 'pdf',
                        pageCount,
                        id: `${Date.now()}-${Math.random()}`,
                    });
                    totalQuantity += pageCount;
                } catch (err) {
                    throw new Error(`Failed to process PDF ${file.name}. Please try again.`);
                }
            }
        }

        return { totalQuantity, fileDetails };
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) {
            return;
        }

        // Check max files limit
        if (maxFiles && files.length > maxFiles) {
            setError(`Maximum ${maxFiles} files allowed`);
            return;
        }

        setError(null);
        setIsProcessing(true);

        try {
            // Process files locally (NO S3 upload yet - files stored in memory only)
            const { totalQuantity: newTotalQuantity, fileDetails: newFileDetails } = await processFiles(files);

            // Combine with existing files
            const allFileDetails = [...uploadedFiles, ...newFileDetails];
            const allFiles = allFileDetails.map(fd => fd.file);
            const finalTotalQuantity = allFileDetails.reduce((sum, fd) => sum + fd.pageCount, 0);

            setUploadedFiles(allFileDetails);
            setTotalQuantity(finalTotalQuantity);

            // Call callbacks - files are NOT uploaded to S3 yet
            // They will be uploaded only after order confirmation
            onFileSelect(allFiles, finalTotalQuantity);
            if (onQuantityChange) {
                onQuantityChange(finalTotalQuantity);
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to process files';
            setError(errorMessage);
        } finally {
            setIsProcessing(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleRemove = (fileId: string) => {
        const updatedFiles = uploadedFiles.filter(fd => fd.id !== fileId);
        const updatedQuantity = updatedFiles.reduce((sum, fd) => sum + fd.pageCount, 0);

        setUploadedFiles(updatedFiles);
        setTotalQuantity(updatedQuantity);

        const files = updatedFiles.map(fd => fd.file);
        onFileSelect(files, updatedQuantity);
        if (onQuantityChange) {
            onQuantityChange(updatedQuantity);
        }
    };

    const imageCount = uploadedFiles.filter(f => f.type === 'image').length;
    const pdfCount = uploadedFiles.filter(f => f.type === 'pdf').length;
    const pdfPageCount = uploadedFiles
        .filter(f => f.type === 'pdf')
        .reduce((sum, f) => sum + f.pageCount, 0);

    return (
        <div className={className}>
            <label className="block text-sm font-medium text-gray-900 mb-3">
                Upload Your Documents
            </label>

            <div className="space-y-4">
                {/* File Input */}
                <div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        id="document-upload"
                        accept={acceptedTypes}
                        onChange={handleFileChange}
                        multiple
                        className="hidden"
                        disabled={isProcessing}
                    />
                    <label
                        htmlFor="document-upload"
                        className={`inline-flex items-center gap-2 px-6 py-3 bg-[#CFCFCF] hover:bg-gray-400 text-gray-700 rounded-lg font-medium cursor-pointer transition-colors ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                    >
                        <Upload size={18} />
                        {isProcessing ? 'Processing...' : 'Upload Documents'}
                    </label>
                    <p className="mt-2 text-xs text-gray-500">
                        Supported formats: Images (JPG, PNG, WebP, GIF - Max 10MB) and PDFs (Max 50MB)
                        {maxFiles && ` • Max ${maxFiles} files`}
                    </p>
                </div>

                {/* Error Display */}
                {error && (
                    <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <AlertTriangle size={18} className="text-red-600 shrink-0 mt-0.5" />
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                )}

                {/* File List */}
                {uploadedFiles.length > 0 && (
                    <div className="space-y-3">
                        <div className="space-y-2">
                            {uploadedFiles.map((fileDetail) => (
                                <div
                                    key={fileDetail.id}
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                                >
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        {fileDetail.type === 'image' ? (
                                            <ImageIcon size={20} className="text-blue-600 shrink-0" />
                                        ) : (
                                            <FileText size={20} className="text-red-600 shrink-0" />
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                {fileDetail.file.name}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {(fileDetail.file.size / 1024 / 1024).toFixed(2)} MB •{' '}
                                                {fileDetail.type === 'pdf'
                                                    ? `${fileDetail.pageCount} page${fileDetail.pageCount !== 1 ? 's' : ''}`
                                                    : '1 page'}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleRemove(fileDetail.id)}
                                        className="p-1 text-gray-400 hover:text-red-600 transition-colors cursor-pointer shrink-0"
                                        type="button"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Total Quantity Display */}
                        {totalQuantity > 0 && (
                            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-sm font-semibold text-blue-900">Total Quantity</p>
                                    <p className="text-lg font-bold text-blue-900">{totalQuantity}</p>
                                </div>
                                <div className="text-xs text-blue-700">
                                    {imageCount > 0 && (
                                        <span>
                                            {imageCount} image{imageCount !== 1 ? 's' : ''} ({imageCount} page{imageCount !== 1 ? 's' : ''})
                                        </span>
                                    )}
                                    {imageCount > 0 && pdfCount > 0 && ' + '}
                                    {pdfCount > 0 && (
                                        <span>
                                            {pdfCount} PDF{pdfCount !== 1 ? 's' : ''} ({pdfPageCount} page{pdfPageCount !== 1 ? 's' : ''})
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Processing Indicator */}
                {isProcessing && uploadedFiles.length === 0 && (
                    <div className="text-sm text-gray-600 flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                        Processing files...
                    </div>
                )}
            </div>
        </div>
    );
}
