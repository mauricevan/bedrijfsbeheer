import React, { useState, useRef } from 'react';
import { parseCSV, CSVColumnMapping, CSVParseResult } from '../../utils/csvParser';

interface CSVUploadProps<T> {
  onDataParsed: (result: CSVParseResult<T>) => void;
  columnMappings: CSVColumnMapping[];
  acceptedExtensions?: string[];
  maxFileSizeMB?: number;
  title?: string;
  description?: string;
  className?: string;
}

/**
 * CSVUpload Component
 * 
 * Herbruikbare component voor het uploaden en parsen van CSV bestanden
 * Met drag-and-drop functionaliteit en validatie
 * 
 * @example
 * <CSVUpload
 *   onDataParsed={handleParsedData}
 *   columnMappings={inventoryMappings}
 *   title="Upload Voorraad CSV"
 * />
 */
export function CSVUpload<T>({
  onDataParsed,
  columnMappings,
  acceptedExtensions = ['.csv'],
  maxFileSizeMB = 10,
  title = 'CSV Bestand Uploaden',
  description = 'Sleep een CSV bestand hierheen of klik om te selecteren',
  className = '',
}: CSVUploadProps<T>) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ==================== FILE HANDLERS ====================

  const handleFileSelect = (file: File) => {
    setUploadError(null);

    // Valideer bestandstype
    const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;
    if (!acceptedExtensions.includes(fileExtension)) {
      setUploadError(
        `Ongeldig bestandstype. Toegestaan: ${acceptedExtensions.join(', ')}`
      );
      return;
    }

    // Valideer bestandsgrootte
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxFileSizeMB) {
      setUploadError(
        `Bestand is te groot (${fileSizeMB.toFixed(2)}MB). Maximum: ${maxFileSizeMB}MB`
      );
      return;
    }

    // Lees en parse bestand
    processFile(file);
  };

  const processFile = async (file: File) => {
    setIsProcessing(true);
    setUploadError(null);

    try {
      const fileContent = await readFileAsText(file);
      const parseResult = parseCSV<T>(fileContent, columnMappings);
      onDataParsed(parseResult);
    } catch (error) {
      setUploadError(
        `Fout bij verwerken van bestand: ${
          error instanceof Error ? error.message : 'Onbekende fout'
        }`
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = () => reject(new Error('Kon bestand niet lezen'));
      reader.readAsText(file, 'UTF-8');
    });
  };

  // ==================== DRAG & DROP ====================

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  // ==================== CLICK UPLOAD ====================

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  // ==================== RENDER ====================

  return (
    <div className={`csv-upload-container ${className}`}>
      {/* Upload Zone */}
      <div
        className={`
          csv-upload-zone
          border-2 border-dashed rounded-lg p-8
          transition-all duration-200 cursor-pointer
          ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'}
          ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-400 hover:bg-blue-50'}
        `}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedExtensions.join(',')}
          onChange={handleFileInputChange}
          className="hidden"
          disabled={isProcessing}
        />

        {/* Icon */}
        <div className="flex flex-col items-center justify-center text-center">
          {isProcessing ? (
            <svg
              className="w-16 h-16 text-blue-500 animate-spin mb-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          ) : (
            <svg
              className="w-16 h-16 text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          )}

          {/* Title */}
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            {isProcessing ? 'Bestand verwerken...' : title}
          </h3>

          {/* Description */}
          <p className="text-sm text-gray-500 mb-4">{description}</p>

          {/* File Info */}
          <div className="text-xs text-gray-400">
            <p>Toegestane bestanden: {acceptedExtensions.join(', ')}</p>
            <p>Maximum grootte: {maxFileSizeMB}MB</p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {uploadError && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start">
            <svg
              className="w-5 h-5 text-red-500 mr-3 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <h4 className="text-sm font-semibold text-red-800">Upload Fout</h4>
              <p className="text-sm text-red-700 mt-1">{uploadError}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
