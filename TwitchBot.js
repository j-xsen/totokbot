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

// check if streams defined @ this.channelsPing are online
// cycles between all people, 1955 characters @ at a time
// (smallest # at a time is 78)(largest # at a time is 488)
// cycle starts at 0 and goes up
TwitchBot.prototype.check = function(cycle){
    let cs = "";

    const it = this.channelsPing;
    const urllength = "https://api.twitch.tv/kraken/streams?channel=".length; // length of twitch api string

    // divide into cycles
    let cyclesDiv = [""];
    let oncycle = 0;
    for(let x in it){
        // see if there's room
        if(cyclesDiv[oncycle].length + x.length + 1 < 2000 - urllength){
            // there is! add it to the string
            cyclesDiv[oncycle] += `${x},`;
        } else {
            // no room! add one to oncycle
            oncycle += 1;
            cyclesDiv[oncycle] = `${x},`;
        }
    }

    if(cyclesDiv[cycle]) {
        console.log(`Pinging[${cycle}/${oncycle}]: ${cyclesDiv[cycle]}`);
        this.client.api({
            url: `/streams?channel=${cyclesDiv[cycle]}`,
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
    } else { console.log(`Not Pinging!`); }

    // check if there should be more cycles
    if(cycle < oncycle){
        // there should! re-ping in 2 seconds
        setTimeout(() => {
            this.check(cycle + 1);
        }, 2000);
    } else {
        // finished cycle!! re-ping in a minute
        setTimeout(() => {
            this.check(0);
        }, 60000);
    }

};

module.exports = TwitchBot;