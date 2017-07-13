/**
 * Created by jaxsen on 7/11/2017 @ 4:58 AM.
 */

function GlobalBot(){
    // Create commands to accept
    this.cmd = {
        "purge": {
            "src": "discord",
            "attr": 0,
            "correct": ""
        },
        "ping": {
            "src": "twitchdiscord",
            "attr": 0,
            "correct": ""
        },
        "yorn": {
            "src": "twitchdiscord",
            "attr": 0,
            "correct": ""
        },
        "check": {
            "src": "discord",
            "attr": 0,
            "correct": ""
        },
        "addchannel": {
            "src": "discord",
            "attr": 1,
            "correct": "!addchannel [channel]"
        }
    }
}

// add discord to globalbot object
GlobalBot.prototype.addDiscord = function (d){
    this.discord = d;
};
// add twitch to globalbot object
GlobalBot.prototype.addTwitch = function(t){
    this.twitch = t;
};

// command received; check if valid
GlobalBot.prototype.cmdRec = function(msg,src,discord,twitch){
    // make sure src is valid & discord or twitch is filled out
    if(src !== "twitch" && src !== "discord"){return false;}
    if(discord.length === 0 && twitch.length === 0){return false;}

    // split up command a bit to be more readable in program
    let subbed = msg.substring(1);
    let com = subbed.split(" ");

    // check if it is a command for the source
    if(this.checkIfCMD(com[0],src)){
        // make sure it has a valid number of attributes
        if(!this.checkAttr(com)){
            this.gSay(src,`Correct usage: ${this.cmd[com[0]]["correct"]}`,[discord,twitch]);
            return false;
        }

        // send it
        this.doCMD(com[0],src,[discord,twitch]);
    }
};

// check if command exists in cmd & fits source
GlobalBot.prototype.checkIfCMD = function(subbed,src){
    try{return this.cmd[subbed]["src"].includes(src);}
    catch(e){return false;}
};

// check if command attributes are correct
GlobalBot.prototype.checkAttr = function (com){
    return com[this.cmd[com[0]]["attr"]];
};

// send message to either twitch or discord depending on src
GlobalBot.prototype.gSay = function(src,msg,reqs){
    if(src === "twitch"){
        this.twitch.msg(reqs[1][0],msg);
    } else if (src === "discord"){
        this.discord.msg(reqs[0][0],msg);
    }
};

// get @ via source & requirements to get @
GlobalBot.prototype.at = function(src,req){
   if(src === "discord"){
       return this.discord.at(req[0][0]);
   }
   else if (src === "twitch"){
       return this.twitch.at(req[1][1]);
   }
};

// get message
GlobalBot.prototype.getMessage = function(src,req){
    if(src === "discord"){
        return req[0].content;
    }
    else if(src === "twitch"){
        return req[2];
    }
};

GlobalBot.prototype.doCMD = function(com,src,reqs){
    this[com](src,reqs);
};

//// ---[ COMMANDS ]--- ////
// to make a new command:
// ```
// GlobalBot.prototype.[name] = function(src,reqs){
//     // your code
// }
// ```
// src = where the command came from ("twitch" or "discord")
// reqs = what each message event sends (discord is discord.js message object & twitch is all the vars)
//        reqs[0] is where discord variables are
//        reqs[1] is where twitch variables are

// __DISCORD AND TWITCH__ //
// yorn
GlobalBot.prototype.yorn = function(src,reqs){
    if(Math.random() >= 0.5){
        this.gSay(src,`${this.at(src,reqs)}, yes.`,reqs);
    }else{
        this.gSay(src,`${this.at(src,reqs)}, no.`,reqs);
    }
};
// ping
GlobalBot.prototype.ping = function(src,reqs){
    this.gSay(src,`${this.at(src,reqs)}, pong!`,reqs);
};

//      __DISCORD__      //
// add channel
GlobalBot.prototype.addchannel = function(src,reqs){
    const attr = this.getMessage(src,reqs).split(" ");
};

module.exports = GlobalBot;