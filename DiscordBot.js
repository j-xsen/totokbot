/**
 * Created by jaxsen on 7/11/2017 @ 4:08 AM.
 */

function DiscordBot(g,bot,prefix) {
    this.discord_prefix = prefix;

    this.global = g;

    // Import the discord.js module
    this.Discord = require('discord.js');

    // Create an instance of a Discord client
    const discord_client = new this.Discord.Client();

    // The token of your bot - https://discordapp.com/developers/applications/me
    const token = bot[0];

    // The ready event is vital, it means that your bot will only start reacting to information
    // from Discord _after_ ready is emitted
    discord_client.on('ready', () => {
        console.log('discord loaded!');
    });

    // Create an event listener for messages
    discord_client.on('message', message => {
        this.mRec(message);
    });

    // Log our bot in
    discord_client.login(token);
}

DiscordBot.prototype.msg = function(msg, response){
    msg.channel.send(response);
};

DiscordBot.prototype.mRec = function(message){
    if(!message.content.startsWith(this.discord_prefix)){return;}

    this.global.cmdRec(message.content,"discord",[message],[]);
};

// permission checker
DiscordBot.prototype.checkPerms = function(message, perm){
    // get roles that are able to use this command & see if the user has it
    const rolesArray = message.guild.roles.array();
    for (let i = 0; i< rolesArray.length; i++){
        let perms = new this.Discord.Permissions(rolesArray[i].permissions);
        if(perms.has(perm)){
            if(message.member.roles.has(rolesArray[i].id)){
                return true;
            }
        }
    }
    return false;
};

// get @ info [returns string]
DiscordBot.prototype.at = function(message){
    return `<@!${message.author.id}>`;
};

module.exports = DiscordBot;