/**
 * Created by jaxsen on 7/11/2017 @ 4:58 AM.
 */

function GlobalBot(){
    // Create commands to accept
    this.cmd = {};

    // alternatives to y/n
    this.y = ["yes","ye","y","1","true","yeah","sure"];
    this.n = ["no","n","0","nope","false","noo","nada","not"];

    // modules
    this.activeModules = [];
    this.modulesInit();
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
    const check = this.checkIfCMD(com[0],src);
    if(check[0]){
        // make sure it has a valid number of attributes
        if(!this.checkAttr(com, check[1])){
            this.gSay(src,`Correct usage: ${this.convertCorrectUsage(src,this.cmd[check[1]][com[0]]["correct"])}`,[discord,twitch]);
            return false;
        }

        // send it
        this.doCMD(check[1],com[0],src,[discord,twitch]);
    }
};

GlobalBot.prototype.convertCorrectUsage = function(src,correct){
    if(src === "twitch"){
        return correct.replace(/\[prefix]/g,this.twitch.prefix);
    } else if (src === "discord"){
        return correct.replace(/\[prefix]/g,this.discord.discord_prefix);
    }
};

// check if command exists in cmd & fits source
// returns [bool source&exists, string module name]
GlobalBot.prototype.checkIfCMD = function(subbed,src){
    //try{return this.cmd[subbed]["src"].includes(src);}
    //catch(e){return false;}

    let rtrn = false;
    let modulename = "";
    // for each module, check if the command is there
    for(let i = 0; i < this.activeModules.length; i++){
        // check if command exists
        if(this.cmd[this.activeModules[i]][subbed]){
            // check if source is avaliable for this
            if(this.cmd[this.activeModules[i]][subbed]["src"].includes(src)){
                rtrn = true;
                modulename = this.activeModules[i];
            }
        }
    }

    return [rtrn,modulename];
};

// check if command attributes are correct
GlobalBot.prototype.checkAttr = function (com, mod){
    const min = this.cmd[mod][com[0]]["attr"][0];
    const max = this.cmd[mod][com[0]]["attr"][1];
    const thisAttr = com.length - 1;

    // check min
    if(thisAttr < min)return false;

    // check max
    return !(thisAttr > max && max !== -1);
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
        return req[0][0].content;
    }
    else if(src === "twitch"){
        return req[1][2];
    }
};

// do a command
GlobalBot.prototype.doCMD = function(mod,com,src,reqs){
    this.cmd[mod][com]["f"](src,reqs);
};

// check if it's a yes/or no
GlobalBot.prototype.ynMatch = function(msg){
    if(this.y.includes(msg)){ return "y"; }
    if(this.n.includes(msg)){ return "n"; }
    return "";
};

// get all modules & add them to the list
GlobalBot.prototype.modulesInit = function(){
    const modulesF = './modules/';
    const fs = require('fs');

    fs.readdir(modulesF,(err,files) => {
        files.forEach(file =>{
            // init file
            const thisRoundReq = require(modulesF + file.substring(0, file.length - 3));
            const thisRound = new thisRoundReq(this);
            // add to this.cmd
            this.cmd[file.substring(0,file.length - 3)] = thisRound.cmd;
            // add to active modules
            this.activeModules.push(file.substring(0, file.length - 3));
        });
    });
};

module.exports = GlobalBot;