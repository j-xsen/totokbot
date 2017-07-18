/**
 * Created by jaxsen on 7/12/2017 @ 2:24 AM.
 */

function TwitchBot(g,bot,channelsSend,_prefix){
    this.tmi = require('tmi.js');

    this.prefix = _prefix;

    this.channelsObs = channelsSend;

    // TODO:: convert to sqlite
    this.channelsPing = {};

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

    this.client.connect().then(function(data){

    }).catch(function(err){
        console.log(`Could not connect to Twitch! (${err})`);
    });

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
        const reg = new RegExp(/^[a-zA-Z0-9][\w]{3,24}$/g);
        if(!reg.test(channel)){
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
                resolve(body["status"] !== 404);
            } else {
                reject("Error: " + err);
            }
        });
    });
};

module.exports = TwitchBot;