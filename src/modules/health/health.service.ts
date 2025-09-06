import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class HealthService implements OnModuleInit {
  private keepAliveInterval: NodeJS.Timeout;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    this.startKeepAlive();
  }

  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  keepAlive() {
    return {
      message: 'Keep alive endpoint hit',
      timestamp: new Date().toISOString(),
    };
  }

  private startKeepAlive() {
    // Keep alive logic for render deployment
    this.keepAliveInterval = setInterval(
      async () => {
        try {
          console.log(
            'Making self request',
            this.configService.get<string>('BASE_URL'),
          );
          const baseUrl =
            this.configService.get<string>('BASE_URL') ||
            'http://locahost:3000';
          await axios.get(`${baseUrl}/api/health/keep-alive`);
        } catch (error) {
          console.log('Error on making self request:', error);
        }
      },
      1000 * 60 * 10,
    ); // Every 10 minutes
  }

  onModuleDestroy() {
    if (this.keepAliveInterval) {
      clearInterval(this.keepAliveInterval);
    }
  }
}
