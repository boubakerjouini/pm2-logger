"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const pm2_1 = __importDefault(require("pm2"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;
const TARGET_PROCESS_NAME = "website"; // Replace with your website process name
if (!DISCORD_WEBHOOK_URL) {
    throw new Error("The DISCORD_WEBHOOK_URL environment variable is not set.");
}
function sendLogToDiscord(content) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield axios_1.default.post(DISCORD_WEBHOOK_URL, { content });
        }
        catch (error) {
            console.error("Error sending log to Discord:", error);
        }
    });
}
pm2_1.default.launchBus((err, bus) => {
    if (err) {
        console.error("Error launching PM2 Bus:", err);
        return;
    }
    console.log("Connected to PM2 log stream...");
    sendLogToDiscord("Connected to logs stream...");
    bus.on("log:out", (packet) => {
        if (packet.process.name === TARGET_PROCESS_NAME) {
            const logMessage = `[${packet.process.name}] ${packet.data}`;
            console.log("Log:", logMessage);
            sendLogToDiscord(logMessage);
        }
    });
    bus.on("log:err", (packet) => {
        if (packet.process.name === TARGET_PROCESS_NAME) {
            const errorMessage = `[${packet.process.name} ERROR] ${packet.data}`;
            console.error("Error Log:", errorMessage);
            sendLogToDiscord(errorMessage);
        }
    });
});
