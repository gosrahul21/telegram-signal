import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LinkTelegramDto {
  @ApiProperty({
    description: 'Registration token received from Telegram bot',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0ZWxlZ3JhbUlkIjoxMjM0NTY3ODksImNoYXRJZCI6MTIzNDU2Nzg5LCJ0eXBlIjoicmVnaXN0cmF0aW9uIiwiaWF0IjoxNjE2MjM5MDIyLCJleHAiOjE2MTYyNDI2MjJ9.example',
  })
  @IsString()
  @IsNotEmpty()
  linkToken: string;
}
