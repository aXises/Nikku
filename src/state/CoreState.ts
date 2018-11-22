import NikkuCore from "core/NikkuCore";
import { ICoreState } from "./ICoreState";
import * as Discord from "discord.js";

export default class CoreState implements ICoreState {
    /**
     * Hander for the state.
     */
    protected handle?: any;

    protected messageHandle?: Discord.Message;

    protected core: NikkuCore;

    /**
     * @classdesc Base state for the bot.
     * @param handle - Handler for the state.
     */
    constructor(core: NikkuCore) {
        this.core = core;
    }

    /**
     * Sets the handle of the state.
     * @param handle - New handle to set.
     */
    public setHandle(handle: object): void {
        this.handle = handle;
    }

    /**
     * Gets the current handle.
     */
    public getHandle(): any {
        return this.handle;
    }

    public getMessageHandle(): Discord.Message {
        return this.messageHandle;
    }
}
