import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Model, Types } from 'mongoose';
import { Alert, AlertDocument } from './alert.entity';
import { CreateAlertDto } from './dto/create-alert.dto';
import { UpdateAlertDto } from './dto/update-alert.dto';
import { QueryAlertDto } from './dto/query-alert.dto';
import {
  AlertCreatedEvent,
  AlertUpdatedEvent,
  AlertDeletedEvent,
  AlertTriggeredEvent,
  AlertStatusChangedEvent,
  ALERT_EVENTS,
} from './events/alert.events';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AlertService {
  constructor(
    @InjectModel(Alert.name) private alertModel: Model<AlertDocument>,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(createAlertDto: CreateAlertDto): Promise<Alert> {
    try {
      const alertData = {
        uuid: uuidv4(),
        ...createAlertDto,
        userId: new Types.ObjectId(createAlertDto.userId),
      };

      // Emit alert created event
      this.eventEmitter.emit(ALERT_EVENTS.CREATED, {
        alert: alertData,
        timestamp: new Date(),
      });

      const alert = new this.alertModel(alertData);
      const savedAlert = await alert.save();

      return savedAlert;
    } catch (error) {
      throw new BadRequestException('Failed to create alert');
    }
  }

  async findAll(query: QueryAlertDto): Promise<Alert[]> {
    const filter: any = {};

    if (query.symbol) {
      filter.symbol = { $regex: query.symbol, $options: 'i' };
    }

    if (query.userId) {
      filter.userId = new Types.ObjectId(query.userId);
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

  async findOne(id: string): Promise<Alert> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid alert ID');
    }

    const alert = await this.alertModel.findById(id);
    if (!alert) {
      throw new NotFoundException('Alert not found');
    }

    return alert;
  }

  async findByUserId(userId: string): Promise<Alert[]> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid user ID');
    }

    return await this.alertModel
      .find({
        userId: new Types.ObjectId(userId),
      })
      .sort({ createdAt: -1 });
  }

  async update(id: string, updateAlertDto: UpdateAlertDto): Promise<Alert> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid alert ID');
    }

    // Get the previous alert data for comparison
    const previousAlert = await this.alertModel.findById(id);
    if (!previousAlert) {
      throw new NotFoundException('Alert not found');
    }

    const alert = await this.alertModel.findByIdAndUpdate(id, updateAlertDto, {
      new: true,
      runValidators: true,
    });

    if (!alert) {
      throw new NotFoundException('Alert not found');
    }

    // Emit alert updated event
    this.eventEmitter.emit(ALERT_EVENTS.UPDATED, {
      alert,
      previousData: previousAlert,
      timestamp: new Date(),
    } as AlertUpdatedEvent);

    return alert;
  }

  async remove(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid alert ID');
    }

    const alert = await this.alertModel.findById(id);
    if (!alert) {
      throw new NotFoundException('Alert not found');
    }

    const result = await this.alertModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException('Alert not found');
    }

    // Emit alert deleted event
    this.eventEmitter.emit(ALERT_EVENTS.DELETED, {
      alertId: id,
      userId: alert.userId.toString(),
      timestamp: new Date(),
    } as AlertDeletedEvent);
  }

  async toggleActive(id: string): Promise<Alert> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid alert ID');
    }

    const alert = await this.alertModel.findById(id);
    if (!alert) {
      throw new NotFoundException('Alert not found');
    }

    const previousStatus = alert.isActive;
    alert.isActive = !alert.isActive;
    const updatedAlert = await alert.save();

    // Emit alert status changed event
    this.eventEmitter.emit(ALERT_EVENTS.STATUS_CHANGED, {
      alert: updatedAlert,
      previousStatus,
      newStatus: updatedAlert.isActive,
      timestamp: new Date(),
    } as AlertStatusChangedEvent);

    return updatedAlert;
  }

  async incrementTriggerCount(id: string, triggerData?: any): Promise<Alert> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid alert ID');
    }

    const alert = await this.alertModel.findByIdAndUpdate(
      id,
      {
        $inc: { triggerCount: 1 },
        lastTriggered: new Date(),
      },
      { new: true },
    );

    if (!alert) {
      throw new NotFoundException('Alert not found');
    }

    // Emit alert triggered event
    this.eventEmitter.emit(ALERT_EVENTS.CREATED, {
      alert,
      triggerData: triggerData || {},
      timestamp: new Date(),
    } as AlertTriggeredEvent);

    return alert;
  }

  async findActiveAlerts(): Promise<Alert[]> {
    return await this.alertModel.find({ isActive: true });
  }

  async findAlertsBySymbol(symbol: string): Promise<Alert[]> {
    return await this.alertModel.find({
      symbol: { $regex: symbol, $options: 'i' },
      isActive: true,
    });
  }

  // Method to manually emit custom events
  async emitCustomEvent(eventName: string, eventData: any): Promise<void> {
    this.eventEmitter.emit(eventName, {
      ...eventData,
      timestamp: new Date(),
    });
  }
}
