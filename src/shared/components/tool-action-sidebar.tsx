// src/shared/components/tool-action-sidebar.tsx — Sticky action sidebar for tool pages.
// Phase 3 Sprint UI 2.0 — Premium tool experience.

'use client';

import { useState, useCallback } from 'react';
import {
  Copy,
  Check,
  Share2,
  Download,
  RotateCcw,
  Star,
  Clock,
  Info,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import type { ToolManifest } from '@packages/types';

export interface ToolActionSidebarProps {
  manifest: ToolManifest;
  /** Whether the tool has produced output that can be copied/shared/downloaded */
  hasOutput: boolean;
  /** Callback to copy the result */
  onCopyResult?: () => Promise<string | null>;
  /** Callback to download the result */
  onDownload?: () => void;
  /** Callback to reset/modify the input */
  onReset?: () => void;
}

export function ToolActionSidebar({
  manifest,
  hasOutput,
  onCopyResult,
  onDownload,
  onReset,
}: ToolActionSidebarProps) {
  const [copied, setCopied] = useState(false);
  const [favorited, setFavorited] = useState(false);

  const handleCopy = useCallback(async () => {
    if (!onCopyResult) return;
    const text = await onCopyResult();
    if (text) {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        toast.success('Copied to clipboard');
        setTimeout(() => setCopied(false), 2000);
      } catch {
        toast.error('Could not copy to clipboard');
      }
    }
  }, [onCopyResult]);

  const handleShare = useCallback(async () => {
    if (typeof window === 'undefined') return;
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: manifest.title, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success('Link copied to clipboard');
      }
    } catch {
      // user cancelled or clipboard failed
    }
  }, [manifest.title]);

  const handleFavorite = useCallback(() => {
    setFavorited((f) => !f);
    toast.success(favorited ? 'Removed from favorites' : 'Added to favorites');
  }, [favorited]);

  return (
    <div className="sticky top-20 space-y-4">
      {/* Quick actions */}
      <Card>
        <CardContent className="p-4">
          <h3 className="mb-3 text-sm font-semibold">Quick actions</h3>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={copied ? 'default' : 'outline'}
              size="sm"
              onClick={handleCopy}
              disabled={!hasOutput || !onCopyResult}
              className="gap-1.5"
            >
              {copied ? <Check className="h-3.5 w-3.5" aria-hidden /> : <Copy className="h-3.5 w-3.5" aria-hidden />}
              {copied ? 'Copied' : 'Copy'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="gap-1.5"
            >
              <Share2 className="h-3.5 w-3.5" aria-hidden />
              Share
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onDownload}
              disabled={!hasOutput || !onDownload}
              className="gap-1.5"
            >
              <Download className="h-3.5 w-3.5" aria-hidden />
              Save
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onReset}
              disabled={!onReset}
              className="gap-1.5"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden />
              Reset
            </Button>
          </div>

          <Separator className="my-3" />

          <Button
            variant={favorited ? 'default' : 'outline'}
            size="sm"
            onClick={handleFavorite}
            className="w-full gap-1.5"
          >
            <Star className={`h-3.5 w-3.5 ${favorited ? 'fill-current' : ''}`} aria-hidden />
            {favorited ? 'Favorited' : 'Add to favorites'}
          </Button>
        </CardContent>
      </Card>

      {/* Tool info */}
      <Card>
        <CardContent className="space-y-3 p-4">
          <h3 className="flex items-center gap-1.5 text-sm font-semibold">
            <Info className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
            Tool info
          </h3>
          <dl className="space-y-2 text-xs">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Version</dt>
              <dd className="font-mono">{manifest.version}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Lifecycle</dt>
              <dd className="capitalize">{manifest.lifecycle}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Execution</dt>
              <dd className="capitalize">{manifest.execution}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Max input</dt>
              <dd className="font-mono">{(manifest.limits.maxInputSize / 1024 / 1024).toFixed(0)} MB</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Auth</dt>
              <dd>{manifest.limits.requiresAuth ? 'Required' : 'Not required'}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* Trust indicators */}
      <Card className="bg-muted/30">
        <CardContent className="space-y-2 p-4">
          <div className="flex items-center gap-2 text-xs">
            <Zap className="h-3.5 w-3.5 text-accent" aria-hidden />
            <span className="text-muted-foreground">Runs locally in your browser</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <Clock className="h-3.5 w-3.5 text-accent" aria-hidden />
            <span className="text-muted-foreground">No server round-trip</span>
          </div>
        </CardContent>
      </Card>

      {/* Keywords */}
      {manifest.seo.keywords.length > 0 ? (
        <Card>
          <CardContent className="p-4">
            <h3 className="mb-2 text-sm font-semibold">Tags</h3>
            <div className="flex flex-wrap gap-1">
              {manifest.seo.keywords.slice(0, 8).map((kw) => (
                <Badge key={kw} variant="secondary" className="text-xs">
                  {kw}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
