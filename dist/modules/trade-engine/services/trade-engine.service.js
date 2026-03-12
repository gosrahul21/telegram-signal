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
var TradeEngineService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TradeEngineService = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const eventsType_1 = require("../../../utils/constants/eventsType");
const orders_1 = require("../../orders");
const WebSocket = require('ws');
let TradeEngineService = TradeEngineService_1 = class TradeEngineService {
    constructor(eventEmitter) {
        this.eventEmitter = eventEmitter;
        this.logger = new common_1.Logger(TradeEngineService_1.name);
        this.ws = null;
        this.priceLimits = new Map();
        this.subscribedSymbols = new Set();
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectInterval = 5000;
        this.isConnected = false;
        this.DEFAULT_SYMBOLS = [
            'BTCUSDT',
            'ETHUSDT',
            'XRPUSDT',
            'SOLUSDT',
            'DOGEUSDT',
            'DOTUSDT',
            'SUIUSDT',
            'ADAUSDT',
            'BNBUSDT',
            'PAXGUSDT',
        ];
    }
    async onModuleInit() {
        this.logger.log('Initializing Trade Engine Service...');
        this.DEFAULT_SYMBOLS.forEach((symbol) => {
            this.subscribedSymbols.add(symbol);
        });
        await this.connectToBinance();
    }
    async onModuleDestroy() {
        this.logger.log('Shutting down Trade Engine Service...');
        this.disconnect();
    }
    async connectToBinance() {
        try {
            const streams = this.buildStreamUrls();
            if (streams.length === 0) {
                this.logger.log('No symbols subscribed, skipping WebSocket connection');
                return;
            }
            const wsUrl = `wss://stream.binance.com:9443/stream?streams=${streams.join('/')}`;
            this.logger.log(`Connecting to Binance WebSocket with streams: ${streams.join(', ')}`);
            this.ws = new WebSocket(wsUrl);
            this.ws.on('open', () => {
                this.logger.log('Connected to Binance WebSocket');
                this.isConnected = true;
                this.reconnectAttempts = 0;
            });
            this.ws.on('message', (data) => {
                try {
                    const message = JSON.parse(data.toString());
                    this.processPriceUpdates(message);
                }
                catch (error) {
                    this.logger.error('Error parsing WebSocket data:', error);
                }
            });
            this.ws.on('close', (code, reason) => {
                this.logger.warn(`WebSocket closed: ${code} - ${reason}`);
                this.isConnected = false;
                this.handleReconnection();
            });
            this.ws.on('error', (error) => {
                this.logger.error('WebSocket error:', error);
                this.isConnected = false;
                this.handleReconnection();
            });
        }
        catch (error) {
            this.logger.error('Failed to connect to Binance WebSocket:', error);
            this.handleReconnection();
        }
    }
    handleReconnection() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            this.logger.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
            setTimeout(() => {
                this.connectToBinance();
            }, this.reconnectInterval);
        }
        else {
            this.logger.error('Max reconnection attempts reached. Manual intervention required.');
        }
    }
    buildStreamUrls() {
        const streams = [];
        for (const symbol of this.subscribedSymbols) {
            streams.push(`${symbol.toLowerCase()}@ticker`);
        }
        return streams;
    }
    processPriceUpdates(message) {
        if (message.stream && message.data) {
            const symbol = message.data.s;
            const price = parseFloat(message.data.c);
            const volume = parseFloat(message.data.v);
            const timestamp = new Date();
            if (this.subscribedSymbols.has(symbol)) {
                const priceUpdate = {
                    symbol,
                    price,
                    timestamp,
                    volume,
                };
                this.checkPriceLimits(priceUpdate);
                this.emitPriceUpdate(priceUpdate);
            }
        }
        else if (Array.isArray(message)) {
            for (const ticker of message) {
                const symbol = ticker.s;
                const price = parseFloat(ticker.c);
                const volume = parseFloat(ticker.v);
                const timestamp = new Date();
                if (this.subscribedSymbols.has(symbol)) {
                    const priceUpdate = {
                        symbol,
                        price,
                        timestamp,
                        volume,
                    };
                    this.checkPriceLimits(priceUpdate);
                    this.emitPriceUpdate(priceUpdate);
                }
            }
        }
    }
    checkPriceLimits(priceUpdate) {
        const { symbol, price } = priceUpdate;
        for (const [limitId, limit] of this.priceLimits.entries()) {
            if (limit.symbol === symbol && !limit.triggered) {
                let isTriggered = false;
                switch (limit.condition) {
                    case 'ABOVE':
                        isTriggered = price > limit.limitPrice;
                        break;
                    case 'BELOW':
                        isTriggered = price < limit.limitPrice;
                        break;
                    case 'EQUAL':
                        isTriggered =
                            Math.abs(price - limit.limitPrice) < limit.limitPrice * 0.001;
                        break;
                }
                if (isTriggered) {
                    this.triggerPriceLimit(limitId, priceUpdate);
                }
            }
        }
    }
    triggerPriceLimit(limitId, priceUpdate) {
        const limit = this.priceLimits.get(limitId);
        if (!limit)
            return;
        limit.triggered = true;
        limit.triggeredAt = new Date();
        this.logger.log(`Price limit triggered: ${limitId} - ${limit.symbol} ${limit.condition} ${limit.limitPrice} at ${priceUpdate.price}`);
        this.eventEmitter.emit(eventsType_1.EventsType.PRICE_LIMIT_TRIGGERED, {
            limitId,
            limit,
            priceUpdate,
            triggeredAt: new Date(),
        });
        if (limit.orderId) {
            this.eventEmitter.emit(eventsType_1.EventsType.ORDER_TRIGGERED, {
                orderId: limit.orderId,
                userId: limit.userId,
                symbol: limit.symbol,
                triggerPrice: priceUpdate.price,
                limitPrice: limit.limitPrice,
                condition: limit.condition,
                triggeredAt: new Date(),
            });
        }
        this.priceLimits.delete(limitId);
    }
    emitPriceUpdate(priceUpdate) {
        this.eventEmitter.emit(eventsType_1.EventsType.PRICE_UPDATED, {
            symbol: priceUpdate.symbol,
            price: priceUpdate.price,
            timestamp: priceUpdate.timestamp,
            volume: priceUpdate.volume,
        });
    }
    addPriceLimit(limit) {
        const limitId = `limit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const priceLimit = {
            ...limit,
            id: limitId,
            createdAt: new Date(),
            triggered: false,
        };
        this.priceLimits.set(limitId, priceLimit);
        const wasSubscribed = this.subscribedSymbols.has(limit.symbol);
        this.subscribedSymbols.add(limit.symbol);
        this.logger.log(`Added price limit: ${limitId} for ${limit.symbol} ${limit.condition} ${limit.limitPrice}`);
        if (!wasSubscribed && this.isConnected) {
            this.logger.log(`New symbol ${limit.symbol} added, reconnecting to update streams...`);
            this.disconnect();
            setTimeout(() => this.connectToBinance(), 1000);
        }
        else if (!this.isConnected) {
            this.connectToBinance();
        }
        return limitId;
    }
    removePriceLimit(limitId) {
        const limit = this.priceLimits.get(limitId);
        if (limit) {
            this.priceLimits.delete(limitId);
            const hasOtherLimits = Array.from(this.priceLimits.values()).some((l) => l.symbol === limit.symbol);
            if (!hasOtherLimits) {
                this.subscribedSymbols.delete(limit.symbol);
            }
            this.logger.log(`Removed price limit: ${limitId}`);
            return true;
        }
        return false;
    }
    async getCurrentPrice(symbol) {
        try {
            const response = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`);
            const data = await response.json();
            return parseFloat(data.price);
        }
        catch (error) {
            this.logger.error(`Error fetching current price for ${symbol}:`, error);
            return null;
        }
    }
    getActivePriceLimits() {
        return Array.from(this.priceLimits.values());
    }
    getPriceLimitsForSymbol(symbol) {
        return Array.from(this.priceLimits.values()).filter((limit) => limit.symbol === symbol);
    }
    getConnectionStatus() {
        return {
            isConnected: this.isConnected,
            subscribedSymbols: Array.from(this.subscribedSymbols),
            activeLimits: this.priceLimits.size,
        };
    }
    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        this.isConnected = false;
    }
    handleTradeEngineEvent(event) {
        this.logger.log('Trade engine event received:', event);
        let condition = '';
        if (event.type === orders_1.OrderType.MARKET) {
            if (event.uuid) {
                this.eventEmitter.emit(eventsType_1.EventsType.ORDER_TRIGGERED, {
                    orderId: event.uuid,
                    userId: event.userId.toString(),
                    symbol: event.symbol,
                    triggerPrice: event.price,
                    amount: event.quantity,
                    limitPrice: event.price,
                    condition: event.side === orders_1.OrderSide.BUY ? 'BELOW' : 'ABOVE',
                    triggeredAt: new Date(),
                });
            }
        }
        switch (event.type) {
            case orders_1.OrderType.LIMIT:
                condition = event.side === orders_1.OrderSide.BUY ? 'BELOW' : 'ABOVE';
                break;
            case orders_1.OrderType.MARKET:
                condition = 'EQUAL';
                break;
            case orders_1.OrderType.STOP_LOSS:
                condition = event.side === orders_1.OrderSide.BUY ? 'ABOVE' : 'BELOW';
                break;
            case orders_1.OrderType.STOP_LOSS_LIMIT:
                condition = 'BELOW';
                break;
            case orders_1.OrderType.TAKE_PROFIT:
                condition = event.side === orders_1.OrderSide.SELL ? 'ABOVE' : 'BELOW';
                break;
            case orders_1.OrderType.TAKE_PROFIT_LIMIT:
                condition = 'ABOVE';
                break;
        }
        this.addPriceLimit({
            symbol: event.symbol,
            amount: event.quantity,
            limitPrice: event.price,
            condition: condition,
            orderId: event.uuid,
            userId: event.userId.toString(),
        });
        this.logger.log('Price limit added:', event);
    }
    subscribeToSymbol(symbol) {
        this.subscribedSymbols.add(symbol);
        this.logger.log(`Subscribed to symbol: ${symbol}`);
        if (this.isConnected) {
            this.logger.log('Reconnecting to update symbol subscriptions...');
            this.disconnect();
            setTimeout(() => this.connectToBinance(), 1000);
        }
        else {
            this.connectToBinance();
        }
    }
    unsubscribeFromSymbol(symbol) {
        const limitsToRemove = Array.from(this.priceLimits.entries())
            .filter(([_, limit]) => limit.symbol === symbol)
            .map(([id, _]) => id);
        limitsToRemove.forEach((id) => this.priceLimits.delete(id));
        this.subscribedSymbols.delete(symbol);
        this.logger.log(`Unsubscribed from symbol: ${symbol}`);
        if (this.isConnected) {
            this.logger.log('Reconnecting to update symbol subscriptions...');
            this.disconnect();
            setTimeout(() => this.connectToBinance(), 1000);
        }
    }
};
exports.TradeEngineService = TradeEngineService;
exports.TradeEngineService = TradeEngineService = TradeEngineService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [event_emitter_1.EventEmitter2])
], TradeEngineService);
//# sourceMappingURL=trade-engine.service.js.map