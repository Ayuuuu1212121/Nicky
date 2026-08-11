import { readdir } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { dirname } from 'path';
import { logger } from '../../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default async function loadEvents(client) {
    try {
        const eventsPath = join(__dirname, '../../events');

        console.log('========================================');
        console.log('[EVENT LOADER] Starting...');
        console.log('[EVENT LOADER] Events path:', eventsPath);
        console.log('========================================');

        const files = await readdir(eventsPath);

        const eventFiles = files.filter(
            file => file.endsWith('.js')
        );

        console.log(
            '[EVENT LOADER] Files found:',
            eventFiles
        );

        logger.info(
            `Found ${eventFiles.length} event files to load`
        );

        for (const file of eventFiles) {
            const filePath = join(eventsPath, file);

            console.log(
                `[EVENT LOADER] Loading: ${file}`
            );

            try {
                const fileUrl = pathToFileURL(filePath).href;

                const module = await import(fileUrl);
                const event = module.default;

                if (
                    !event ||
                    !event.name ||
                    typeof event.execute !== 'function'
                ) {
                    console.log(
                        `[EVENT LOADER] INVALID EVENT: ${file}`
                    );

                    logger.warn(
                        `Event ${file} is missing required "name" or "execute" properties.`
                    );

                    continue;
                }

                const safeExecute = async (...args) => {
                    try {
                        await event.execute(
                            ...args,
                            client
                        );
                    } catch (error) {
                        logger.error(
                            `Error executing event ${event.name}:`,
                            error
                        );
                    }
                };

                if (event.once === true) {
                    client.once(
                        event.name,
                        safeExecute
                    );

                    console.log(
                        `[EVENT LOADER] REGISTERED ONCE: ${event.name}`
                    );

                    logger.info(
                        `✅ Registered once event: ${event.name}`
                    );
                } else {
                    client.on(
                        event.name,
                        safeExecute
                    );

                    console.log(
                        `[EVENT LOADER] REGISTERED: ${event.name}`
                    );

                    logger.info(
                        `✅ Registered event: ${event.name}`
                    );
                }

            } catch (error) {
                console.error(
                    `[EVENT LOADER] FAILED TO LOAD ${file}:`,
                    error
                );

                logger.error(
                    `Error loading event ${file}:`,
                    error
                );
            }
        }

        console.log('========================================');
        console.log('[EVENT LOADER] Finished.');
        console.log('========================================');

    } catch (error) {
        console.error(
            '[EVENT LOADER] FATAL ERROR:',
            error
        );

        logger.error(
            'Fatal error loading events:',
            error
        );

        throw error;
    }
}
