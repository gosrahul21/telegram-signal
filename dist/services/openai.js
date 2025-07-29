"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _this = this;
exports.__esModule = true;
require("dotenv").config(); // Load environment variables
var techincalIndicators_1 = require("../utils/helper/techincalIndicators");
var fs_1 = __importDefault(require("fs"));
// const { Configuration, OpenAIApi } = require("openai");
var openai_1 = __importDefault(require("openai"));
// Set up OpenAI configuration
// const configuration = new Configuration({
//   apiKey: process.env.OPENAI_API_KEY,
// });
// const openai = new OpenAIApi(configuration);
var OPENAI_API_KEY = "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";
var client = new openai_1["default"]({
    apiKey: OPENAI_API_KEY
});
function getTechnicalAnalysis(data) {
    return __awaiter(this, void 0, void 0, function () {
        var prompt_1, completion, analysis, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    prompt_1 = "\n    You are a financial analyst specializing in technical analysis.\n    \n    Given the following data across multiple timeframes:\n    \n    " + data + "\n    \n    Provide a concise analysis with:\n    - **Trend Direction**: Bullish, Bearish, or Sideways.\n    - **Key Buy/Sell Signals**: Based on MACD, RSI, and EMAs.\n    - **Optimal Entry & Exit**: Entry price, stop loss, and take profit.\n    - **Risk Warnings**: Any divergences or trend reversals.\n    \n    Keep responses **brief, actionable, and data-driven**.\n    ";
                    return [4 /*yield*/, client.chat.completions.create({
                            model: "gpt-4o-mini",
                            messages: [
                                {
                                    role: "system",
                                    content: "You are a financial analyst specializing in technical analysis."
                                },
                                { role: "user", content: prompt_1 },
                            ]
                        })];
                case 1:
                    completion = _a.sent();
                    analysis = completion.choices[0].message.content;
                    // Save response to a file
                    return [2 /*return*/, analysis];
                case 2:
                    error_1 = _a.sent();
                    console.error("Error fetching analysis from OpenAI:", error_1);
                    throw error_1;
                case 3: return [2 /*return*/];
            }
        });
    });
}
var main = function (symbol) { return __awaiter(_this, void 0, void 0, function () {
    var prompt, _a, finalPrompt;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, techincalIndicators_1.getIndicatorOnTimeFrame(symbol, "1M")];
            case 1:
                _a = [
                    _b.sent()
                ];
                return [4 /*yield*/, techincalIndicators_1.getIndicatorOnTimeFrame(symbol, "1w")];
            case 2:
                _a = _a.concat([
                    _b.sent()
                ]);
                return [4 /*yield*/, techincalIndicators_1.getIndicatorOnTimeFrame(symbol, "1d")];
            case 3:
                prompt = _a.concat([
                    _b.sent()
                ]).join("\n\n");
                console.log(prompt);
                finalPrompt = "\n  You are a financial analyst specializing in technical analysis.\n  \n  Given the following data across multiple timeframes:\n  \n  " + prompt + "\n  \n provide technical analysis with overall market prediction\n.\n  ";
                //   console.log(finalPrompt);
                fs_1["default"].writeFileSync("prompt_" + symbol + ".txt", finalPrompt, "utf8");
                return [2 /*return*/];
        }
    });
}); };
main("SUIUSDT");
