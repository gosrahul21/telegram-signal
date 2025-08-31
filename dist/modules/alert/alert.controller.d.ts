import { AlertService } from './alert.service';
import { CreateAlertDto } from './dto/create-alert.dto';
import { UpdateAlertDto } from './dto/update-alert.dto';
import { QueryAlertDto } from './dto/query-alert.dto';
export declare class AlertController {
    private readonly alertService;
    constructor(alertService: AlertService);
    create(createAlertDto: CreateAlertDto): Promise<import("./alert.entity").Alert>;
    findAll(query: QueryAlertDto): Promise<import("./alert.entity").Alert[]>;
    findActiveAlerts(): Promise<import("./alert.entity").Alert[]>;
    findAlertsBySymbol(symbol: string): Promise<import("./alert.entity").Alert[]>;
    findByUserId(userId: string): Promise<import("./alert.entity").Alert[]>;
    findOne(id: string): Promise<import("./alert.entity").Alert>;
    update(id: string, updateAlertDto: UpdateAlertDto): Promise<import("./alert.entity").Alert>;
    remove(id: string): Promise<void>;
}
