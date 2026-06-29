// src/tools/image/image-rotate/components/InputForm.tsx

'use client';

import { useState } from 'react';
import { FileDropzone } from '@/shared/components/file-dropzone';
import { ToolFormShell } from '@/shared/components/tool-form-shell';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { ToolInputFormProps } from '@/generated/tool-bundles';
import type { ToolInput } from '../manifest';

export default function InputForm({ onRun, loading }: ToolInputFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [angle, setAngle] = useState<ToolInput['angle']>('90');
  const [flip, setFlip] = useState<ToolInput['flip']>('none');

  const canRun = Boolean(file);

  const handleSubmit = () => {
    if (!file) return;
    const input: ToolInput = { file, angle, flip };
    void onRun(input);
  };

  return (
    <ToolFormShell onSubmit={handleSubmit} loading={loading} disabled={!canRun} submitLabel="Rotate image">
      <div className="space-y-2">
        <Label htmlFor="image-rotate-file">Image</Label>
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

      <div className="space-y-2">
        <Label>Rotation angle</Label>
        <RadioGroup
          value={angle}
          onValueChange={(v) => setAngle(v as ToolInput['angle'])}
          className="flex gap-4"
        >
          {(['90', '180', '270'] as const).map((a) => (
            <div key={a} className="flex items-center gap-2">
              <RadioGroupItem id={`angle-${a}`} value={a} />
              <Label htmlFor={`angle-${a}`}>{a}°</Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label htmlFor="image-rotate-flip">Flip</Label>
        <Select value={flip} onValueChange={(v) => setFlip(v as ToolInput['flip'])}>
          <SelectTrigger id="image-rotate-flip">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            <SelectItem value="horizontal">Horizontal</SelectItem>
            <SelectItem value="vertical">Vertical</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </ToolFormShell>
  );
}
