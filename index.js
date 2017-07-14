/**
 * Created by jaxsen on 7/11/2017 @ 2:42 AM.
 */


// TODO:: REMOVE
/* create list of channels to ping
const streams = {
    "s":[
        //// \/ example of what will appear here \/ ////
        //                                            //
        //  {                                         //
        //      "name":"totokbot",                    //
        //      "recips":["othertest","test"],        //
        //      "lastsent":true                       //
        //  },                                        //
        //  {                                         //
        //      "name":"totok13",                     //
        //      "recips":["test"],                    //
        //      "lastsent":false                      //
        //  }                                         //
        //                                            //
        //// /\ example of what will appear here /\ ////
    ]
};

for(let i=0;i<streams["s"].length;i++){
    for(let j=0;j<streams["s"][i]["recips"].length;j++){
        console.log(`${streams["s"][i]["name"]}: ${streams["s"][i]["recips"][j]}`);
    }
}
*/

// config
const config = require('./config');

// global
const GlobalBot = require('./GlobalBot');
const G = new GlobalBot();

// discord
const DiscordBot = require('./DiscordBot');
const DBot = new DiscordBot(G, [config.discordtoken]);
G.addDiscord(DBot);

// twitch
const TwitchBot = require('./TwitchBot');
const TBot = new TwitchBot(G,[config.twitchclientid,config.twitchuser,config.twitchpass],
                           config.twitchchats,config.twitchprefix);
G.addTwitch(TBot);

// start twitch online ping
TBot.check();