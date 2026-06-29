// src/tools/image/image-crop/components/InputForm.tsx

'use client';

import { useState } from 'react';
import { FileDropzone } from '@/shared/components/file-dropzone';
import { ToolFormShell } from '@/shared/components/tool-form-shell';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { ToolInputFormProps } from '@/generated/tool-bundles';
import type { ToolInput } from '../manifest';

export default function InputForm({ onRun, loading }: ToolInputFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const [width, setWidth] = useState(100);
  const [height, setHeight] = useState(100);

  const canRun = Boolean(file) && width > 0 && height > 0;

  const handleSubmit = () => {
    if (!file) return;
    const input: ToolInput = { file, x, y, width, height };
    void onRun(input);
  };

  return (
    <ToolFormShell onSubmit={handleSubmit} loading={loading} disabled={!canRun} submitLabel="Crop image">
      <div className="space-y-2">
        <Label htmlFor="image-crop-file">Image</Label>
        <FileDropzone
          accept="image/*"
          label="Drop an image or click to browse"
          hint="PNG, JPG, WebP, GIF, BMP — up to 25 MB."
          onFiles={(files) => setFile(files[0] ?? null)}
        />
        {file ? (
          <p className="text-xs text-muted-foreground">
            Selected: <span className="font-mono">{file.name}</span>
          </p>
        ) : null}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="image-crop-x">X (px)</Label>
          <Input
            id="image-crop-x"
            type="number"
            min={0}
            value={x}
            onChange={(e) => setX(Number(e.target.value))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="image-crop-y">Y (px)</Label>
          <Input
            id="image-crop-y"
            type="number"
            min={0}
            value={y}
            onChange={(e) => setY(Number(e.target.value))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="image-crop-w">Width (px)</Label>
          <Input
            id="image-crop-w"
            type="number"
            min={1}
            max={20000}
            value={width}
            onChange={(e) => setWidth(Number(e.target.value))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="image-crop-h">Height (px)</Label>
          <Input
            id="image-crop-h"
            type="number"
            min={1}
            max={20000}
            value={height}
            onChange={(e) => setHeight(Number(e.target.value))}
          />
        </div>
      </div>
    </ToolFormShell>
  );
}
