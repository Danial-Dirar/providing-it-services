import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { appendFile, mkdir } from 'fs/promises';
import { join, resolve } from 'path';
import { randomUUID } from 'crypto';
import { CreateEnquiryDto } from './dto/create-enquiry.dto';

export interface StoredEnquiry extends CreateEnquiryDto {
  reference: string;
  receivedAt: string;
  userAgent?: string;
  ip?: string;
}

/**
 * Persists enquiries.
 *
 * Local development writes one JSON object per line to a dated file, which is
 * enough to prove the form works end to end without a mail server.
 *
 * Serverless platforms (Vercel) have a read-only filesystem, so the file write
 * is skipped there and the enquiry is emitted as a single structured log line
 * instead. That is recoverable but not durable — wiring an email or CRM
 * transport here is a launch blocker for any deployment that takes real
 * enquiries. See handout.md §5.1.
 */
@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);
  private readonly dir: string;
  private readonly fileStoreEnabled: boolean;

  constructor(private readonly config: ConfigService) {
    this.dir = resolve(
      process.cwd(),
      this.config.get<string>('ENQUIRY_LOG_DIR') ?? './data/enquiries',
    );
    // Vercel sets VERCEL=1 in build and runtime; its only writable path is /tmp,
    // which does not survive the instance, so there is nothing to gain by using it.
    this.fileStoreEnabled = !process.env.VERCEL;
  }

  async submit(
    dto: CreateEnquiryDto,
    context: { ip?: string; userAgent?: string },
  ): Promise<{ reference: string }> {
    const reference = this.buildReference();

    // The honeypot is filled, so this is automated. Return a normal-looking
    // response rather than an error, and drop it.
    if (dto.website) {
      this.logger.warn(`Honeypot triggered from ${context.ip ?? 'unknown'} — enquiry dropped`);
      return { reference };
    }

    const record: StoredEnquiry = {
      ...dto,
      website: undefined,
      reference,
      receivedAt: new Date().toISOString(),
      ip: context.ip,
      userAgent: context.userAgent,
    };

    await this.persist(record);
    this.logger.log(`Enquiry ${reference} from ${dto.email} — ${dto.service}`);

    return { reference };
  }

  private async persist(record: StoredEnquiry): Promise<void> {
    // Always emit the full record; on a read-only filesystem this is the record.
    this.logger.log(`ENQUIRY ${JSON.stringify(record)}`);

    if (!this.fileStoreEnabled) return;

    try {
      await mkdir(this.dir, { recursive: true });
      const file = join(this.dir, `${record.receivedAt.slice(0, 10)}.jsonl`);
      await appendFile(file, `${JSON.stringify(record)}\n`, 'utf8');
    } catch (error) {
      // A storage failure must never lose the enquiry behind a 500 — the caller
      // has already been given a reference and the line above holds the data.
      this.logger.error(
        `Could not write enquiry ${record.reference} to ${this.dir}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  /** Human-quotable reference, e.g. PITS-8F3K2A. */
  private buildReference(): string {
    return `PITS-${randomUUID().replace(/-/g, '').slice(0, 6).toUpperCase()}`;
  }
}
