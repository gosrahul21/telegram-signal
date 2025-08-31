import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { TechnicalAnalysisService } from './technical-analysis.service';
import { PriceMonitoringService } from './price-monitoring.service';
import { Monitoring, MonitoringDocument } from './monitoring.entity';
import { Model } from 'mongoose';
import { MonitorEventType } from '../alert';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreateMonitoringDto } from './dto/create-monitoring.dto';
export declare class MonitoringService implements OnModuleInit, OnModuleDestroy {
    private readonly technicalAnalysisService;
    private readonly priceMonitoringService;
    private eventEmitter;
    private monitoringModel;
    private readonly logger;
    private monitorings;
    constructor(technicalAnalysisService: TechnicalAnalysisService, priceMonitoringService: PriceMonitoringService, eventEmitter: EventEmitter2, monitoringModel: Model<MonitoringDocument>);
    onModuleInit(): void;
    loadMonitorings(): Promise<void>;
    onModuleDestroy(): void;
    addMonitoring(monitoring: CreateMonitoringDto): Promise<void>;
    removeMonitoring(symbol: string, timeframe: string, eventType: MonitorEventType): Promise<void>;
    private startMonitoringByType;
    private triggerAlert;
    private getMonitoringInterval;
    private checkBollingerBandsCondition;
    private checkEMACrossoverCondition;
    private checkRSICondition;
    private checkMACDCondition;
    getMonitoringStatus(): Promise<{
        active: number;
        status: string;
    }>;
    getAllMonitorings(): Promise<Monitoring[]>;
}
