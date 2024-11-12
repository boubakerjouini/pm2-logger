import axios from "axios";
import pm2 from "pm2";
import dotenv from "dotenv";

dotenv.config();

const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;
const TARGET_PROCESS_NAME = "website"; // Replace with your website process name

console.log("DISCORD_WEBHOOK_URL", DISCORD_WEBHOOK_URL);
if (!DISCORD_WEBHOOK_URL) {
  throw new Error("The DISCORD_WEBHOOK_URL environment variable is not set.");
}

const getTimestamp = () => new Date().toISOString();

async function sendLogToDiscord(
  content: string,
  isError: boolean = false
): Promise<void> {
  try {
    const embed = {
      title: isError ? "Error Log" : "Output Log",
      description: content,
      color: isError ? 0xff0000 : 0x00ff00, // Red for error, Green for output
      timestamp: getTimestamp(), // Adds the current timestamp
      footer: {
        text: `PM2 Process: ${TARGET_PROCESS_NAME}`,
      },
      fields: [
        {
          name: "Process ID",
          value: "N/A", // Optionally include the PID here
          inline: true,
        },
        {
          name: "Process Name",
          value: TARGET_PROCESS_NAME,
          inline: true,
        },
      ],
    };

    await axios.post(DISCORD_WEBHOOK_URL as string, { embeds: [embed] });
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
      sendLogToDiscord(logMessage); // Send as regular log
    }
  });

  bus.on("log:err", (packet: any) => {
    if (packet.process.name === TARGET_PROCESS_NAME) {
      const errorMessage = `[${packet.process.name} ERROR] ${packet.data}`;
      console.error("Error Log:", errorMessage);
      sendLogToDiscord(errorMessage, true); // Send as error log
    }
  });
});
