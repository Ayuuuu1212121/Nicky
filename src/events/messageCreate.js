import { Events } from 'discord.js';
import { generateAIResponse } from '../services/aiService.js';

export default {
    name: Events.MessageCreate,

    async execute(message, client) {
        try {
            // Ignore bots
            if (message.author.bot) {
                return;
            }

            // Ignore DMs
            if (!message.guild) {
                return;
            }

            console.log(
                `[AI TEST] Message received: ${message.author.tag}: ${message.content}`
            );

            // Check whether the bot was mentioned
            if (!client.user) {
                console.log('[AI TEST] client.user is not ready');
                return;
            }

            if (!message.mentions.has(client.user)) {
                console.log('[AI TEST] Bot was NOT mentioned');
                return;
            }

            console.log('[AI TEST] BOT MENTION DETECTED');

            // Remove bot mention
            const mentionRegex = new RegExp(
                `<@!?${client.user.id}>`,
                'g'
            );

            const userMessage = message.content
                .replace(mentionRegex, '')
                .trim();

            console.log(
                `[AI TEST] User message: "${userMessage}"`
            );

            if (!userMessage) {
                await message.reply(
                    'Hey 😏 You called me? Say something.'
                );
                return;
            }

            await message.channel.sendTyping();

            console.log('[AI TEST] Calling Gemini...');

            const response = await generateAIResponse(userMessage);

            console.log(
                `[AI TEST] Gemini response: "${response}"`
            );

            if (!response) {
                await message.reply(
                    'My AI brain returned nothing 😭'
                );
                return;
            }

            await message.reply(response);

            console.log('[AI TEST] Reply sent successfully.');

        } catch (error) {
            console.error(
                '[AI TEST] ERROR:',
                error
            );

            await message.reply(
                'Something went wrong with my AI brain 😭'
            ).catch(() => {});
        }
    },
};
