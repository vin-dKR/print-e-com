"use client";

import { useState, useRef } from "react";
import { Upload, File, AlertTriangle, X } from "lucide-react";

interface ProductDocumentUploadProps {
  onFileSelect: (file: File | null, pageCount?: number) => void;
  acceptedTypes?: string;
  maxSizeMB?: number;
  className?: string;
}

export default function ProductDocumentUpload({
  onFileSelect,
  acceptedTypes = "image/*,.pdf,.doc,.docx",
  maxSizeMB = 10,
  className = "",
}: ProductDocumentUploadProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const countPDFPages = async (file: File): Promise<number> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer;
          const typedArray = new Uint8Array(arrayBuffer);

          // Try to use pdf.js if available (optional dependency)
          // For now, use a simple regex-based approach
          // In production, install pdfjs-dist: npm install pdfjs-dist
          try {
            // Dynamic import to avoid loading in non-PDF cases
            const pdfjsLib = await import('pdfjs-dist');
            pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

            const pdf = await pdfjsLib.getDocument({ data: typedArray }).promise;
            resolve(pdf.numPages);
          } catch (importError) {
            // Fallback: simple regex approach to find page count
            // This is a basic fallback - not 100% accurate but works for most PDFs
            const text = new TextDecoder('utf-8', { fatal: false }).decode(typedArray.slice(0, 50000));

            // Try to find /Count in the document catalog
            const countMatch = text.match(/\/Count\s+(\d+)/);
            if (countMatch && countMatch[1]) {
              resolve(parseInt(countMatch[1], 10));
            } else {
              // Alternative: count page objects
              const pageMatches = text.match(/\/Type\s*\/Page[^s]/g);
              if (pageMatches && pageMatches.length > 0) {
                resolve(pageMatches.length);
              } else {
                reject(new Error('Unable to count PDF pages automatically. Please install pdfjs-dist for accurate counting.'));
              }
            }
          }
        } catch (err) {
          console.error('Error counting PDF pages:', err);
          reject(err);
        }
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setUploadedFile(null);
      setPageCount(null);
      setError(null);
      onFileSelect(null);
      return;
    }

    // Validate file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setError(`File size exceeds ${maxSizeMB}MB limit`);
      setUploadedFile(null);
      setPageCount(null);
      onFileSelect(null);
      return;
    }

    setError(null);
    setUploadedFile(file);

    // If PDF, count pages
    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      setIsProcessing(true);
      try {
        const pages = await countPDFPages(file);
        setPageCount(pages);
        onFileSelect(file, pages);
      } catch (err) {
        console.error('Error processing PDF:', err);
        setError('Failed to process PDF file');
        setPageCount(null);
        onFileSelect(file);
      } finally {
        setIsProcessing(false);
      }
    } else {
      setPageCount(null);
      onFileSelect(file);
    }
  };

  const handleRemove = () => {
    setUploadedFile(null);
    setPageCount(null);
    setError(null);
    onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-900 mb-3">
        Upload Your Document
      </label>

      {!uploadedFile ? (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            id="document-upload"
            accept={acceptedTypes}
            onChange={handleFileChange}
            className="hidden"
          />
          <label
            htmlFor="document-upload"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#CFCFCF] hover:bg-gray-400 text-gray-700 rounded-lg font-medium cursor-pointer transition-colors"
          >
            <Upload size={18} />
            Upload Document
          </label>
          <p className="mt-2 text-xs text-gray-500">
            Supported formats: PDF, DOC, DOCX, Images (Max {maxSizeMB}MB)
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <File size={20} className="text-gray-600 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{uploadedFile.name}</p>
                <p className="text-xs text-gray-500">
                  {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button
              onClick={handleRemove}
              className="p-1 text-gray-400 hover:text-red-600 transition-colors cursor-pointer shrink-0"
            >
              <X size={18} />
            </button>
          </div>

          {isProcessing && (
            <div className="text-sm text-gray-600">Processing PDF...</div>
          )}

          {pageCount !== null && (
            <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertTriangle size={18} className="text-yellow-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-900">
                  PDF detected with {pageCount} page{pageCount !== 1 ? 's' : ''}
                </p>
                <p className="text-xs text-yellow-700 mt-1">
                  The quantity will be calculated based on the number of pages in your PDF.
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertTriangle size={18} className="text-red-600 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

