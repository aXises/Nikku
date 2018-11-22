import * as moment from "moment";
import * as Transport from "winston-transport";
import * as Discord from "discord.js";
import { TransformableInfo } from "logform";

export default class ChannelTransport extends Transport {

    private static channels: Discord.TextChannel[];

    public constructor(options: any) {
        super(options);
    }

    public log(info: TransformableInfo, callback: () => any) {
        setImmediate(() => {
            this.emit("logged", info);
        });
        if (ChannelTransport.channels) {
            for (const channel of ChannelTransport.channels) {
                channel.send(`${moment().format()}:${info.label}:**${info.level}**:${info.message}`);
            }
        }
        callback();
    }

    public static setChannels(channels: Discord.TextChannel[]) {
        this.channels = channels;
    }

    public static addChannel(channel: Discord.TextChannel) {
        if (this.channels === undefined) {
            this.channels = [];
        }
        this.channels.push(channel);
    }

    public static removeChannelById(id: string) {
        let index = 0;
        for (const channel of this.channels) {
            if (channel.id === id) {
                break;
            }
            index++;
        }
        this.channels.splice(index, 1);
    }
}