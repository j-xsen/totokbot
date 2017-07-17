/**
 * Created by jaxsen on 7/16/2017 @ 5:21 PM.
 */
// default commands and stuff

function StarterModule(g){
    this.global = g;

    this.cmd = {
        //// __DISCORD AND TWITCH__ ////

        // ping - responds with `@<user>, pong!`
        "ping": {
            "src": "twitchdiscord",
            "attr": [0, -1],
            "correct": "",
            "f": function(src,reqs){
                g.gSay(src,`${g.at(src,reqs)}, pong!`,reqs);
            }
        },
        // yorn - sends yes or no
        "yorn": {
            "src": "twitchdiscord",
            "attr": [0, -1],
            "correct": "",
            "f": function (src, reqs) {
                if(Math.random() >= 0.5){
                    g.gSay(src,`${g.at(src,reqs)}, yes.`,reqs);
                }else{
                    g.gSay(src,`${g.at(src,reqs)}, no.`,reqs);
                }
            }
        },

        ////      __DISCORD__       ////
        // purge - clear all messages (up to 2 weeks)
        "purge": {
            "src": "discord",
            "attr": [1, -1],
            "correct": "[prefix]purge [number of messages to delete]",
            "f": function (src, reqs) {
                const message = reqs[0][0];
                if(message.guild !== null) {
                    const param = message.content.split(" ");
                    if (g.discord.checkPerms(message, "MANAGE_MESSAGES")) {
                        if (param[1] < 1) {
                            return;
                        } // make sure param[1] is valid

                        message.channel.bulkDelete(param[1]);
                    }
                } else {
                    // guild isn't available
                    g.gSay(src,"Sorry! This command doesn't work in DMs.",reqs);
                }
            }
        },
        // addchannel - adds a channel to the list of pings & signs this discord channel up for it
        "addchannel": {
            "src": "discord",
            "attr": [1, 2],
            "correct": "[prefix]addchannel [channel] (@ everyone? (y/N))",
            "f": function (src, reqs) {
                // get attributes
                const attr = g.getMessage(src,reqs).split(" ");

                g.discord.msgR(reqs[0][0],`Turning on notifications for ${attr[1]}...`)
                    .then(function(message){
                        // make sure it is a channel
                        g.twitch.isChannel(attr[1])
                            .then(response => {
                                if(response){
                                    // check if is in this.twitch.channelsPing
                                    let already_made = g.twitch.channelsPing[attr[1]];

                                    // not yet in channelsPing! add it to the list
                                    if(!already_made){
                                        console.log(`Adding ${attr[1]} to channelsPing`);
                                        g.twitch.channelsPing[attr[1]] = {
                                            "recs":[],
                                            "lastsent":false,
                                            "starttime":null
                                        }
                                    }

                                    // check if channel is already in
                                    for(let x = 0; x < g.twitch.channelsPing[attr[1]]["recs"].length; x++){
                                        if(g.twitch.channelsPing[attr[1]]["recs"][x][0].id === reqs[0][0].channel.id){
                                            message.edit(`This channel already has notifications for ${attr[1]}!`);
                                            return;
                                        }
                                    }

                                    // add this discord channel to list
                                    g.twitch.channelsPing[attr[1]]["recs"].push([reqs[0][0].channel,
                                                                                g.ynMatch(attr[2]) === "y"]);

                                    message.edit(`Notifications turned on for ${attr[1]}!`);
                                } else {
                                    message.edit(`${attr[1]} isn't a channel!`);
                                }
                            })
                            .catch(error => {
                                message.edit(`Error! Try again!`);
                                console.log(error);
                            });
                    });
            }
        }
    };
}

module.exports = StarterModule;