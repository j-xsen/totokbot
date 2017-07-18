/**
 * Created by jaxsen on 7/16/2017 @ 5:21 PM.
 */
// default commands and stuff

function StarterModule(g){
    this.global = g;

    // Functions
    const ping = function(src,reqs){
        g.gSay(src,`${g.at(src,reqs)}, pong!`,reqs);
    };
    const yorn = function(src,reqs){
        if(Math.random() >= 0.5){
            g.gSay(src,`${g.at(src,reqs)}, yes.`,reqs);
        }else{
            g.gSay(src,`${g.at(src,reqs)}, no.`,reqs);
        }
    };

    const purge = function(src,reqs){
        const message = reqs[0][0];
        const param = message.content.split(" ");
        if (g.discord.checkPerms(message, "MANAGE_MESSAGES")) {
            if (param[1] < 2 || param[1] > 100) {
                g.gSay(src,"You must purge at least 2 messages and less than 100",reqs);
                return;
            } // make sure param[1] is valid

            message.channel.bulkDelete(param[1]);
        }
    };

    this.cmd = {
        //// __DISCORD AND TWITCH__ ////

        // ping - responds with `@<user>, pong!`
        "ping": {
            "src": "*",
            "attr": [0, -1],
            "correct": "",
            "f": ping
        },
        // yorn - sends yes or no
        "yorn": {
            "src": "*",
            "attr": [0, -1],
            "correct": "",
            "f": yorn
        },

        ////      __DISCORD__       ////
        // purge - clear all messages (up to 2 weeks)
        "purge": {
            "src": "discord",
            "attr": [1, -1],
            "correct": "[prefix]purge [number of messages to delete]",
            "catch": [["dm","Sorry! This command doesn't work in DMs."]],
            "f": purge
        }
    };
}

module.exports = StarterModule;