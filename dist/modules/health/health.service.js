"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = require("axios");
let HealthService = class HealthService {
    constructor(configService) {
        this.configService = configService;
    }
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
    startKeepAlive() {
        this.keepAliveInterval = setInterval(async () => {
            try {
                console.log('Making self request', this.configService.get('BASE_URL'));
                const baseUrl = this.configService.get('BASE_URL') ||
                    'https://telegram-signal-1.onrender.com';
                await axios_1.default.get(`${baseUrl}/api/health/keep-alive`);
            }
            catch (error) {
                console.log('Error on making self request:', error);
            }
        }, 1000);
    }
    onModuleDestroy() {
        if (this.keepAliveInterval) {
            clearInterval(this.keepAliveInterval);
        }
    }
};
exports.HealthService = HealthService;
exports.HealthService = HealthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], HealthService);
//# sourceMappingURL=health.service.js.map