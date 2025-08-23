import { ApiProperty } from '@nestjs/swagger';

export class GenerateRegistrationTokenDto {
  @ApiProperty({
    description: 'Optional reason for generating the token',
    example: 'Linking new Telegram account',
    required: false,
  })
  reason?: string;

  @ApiProperty({
    description: 'Optional custom expiration time (default: 1h)',
    example: '2h',
    required: false,
    enum: ['30m', '1h', '2h', '4h', '1d'],
  })
  expiresIn?: string;
}
