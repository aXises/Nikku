"use strict";
var Discord = require("discord.js");
var moment = require("moment");
var momentDuration = require("moment-duration-format");
const authToken = "NDM3MTU1NDM1ODA0MzYwNzE0.DbyAfA.OmAW7R9t-342ic_QjMeQR2JYYoc";
var bot = new Discord.Client();
var channel = bot.channels.get("general");
bot.login(authToken);
bot.on('message', (message) => {
    var loop = function (amount, delay) {
        var i = 0;
        function selfLoop () {
            setTimeout(function () {
                message.channel.send("<@121959865101975552> fortnite?").then((message) => {
                    message.delete(delay / 2);
                });
                i++;
                if (i < amount) {
                   selfLoop();
                }
             }, delay);
        }
        selfLoop();
    };
    if (message.content.startsWith("!fortnite")) {
        var command = message.content.split(" ")[1];
        if (!command) {
            message.channel.send("<@121959865101975552> fortnite?");
        }
        else if (command == "auto") {
            var amount = message.content.split(" ")[2];
            var time = message.content.split(" ")[3];
            loop(parseInt(amount), parseInt(time));
            var formattedTime = moment.duration(parseInt(time), "milliseconds").format();
            message.channel.send("Auto fortnite set. I will ping <@121959865101975552> " + amount + " times every " + formattedTime).then((message) => {
                message.delete(30000);
            });;
        }
        else {
            message.reply("usage: !fortnite auto {amount} {delay(ms)}").then((message) => {
                message.delete(10000);
            });
        }
    }
});
//bot.channels.get("leaderboards").send("test"); 
