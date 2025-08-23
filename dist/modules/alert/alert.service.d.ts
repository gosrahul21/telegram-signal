import { EventEmitter2 } from '@nestjs/event-emitter';
import { Model } from 'mongoose';
import { Alert, AlertDocument } from './alert.entity';
import { CreateAlertDto } from './dto/create-alert.dto';
import { UpdateAlertDto } from './dto/update-alert.dto';
import { QueryAlertDto } from './dto/query-alert.dto';
export declare class AlertService {
    private alertModel;
    private eventEmitter;
    constructor(alertModel: Model<AlertDocument>, eventEmitter: EventEmitter2);
    create(createAlertDto: CreateAlertDto): Promise<Alert>;
    findAll(query: QueryAlertDto): Promise<Alert[]>;
    findOne(id: string): Promise<Alert>;
    findByUserId(userId: string): Promise<Alert[]>;
    update(id: string, updateAlertDto: UpdateAlertDto): Promise<Alert>;
    remove(id: string): Promise<void>;
    toggleActive(id: string): Promise<Alert>;
    incrementTriggerCount(id: string, triggerData?: any): Promise<Alert>;
    findActiveAlerts(): Promise<Alert[]>;
    findAlertsBySymbol(symbol: string): Promise<Alert[]>;
    emitCustomEvent(eventName: string, eventData: any): Promise<void>;
}
