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
exports.GenerateRegistrationTokenDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class GenerateRegistrationTokenDto {
}
exports.GenerateRegistrationTokenDto = GenerateRegistrationTokenDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Optional reason for generating the token',
        example: 'Linking new Telegram account',
        required: false,
    }),
    __metadata("design:type", String)
], GenerateRegistrationTokenDto.prototype, "reason", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Optional custom expiration time (default: 1h)',
        example: '2h',
        required: false,
        enum: ['30m', '1h', '2h', '4h', '1d'],
    }),
    __metadata("design:type", String)
], GenerateRegistrationTokenDto.prototype, "expiresIn", void 0);
//# sourceMappingURL=generate-registration-token.dto.js.map