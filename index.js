const { Client } = require('discord.js-selfbot-v13');
const { token } = require('./config.json');
const client = new Client({
	// See other options here
	// https://discordjs-self-v13.netlify.app/#/docs/docs/main/typedef/ClientOptions
	// All partials are loaded automatically
});

const fs = require('fs');

client.on('ready', async () => {
    console.log(`${client.user.username} is ready!`);
    client.user.setActivity('Scraping for CGI', { type: 'WATCHING' });

    const guilds = [
        "905883547997446215",
        "782472880876683264",
        "974662407202930708"
    ]

    const channels = [
        "965916560373989377",
        "1145966877177299004",
        "1063512815601721364"
    ]

    let messagesArray = [];
    let lastMessageId = null;
    let fetchedMessages = 0;
    const limit = 100;
    const totalMessages = 50000;

    for (let i = 0; i < guilds.length; i++) {
        const guild = client.guilds.cache.get(guilds[i]);
        for (let j = 0; j < channels.length; j++) {
            const channel = guild.channels.cache.get(channels[j]);
            while (fetchedMessages < totalMessages) {
                const options = { limit: Math.min(totalMessages - fetchedMessages, limit) };
                if (lastMessageId) {
                    options.before = lastMessageId;
                }
                const messages = await channel.messages.fetch(options);
                if (messages.size === 0) {
                    break;
                }
                fetchedMessages += messages.size;
                lastMessageId = messages.last().id;
                messagesArray = messagesArray.concat(messages.map(message => {
                    return {
                        author: message.author.username,
                        content: message.content,
                        timestamp: message.createdTimestamp
                    }
                }));
                let percent = Math.round((fetchedMessages / totalMessages) * 100);
                console.log(`Fetched ${messages.size} messages from ${guild.name} | ${channel.name} | ${percent}%`);
            }
        }
    }

    fs.writeFile('messages.json', JSON.stringify(messagesArray), (err) => {
        if (err) throw err;
        console.log('Messages saved to file!');

        // Quit the process
        console.log('Quitting in 3 seconds...');
        setTimeout(() => {
            process.exit(0);
        }, 3000);
    });
})

client.login(token);