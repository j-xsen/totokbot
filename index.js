/**
 * Created by jaxsen on 7/11/2017 @ 2:42 AM.
 */

// config
const config = require('./config');

// global
const GlobalBot = require('./GlobalBot');
const G = new GlobalBot();

// discord
const DiscordBot = require('./DiscordBot');
const DBot = new DiscordBot(G, [config.discordtoken],config.discordprefix);
G.addDiscord(DBot);

// twitch
const TwitchBot = require('./TwitchBot');
const TBot = new TwitchBot(G,[config.twitchclientid,config.twitchuser,config.twitchpass],
                           config.twitchchats,config.twitchprefix);
G.addTwitch(TBot);

// start twitch online ping
TBot.check();