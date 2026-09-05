import { Logger } from '@nestjs/common';

import { createApp } from './create-app';
import { isProductionEnv } from './common/site-url';

/** Long-running server entrypoint (local dev, VPS, Docker). */
async function bootstrap(): Promise<void> {
  const app = await createApp();

  const port = Number(process.env.PORT) || 3100;
  // Loopback only: in every deployment of this entrypoint the sole client is a
  // reverse proxy on the same host, so binding the wildcard address would only
  // expose the origin to the local network and let it be reached unproxied.
  await app.listen(port, '127.0.0.1');

  new Logger('Bootstrap').log(
    `Providing IT Services running at http://localhost:${port} (${isProductionEnv() ? 'production' : 'development'})`,
  );
}

void bootstrap();
