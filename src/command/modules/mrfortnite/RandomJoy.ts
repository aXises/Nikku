import TriggerableCommand from "command/TriggerableCommand";
import { AccessLevel } from "user/AccessLevel";
import Trigger from "action/Trigger";
import Action from "action/Action";
import OnMessageState from "state/OnMessageState";
import { MathUtil } from "math/MathUtil";

export default class RandomJoy extends TriggerableCommand {

    public constructor() {
        super(AccessLevel.UNREGISTERED);
    }

    public setCustomTrigger(): Trigger {
        return new Trigger(async (state: OnMessageState): Promise<boolean> => {
            return MathUtil.randInt(0, 100) < 5;
        });
    }

    public setCustomAction(): Action {
        return new Action(async (state: OnMessageState): Promise<boolean> => {
            try {
                await state.getHandle().react("😂");
                return true;
            } catch (err) {
                throw err;
            }
        });
    }
}
