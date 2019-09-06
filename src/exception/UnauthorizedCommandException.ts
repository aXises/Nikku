import * as Discord from "discord.js";
import { CoreState } from "state";
import { AbstractCommand } from "command";
import { AccessLevel } from "user";
import { CommandException } from "./";

import DBUserSchema from "database/schemas/DBUserSchema";

export class UnauthorizedCommandException extends CommandException {

    /**
     * @classdesc Exception thrown when a command is executed without the appropriate access level.
     * @param message - Message associated with the error.
     */
    constructor(state: CoreState<Discord.Message>, command: AbstractCommand, user: DBUserSchema) {
        super(state, command);
        if (user && user.accessLevel) {
            this.toExecutionUser(
                "You do not have the required access level to this command.\n" +
                `Your access level: **${user.accessLevel}** (${AccessLevel[user.accessLevel]})\n` +
                `Command access level: **${command.getAccessLevel()}** (${AccessLevel[command.getAccessLevel()]})\n`,
            );
        }
    }
}
