/**
 * Created by jaxsen on 7/12/2017 @ 2:24 AM.
 */

function TwitchBot(g,bot,channelsSend,_prefix){
    this.tmi = require('tmi.js');

    this.prefix = _prefix;

    this.channelsObs = channelsSend;
    this.channelsPing = {"s":[]};
    this.global = g;

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
 * @description Add a channel to the list of channels to ping
 * @param dChannel - Discord Channel object
 * @param channelName - Name of channel to ping
 */
TwitchBot.prototype.addChannel = function(dChannel, channelName){

};

// check if streams defined @ this.channelsPing are online
TwitchBot.prototype.check = function(){
    let cs = "";
    for(let i=0;i<this.channelsPing["s"].length;i++){
        cs += `${this.channelsPing["s"][i]["name"].slice(1)},`;
    }
    //console.log(`Channels to ping: ${cs}.`);
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
    setTimeout(() => {
        this.check();
    }, 5000); // set to 60 when done debugging
};

module.exports = TwitchBot;