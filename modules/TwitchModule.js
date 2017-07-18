/**
 * Created by jaxsen on 7/18/2017 @ 4:56 AM.
 */
// Twitch pings

function TwitchModule(g){
    this.global = g;

    // Functions
    const addchannel = function(src,reqs){
        // get attributes
        const attr = g.getMessage(src,reqs).split(" ");

        g.discord.msgR(reqs[0][0],`Turning on notifications for ${attr[1]}...`)
            .then(function(message){
                // make sure it is a channel
                g.twitch.isChannel(attr[1])
                    .then(response => {
                        if(response){
                            // get database requires
                            const sql = require('sqlite3').verbose();

                            // get database
                            const db = new sql.Database('./sqlite/twitch');

                            db.serialize(function(){
                                // create table
                                db.run("CREATE TABLE IF NOT EXISTS twitch (username VARCHAR(25) PRIMARY KEY NOT NULL, recipients TEXT, lastsent BOOLEAN DEFAULT false, starttime INT DEFAULT 0)",function(err){
                                    if(err) {
                                        console.log(`Error creating twitch... ${err}`);
                                    }
                                });

                                // check if is in the db
                                db.run("SELECT recipients FROM twitch WHERE username=$u",{
                                    $u: attr[1]
                                }, function(err, row){
                                    if(err){
                                        console.log(`Error receiving recipients... ${err}`);
                                    } else {
                                        // check if any results came
                                        if(row) {
                                            // check if
                                            console.log(`${row[0].recipients}`);
                                        } else {
                                            // add to db
                                            db.run("INSERT INTO twitch (username,recipients,lastsent,starttime) VALUES ($u,null,false,0)",{
                                                $u: attr[1]
                                            }, function(err,row){
                                                if(err) {
                                                    console.log(`Error creating user... ${err}`);
                                                }
                                            });
                                        }
                                    }
                                });
                            });

                            /*
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
                            */
                        } else {
                            message.edit(`${attr[1]} isn't a channel!`);
                        }
                    })
                    .catch(error => {
                        message.edit(`Error! Try again!`);
                        console.log(`Error @ StarterModule AddChannel: ${error}`);
                    });
            });
    };

    this.cmd = {
        ////      __DISCORD__       ////
        // addchannel - adds a channel to the list of pings & signs this discord channel up for it
        "addchannel": {
            "src": "discorddm",
            "attr": [1, 2],
            "correct": "[prefix]addchannel [channel] (@ everyone? (y/N))",
            "f": addchannel
        }
    };
}

module.exports = TwitchModule;