
import { Events } from 'discord.js';
import { generateAIResponse } from '../services/aiService.js';

console.log('🤖 AI CHAT EVENT FILE LOADED');

export default {
    name: Events.MessageCreate,
    once: false,

    async execute(message) {
        console.log(
            `🤖 Message event received: ${message.author?.tag || 'unknown'}`
        );

        // Ignore bots
        if (message.author?.bot) {
            return;
        }

        // Make sure the bot is ready
        if (!message.client.user) {
            console.log('⚠️ Bot user is not ready yet.');
            return;
        }

        // Only respond when the bot is mentioned
        if (!message.mentions.has(message.client.user)) {
            return;
        }

        console.log(
            `🤖 Bot was mentioned by ${message.author.tag}`
        );

        try {
            // Remove the bot mention
            const mentionRegex = new RegExp(
                `<@!?${message.client.user.id}>`,
                'g'
            );

            const userMessage = message.content
                .replace(mentionRegex, '')
                .trim();

            console.log(
                `💬 User message: "${userMessage}"`
            );

            // If they only mention the bot
            if (!userMessage) {
                await message.reply(
                    'Hey 😏 You called me? Say something.'
                );

                return;
            }

            // Show Discord typing indicator
            await message.channel.sendTyping();

            console.log('🧠 Sending message to AI...');

            const response = await generateAIResponse(
                userMessage
            );

            console.log('✅ AI response received.');

            // Make sure we actually received text
            if (
                !response ||
                typeof response !== 'string'
            ) {
                console.error(
                    '❌ AI returned an invalid response:',
                    response
                );

                await message.reply(
                    "My brain went blank for a second 😭 Try again."
                );

                return;
            }

            // Discord has a 2000-character message limit
            if (response.length <= 2000) {
                await message.reply(response);
                return;
            }

            // Split long responses
            for (
                let i = 0;
                i < response.length;
                i += 1900
            ) {
                await message.channel.send(
                    response.slice(i, i + 1900)
                );
            }

        } catch (error) {
            console.error(
                '❌ AI MESSAGE ERROR:',
                error
            );

            try {
                await message.reply(
                    "Oops 😭 my AI brain disconnected for a second. Try again."
                );
            } catch (replyError) {
                console.error(
                    '❌ Could not send error reply:',
                    replyError
                );
            }
        }
    },
};
