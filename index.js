require('dotenv').config();
const { Client, GatewayIntentBits, Partials } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Message, Partials.Channel],
});

client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
    console.log(`📩 New message received in #${message.channel.name}: ${message.content}`);

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
        // Limit message content to 100 characters (if available)
        const messagePreview = message.content.length > 100 
            ? message.content.substring(0, 100) + "..."  // If longer than 100, add "..."
            : message.content;  // Otherwise, use full message
        
        // Construct thread name with date + message preview
        const threadName = `Update - ${new Date().toLocaleDateString()} | ${messagePreview}`;

        console.log(`✅ Creating a thread: "${threadName}"`);
        
        const thread = await message.startThread({
            name: threadName,
            autoArchiveDuration: 1440, // Auto-archive after 24 hours
        });

        console.log(`🧵 Thread created: ${thread.name}`);
    } catch (error) {
        console.error('❌ Error creating thread:', error);
    }
});

client.login(process.env.DISCORD_TOKEN);
