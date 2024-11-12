# PM2 Discord Logger

This project provides a simple script (`pm2-discord-logger.ts`) to send PM2 logs to a Discord webhook. It connects to the PM2 log stream and sends log messages for a specified process directly to a Discord channel.

## Prerequisites

- [Node.js](https://nodejs.org/) (latest stable version recommended)
- [PM2](https://pm2.keymetrics.io/) for process management
- [Discord Webhook URL](https://support.discord.com/hc/en-us/articles/228383668-Intro-to-Webhooks) (You need to set up a webhook in Discord for the channel where you want logs to be posted)

## Setup

1. Clone the repository or copy `pm2-discord-logger.ts` to your local project.

2. Install dependencies:

   ```bash
   npm install pm2 axios dotenv
   ```

3. Create a `.env` file in the project root and add your Discord webhook URL:

   ```plaintext
   DISCORD_WEBHOOK_URL=<your_discord_webhook_url>
   ```

4. Update `pm2-discord-logger.ts`:

   - Set the `TARGET_PROCESS_NAME` variable to the name of the PM2 process you want to monitor.

5. Start the logger using PM2:

   ```bash
   pm2 start pm2-discord-logger.ts --name pm2-discord-logger
   ```

## Usage

The script listens to the PM2 log stream and sends formatted log messages to Discord. It includes both `log:out` (standard output) and `log:err` (error output) for the specified PM2 process.

### Log Format

Each log sent to Discord will include:

- **Process Name**: The name of the process as defined in PM2.
- **Timestamp**: The time when the log was generated.
- **Log Level**: `INFO` for standard logs, `ERROR` for error logs.
- **Message Content**: The actual log message.

Example of log message structure in Discord:

- `[Process Name - INFO] <log message>`
- `[Process Name - ERROR] <error message>`

## Enhancements and Customization

You can customize the message format, add additional data, or style the message further by modifying the `sendLogToDiscord` function in `pm2-discord-logger.ts`.

## Troubleshooting

1. **No logs are being sent to Discord**:

   - Verify that the `DISCORD_WEBHOOK_URL` is set correctly in the `.env` file.
   - Ensure that the `TARGET_PROCESS_NAME` matches the name of the process managed by PM2.

2. **Permission issues**:
   - You may need to run PM2 with appropriate permissions or as a specific user.

## License

This project is open-source and available for modification to suit your needs.
