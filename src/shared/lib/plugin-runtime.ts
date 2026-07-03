import type { ToolManifest, PluginExtension } from '@packages/types';

/**
 * Plugin Runtime Preparation — Per P14, DGA-10, ADR-073.
 * Interfaces only. No marketplace implementation.
 * Extension points for future plugin support.
 */

// ═══ Plugin Interfaces ═══

export interface PluginManifest extends ToolManifest {
  plugin: PluginExtension;
}

export interface PluginContext {
  platformVersion: string;
  apiVersion: string;
  signal: AbortSignal;
  log: (level: 'info' | 'warn' | 'error', message: string) => void;
}

export interface PluginLifecycle {
  onLoad?(context: PluginContext): Promise<void>;
  onUnload?(): Promise<void>;
}

export interface PluginPermission {
  resource: string;
  action: 'read' | 'write' | 'execute';
}

export interface PluginSandbox {
  evaluate(code: string, context: PluginContext): Promise<unknown>;
  isAllowed(permission: PluginPermission): boolean;
}

// ═══ Plugin Registry (future) ═══

export interface PluginRegistry {
  register(manifest: PluginManifest): void;
  unregister(slug: string): void;
  getAll(): PluginManifest[];
  getByPublisher(publisher: string): PluginManifest[];
  verify(manifest: PluginManifest): boolean;
}

// ═══ Plugin Extension Points (future) ═══

export interface PluginExtensionPoints {
  /** Custom tool stages provided by plugin */
  stages?: Record<string, unknown>;
  /** Custom UI components provided by plugin */
  components?: Record<string, React.ComponentType>;
  /** Custom analytics adapters */
  analyticsAdapters?: unknown[];
  /** Custom search adapters */
  searchAdapters?: unknown[];
}

// ═══ Plugin Verification (interface only) ═══

export interface PluginVerifier {
  verifySignature(manifest: PluginManifest): boolean;
  checkPermissions(manifest: PluginManifest): boolean;
  checkCompatibility(manifest: PluginManifest): boolean;
}

// ═══ Factory (for future use) ═══

export function createPluginRegistry(): PluginRegistry {
  // Phase 4 implementation
  const plugins: Map<string, PluginManifest> = new Map();

  return {
    register(manifest: PluginManifest): void {
      plugins.set(manifest.slug, manifest);
    },
    unregister(slug: string): void {
      plugins.delete(slug);
    },
    getAll(): PluginManifest[] {
      return Array.from(plugins.values());
    },
    getByPublisher(publisher: string): PluginManifest[] {
      return Array.from(plugins.values()).filter((p) => p.plugin.publisher === publisher);
    },
    verify(manifest: PluginManifest): boolean {
      // Phase 4: verify signature, permissions, compatibility
      return manifest.plugin !== undefined;
    },
  };
}
