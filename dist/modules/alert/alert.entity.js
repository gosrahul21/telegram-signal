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
exports.AlertSchema = exports.Alert = exports.Timeframe = exports.AlertType = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const uuid_1 = require("uuid");
var AlertType;
(function (AlertType) {
    AlertType["LIMIT"] = "limit";
    AlertType["BOLLINGER_BANDS"] = "bollinger_bands";
    AlertType["EMA"] = "ema_crossover";
    AlertType["RSI"] = "rsi";
    AlertType["MACD"] = "macd";
    AlertType["STOCHASTIC"] = "stochastic";
    AlertType["VOLUME"] = "volume";
    AlertType["PRICE_ACTION"] = "price_action";
})(AlertType || (exports.AlertType = AlertType = {}));
var Timeframe;
(function (Timeframe) {
    Timeframe["ONE_MINUTE"] = "1m";
    Timeframe["FIVE_MINUTES"] = "5m";
    Timeframe["FIFTEEN_MINUTES"] = "15m";
    Timeframe["THIRTY_MINUTES"] = "30m";
    Timeframe["ONE_HOUR"] = "1h";
    Timeframe["FOUR_HOURS"] = "4h";
    Timeframe["ONE_DAY"] = "1d";
})(Timeframe || (exports.Timeframe = Timeframe = {}));
let Alert = class Alert {
};
exports.Alert = Alert;
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: String }),
    __metadata("design:type", String)
], Alert.prototype, "symbol", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: mongoose_2.Types.ObjectId, ref: 'User' }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Alert.prototype, "userId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: AlertType }),
    __metadata("design:type", String)
], Alert.prototype, "type", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 1, max: 10 }),
    __metadata("design:type", Number)
], Alert.prototype, "count", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true, default: () => (0, uuid_1.v4)() }),
    __metadata("design:type", String)
], Alert.prototype, "uuid", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: Timeframe }),
    __metadata("design:type", String)
], Alert.prototype, "timeframe", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: true }),
    __metadata("design:type", Boolean)
], Alert.prototype, "isActive", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object }),
    __metadata("design:type", Object)
], Alert.prototype, "conditions", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", Date)
], Alert.prototype, "lastTriggered", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 0 }),
    __metadata("design:type", Number)
], Alert.prototype, "triggerCount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], Alert.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], Alert.prototype, "tags", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object }),
    __metadata("design:type", Object)
], Alert.prototype, "metadata", void 0);
exports.Alert = Alert = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Alert);
exports.AlertSchema = mongoose_1.SchemaFactory.createForClass(Alert);
exports.AlertSchema.index({ symbol: 1, timeframe: 1 });
exports.AlertSchema.index({ userId: 1, isActive: 1 });
exports.AlertSchema.index({ type: 1, isActive: 1 });
exports.AlertSchema.index({ uuid: 1 }, { unique: true });
//# sourceMappingURL=alert.entity.js.map