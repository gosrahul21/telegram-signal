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
const uuid_1 = require("uuid");
const eventsType_1 = require("../../utils/constants/eventsType");
let AlertService = class AlertService {
    constructor(alertModel, eventEmitter) {
        this.alertModel = alertModel;
        this.eventEmitter = eventEmitter;
        this.alerts = [];
    }
    async onModuleInit() {
        this.alerts = await this.alertModel.find({}).lean();
    }
    getBestCount(symbol, timeframe, eventType) {
        const filteredAlerts = this.alerts.filter((alert) => alert.isActive &&
            alert.symbol === symbol &&
            alert.timeframe === timeframe &&
            alert.eventType === eventType);
        const hasInfinite = filteredAlerts.some((alert) => alert.infinite);
        if (hasInfinite)
            return 'INFINITE';
        return Math.max(...filteredAlerts.map((alert) => alert.count), 0);
    }
    async create(createAlertDto) {
        try {
            const alertData = {
                uuid: (0, uuid_1.v4)(),
                ...createAlertDto,
                userId: new mongoose_2.Types.ObjectId(createAlertDto.userId),
            };
            const alert = new this.alertModel(alertData);
            const savedAlert = await alert.save();
            this.alerts.push(savedAlert.toObject());
            const alertObject = {
                ...savedAlert.toObject(),
                count: await this.getBestCount(savedAlert.symbol, savedAlert.timeframe, savedAlert.eventType),
                timestamp: new Date(),
            };
            console.log('alertObject', alertObject);
            this.emitCustomEvent(eventsType_1.EventsType.ALERT_CREATED, alertObject);
            return savedAlert;
        }
        catch (error) {
            throw new common_1.BadRequestException(error);
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
        const previousAlert = await this.alertModel.findOne({ uuid: id });
        if (!previousAlert) {
            throw new common_1.NotFoundException('Alert not found');
        }
        const updatedAlert = await this.alertModel
            .findOneAndUpdate({ uuid: id }, updateAlertDto, {
            new: true,
            runValidators: true,
        })
            .lean();
        if (!updatedAlert) {
            throw new common_1.NotFoundException('Alert not found');
        }
        this.alerts = this.alerts.map((alert) => alert.uuid === id ? updatedAlert : alert);
        this.emitCustomEvent(eventsType_1.EventsType.ALERT_UPDATED, {
            ...updatedAlert,
            count: this.getBestCount(updatedAlert.symbol, updatedAlert.timeframe, updatedAlert.eventType),
            timestamp: new Date(),
        });
        return updatedAlert;
    }
    async remove(id) {
        const alert = await this.alertModel.findOne({ uuid: id });
        if (!alert) {
            throw new common_1.NotFoundException('Alert not found');
        }
        const result = await this.alertModel.findOneAndDelete({ uuid: id });
        if (!result) {
            throw new common_1.NotFoundException('Alert not found');
        }
        this.alerts = this.alerts.filter((alert) => alert.uuid !== id);
        this.emitCustomEvent(eventsType_1.EventsType.ALERT_DELETED, {
            alertId: id,
            userId: alert.userId.toString(),
            symbol: alert.symbol,
            timeframe: alert.timeframe,
            eventType: alert.eventType,
            count: this.getBestCount(alert.symbol, alert.timeframe, alert.eventType),
            timestamp: new Date(),
        });
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
    async findActiveAlertsBySymbolTimeframeEventType(symbol, timeframe, eventType) {
        return await this.alertModel
            .find({
            symbol,
            timeframe: timeframe,
            eventType: eventType,
            isActive: true,
        })
            .lean();
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