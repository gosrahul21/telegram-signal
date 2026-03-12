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
exports.PositionSchema = exports.Position = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const uuid_1 = require("uuid");
const orders_entity_1 = require("./orders.entity");
let Position = class Position {
};
exports.Position = Position;
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true, default: () => (0, uuid_1.v4)() }),
    __metadata("design:type", String)
], Position.prototype, "uuid", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: mongoose_2.Types.ObjectId, ref: 'User' }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Position.prototype, "userId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true, type: mongoose_2.Types.ObjectId, ref: 'Order' }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Position.prototype, "creatorOrderId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: mongoose_2.Types.ObjectId, ref: 'Exchange' }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Position.prototype, "exchangeId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Position.prototype, "symbol", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Position.prototype, "side", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Position.prototype, "quantity", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Position.prototype, "openPrice", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false }),
    __metadata("design:type", Number)
], Position.prototype, "closePrice", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false }),
    __metadata("design:type", Number)
], Position.prototype, "pnl", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false }),
    __metadata("design:type", Number)
], Position.prototype, "pnlPercentage", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false }),
    __metadata("design:type", Date)
], Position.prototype, "pnlCalculatedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false }),
    __metadata("design:type", Date)
], Position.prototype, "closedAt", void 0);
exports.Position = Position = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Position);
exports.PositionSchema = mongoose_1.SchemaFactory.createForClass(Position);
//# sourceMappingURL=position.entity.js.map