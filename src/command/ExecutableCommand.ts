import { ICommand } from "../command/ICommand";
import { Command } from "../command/Command";

/**
 * Commands which must be executed by a user to run.
 */

export class ExecutableCommand extends Command implements ICommand {
    public constructor(commandString: string, accessLevel: number,
                       action: () => boolean) {
        super(commandString, accessLevel, action);
    }
}
