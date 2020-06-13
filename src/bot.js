require('dotenv').config();
const { Client } = require('discord.js');
const client = new Client();
const createCaptcha = require('./captcha');
const fs = require('fs').promises;
client.login(process.env.BOT_TOKEN);

client.on('ready', () => {
    console.log(`${client.user.tag} has logged in.`);
});

client.on('guildMemberAdd', async member => {
    const captcha = await createCaptcha();
    try {
        const msg = await member.send('Envía un mensaje con lo que dice en la imagen.\nNota: tienes un día para hacerlo, sino, serás expulsado automaticamente.', {
            files: [{
                attachment: `${__dirname}/captchas/${captcha}.png`,
                name: `${captcha}.png`
            }]
        });
        try {
            const filter = m => {
                if(m.author.bot) return;
                if(m.author.id === member.id && m.content === captcha) return true;
                else {
                    m.channel.send('Fallaste en alguna letra o número. Comprueba la imagen e intentalo nuevamente.');
                    return false;
                }
            };
            const response = await msg.channel.awaitMessages(filter, { max: 1, time: 850000, errors: ['time']});
            if(response) {
                await msg.channel.send('¡Te has verificado! ¡Lo escribiste correctamente!\nGracias por elegir a Logística Salto.');
                await member.roles.add('653357920171327489');
                await fs.unlink(`${__dirname}/captchas/${captcha}.png`)
                    .catch(err => console.log(err));
            }
        }
        catch(err) {
            console.log(err);
            await msg.channel.send('No respondiste en tiempo y forma 😔. Has sido expulsado.');
            await member.kick();
            await fs.unlink(`${__dirname}/captchas/${captcha}.png`)
                    .catch(err => console.log(err));
        }
    }
    catch(err) {
        console.log(err);
    }
});