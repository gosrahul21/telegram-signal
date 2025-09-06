import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
export declare class HealthService implements OnModuleInit {
    private configService;
    private keepAliveInterval;
    constructor(configService: ConfigService);
    onModuleInit(): void;
    getHealth(): {
        status: string;
        timestamp: string;
        uptime: number;
    };
    keepAlive(): {
        message: string;
        timestamp: string;
    };
    private startKeepAlive;
    onModuleDestroy(): void;
}
