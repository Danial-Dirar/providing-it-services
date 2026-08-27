import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { mkdtemp, readFile, readdir } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';

import { AppModule } from '../src/app.module';

/**
 * The contact endpoint is the only thing on this site that accepts input, so
 * it gets the closest attention: validation shape, honeypot behaviour, and
 * that a real enquiry is actually written somewhere retrievable.
 */
describe('Contact API (e2e)', () => {
  let app: INestApplication;
  let logDir: string;

  const valid = {
    name: 'Nusrat Rahman',
    email: 'nusrat@example.com',
    company: 'Example Ltd',
    service: 'Data & Analytics',
    budget: '$10k – $50k',
    message: 'Our monthly board pack takes eleven days to assemble and still disagrees with finance.',
  };

  beforeAll(async () => {
    logDir = await mkdtemp(join(tmpdir(), 'pits-enquiries-'));
    process.env.ENQUIRY_LOG_DIR = logDir;

    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    delete process.env.ENQUIRY_LOG_DIR;
  });

  it('accepts a complete enquiry and returns a quotable reference', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/contact')
      .send(valid)
      .expect(200);

    expect(res.body.ok).toBe(true);
    expect(res.body.reference).toMatch(/^PITS-[0-9A-F]{6}$/);
  });

  it('writes the enquiry to disk so nothing is lost without a mail server', async () => {
    await request(app.getHttpServer()).post('/api/contact').send(valid).expect(200);

    const files = await readdir(logDir);
    expect(files.length).toBeGreaterThan(0);

    const contents = await readFile(join(logDir, files[0]), 'utf8');
    const records = contents
      .trim()
      .split('\n')
      .map((line) => JSON.parse(line) as Record<string, unknown>);

    const latest = records.at(-1);
    expect(latest).toBeDefined();
    expect(latest).toMatchObject({
      email: valid.email,
      service: valid.service,
      message: valid.message,
    });
    expect(latest?.receivedAt).toBeTruthy();
  });

  it('returns per-field messages the form can attach to inputs', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/contact')
      .send({ name: 'A', email: 'not-an-email', service: '', message: 'too short' })
      .expect(400);

    expect(res.body.fields).toEqual(
      expect.objectContaining({
        name: expect.any(String),
        email: expect.any(String),
        message: expect.any(String),
      }),
    );
  });

  it('accepts the empty strings a browser sends for untouched optional fields', async () => {
    // "Prefer not to say" on the budget select submits "", and an untouched
    // text input submits "". Neither should read as a validation failure.
    const res = await request(app.getHttpServer())
      .post('/api/contact')
      .send({ ...valid, company: '', phone: '', budget: '' })
      .expect(200);

    expect(res.body.ok).toBe(true);
  });

  it('never surfaces a raw class-validator message to the visitor', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/contact')
      .send({ name: '', email: '', service: '', budget: '', message: '' })
      .expect(400);

    // An absent field trips isString, isNotEmpty and maxLength at once; the
    // length message is the least useful and must not win.
    for (const message of Object.values<string>(res.body.fields)) {
      expect(message).not.toMatch(/must be|shorter than or equal|longer than or equal/);
    }
    expect(res.body.fields.service).toBe('Pick the practice closest to what you need.');
    // Optional fields left blank are not errors.
    expect(res.body.fields.budget).toBeUndefined();
    expect(res.body.fields.company).toBeUndefined();
  });

  it('rejects an unknown budget band rather than storing free text', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/contact')
      .send({ ...valid, budget: 'a trillion dollars' })
      .expect(400);

    expect(res.body.fields.budget).toBeTruthy();
  });

  it('strips unknown fields instead of persisting whatever was posted', async () => {
    await request(app.getHttpServer())
      .post('/api/contact')
      .send({ ...valid, isAdmin: true })
      .expect(400);
  });

  it('silently drops a submission that filled the honeypot', async () => {
    const before = (await readdir(logDir)).length
      ? (await readFile(join(logDir, (await readdir(logDir))[0]), 'utf8')).trim().split('\n').length
      : 0;

    const res = await request(app.getHttpServer())
      .post('/api/contact')
      .send({ ...valid, website: 'http://spam.example' })
      .expect(200);

    // The bot gets a normal-looking response...
    expect(res.body.ok).toBe(true);

    // ...but nothing new is written.
    const files = await readdir(logDir);
    const after = (await readFile(join(logDir, files[0]), 'utf8')).trim().split('\n').length;
    expect(after).toBe(before);
  });
});
