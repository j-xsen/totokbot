/**
 * Created by jaxsen on 7/24/2017 @ 11:50 AM.
 */

function ExampleModule(g){
    const funcone = function(src,reqs){
        g.gSay(src,`${g.at(src,reqs)}, command one worked!`,reqs);
    };

    const functwo = function(src,reqs){
        g.gSay(src,`${g.at(src,reqs)}, command two worked!`,reqs);
    };

    this.cmd = {
        "commandone": {
            "src": "*",
            "attr": [0, -1],
            "correct": "[prefix]commandone",
            "f": funcone
        },
        "commandtwo": {
            "src": "discorddm",
            "attr": [0,-1],
            "correct": "[prefix]commandtwo",
            "f": functwo
        }
    };
}

module.exports = ExampleModule;