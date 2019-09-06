// @ts-ignore
import * as ChatBot from "cleverbot.io";
import * as Discord from "discord.js";
import * as winston from "winston";
import { NikkuConfig } from "config";
import { Logger } from "log";
import { OnMessageState } from "state";
import StringFunc from "utils/StringFunc";
import DBGuildPropertySchema from "database/schemas/DBGuildPropertySchema";
import { GuildConfig } from "config/GuildConfig";
import { isUndefined } from "util";

export default class ChatBotService {

    private bot: ChatBot;

    private logger: winston.Logger = new Logger(this.constructor.name).getLogger();

    public constructor() {
        if (!NikkuConfig.EnvironmentVariables.ServiceOptions.CHATBOT_API_KEY
            || !NikkuConfig.EnvironmentVariables.ServiceOptions.CHATBOT_USER_ID
            || !NikkuConfig.EnvironmentVariables.ServiceOptions.CHATBOT_SESSION) {
            this.logger.warn("Failed to initialize chat service. Missing keys.");
            return;
        }
        this.bot = new ChatBot(NikkuConfig.EnvironmentVariables.ServiceOptions.CHATBOT_USER_ID,
            NikkuConfig.EnvironmentVariables.ServiceOptions.CHATBOT_API_KEY);
        this.bot.setNick(NikkuConfig.EnvironmentVariables.ServiceOptions.CHATBOT_SESSION);
    }

    public async sendMessage(state: OnMessageState): Promise<boolean> {
        const m: Discord.Message = state.getHandle();
        const str = StringFunc.removeStrBothEndsNoSpace(m.content, "mrfortnite");
        if (str.length === 0) {
            return false;
        }
        try {
            const guild = await DBGuildPropertySchema.getGuildById(state.getHandle().guild.id);
            if (guild) {
                const ttsEnabled = await guild.getBooleanConfig(GuildConfig.BooleanConfig.Options.RESPONSE_TTS_ENABLED);
                await m.channel.send(`${await this.getResponse(str)}`, {
                    tts: isUndefined(ttsEnabled) ? false : ttsEnabled,
                });
            }
            return true;
        } catch (err) {
            throw err;
        }
    }

    public getResponse(message: string): Promise<string> {
        return new Promise((resolve, reject) => {
            this.bot.create((errA: unknown) => {
                if (errA) {
                    return reject(errA);
                }
                this.bot.ask(message, (errB: unknown, res: string) => {
                    if (errB) {
                        return reject(errB);
                    }
                    return resolve(res);
                });
            });
        });
    }
}
