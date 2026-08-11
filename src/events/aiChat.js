```js
import { Events } from 'discord.js';
import { generateAIResponse } from '../services/aiService.js';

export default {
    name: Events.MessageCreate,
    once: false,

    async execute(message) {
        // Ignore bots, including itself
        if (message.author.bot) {
            return;
        }

        // Only respond when the bot is mentioned
        if (!message.mentions.has(message.client.user)) {
            return;
        }

        try {
            // Remove the bot mention from the message
            const userMessage = message.content
                .replace(
                    new RegExp(`<@!?${message.client.user.id}>`, 'g'),
                    ''
                )
                .trim();

            if (!userMessage) {
                await message.reply(
                    'Hey 😏 You called? Say something to me.'
                );
                return;
            }

            // Show Discord's typing indicator
            await message.channel.sendTyping();

            const response = await generateAIResponse(userMessage);

            // Discord messages have a 2000-character limit
            if (response.length <= 2000) {
                await message.reply(response);
                return;
            }

            // Split longer AI responses into chunks
            for (let i = 0; i < response.length; i += 1900) {
                await message.channel.send(
                    response.slice(i, i + 1900)
                );
            }
        } catch (error) {
            console.error('AI message error:', error);

            await message.reply(
                "Oops 😭 my brain just disconnected for a second."
            ).catch(() => {});
        }
    },
};
```
