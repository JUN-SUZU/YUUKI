const { ActionRowBuilder, ActivityType, Client, Collection, EmbedBuilder, Events, GatewayIntentBits, PermissionsBitField } = require('discord.js');
const config = require('./config.json');
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessageTyping,
        GatewayIntentBits.MessageContent
    ]
});

client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}`);
    client.user.setActivity('Yuuki', { type: ActivityType.Game });
});

client.on(Events.MessageCreate, async (message) => {
    spamProtection(message);
});

function spamProtection(message) {
    const { author, guild, member } = message;
    if (author.bot || !guild || !member) return;
    const { roles } = member;
    const { cache } = roles;
    const mutedRole = cache.find(role => role.name === 'Muted');
    if (mutedRole) {
        message.delete();
        return;
    }
    const { content } = message;
    const { spam } = client;
    if (!spam.has(author.id)) {
        spam.set(author.id, new Collection());
    }
    const timestamps = spam.get(author.id);
    const now = Date.now();
    timestamps.set(now, content);
    setTimeout(() => {
        timestamps.delete(now);
        if (!timestamps.size) {
            spam.delete(author.id);
        }
    }, 5000);
    if (timestamps.size > 5) {
        message.delete();
        const { channel } = message;
        const member = guild.members.cache.get(author.id);
        member.roles.add(mutedRole);
        channel.send(`${author}, you have been muted for spamming!`);
    }
}

client.login(config.token);
