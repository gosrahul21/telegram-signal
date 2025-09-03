"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandHandlersModule = void 0;
const common_1 = require("@nestjs/common");
const day_status_handler_1 = require("./day-status.handler");
const four_hour_status_handler_1 = require("./four-hour-status.handler");
const hour_status_handler_1 = require("./hour-status.handler");
const on_subscribe_handler_1 = require("./on-subscribe.handler");
const unsubscribe_handler_1 = require("./unsubscribe.handler");
const handle_status_by_duration_handler_1 = require("./handle-status-by-duration.handler");
let CommandHandlersModule = class CommandHandlersModule {
};
exports.CommandHandlersModule = CommandHandlersModule;
exports.CommandHandlersModule = CommandHandlersModule = __decorate([
    (0, common_1.Module)({
        providers: [
            day_status_handler_1.DayStatusHandler,
            four_hour_status_handler_1.FourHourStatusHandler,
            hour_status_handler_1.HourStatusHandler,
            on_subscribe_handler_1.OnSubscribeHandler,
            unsubscribe_handler_1.UnsubscribeHandler,
            handle_status_by_duration_handler_1.HandleStatusByDurationHandler,
        ],
        exports: [
            day_status_handler_1.DayStatusHandler,
            four_hour_status_handler_1.FourHourStatusHandler,
            hour_status_handler_1.HourStatusHandler,
            on_subscribe_handler_1.OnSubscribeHandler,
            unsubscribe_handler_1.UnsubscribeHandler,
            handle_status_by_duration_handler_1.HandleStatusByDurationHandler,
        ],
    })
], CommandHandlersModule);
//# sourceMappingURL=command-handlers.module.js.map