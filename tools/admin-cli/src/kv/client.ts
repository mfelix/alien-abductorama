import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const KV_BINDING = 'ALIEN_ABDUCTORAMA_HIGH_SCORES';

export class KVError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = 'KVError';
  }
}

export class KVParseError extends KVError {
  constructor(public readonly key: string, public readonly rawContent: string, cause: unknown) {
    super(`Failed to parse JSON for key "${key}"`, cause);
    this.name = 'KVParseError';
  }
}

export interface KVClientOptions {
  dryRun?: boolean;
  verbose?: boolean;
}

export class KVClient {
  private options: KVClientOptions;

  constructor(options: KVClientOptions = {}) {
    this.options = options;
  }

  /**
   * Read a key from KV storage.
   * Returns null if key doesn't exist.
   * Throws KVParseError if key exists but contains invalid JSON.
   */
  get<T>(key: string): T | null {
    let result: string;
    try {
      result = execSync(
        `npx wrangler kv key get "${key}" --binding=${KV_BINDING} --remote`,
        { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }
      );
    } catch (error: unknown) {
      // wrangler exits with error if key doesn't exist
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('not found') || errorMessage.includes('could not find')) {
        return null;
      }
      throw new KVError(`Failed to read key "${key}"`, error);
    }

    const trimmed = result.trim();
    if (!trimmed) {
      return null;
    }

    try {
      return JSON.parse(trimmed) as T;
    } catch (parseError) {
      throw new KVParseError(key, trimmed, parseError);
    }
  }

  /**
   * Write a key to KV storage.
   * Uses a temporary file to avoid shell escaping issues with JSON.
   */
  put<T>(key: string, value: T): boolean {
    const json = JSON.stringify(value);

    if (this.options.dryRun) {
      console.log(`[DRY RUN] Would write to key "${key}":`);
      console.log(JSON.stringify(value, null, 2));
      return true;
    }

    const tempFile = join(tmpdir(), `alien-admin-${Date.now()}-${Math.random().toString(36).slice(2)}.json`);
    try {
      writeFileSync(tempFile, json);
      execSync(
        `npx wrangler kv key put "${key}" --binding=${KV_BINDING} --remote --path "${tempFile}"`,
        { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }
      );
      return true;
    } catch (error) {
      console.error(`Failed to write key "${key}":`, error);
      return false;
    } finally {
      try {
        unlinkSync(tempFile);
      } catch {
        // Ignore cleanup errors
      }
    }
  }

  /**
   * Convenience wrapper for read-modify-write operations.
   * NOTE: This is NOT atomic. See Known Limitations in the plan.
   */
  modify<T>(
    key: string,
    modifier: (current: T | null) => T
  ): { success: boolean; oldValue: T | null; newValue: T } {
    const oldValue = this.get<T>(key);
    const newValue = modifier(oldValue);

    if (this.options.verbose) {
      console.log('Old value:', JSON.stringify(oldValue, null, 2));
      console.log('New value:', JSON.stringify(newValue, null, 2));
    }

    const success = this.put(key, newValue);
    return { success, oldValue, newValue };
  }
}

// Singleton instance for convenience
let defaultClient: KVClient | null = null;

export function getKVClient(options?: KVClientOptions): KVClient {
  if (!defaultClient || options) {
    defaultClient = new KVClient(options);
  }
  return defaultClient;
}
