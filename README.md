# totokbot - a discord/twitch bot

## totokbot uses:

  - [node.js](https://nodejs.org/)
  - [discord.js](https://discord.js.org/)
  - [tmi.js](https://tmijs.org/)
  - [sqlite3](https://github.com/mapbox/node-sqlite3)

## installation

  1. install npm & node.js ([dl](https://nodejs.org/en/download/)/[tutorial](https://nodejs.org/en/download/package-manager/))
  2. [clone](https://help.github.com/articles/cloning-a-repository/) (requires [git](https://git-scm.com/downloads)) or [download the repository and extract it to a folder](https://github.com/totok13/totokbot/archive/master.zip)
  3. open a command prompt or [git bash](https://git-scm.com/downloads) in the repository's location and type ```npm install```
  4. duplicate ```config.js.example``` and name the new file ```config.js```
  5. edit ```config.js``` to match your preferences
  6. go back to the command prompt and type ```node index.js```

## adding modules

  0. for this, MODULENAME is the name of your module, so replace it when actually adding it
  
      * if you are low on time/don't want to read this, you can duplicate ExampleModule.js.example and adjust that file. just remove .example from the name & make it a javascript file.
	  
  1. create the file ```./modules/MODULENAME.js```
  2. create a constructor with one parameter, g
      * ex: ```function MODULENAME(g){ }```
  3. put ```module.exports = MODULENAME;``` at the end of the file
  4. in the constructor, add a public json object called cmd
  5. add your commands into cmd with the following format (remove comments):
        ```javascript
        "commandname": {    // what must be typed in right next to the prefix (!commandname)
            "src":"*",      // where this command can be used
                            // // twitch - twitch chat
                            // // discord - a discord text channel
                            // // dm - discord dm
                            // // * - anywhere
                            // // put these strings in any order to say two places
                            // // // ex "twitchdiscord" - everywhere except discord dms
            "attr":[0,-1],  // arguments that the command takes
                            // // first number - minimum number of arguments
                            // // second number - the max number of arguments (-1 is no cap)
                            // // if there r 4 arguments, the 1st 2 become discord's cap and the last 2 r twitch's
                            // // // ex [1,-1,0,-1] = 1 arg required for discord, 0 required for twitch
            "correct":"[prefix]commandname",    // what to display when someone enters the wrong # of args
                                                // [prefix] gets changed to the prefix that is being used
            "f":functionname    // what function to use when the command is ran
        }
        ```
  6. create a variable that is equal to a function with two arguments
  
      * argument one is a string that says the source ("discord", "twitch",or "dm")
	  
      * argument two is an array, [discord_variables, twitch_variables]
	  
      1. discord_variables
          * 0 - [discord.js message](https://discord.js.org/#/docs/main/stable/class/Message)
		
      2. [twitch_variables](https://docs.tmijs.org/v1.2.1/Events.html#message)
          * 0 - string ```channel``` - the channel name
          * 1 - object ```userstate``` - [the userstate object](https://docs.tmijs.org/v1.2.1/Events.html#message)
          * 2 - string ```message``` - the message that was received
          * 3 - bool ```self``` - is this message from the bot (should always be false, if true is handled in TwitchBot.js)
    7. your file should now look something like this:
        ```javascript
        function MODULENAME(g){
            const functionname = function(src,reqs){
                // function
            };
    
            this.cmd = {
                "commandname": {
                    "src":"*",
                    "attr":[0,-1],
                    "correct":"[prefix]commandname",
                    "f":functionname
                }
            };
        }
  
        module.exports = MODULENAME;
        ```
    8. run the bot and test out your new command!

## using global
global is meant to allow you to interact with discord and twitch without having to adjust code for each source. modules are always sent a global parameter when being created, allowing them to access these global functions.

#### outer functions
*these are the functions that you'll probably use. even though these are the only global functions, you can still use [discord.js](https://discord.js.org/#/docs/main/stable/general/welcome) and [tmi.js](https://docs.tmijs.org/) by getting the twitch/discord objects from your global object.*

Function | Parameters | Returns | What it does
-------- | ---------- | ------- | ------------
gSay | ```src``` string, ```msg``` string, ```reqs``` array[discord_variables,twitch_variables] | | Sends a messge to either Discord or Twitch depending on ```src```
at | ```src``` string, ```reqs``` array[discord_variables,twitch_variables] | string | Returns the string needed to @ the sender of the message
getMessage | ```src``` string, ```reqs``` array[discord_variables,twitch_variables] | string | Returns the message sent as a string
ynMatch | ```msg``` string | string ("y","n", or "") | Checks if string matches yes or no (vars g.y,g.n)

#### inner functions
*These are functions your probably won't use and are more for internal workings.*

Function | Paramters | What it does
-------- | --------- | ------------
addDiscord | ```d``` DiscordBot | Adds the DiscordBot object to the global object
addTwitch | ```t``` TwitchBot | Adds the TwitchBot object to the global object
cmdRec | ```msg``` string, ```src``` string, ```discord``` discord_variables, ```twitch``` twitch_variables | Checks whether or not to do a command
convertCorrectUsage | ```src``` string, ```correct``` string | Formats a command's "correct"
checkIfCMD | ```subbed``` string, ```src``` string | Checks if a command exists and if it fits the source
checkAttr | ```com``` array[arguments], ```mod``` string, ```src``` string | Checks if submitted command fits the number of attributes
doCMD | ```mod``` string, ```com``` string, ```src``` string, ```reqs``` array[discord_variables,twitch_variables] | Does a command
modulesInit | | Gets all modules & adds them to active modules

## sqlite
sqlite was added to allow some things to be saved between bot sessions. upon the bot running for the first time, ```./sqlite/``` is created, and that's where sqlite databases should be stored. ([documentation for sqlite3](https://github.com/mapbox/node-sqlite3/wiki))
