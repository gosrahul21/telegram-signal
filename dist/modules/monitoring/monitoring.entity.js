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
exports.MonitoringSchema = exports.Monitoring = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const alert_1 = require("../alert");
let Monitoring = class Monitoring {
};
exports.Monitoring = Monitoring;
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: String }),
    __metadata("design:type", String)
], Monitoring.prototype, "symbol", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: String }),
    __metadata("design:type", String)
], Monitoring.prototype, "timeframe", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: alert_1.MonitorEventType }),
    __metadata("design:type", String)
], Monitoring.prototype, "eventType", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: String }),
    __metadata("design:type", String)
], Monitoring.prototype, "count", void 0);
exports.Monitoring = Monitoring = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Monitoring);
exports.MonitoringSchema = mongoose_1.SchemaFactory.createForClass(Monitoring);
//# sourceMappingURL=monitoring.entity.js.map