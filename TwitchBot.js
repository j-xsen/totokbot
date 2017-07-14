/**
 * Created by jaxsen on 7/12/2017 @ 2:24 AM.
 */

function TwitchBot(g,bot,channelsSend,_prefix){
    this.tmi = require('tmi.js');

    this.prefix = _prefix;

    this.channelsObs = channelsSend;

    // TODO:: convert to sqlite
    this.channelsPing = {
        "totokbot": {
            "recs":[],
            "lastsent":false,
            "starttime":null
        }
    };

    this.global = g;

    this.pingcycle = 0;

    const options = {
        options: {
            debug: true,
            clientId: bot[0]
        },
        connection: {
            reconnect: true
        },
        identity: {
            username: bot[1],
            password: bot[2]
        },
        channels: channelsSend
    };

    this.client = new this.tmi.client(options);

    this.client.connect();

    this.client.on("connecting",function(address,port){
        console.log("Connecting!");
    });

    this.client.on("chat",function(channel,userstate,message,self){
        // make sure is not a bot message
        if(self)return;

        // make sure it's a bot command
        if(!message.startsWith(_prefix))return;

        g.cmdRec(message, "twitch", [], [channel,userstate,message,self]);
    });

    this.userregex = new RegExp(/^[a-zA-Z0-9][\w]{3,24}$/g);
}

// gets an @ for a user
TwitchBot.prototype.at = function(userstate){
    return `@${userstate["username"]}`;
};

// sends a message to channel specified
TwitchBot.prototype.msg = function(channel,msg){
    this.client.say(channel,msg);
};

/**
 * @description Checks if a channel is an actual channel
 * @param channel - Channel name to check
 */

TwitchBot.prototype.isChannel = function(channel){
    const self = this;
    return new Promise(function(resolve,reject){
        // make sure follows twitch regex
        if(!self.userregex.test(channel)){
            resolve(false);
        }

        // do the api
        self.client.api({
            url: `/channels/${channel}`,
            headers: {
                "Client-ID": self.client.clientId
            }
        }, (err,res,body)=>{
            if(!err){
                resolve(body["status"] !== "404");
            } else {
                reject("Error: " + err);
            }
        });
    });
};

// check if streams defined @ this.channelsPing are online
// cycles between all people, 1955 characters @ at a time
// (smallest # at a time is 78)(largest # at a time is 488)
// TODO:: cycles
TwitchBot.prototype.check = function(){
    let cs = "";

    const it = this.channelsPing;
    let curlength = "https://api.twitch.tv/kraken/streams?channel=".length; // length of twitch api string
    for(let x in it){
        // check to see if there's room
        if(curlength - x.length >= 2){
            // there is! add it to the string
            curlength -= x.length;
            cs += `${x},`;
        }
    }

    if(cs !== "") {
        console.log("pinging");
        this.client.api({
            url: `/streams?channel=${cs}`,
            headers: {
                "Client-ID": this.client.clientId
            }
        }, (err, res, body) => {
            if (!err) {
                //console.log(body);
            } else {
                console.log(err);
            }
        });
    } else { console.log("not pinging"); }

    // timeout to re-ping later
    setTimeout(() => {
        this.check();
    }, 5000); // set to 60 when done debugging
};

module.exports = TwitchBot;