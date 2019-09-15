import * as Discord from "discord.js";
import * as winston from "winston";
import { NikkuConfig, ConfigParser, BotConfigOptions, PackagejsonData } from "../config";
import { Logger, ChannelTransport } from "../log";
import { CommandManager, AbstractManager } from "../managers";
import { EventType } from "../event";
import { NikkuException } from "../exception";

import { EventCore } from "./EventCore";
import { DatabaseCore } from "./DatabaseCore";
import { CoreInitializer } from "./CoreInitializer";

/**
 * The main class of the bot, initializes most of the main processes.
 */
export class NikkuCore {
    /**
     * Discord.js API
     */
    private client: Discord.Client;

    /**
     * Main event handlers for the bot.
     */
    private eventCore: EventCore;

    /**
     * Main database events/handlers for the bot.
     */
    private databaseCore: DatabaseCore;

    private logger: winston.Logger = new Logger(this.constructor.name).getLogger();

    private managers: Map<string, AbstractManager>;

    private botConfigOptions?: BotConfigOptions;

    private pjsonData?: PackagejsonData;

    private static instance: NikkuCore;

    /**
     * @param config Initial configurations for the bot.
     * @param initializeImmediately Start main processes immediately.
     */
    public constructor(coreInitializer: CoreInitializer) {
        this.logger.debug("Nikku Core initialized.");
        this.client = new Discord.Client();
        this.managers = new Map<string, AbstractManager>();
        this.eventCore = new EventCore(this);
        this.databaseCore = new DatabaseCore(this);
        this.retrieveInitializationConfiguration(
            new ConfigParser(coreInitializer.configurationPath, coreInitializer.dotenvPath),
        );
        if (coreInitializer.initializeImmediately) {
            this.startMainProcesses();
        }
        NikkuCore.instance = this;
    }

    private retrieveInitializationConfiguration(configParser: ConfigParser): void {
        try {
            configParser.parseConfig().parsePackageJSON().parseEnvConfig();
            this.botConfigOptions = configParser.getBotConfig();
            this.pjsonData = configParser.getPackageJSONData();
        }  catch (e) {
            this.logger.error("Error while parsing configurations.");
            process.exit();
        }
    }

    private validateEnvironmentalVariables(): void {
        let exception: NikkuException | undefined;
        if (!NikkuConfig.EnvironmentVariables.DiscordOptions.TOKEN) {
            exception = new NikkuException(
                "Missing Discord bot token in environment variables. Please specify 'DISCORD_BOT_TOKEN'.",
            );
        }
        // Additional checking for other options.
        if (exception) {
            throw exception;
        }
    }

    /**
     * Start the main processes of the bot.
     */
    public startMainProcesses(): void {
        try {
            this.validateEnvironmentalVariables();
        } catch (e) {
            this.logger.error(e.message);
            return;
        }
        this.client.login(NikkuConfig.EnvironmentVariables.DiscordOptions.TOKEN);
        this.client.on(EventType.READY, async () => {
            this.setDebugLogChannels();
            await this.loadModules();
            if (await this.startDbProcesses()) {
                this.eventCore.handleMessageEvent();
            }
        });
    }

    /**
     * Starts database related processes.
     */
    public async startDbProcesses(): Promise<boolean> {
        const version: string | undefined = this.pjsonData ? this.pjsonData.VERSION : "0.0.0";
        try {
            await this.databaseCore.connectDb();
            this.logger.info(`Nikku v${version ? version : "0.0.0"} started.`);
            return true;
        } catch (err) {
            // no db mode.
            this.logger.warn(`Nikku v${version} started without an database.`);
            this.logger.error(err.message);
            return false;
        }
    }

    /**
     * Loads primary bot modules.
     */
    public async loadModules(): Promise<void> {
        try {
            Promise.all([
                this.getManager(CommandManager).loadCommands(),
            ]);
        } catch (err) {
            this.logger.error(err.message);
        }
    }

    /**
     * Set Discord channels for debug/logging outputs. Configure it from a botconfig.json file.
     */
    public setDebugLogChannels(): void {
        const debugChannels = NikkuConfig.EnvironmentVariables.DiscordOptions.DEBUG_CHANNELS;
        if (debugChannels && debugChannels.length !== 0) {
            for (const id of debugChannels) {
                const channel: Discord.TextChannel = this.client.channels.get(id) as Discord.TextChannel;
                if (channel) {
                    ChannelTransport.addChannel(channel);
                }
            }
        }
    }

    /**
     * @returns The event core of the bot.
     */
    public getEventCore(): EventCore {
        return this.eventCore;
    }

    /**
     * @returns The database core of the bot.
     */
    public getDbCore(): DatabaseCore {
        return this.databaseCore;
    }

    /**
     * @returns The discord client instance.
     */
    public getClient(): Discord.Client {
        return this.client;
    }

    /**
     * @returns The loaded package.json data.
     */
    public getPackageJsonData(): PackagejsonData | undefined {
        return this.pjsonData;
    }

    public getBotConfigOptions(): BotConfigOptions | undefined {
        return this.botConfigOptions;
    }

    /**
     * Sets the activity of the bot.
     * @param str The activity of the bot.
     */
    public setActivity(str: string): void {
        this.client.user.setActivity(str);
    }

    /* tslint:disable */
    /**
     * Gets a instance of a manager.
     * @param Cls Class Type of the manager to retrieve.
     */
    public getManager<T extends AbstractManager>(Cls: (new () => T)): T {
        /* tslint:enable */
        if (!this.managers.has(Cls.name)) {
            this.managers.set(Cls.name, new Cls());
        }
        return this.managers.get(Cls.name) as T;
    }

    public static getCoreInstance(): NikkuCore {
        if (!NikkuCore.instance) {
            throw new NikkuException("Nikku core should be initialized via the constructor first.");
        } else {
            return this.instance;
        }
    }
}