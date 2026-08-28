import type { Express } from 'express';

import { createApp } from './create-app';

/**
 * Serverless entrypoint (Vercel).
 *
 * The platform owns the listener, so the app is initialised once per warm
 * instance and the underlying Express handler is reused. The in-flight promise
 * is cached as well, so concurrent cold-start requests share one boot.
 */
let server: Express | undefined;
let booting: Promise<Express> | undefined;

export async function getServer(): Promise<Express> {
  if (server) return server;

  if (!booting) {
    booting = (async () => {
      const app = await createApp();
      await app.init();
      server = app.getHttpAdapter().getInstance();
      return server;
    })().catch((error: unknown) => {
      // Let the next request retry rather than caching a failed boot forever.
      booting = undefined;
      throw error;
    });
  }

  return booting;
}
