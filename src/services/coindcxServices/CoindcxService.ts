import axios from "axios";
import dotenv from "dotenv";
import getSignature from "./getSignature";

dotenv.config();

interface CreateFuturesOrderParams {
  side: "buy" | "sell";
  pair: string;
  order_type:
    | "market_order"
    | "limit_order"
    | "stop_limit"
    | "stop_market"
    | "take_profit_limit"
    | "take_profit_market";
  price?: number;
  stop_price?: number;
  total_quantity: number;
  leverage?: number;
  notification?: "no_notification" | "email_notification";
  time_in_force?: "good_till_cancel" | "fill_or_kill" | "immediate_or_cancel";
  margin_currency_short_name?: "INR" | "USDT";
  position_margin_type?: "isolated" | "crossed";
  take_profit_price?: number;
  stop_loss_price?: number;
}

interface CancelOrderParams {
  orderId: string;
}

interface EditFuturesOrderParams {
  orderId: string;
  total_quantity: number;
  price: number;
  take_profit_price?: number;
  stop_loss_price?: number;
}

interface UpdateTakeProfitParams {
  orderId: string;
  take_profit_price: number;
}

interface UpdateStopLossParams {
  orderId: string;
  stop_loss_price: number;
}

interface GetOrdersParams {
  status:
    | "open"
    | "filled"
    | "partially_filled"
    | "partially_cancelled"
    | "cancelled"
    | "rejected"
    | "untriggered";
  side: "buy" | "sell";
  page: string;
  size: string;
  margin_currency_short_name?: ("INR" | "USDT")[];
}

export class CoindcxService {
  private readonly baseurl: string;
  private readonly apiKey: string;
  private readonly secretKey: string;

  constructor() {
    this.baseurl = "https://api.coindcx.com";
    this.apiKey = process.env.COINDCX_API_KEY || "";
    this.secretKey = process.env.COINDCX_SECRET_KEY || "";

    if (!this.apiKey || !this.secretKey) {
      throw new Error("API credentials not found in environment variables");
    }
  }

  private getTimestamp(): number {
    return Math.floor(Date.now());
  }

  private getHeaders(body: any) {
    const signature = getSignature(body, this.secretKey);
    return {
      "X-AUTH-APIKEY": this.apiKey,
      "X-AUTH-SIGNATURE": signature,
    };
  }

  async getPositions() {
    const body = {
      timestamp: this.getTimestamp(),
      page: "1",
      size: "10",
      margin_currency_short_name: ["USDT", "INR"],
    };

    try {
      const response = await axios.post(
        this.baseurl + "/exchange/v1/derivatives/futures/positions",
        body,
        {
          headers: this.getHeaders(body),
        }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`API request failed: ${error.message}`);
      }
      throw error;
    }
  }

  async createFuturesOrder({
    side,
    pair,
    order_type,
    price,
    stop_price,
    total_quantity,
    leverage,
    notification = "no_notification",
    time_in_force = "good_till_cancel",
    margin_currency_short_name = "USDT",
    position_margin_type,
    take_profit_price,
    stop_loss_price,
  }: CreateFuturesOrderParams) {
    const body = {
      timestamp: this.getTimestamp(),
      order: {
        side,
        pair,
        order_type,
        price,
        stop_price,
        total_quantity,
        leverage,
        notification,
        time_in_force,
        margin_currency_short_name,
        position_margin_type,
        take_profit_price,
        stop_loss_price,
      },
    };
    try {
      const response = await axios.post(
        this.baseurl + "/exchange/v1/derivatives/futures/orders/create",
        body,
        {
          headers: this.getHeaders(body),
        }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // console.log(error.response && error.response);
        throw new Error(`Failed to create futures order: ${error.message}`);
      }
      throw error;
    }
  }

  async cancelOrder({ orderId }: CancelOrderParams) {
    const body = {
      timestamp: this.getTimestamp(),
      id: orderId,
    };

    try {
      const response = await axios.post(
        this.baseurl + "/exchange/v1/derivatives/futures/orders/cancel",
        body,
        {
          headers: this.getHeaders(body),
        }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Failed to cancel order: ${error.message}`);
      }
      throw error;
    }
  }

  async getWalletDetails() {
    const body = {
      timestamp: this.getTimestamp(),
    };

    try {
      const response = await axios.get(
        this.baseurl + "/exchange/v1/derivatives/futures/wallets",
        {
          headers: this.getHeaders(body),
          params: body,
        }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          `Failed to get wallet details: ${error.message} ${
            error.response ? error.response.data : ""
          }`
        );
      }
      throw error;
    }
  }

  async editFuturesOrder({
    orderId,
    total_quantity,
    price,
    take_profit_price,
    stop_loss_price,
  }: EditFuturesOrderParams) {
    const body = {
      timestamp: this.getTimestamp(),
      id: orderId,
      total_quantity,
      price,
      take_profit_price,
      stop_loss_price,
    };

    try {
      const response = await axios.post(
        this.baseurl + "/exchange/v1/derivatives/futures/orders/edit",
        body,
        {
          headers: this.getHeaders(body),
        }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Failed to edit futures order: ${error.message}`);
      }
      throw error;
    }
  }

  async updateTakeProfit({
    orderId,
    take_profit_price,
  }: UpdateTakeProfitParams) {
    const body = {
      timestamp: this.getTimestamp(),
      id: orderId,
      take_profit_price,
    };

    try {
      const response = await axios.post(
        this.baseurl + "/exchange/v1/derivatives/futures/orders/edit",
        body,
        {
          headers: this.getHeaders(body),
        }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Failed to update take profit: ${error.message}`);
      }
      throw error;
    }
  }

  async updateStopLoss({ orderId, stop_loss_price }: UpdateStopLossParams) {
    const body = {
      timestamp: this.getTimestamp(),
      id: orderId,
      stop_loss_price,
    };

    try {
      const response = await axios.post(
        this.baseurl + "/exchange/v1/derivatives/futures/orders/edit",
        body,
        {
          headers: this.getHeaders(body),
        }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Failed to update stop loss: ${error.message}`);
      }
      throw error;
    }
  }

  async getOrders({
    status,
    side,
    page,
    size,
    margin_currency_short_name = ["USDT"],
  }: GetOrdersParams) {
    const body = {
      timestamp: this.getTimestamp(),
      status,
      side,
      page,
      size,
      margin_currency_short_name,
    };

    try {
      const response = await axios.post(
        this.baseurl + "/exchange/v1/derivatives/futures/orders",
        body,
        {
          headers: this.getHeaders(body),
        }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Failed to fetch orders: ${error.message}`);
      }
      throw error;
    }
  }

  // Add more methods here for other API endpoints
  // For example:
  // async getOrderBook(pair: string) { ... }
  // async getBalance() { ... }
}
