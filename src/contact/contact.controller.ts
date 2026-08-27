import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Ip,
  Post,
  Headers,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ContactService } from './contact.service';
import { CreateEnquiryDto, pickMessage } from './dto/create-enquiry.dto';

@Controller('api/contact')
export class ContactController {
  constructor(private readonly contact: ContactService) {}

  /** Five submissions per IP per hour is generous for a real buyer. */
  @Throttle({ contact: { limit: 5, ttl: 3_600_000 } })
  @Post()
  @HttpCode(HttpStatus.OK)
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) => {
        // Collapse class-validator output into { field: message } so the
        // browser can attach each message to its own input.
        const fields: Record<string, string> = {};
        for (const error of errors) {
          fields[error.property] = pickMessage(error.constraints);
        }
        return new BadRequestException({
          statusCode: 400,
          message: 'Some details need another look.',
          fields,
        });
      },
    }),
  )
  async create(
    @Body() dto: CreateEnquiryDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent?: string,
  ) {
    const { reference } = await this.contact.submit(dto, { ip, userAgent });
    return {
      ok: true,
      reference,
      message: `Thanks — your enquiry is with us. Reference ${reference}. We reply within one working day.`,
    };
  }
}
