/**
 * Created by jaxsen on 7/18/2017 @ 4:56 AM.
 */
// Twitch pings

function TwitchModule(g){
    this.global = g;

    const sql = require('sqlite3').verbose();
    const db = new sql.Database('./sqlite/twitch');

    // Functions
    const adddiscordnotif = function(src,reqs,message,currec){
        // get attributes
        const attr = g.getMessage(src,reqs).split(" ");

        // make sure they're not already in the db
        if(currec.includes(reqs[0][0].channel.id)){
            message.edit(`Notifications have already been turned on for ${attr[1]}!`);
            return;
        }

        let setrec = "";
        if(currec === 'null'){
            setrec = reqs[0][0].channel.id;
        } else {
            setrec = currec + "," + reqs[0][0].channel.id;
        }

        if(setrec !== "") {
            db.run("UPDATE twitch SET recipients = $r",{
                $r: setrec
            }, function(err){
                if(err){
                    console.log(`Error updating: ${err}`);
                    message.edit("There's been an error! Try again.");
                } else {
                    message.edit(`Notifications turned on for ${attr[1]}!`);
                }
            });
        } else {
            message.edit("There's been an error! Try again.");
        }
    };
    const createchanneldb = function(src,reqs){
        // get attributes
        const attr = g.getMessage(src,reqs).split(" ");
        attr[1] = attr[1].toLowerCase();

        g.discord.msgR(reqs[0][0],`Turning on notifications for ${attr[1]}...`)
            .then(function(message){
                // make sure it is a channel
                g.twitch.isChannel(attr[1])
                    .then(response => {
                        if(response){
                            db.serialize(function(){
                                // create table
                                db.run("CREATE TABLE IF NOT EXISTS twitch (username VARCHAR(25) PRIMARY KEY NOT NULL, recipients TEXT, lastsent BOOLEAN DEFAULT false, starttime INT DEFAULT 0)",function(err){
                                    if(err) {
                                        console.log(`Error creating twitch... ${err}`);
                                        message.edit(`There's been an error! Try again.`);
                                    } else {
                                        // check if is in the db
                                        db.all("SELECT recipients FROM twitch WHERE username=$u",{
                                            $u: attr[1]
                                        }, function(err, row){
                                            if(err){
                                                console.log(`Error receiving recipients... ${err}`);
                                            } else {
                                                // check if any results came
                                                if(row[0]) {
                                                    // this is already in db!
                                                    adddiscordnotif(src,reqs,message,row[0].recipients);
                                                } else {
                                                    // add to db
                                                    db.run("INSERT INTO twitch (username,recipients,lastsent,starttime) VALUES ($u,null,0,0)",{
                                                        $u: attr[1]
                                                    }, function(err){
                                                        if(err) {
                                                            console.log(`Error creating user... ${err}`);
                                                            message.edit(`There's been an error! Try again.`);
                                                        } else {
                                                            console.log(`Added ${attr[1]} to db.`);
                                                            adddiscordnotif(src,reqs,message,"null");
                                                        }
                                                    });
                                                }
                                            }
                                        });
                                    }
                                });
                            });
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

    let cycle=0;

    const pingXO = function(){
        return new Promise(function(resolve,reject) {
            db.all("SELECT count(username) FROM twitch", function (err, row) {
                if (err) {
                    console.log(`Error getting all usernames: ${err}`);
                    reject(err);
                } else {
                    const numusers = row[0]["count(username)"];

                    const offset = 100 * cycle;

                    db.all("SELECT username,recipients,lastsent FROM twitch LIMIT 100 OFFSET $off", {
                        $off: offset
                    }, function (err, rows) {
                        if (err) {
                            console.log(`Error getting username,recipients,lastsent: ${err}`);
                            reject(err);
                        } else {
                            let alluser = "";
                            for (let i = 0; i < rows.length; i++) {
                                alluser += `${rows[i].username}`;
                                alluser += i === rows.length - 1 ? `` : `,`;
                            }
                            if (alluser === "") {
                                console.log(`No users!`);
                                reject("NO_USERS");
                            }
                            g.twitch.client.api({
                                url: `/streams?channel=${alluser}&limit=100&stream_type=live`,
                                headers: {
                                    "Client-ID": g.twitch.client.clientId
                                }
                            }, (err, res, body) => {
                                if (!err) {
                                    let livechannels = [];
                                    let offlinechannels = [];
                                    for (let i = 0; i < body["streams"].length; i++) {
                                        const thisstream = body["streams"][i];
                                        livechannels.push(thisstream["channel"]["name"])
                                    }
                                    for (let i = 0; i < rows.length; i++) {
                                        if (!livechannels.includes(rows[i].username)) {
                                            offlinechannels.push(rows[i].username);
                                        }
                                    }

                                    //console.log(`Live Channels: ${livechannels} // Offline Channels: ${offlinechannels}`);

                                    let lastonlinechannels = [];
                                    let lastofflinechannels = [];
                                    for (let i = 0; i < rows.length; i++) {
                                        if (rows[i].lastsent === 1) {
                                            lastonlinechannels.push(rows[i].username);
                                        } else if (rows[i].lastsent === 0) {
                                            lastofflinechannels.push(rows[i].username);
                                        }
                                    }

                                    // get differences
                                    for (let i = 0; i < livechannels.length; i++) {
                                        // check if in old live channels
                                        if (lastonlinechannels.includes(livechannels[i])) {
                                            //console.log(`${livechannels[i]} is still streaming.`);
                                        } else {
                                            //console.log(`${livechannels[i]} has just begun streaming!`);
                                            // alert channels
                                            let thisuser;

                                            for (let x = 0; x < rows.length; x++) {
                                                if (rows[x].username === livechannels[i]) {
                                                    thisuser = rows[x];
                                                }
                                            }

                                            const alertthese = thisuser.recipients.split(",");
                                            for (let x = 0; x < alertthese.length; x++) {
                                                g.discord.getChannel(alertthese[x]).send(`${livechannels[i]} has gone live!`);
                                            }
                                            let starttime;
                                            for (let i = 0; i < body["streams"].length; i++) {
                                                if(body["streams"][i]["channel"]["name"]){
                                                    starttime = body["streams"][i]["created_at"];
                                                }
                                            }
                                            db.run("UPDATE twitch SET lastsent=1,starttime=$st WHERE username=$user", {
                                                $user: livechannels[i],
                                                $st: starttime
                                            }, function (err) {
                                                if (err) {
                                                    console.log(`Error updating last sent for ${livechannels[i]}!`);
                                                    console.log(`[${err}]`);
                                                    reject(err);
                                                } else {
                                                    //console.log(`Set last sent for ${livechannels[i]} to true.`);
                                                }
                                            });
                                        }
                                    }
                                    for (let i = 0; i < offlinechannels.length; i++) {

                                        if (lastofflinechannels.includes(offlinechannels[i])) {
                                            //console.log(`${offlinechannels[i]} is still offline.`);
                                        } else {
                                            //console.log(`${offlinechannels[i]} has just gone offline`);
                                            // DEBUG TODO: REMOVE
                                            let thisuser = null;

                                            for (let x = 0; x < rows.length; x++) {
                                                if (rows.username === livechannels[i]) {
                                                    thisuser = rows[x];
                                                }
                                            }

                                            const alertthese = thisuser.recipients.split(",");
                                            for (let x = 0; x < alertthese.length; x++) {
                                                g.discord.getChannel(alertthese[x]).send(`${offlinechannels[i]} has gone offline!`);
                                            }
                                            db.run("UPDATE twitch SET lastsent=0 WHERE username=$user", {
                                                $user: offlinechannels[i]
                                            }, function (err) {
                                                if (err) {
                                                    console.log(`Error updating last sent for ${offlinechannels[i]}!`);
                                                    console.log(`[${err}]`);
                                                    reject(err);
                                                } else {
                                                    //console.log(`Set last sent for ${offlinechannels[i]} to false.`);
                                                }
                                            });
                                        }
                                    }
                                    resolve(numusers > offset);
                                } else {
                                    console.log(`Error w/ twitch api: ${err}`);
                                    reject(err);
                                }
                            });
                        }
                    });
                }
            });
        });
    };

    const loopPing = function() {
        pingXO()
            .then(function (tof) {
                if (tof) {
                    //console.log(`Re-ping in 60`);
                    cycle = 0;
                    setTimeout(loopPing,60000);
                } else {
                    //console.log(`Re-ping in 3`);
                    cycle += 1;
                    setTimeout(loopPing,3000);
                }
            }).catch(function (e) {
            // error; re-ping in 60
            //console.log(`Re-ping in 60`);
            cycle = 0;
            setTimeout(loopPing,60000);
        });
    };
    loopPing();

    const uptime = function(src,reqs){
        let uptimechannel;
        if(src !== "twitch") {
            const attr = g.getMessage(src, reqs).split(" ");
            uptimechannel = attr[1].toLowerCase();
        } else {
            uptimechannel = reqs[1][0].substring(1);
        }

        db.all("SELECT starttime FROM twitch WHERE username=$u AND lastsent=1",{
            $u: uptimechannel
        }, function(err,row){
            if(err){
                console.log(`Error: ${err}`);
                g.gSay(src,`Something has gone wrong! Try again.`,reqs);
            } else {
                if(row[0] && row[0].starttime) {
                    const t = new Date(new Date() - new Date(row[0].starttime));
                    const ms = t.getTime();
                    const minutes = 1000 * 60;
                    const thish = Math.floor(ms / (minutes * 60));
                    const thism = Math.floor((ms - (thish * (minutes*60))) / minutes);
                    if(src === "twitch"){
                        g.gSay(src, `${thish} hours and ${thism} minutes`,reqs);
                    } else {
                        g.gSay(src, `${uptimechannel}'s uptime: ${thish} hours and ${thism} minutes`, reqs);
                    }
                }
            }
        });
    };

    this.cmd = {
        ////  __DISCORD & TWITCH__  ////
        // uptime - get uptime of a channel
        "uptime": {
            "src": "discorddmtwitch",
            "attr": [1,-1,0,-1],
            "correct": "[prefix]uptime [channel]",
            "f": uptime
        },
        ////      __DISCORD__       ////
        // addchannel - adds a channel to the list of pings & signs this discord channel up for it
        "addchannel": {
            "src": "discorddm",
            "attr": [1, 2],
            "correct": "[prefix]addchannel [channel] (@ everyone? (y/N))",
            "f": createchanneldb
        }
    };
}

module.exports = TwitchModule;