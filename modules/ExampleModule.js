/**
 * Created by jaxsen on 7/24/2017 @ 11:50 AM.
 */

function ExampleModule(g){
    this.global = g;

    const examplefunction = function(src,reqs){ // must have src,reqs as parameters
        g.gSay(src,`${g.at(src,reqs)}, example function worked!`,reqs);
    };

    this.cmd = {
        "commandname": {
            "src": "*",
            "attr": [0, -1],
            "correct": "[prefix]commandname",
            "f": examplefunction
        }
    };
}

module.exports = ExampleModule;