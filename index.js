require("dotenv").config();
const { Client, GatewayIntentBits, Partials } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Message, Partials.Channel],
});

client.once("ready", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  console.log(
    `📩 New message received in #${message.channel.name}: ${message.content}`
  );

  if (message.author.bot && message.webhookId === null) {
    console.log(`🤖 Ignoring regular bot message from ${message.author.tag}`);
    return;
  }

  // Only respond to messages in the followed channel
  const followedChannelId = process.env.CHANNEL_ID;
  if (message.channel.id !== followedChannelId) {
    console.log(`❌ Message is not from the followed channel.`);
    return;
  }

  try {
    // Extract message content and sanitize Markdown
    let messagePreview = message.content
      .replace(/\[.*?\]\(.*?\)/g, "") // Remove Markdown links [text](url)
      .replace(/[#*_`~[\]]/g, "") // Remove headers, bold, italics, brackets, and other Markdown symbols
      .replace(/\s+/g, " ") // Replace multiple spaces with a single space
      .trim(); // Remove leading/trailing spaces

    // Hard limit preview to 80 characters (to leave space for "Update - DATE |")
    if (messagePreview.length > 80) {
      messagePreview = messagePreview.substring(0, 80) + "...";
    }

    // Construct thread name safely
    const threadName = `Update - ${new Date().toLocaleDateString()} | ${messagePreview}`;

    console.log(`✅ Creating a thread: "${threadName}"`);

    const thread = await message.startThread({
      name: threadName,
      autoArchiveDuration: 1440, // Auto-archive after 24 hours
    });

    console.log(`🧵 Thread created: ${thread.name}`);
  } catch (error) {
    console.error("❌ Error creating thread:", error);
  }
});

client.login(process.env.DISCORD_TOKEN);
