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
exports.AlertService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const event_emitter_1 = require("@nestjs/event-emitter");
const mongoose_2 = require("mongoose");
const alert_entity_1 = require("./alert.entity");
const alert_events_1 = require("./events/alert.events");
const uuid_1 = require("uuid");
let AlertService = class AlertService {
    constructor(alertModel, eventEmitter) {
        this.alertModel = alertModel;
        this.eventEmitter = eventEmitter;
    }
    async create(createAlertDto) {
        try {
            const alertData = {
                uuid: (0, uuid_1.v4)(),
                ...createAlertDto,
                userId: new mongoose_2.Types.ObjectId(createAlertDto.userId),
            };
            this.eventEmitter.emit(alert_events_1.ALERT_EVENTS.CREATED, {
                alert: alertData,
                timestamp: new Date(),
            });
            const alert = new this.alertModel(alertData);
            const savedAlert = await alert.save();
            return savedAlert;
        }
        catch (error) {
            throw new common_1.BadRequestException('Failed to create alert');
        }
    }
    async findAll(query) {
        const filter = {};
        if (query.symbol) {
            filter.symbol = { $regex: query.symbol, $options: 'i' };
        }
        if (query.userId) {
            filter.userId = new mongoose_2.Types.ObjectId(query.userId);
        }
        if (query.type) {
            filter.type = query.type;
        }
        if (query.timeframe) {
            filter.timeframe = query.timeframe;
        }
        if (query.isActive !== undefined) {
            filter.isActive = query.isActive;
        }
        if (query.tags && query.tags.length > 0) {
            filter.tags = { $in: query.tags };
        }
        if (query.search) {
            filter.$or = [
                { symbol: { $regex: query.search, $options: 'i' } },
                { description: { $regex: query.search, $options: 'i' } },
            ];
        }
        return await this.alertModel.find(filter).sort({ createdAt: -1 });
    }
    async findOne(id) {
        if (!mongoose_2.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException('Invalid alert ID');
        }
        const alert = await this.alertModel.findById(id);
        if (!alert) {
            throw new common_1.NotFoundException('Alert not found');
        }
        return alert;
    }
    async findByUserId(userId) {
        if (!mongoose_2.Types.ObjectId.isValid(userId)) {
            throw new common_1.BadRequestException('Invalid user ID');
        }
        return await this.alertModel
            .find({
            userId: new mongoose_2.Types.ObjectId(userId),
        })
            .sort({ createdAt: -1 });
    }
    async update(id, updateAlertDto) {
        if (!mongoose_2.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException('Invalid alert ID');
        }
        const previousAlert = await this.alertModel.findById(id);
        if (!previousAlert) {
            throw new common_1.NotFoundException('Alert not found');
        }
        const alert = await this.alertModel.findByIdAndUpdate(id, updateAlertDto, {
            new: true,
            runValidators: true,
        });
        if (!alert) {
            throw new common_1.NotFoundException('Alert not found');
        }
        this.eventEmitter.emit(alert_events_1.ALERT_EVENTS.UPDATED, {
            alert,
            previousData: previousAlert,
            timestamp: new Date(),
        });
        return alert;
    }
    async remove(id) {
        if (!mongoose_2.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException('Invalid alert ID');
        }
        const alert = await this.alertModel.findById(id);
        if (!alert) {
            throw new common_1.NotFoundException('Alert not found');
        }
        const result = await this.alertModel.findByIdAndDelete(id);
        if (!result) {
            throw new common_1.NotFoundException('Alert not found');
        }
        this.eventEmitter.emit(alert_events_1.ALERT_EVENTS.DELETED, {
            alertId: id,
            userId: alert.userId.toString(),
            timestamp: new Date(),
        });
    }
    async toggleActive(id) {
        if (!mongoose_2.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException('Invalid alert ID');
        }
        const alert = await this.alertModel.findById(id);
        if (!alert) {
            throw new common_1.NotFoundException('Alert not found');
        }
        const previousStatus = alert.isActive;
        alert.isActive = !alert.isActive;
        const updatedAlert = await alert.save();
        this.eventEmitter.emit(alert_events_1.ALERT_EVENTS.STATUS_CHANGED, {
            alert: updatedAlert,
            previousStatus,
            newStatus: updatedAlert.isActive,
            timestamp: new Date(),
        });
        return updatedAlert;
    }
    async incrementTriggerCount(id, triggerData) {
        if (!mongoose_2.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException('Invalid alert ID');
        }
        const alert = await this.alertModel.findByIdAndUpdate(id, {
            $inc: { triggerCount: 1 },
            lastTriggered: new Date(),
        }, { new: true });
        if (!alert) {
            throw new common_1.NotFoundException('Alert not found');
        }
        this.eventEmitter.emit(alert_events_1.ALERT_EVENTS.CREATED, {
            alert,
            triggerData: triggerData || {},
            timestamp: new Date(),
        });
        return alert;
    }
    async findActiveAlerts() {
        return await this.alertModel.find({ isActive: true });
    }
    async findAlertsBySymbol(symbol) {
        return await this.alertModel.find({
            symbol: { $regex: symbol, $options: 'i' },
            isActive: true,
        });
    }
    async emitCustomEvent(eventName, eventData) {
        this.eventEmitter.emit(eventName, {
            ...eventData,
            timestamp: new Date(),
        });
    }
};
exports.AlertService = AlertService;
exports.AlertService = AlertService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(alert_entity_1.Alert.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        event_emitter_1.EventEmitter2])
], AlertService);
//# sourceMappingURL=alert.service.js.map