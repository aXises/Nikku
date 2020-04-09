import * as Discord from "discord.js";
import TriggerableCommand from "command/TriggerableCommand";
import { AccessLevel } from "user/AccessLevel";
import Trigger from "action/Trigger";
import Action from "action/Action";
import OnMessageState from "state/OnMessageState";
import { MathUtil } from "math/MathUtil";
import { Config } from "config/Config";
import ChatBotService from "services/ChatBotService";
import { CommandUtil } from "utils/CommandUtil";

const cleverbot = require("cleverbot-free");

export default class RandomResponse extends TriggerableCommand {

    private botService: ChatBotService;

    public constructor() {
        super(AccessLevel.UNREGISTERED);
        this.botService = new ChatBotService(Config);
    }

    public setCustomTrigger(): Trigger {
        return new Trigger(async (state: OnMessageState): Promise<boolean> => {
            const m = state.getHandle();
            return MathUtil.randInt(0, 100) < 5 && !CommandUtil.isResponseTrigger(state.getHandle().content, 2)
                && m.content.replace(/\s/g, "").toLowerCase().search("fortnite") === -1;
        });
    }

    public setCustomAction(): Action {
        return new Action(async (state: OnMessageState): Promise<boolean> => {
            try {
                return await this.botService.sendMessage(state);
            } catch (err) {
                throw err;
            }
        });
    }
}
