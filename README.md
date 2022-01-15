# DiscordJS Impersonate
A fun DiscordJS script to make your bot impersonate a user of your choice. Just something fun to maybe troll your friend or whatever.  
Obviously the bot will always have a large "bot" tag next to its name, so no one will seriously fall for the impersonation, this is just for some laughs.

This script makes your bot watch for the target user's **nickname**, **username**, **avatar** and **guild avatar** changes. If any of them change, your bot's nickname/avatar will be immediately changed as well to match the target user.  
Avatar changes are heavily rate-limited, so be prepared to probably have the script fail temporarily if your target user spams avatar changes

Your bot needs to have the `GUILD_MEMBERS` [privileged intent](https://discord.com/developers/docs/topics/gateway#privileged-intents) as well as permissions to change its nickname.


### Installing

* Install [NodeJS](https://nodejs.org/en/) via whatever method is appropriate for your platform.
  * Follow discord.js' requirements for the required NodeJS version.
* Clone this repository
`git clone https://github.com/0x464e/discordjs-impersonate`
* Insert the required information into the file `config.json` 
* Install the required Node packages from `package.json` by running `npm install`

### Executing the application

* Run `node index.js` and enjoy.