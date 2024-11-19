import axios from "axios";
import pm2 from "pm2";
import dotenv from "dotenv";

dotenv.config();

const DISCORD_WEBHOOK_URL =
  "https://discord.com/api/webhooks/1305549502849089576/lYfnxNsiFXYK0nqliEpiTOR1vdn79VU9B0NELjXKonqGzK05rtKBVsTS4U4tXJzBzFVS";
const TARGET_PROCESS_NAME = "main"; // Replace with your process name
const DISCORD_USER_ID = "1012662436584759378";

if (!DISCORD_WEBHOOK_URL) {
  throw new Error("The DISCORD_WEBHOOK_URL environment variable is not set.");
}

const getTimestamp = (): string => new Date().toISOString();

async function sendLogToDiscord(
  content: string,
  isError: boolean = false,
  additionalFields: any[] = []
): Promise<void> {
  try {
    const embed = {
      title: isError ? "Error Log" : "Output Log",
      description: content,
      color: isError ? 0xff0000 : 0x00ff00, // Red for error, Green for output
      timestamp: getTimestamp(),
      footer: {
        text: `PM2 Process: ${TARGET_PROCESS_NAME}`,
      },
      fields: [
        ...additionalFields, // Dynamically add extra fields
        {
          name: "Process Name",
          value: TARGET_PROCESS_NAME,
          inline: true,
        },
      ],
    };

    // Add user mention for errors
    const messageContent = isError
      ? `<@${DISCORD_USER_ID}> 🚨 **Attention Required!**\n`
      : "";

    await axios.post(DISCORD_WEBHOOK_URL as string, {
      content: messageContent, // Tags the user
      embeds: [embed],
    });
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

  // Handle Standard Logs
  // bus.on("log:out", (packet: any) => {
  //   if (packet.process.name === TARGET_PROCESS_NAME) {
  //     const logMessage = `[INFO] [${packet.process.name}] ${packet.data}`;
  //     console.log(logMessage);
  //     sendLogToDiscord(logMessage, false, [
  //       { name: "Log Type", value: "Standard Output", inline: true },
  //     ]);
  //   }
  // });

  // Handle Error Logs
  bus.on("log:err", (packet: any) => {
    if (packet.process.name === TARGET_PROCESS_NAME) {
      const errorMessage = `[ERROR] [${packet.process.name}] ${packet.data}`;
      console.error("Error Log:", errorMessage);
      sendLogToDiscord(errorMessage, true, [
        { name: "Log Type", value: "Error", inline: true },
      ]);
    }
  });

  // Handle Process Exits
  bus.on("process:exit", (packet: any) => {
    if (packet.process && packet.process.name === TARGET_PROCESS_NAME) {
      const exitCode = packet.process.exit_code ?? "N/A";
      const reason = packet.process.exit_reason ?? "Unknown";
      const crashMessage = `⚠️ [${packet.process.name}] Process exited. Exit code: ${exitCode}. Reason: ${reason}`;
      console.error(crashMessage);
      sendLogToDiscord(crashMessage, true, [
        { name: "Exit Code", value: `${exitCode}`, inline: true },
        { name: "Reason", value: reason, inline: true },
        {
          name: "Process ID",
          value: `${packet.process.pm_id ?? "N/A"}`,
          inline: true,
        },
      ]);
    }
  });
});
