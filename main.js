const fs = require('fs');
const axios = require('axios');

var arguments = process.argv.slice(2).map((element) => {
    return element.toLowerCase();
});

if (arguments[0] == undefined) throw new Error('No arguments provided');
if (arguments[1] == undefined) arguments[1] = 'checked_tokens.txt';

fs.readFile(__dirname + '\\' + arguments[0], 'utf8', (error, data) => {
    if (error) throw error;

    var discordTokens = data.split('\r\n');
    var checkedTokens = 0;
    var validTokens = [];

    const discordTokensNoDuplicates = discordTokens.filter((element, index) => {
        return discordTokens.indexOf(element) === index;
    });

    console.log('Found ' + (discordTokens.length - discordTokensNoDuplicates.length) + ' duplicate token(s)');

    discordTokensNoDuplicates.forEach((token) => {
        axios('https://discordapp.com/api/v6/users/@me', {
            headers: {
                Authorization: token,
            },
        })
            .then(function (response) {
                console.log('(+) ' + response.data.username + '#' + response.data.discriminator);
                validTokens.push(token);
            })
            .catch(function (error) {
                switch (error.response.status) {
                    case 401:
                        console.log('(-) ' + token);
                        break;
                    default:
                        throw new Error('No connection to discord!');
                }
            })
            .finally(() => {
                checkedTokens++;

                if (checkedTokens == discordTokensNoDuplicates.length) {
                    fs.writeFile(__dirname + '\\' + arguments[1], validTokens.join('\r\n'), (error) => {
                        if (error) throw new Error("Couldn't write to file!");

                        console.log('Created file at ' + __dirname + '\\' + arguments[1] + ' with ' + validTokens.length + ' valid tokens');
                    });
                }
            });
    });
});
