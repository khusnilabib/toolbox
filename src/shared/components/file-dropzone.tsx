// src/shared/components/file-dropzone.tsx — Accessible file upload dropzone.

'use client';

import { useCallback, useRef, useState, type DragEvent } from 'react';
import { UploadCloud } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ACCEPTED_IMAGE_TYPES, MAX_IMAGE_SIZE } from '@/tools/image/_shared/lib/image-utils';

export interface FileDropzoneProps {
  onFiles: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  label?: string;
  hint?: string;
  className?: string;
  disabled?: boolean;
}

export function FileDropzone({
  onFiles,
  accept = ACCEPTED_IMAGE_TYPES.join(','),
  multiple = false,
  maxSize = MAX_IMAGE_SIZE,
  label = 'Drop a file here, or click to browse',
  hint = 'Files are processed locally in your browser.',
  className,
  disabled = false,
}: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList || fileList.length === 0) return;
      const files = Array.from(fileList);
      const tooLarge = files.find((f) => f.size > maxSize);
      if (tooLarge) {
        setError(`File "${tooLarge.name}" exceeds the maximum size of ${maxSize} bytes.`);
        return;
      }
      setError(null);
      onFiles(multiple ? files : [files[0]!]);
    },
    [maxSize, multiple, onFiles],
  );

  const onDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragOver(false);
      if (disabled) return;
      handleFiles(e.dataTransfer.files);
    },
    [disabled, handleFiles],
  );

  return (
    <div className={cn('w-full', className)}>
      <div
        role="button"
        tabIndex={0}
        aria-disabled={disabled}
        aria-label={label}
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-card px-6 py-10 text-center transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          dragOver && 'border-primary bg-muted',
          disabled && 'cursor-not-allowed opacity-60',
        )}
      >
        <UploadCloud className="h-6 w-6 text-muted-foreground" aria-hidden />
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{hint}</p>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="sr-only"
          onChange={(e) => handleFiles(e.target.files)}
          disabled={disabled}
        />
      </div>
      {error ? (
        <p role="alert" className="mt-2 text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
