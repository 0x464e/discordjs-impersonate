const { Client, GatewayIntentBits, Partials, PermissionsBitField } = require('discord.js');
const cron = require('node-cron');
const client = new Client(
    {
        intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
        //partials needed to detect users even if they're appearing offline
        partials: [Partials.User, Partials.GuildMember]
    });
const { TOKEN, GUILDID, USERID } = require('./config.json');
let last_avi;

client.on('userUpdate', (old_user, new_user) => {
    if (old_user.id !== USERID)
        return;

    if (old_user.avatar !== new_user.avatar) //user changed their avatar
        client.guilds.fetch(GUILDID).then(guild =>
            guild.members.fetch(USERID).then(user => {
            if (user.avatarURL() == null) //if user has a guild specific avatar, we don't care about a normal avatar change
                change_avi(new_user.displayAvatarURL()).catch(error => { console.log(error); last_avi = null });
            }).catch(console.error)
        ).catch(console.error);
    else if (old_user.globalName !== new_user.globalName) //user changed their username
    {
       client.guilds.fetch(GUILDID).then(guild =>
           guild.members.fetch(USERID).then(user => {
               if (user.nickname == null) //if the user has a nickname, we don't care about a username change
                   guild.members.me.setNickname(new_user.globalName).catch(console.error);
           }).catch(console.error)
       ).catch(console.error);
    }
});

client.on('guildMemberUpdate', async (old_user, new_user) => {
    if (old_user.guild.id !== GUILDID || (new_user.id !== USERID && new_user.id !== client.user.id))
        return;

    if (new_user.id === USERID && old_user.nickname !== new_user.nickname) //user changed their nickname
        new_user.guild.members.me.setNickname(new_user.nickname ?? new_user.user.globalName).catch(console.error);
    else if (new_user.id === USERID && old_user.avatar !== new_user.avatar) //user changed their guild specific avatar
       change_avi(new_user.avatarURL() ?? new_user.displayAvatarURL()).catch(error => { console.log(error); last_avi = null });
    else if (new_user.id === client.user.id && old_user.nickname !== new_user.nickname) //the bot's nickname was changed by someone
        new_user.guild.members.fetch(USERID).then(user => new_user.guild.members.me.setNickname(user.nickname ?? user.user.globalName).catch(console.error));
});

let change_avi = (avi_url) => client.user.setAvatar((last_avi = avi_url).replace(/(?:.(?!\.))+$/, '.png?size=4096'));

client.login(TOKEN).then(() =>
{
    console.log('Connected as ' + client.user.tag);
    client.guilds.fetch(GUILDID).then(guild => {
        guild.members.fetch(USERID).then(user => {
            if (!guild.members.me.permissions.has(PermissionsBitField.Flags.ChangeNickname))
            {
                console.log('No permissions to change nickname, exiting');
                process.exit();
            }
            change_avi(user.avatarURL() ?? user.displayAvatarURL()).catch(error => { console.log(error); last_avi = null });
            guild.members.me.setNickname(user.nickname ?? user.user.globalName).catch(console.error);
        }).catch(console.error);
    }).catch(console.error);
}).catch(console.error);

//check every hour that we haven't somehow missed an avatar/name change
//(maybe we got e.g. disconnected and the user made a change during that time)
cron.schedule('0 * * * *', () => {
    if (!client.isReady())
        return;

    client.guilds.fetch(GUILDID).then(guild => {
        guild.members.fetch(USERID).then(user => {
            let avi_url = user.avatarURL() ?? user.displayAvatarURL();
            if (last_avi !== avi_url)
                change_avi(avi_url).catch(error => { console.log(error); last_avi = null });
            if (guild.members.me.nickname !== user.nickname ?? user.user.globalName)
                guild.members.me.setNickname(user.nickname ?? user.user.globalName).catch(console.error);
        }).catch(console.error);
    }).catch(console.error);
});
