"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const schedule_1 = require("@nestjs/schedule");
const health_module_1 = require("./modules/health/health.module");
const notification_1 = require("./modules/notification");
const auth_module_1 = require("./modules/auth/auth.module");
const user_module_1 = require("./modules/user/user.module");
const mongoose_1 = require("@nestjs/mongoose");
const socket_module_1 = require("./modules/socket/socket.module");
const alert_module_1 = require("./modules/alert/alert.module");
const event_emitter_1 = require("@nestjs/event-emitter");
const bot_module_1 = require("./modules/bot/bot.module");
const monitoring_module_1 = require("./modules/monitoring/monitoring.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
            }),
            mongoose_1.MongooseModule.forRoot(process.env.MONGODB_URL_PROD),
            schedule_1.ScheduleModule.forRoot(),
            health_module_1.HealthModule,
            event_emitter_1.EventEmitterModule.forRoot(),
            bot_module_1.BotModule,
            notification_1.NotificationModule,
            auth_module_1.AuthModule,
            user_module_1.UserModule,
            socket_module_1.SocketModule,
            alert_module_1.AlertModule,
            monitoring_module_1.MonitoringModule,
        ],
        controllers: [],
        providers: [],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map