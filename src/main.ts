import { Logger } from '@nestjs/common';

import { createApp } from './create-app';
import { isProductionEnv } from './common/site-url';

/** Long-running server entrypoint (local dev, VPS, Docker). */
async function bootstrap(): Promise<void> {
  const app = await createApp();

  const port = Number(process.env.PORT) || 3100;
  await app.listen(port, '0.0.0.0');

  new Logger('Bootstrap').log(
    `Providing IT Services running at http://localhost:${port} (${isProductionEnv() ? 'production' : 'development'})`,
  );
}

void bootstrap();
