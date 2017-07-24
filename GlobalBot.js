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
    if(src !== "twitch" && src !== "discord" && src !== "dm"){return false;}
    if(discord.length === 0 && twitch.length === 0){return false;}

    // split up command a bit to be more readable in program
    let subbed = msg.substring(1);
    let com = subbed.split(" ");

    // check if it is a command for the source
    const check = this.checkIfCMD(com[0],src);
    if(check[0] === 1){
        // make sure it has a valid number of attributes
        if(!this.checkAttr(com, check[1], src)){
            this.gSay(src,
                `Correct usage: ${this.convertCorrectUsage(src,this.cmd[check[1]][com[0]]["correct"],com)}`,
                [discord,twitch]);
            return false;
        }

        // send it
        this.doCMD(check[1],com[0],src,[discord,twitch]);
    } else if (check[0] === 2){
        // send error message
        this.gSay(src,check[1],[discord,twitch]);
        return false;
    }
};

GlobalBot.prototype.convertCorrectUsage = function(src,correct,com){
    correct = correct.replace(/\[#cmdname#]/g,com);
    if(src === "twitch"){
        return correct.replace(/\[#prefix#]/g,this.twitch.prefix);
    } else if (src === "discord" || src === "dm"){
        return correct.replace(/\[#prefix#]/g,this.discord.discord_prefix);
    }
};

// check if command exists in cmd & fits source
// returns [int (0 - not a command,1 - is a command and has valid source,2 - is command invalid src),
//          string module name]
// or
// returns [int 2, string catch message]
GlobalBot.prototype.checkIfCMD = function(subbed,src){
    let rtrn = 0;
    let modulename = "";
    // for each module, check if the command is there
    for(let i = 0; i < this.activeModules.length; i++){
        // check if command exists
        if(this.cmd[this.activeModules[i]][subbed]){
            // check if source is avaliable for this
            if(this.cmd[this.activeModules[i]][subbed]["src"].includes(src)
                || this.cmd[this.activeModules[i]][subbed]["src"] === "*"){
                rtrn = 1;
                modulename = this.activeModules[i];
            } else {
                // source isn't available, check if message should still be sent
                if(this.cmd[this.activeModules[i]][subbed]["catch"]) {
                    for (let x = 0; x < this.cmd[this.activeModules[i]][subbed]["catch"].length; x++) {
                        let thisone = this.cmd[this.activeModules[i]][subbed]["catch"][x];
                        if (thisone[0] === src) {
                            rtrn = 2;
                            modulename = thisone[1];
                        }
                    }
                }
            }
        }
    }

    return [rtrn,modulename];
};

// check if command attributes are correct
GlobalBot.prototype.checkAttr = function (com, mod, src){
    // check if it should even check source
    let min = this.cmd[mod][com[0]]["attr"][0];
    let max = this.cmd[mod][com[0]]["attr"][1];
    if(this.cmd[mod][com[0]]["attr"][2] !== null && src === "twitch"){
        min = this.cmd[mod][com[0]]["attr"][2];
        max = this.cmd[mod][com[0]]["attr"][3];
    }
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
    } else if (src === "discord" || src === "dm"){
        this.discord.msg(reqs[0][0],msg);
    }
};

// get @ via source & requirements to get @
GlobalBot.prototype.at = function(src,req){
   if(src === "discord" || src === "dm"){
       return this.discord.at(req[0][0]);
   }
   else if (src === "twitch"){
       return this.twitch.at(req[1][1]);
   }
};

// get message
GlobalBot.prototype.getMessage = function(src,req){
    if(src === "discord" || src === "dm"){
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
            // make sure it is a module
            if(file.substring(file.length - 3, file.length) === ".js") {
                // init file
                const thisRoundReq = require(modulesF + file.substring(0, file.length - 3));
                const thisRound = new thisRoundReq(this);
                // add to this.cmd
                this.cmd[file.substring(0, file.length - 3)] = thisRound.cmd;
                // add to active modules
                this.activeModules.push(file.substring(0, file.length - 3));
            }
        });
    });
};

module.exports = GlobalBot;