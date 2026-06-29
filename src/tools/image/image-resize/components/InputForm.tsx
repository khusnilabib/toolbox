// src/tools/image/image-resize/components/InputForm.tsx

'use client';

import { useState } from 'react';
import { FileDropzone } from '@/shared/components/file-dropzone';
import { ToolFormShell } from '@/shared/components/tool-form-shell';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { ToolInputFormProps } from '@/generated/tool-bundles';
import type { ToolInput } from '../manifest';

type Mode = 'dimensions' | 'scale';

export default function InputForm({ onRun, loading }: ToolInputFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<Mode>('dimensions');
  const [width, setWidth] = useState<number | ''>('');
  const [height, setHeight] = useState<number | ''>('');
  const [scale, setScale] = useState<number>(50);
  const [maintainAspect, setMaintainAspect] = useState(true);

  const canRun = Boolean(file) && (mode === 'dimensions' ? Boolean(width || height) : true);

  const handleSubmit = () => {
    if (!file) return;
    const input: ToolInput = {
      file,
      maintainAspect,
      ...(mode === 'dimensions'
        ? {
            width: width === '' ? undefined : Number(width),
            height: height === '' ? undefined : Number(height),
          }
        : { scale }),
    };
    void onRun(input);
  };

  return (
    <ToolFormShell onSubmit={handleSubmit} loading={loading} disabled={!canRun} submitLabel="Resize image">
      <div className="space-y-2">
        <Label htmlFor="image-resize-file">Image</Label>
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
        <Label>Resize mode</Label>
        <Select value={mode} onValueChange={(v) => setMode(v as Mode)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="dimensions">Exact dimensions</SelectItem>
            <SelectItem value="scale">Percentage scale</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {mode === 'dimensions' ? (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="image-resize-width">Width (px)</Label>
            <Input
              id="image-resize-width"
              type="number"
              min={1}
              max={20000}
              value={width}
              onChange={(e) => setWidth(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="e.g. 800"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="image-resize-height">Height (px)</Label>
            <Input
              id="image-resize-height"
              type="number"
              min={1}
              max={20000}
              value={height}
              onChange={(e) => setHeight(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="e.g. 600"
            />
          </div>
          <div className="col-span-2 flex items-center gap-2">
            <Switch
              id="image-resize-aspect"
              checked={maintainAspect}
              onCheckedChange={setMaintainAspect}
            />
            <Label htmlFor="image-resize-aspect">Maintain aspect ratio</Label>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <Label htmlFor="image-resize-scale">Scale (%)</Label>
          <Input
            id="image-resize-scale"
            type="number"
            min={1}
            max={100}
            value={scale}
            onChange={(e) => setScale(Number(e.target.value))}
          />
        </div>
      )}
    </ToolFormShell>
  );
}
