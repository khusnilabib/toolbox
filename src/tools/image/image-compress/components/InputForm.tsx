// src/tools/image/image-compress/components/InputForm.tsx

'use client';

import { useState } from 'react';
import { FileDropzone } from '@/shared/components/file-dropzone';
import { ToolFormShell } from '@/shared/components/tool-form-shell';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { ToolInputFormProps } from '@/generated/tool-bundles';
import type { ToolInput } from '../manifest';

export default function InputForm({ onRun, loading }: ToolInputFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [quality, setQuality] = useState(75);
  const [outputFormat, setOutputFormat] = useState<ToolInput['outputFormat']>('original');

  const canRun = Boolean(file);

  const handleSubmit = () => {
    if (!file) return;
    const input: ToolInput = { file, quality, outputFormat };
    void onRun(input);
  };

  return (
    <ToolFormShell onSubmit={handleSubmit} loading={loading} disabled={!canRun} submitLabel="Compress image">
      <div className="space-y-2">
        <Label htmlFor="image-compress-file">Image</Label>
        <FileDropzone
          accept="image/*"
          label="Drop an image or click to browse"
          hint="PNG, JPG, WebP, GIF, BMP — up to 25 MB."
          onFiles={(files) => setFile(files[0] ?? null)}
        />
        {file ? (
          <p className="text-xs text-muted-foreground">
            Selected: <span className="font-mono">{file.name}</span> ({(file.size / 1024).toFixed(1)} KB)
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="image-compress-format">Output format</Label>
        <Select value={outputFormat} onValueChange={(v) => setOutputFormat(v as ToolInput['outputFormat'])}>
          <SelectTrigger id="image-compress-format">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="original">Keep original</SelectItem>
            <SelectItem value="image/jpeg">JPEG</SelectItem>
            <SelectItem value="image/webp">WebP</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="image-compress-quality">Quality</Label>
          <span className="text-xs font-mono text-muted-foreground">{quality}%</span>
        </div>
        <Slider
          id="image-compress-quality"
          min={1}
          max={100}
          step={1}
          value={[quality]}
          onValueChange={([v]) => setQuality(v ?? 75)}
        />
        <Input
          type="number"
          min={1}
          max={100}
          value={quality}
          onChange={(e) => setQuality(Number(e.target.value))}
          aria-label="Quality percentage"
        />
      </div>
    </ToolFormShell>
  );
}
