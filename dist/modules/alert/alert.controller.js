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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlertController = void 0;
const common_1 = require("@nestjs/common");
const alert_service_1 = require("./alert.service");
const create_alert_dto_1 = require("./dto/create-alert.dto");
const update_alert_dto_1 = require("./dto/update-alert.dto");
const query_alert_dto_1 = require("./dto/query-alert.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let AlertController = class AlertController {
    constructor(alertService) {
        this.alertService = alertService;
    }
    create(createAlertDto, req) {
        const userId = req.user.id;
        return this.alertService.create({ ...createAlertDto, userId });
    }
    findAll(query) {
        return this.alertService.findAll(query);
    }
    findActiveAlerts() {
        return this.alertService.findActiveAlerts();
    }
    findAlertsBySymbol(symbol) {
        return this.alertService.findAlertsBySymbol(symbol);
    }
    findByUserId(req) {
        const userId = req.user.id;
        return this.alertService.findByUserId(userId);
    }
    findOne(id) {
        return this.alertService.findOne(id);
    }
    update(id, updateAlertDto, req) {
        const userId = req.user.id;
        return this.alertService.update(id, { ...updateAlertDto, userId });
    }
    remove(id) {
        return this.alertService.remove(id);
    }
};
exports.AlertController = AlertController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_alert_dto_1.CreateAlertDto, Object]),
    __metadata("design:returntype", void 0)
], AlertController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_alert_dto_1.QueryAlertDto]),
    __metadata("design:returntype", void 0)
], AlertController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('active'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AlertController.prototype, "findActiveAlerts", null);
__decorate([
    (0, common_1.Get)('symbol/:symbol'),
    __param(0, (0, common_1.Param)('symbol')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AlertController.prototype, "findAlertsBySymbol", null);
__decorate([
    (0, common_1.Get)('user'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AlertController.prototype, "findByUserId", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AlertController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_alert_dto_1.UpdateAlertDto, Object]),
    __metadata("design:returntype", void 0)
], AlertController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AlertController.prototype, "remove", null);
exports.AlertController = AlertController = __decorate([
    (0, common_1.Controller)('alerts'),
    __metadata("design:paramtypes", [alert_service_1.AlertService])
], AlertController);
//# sourceMappingURL=alert.controller.js.map