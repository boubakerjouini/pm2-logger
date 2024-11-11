import axios from "axios";
import pm2 from "pm2";

const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;
const TARGET_PROCESS_NAME = "website"; // Replace with your website process name

if (!DISCORD_WEBHOOK_URL) {
  throw new Error("The DISCORD_WEBHOOK_URL environment variable is not set.");
}

async function sendLogToDiscord(content: string): Promise<void> {
  try {
    await axios.post(DISCORD_WEBHOOK_URL as string, { content });
  } catch (error) {
    console.error("Error sending log to Discord:", error);
  }
}

pm2.launchBus((err: Error | null, bus: any) => {
  if (err) {
    console.error("Error launching PM2 Bus:", err);
    return;
  }

  console.log("Connected to PM2 log stream...");

  sendLogToDiscord("Connected to logs stream...");

  bus.on("log:out", (packet: any) => {
    if (packet.process.name === TARGET_PROCESS_NAME) {
      const logMessage = `[${packet.process.name}] ${packet.data}`;
      console.log("Log:", logMessage);
      sendLogToDiscord(logMessage);
    }
  });

  bus.on("log:err", (packet: any) => {
    if (packet.process.name === TARGET_PROCESS_NAME) {
      const errorMessage = `[${packet.process.name} ERROR] ${packet.data}`;
      console.error("Error Log:", errorMessage);
      sendLogToDiscord(errorMessage);
    }
  });
});
