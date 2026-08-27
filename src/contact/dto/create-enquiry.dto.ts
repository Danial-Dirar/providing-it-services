import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

/**
 * Every constraint carries an explicit message. class-validator's defaults
 * ("service must be shorter than or equal to 120 characters") are written for
 * developers, and one leaking into the form is a bad look on a page whose whole
 * argument is that this firm communicates clearly.
 */

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

/**
 * Optional selects submit an empty string when the visitor leaves them alone.
 * `@IsOptional` only skips `null` and `undefined`, so normalise here or the
 * "Prefer not to say" option gets rejected.
 */
const trimToUndefined = ({ value }: { value: unknown }) => {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
};

export const BUDGET_BANDS = [
  'Not sure yet',
  'Under $10k',
  '$10k – $50k',
  '$50k – $150k',
  'Over $150k',
  'Monthly retainer',
] as const;

export class CreateEnquiryDto {
  @Transform(trim)
  @IsString({ message: 'Tell us your name.' })
  @IsNotEmpty({ message: 'Tell us your name.' })
  @MinLength(2, { message: 'Tell us your name.' })
  @MaxLength(120, { message: 'That name is longer than we can store — 120 characters is the limit.' })
  name!: string;

  @Transform(trim)
  @IsEmail({}, { message: 'We need a working email address to reply to.' })
  @MaxLength(200, { message: 'That address is longer than we can store.' })
  email!: string;

  @Transform(trimToUndefined)
  @IsOptional()
  @IsString({ message: 'Company should be plain text.' })
  @MaxLength(160, { message: 'Company name is longer than we can store.' })
  company?: string;

  @Transform(trimToUndefined)
  @IsOptional()
  @IsString({ message: 'Phone should be plain text.' })
  @MaxLength(40, { message: 'That phone number is longer than we can store.' })
  phone?: string;

  @Transform(trim)
  @IsString({ message: 'Pick the practice closest to what you need.' })
  @IsNotEmpty({ message: 'Pick the practice closest to what you need.' })
  @MaxLength(120, { message: 'Pick one of the listed practices.' })
  service!: string;

  @Transform(trimToUndefined)
  @IsOptional()
  @IsIn([...BUDGET_BANDS], { message: 'Pick one of the listed budget bands.' })
  budget?: string;

  @Transform(trim)
  @IsString({ message: 'Give us a couple of sentences on what you need.' })
  @IsNotEmpty({ message: 'Give us a couple of sentences on what you need.' })
  @MinLength(20, { message: 'A little more detail helps us route this to the right person.' })
  @MaxLength(4000, { message: 'Keep it under 4000 characters — you can send the rest by email.' })
  message!: string;

  /**
   * Honeypot. Real people never see this field, so anything in it is a bot.
   */
  @IsOptional()
  @IsString()
  @MaxLength(200)
  website?: string;
}

/**
 * Which constraint's message to show when a field trips several at once.
 *
 * class-validator returns constraints in an order that depends on decorator
 * evaluation, so picking "the first one" surfaces an arbitrary message — an
 * absent field fails `isString`, `isNotEmpty` and `maxLength` together, and
 * the length message is the least useful of the three.
 */
const MESSAGE_PRIORITY = [
  'isNotEmpty',
  'isString',
  'isEmail',
  'isIn',
  'minLength',
  'maxLength',
];

export function pickMessage(constraints: Record<string, string> = {}): string {
  for (const key of MESSAGE_PRIORITY) {
    if (constraints[key]) return constraints[key];
  }
  return Object.values(constraints)[0] ?? 'Please check this field.';
}
