const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const { msleep } = require('sleep');
const { Select, Input, Password } = require('enquirer');
const fs = require('fs');
require('colors');
puppeteer.use(StealthPlugin());

if (process.argv.includes('--user') && process.argv.includes('--password')) {
    let user = process.argv[process.argv.indexOf('--user') + 1];
    let pass = process.argv[process.argv.indexOf('--password') + 1];

    bot(user + ':' + pass);
} else if (!fs.existsSync('accounts.txt')) {
    addAccount();
} else {
    selectAccount();
}

function addAccount() {
    const userPrompt = new Input({
        name: 'user',
        message: 'Enter your Surfow username'
    });

    const passPrompt = new Password({
        name: 'pass',
        message: 'Enter your Surfow password'
    });

    userPrompt.run().then(async (user) => {
        passPrompt.run().then(async (pass) => {
            if (user.replaceAll(' ', '').length < 1 || pass.replaceAll(' ', '').length < 1) {
                console.log('The account is not valid !'.red);
                process.exit();
            }

            fs.appendFileSync('accounts.txt', user + ':' + pass + '\r\n');
            console.log('The account has been added !'.green);
            
            selectAccount();
        }).catch(() => {
            process.exit();
        });
    }).catch(() => {
        process.exit();
    });
}

function selectAccount() {
    let accountsFile = fs.readFileSync('accounts.txt', 'utf8').split('\r\n');
    let accounts = accountsFile.map((account) => {
        return account.split(':')[0];
    }).filter((account) => {
        return account.replaceAll(' ', '').length > 0;
    });
    
    if (accounts.length < 1) {
        return addAccount();
    }

    accounts.push('Add an account');

    const prompt = new Select({
        name: 'user',
        message: 'Pick an account',
        choices: accounts
    });
    
    prompt.run().then(async (user) => {
        if (user === 'Add an account') {
            return addAccount();
        }

        user = user + ':' + accountsFile.filter((account) => {
            return account.split(':')[0] === user;
        })[0].split(':')[1];
    
        if (user.replaceAll(' ', '').length < 1) {
            console.log('The account is not valid !'.red);
            process.exit();
        }
    
        bot(user);
    }).catch(() => {
        process.exit();
    });
}

function rn(min, max) {
    return parseInt(Math.floor(Math.random() * (max - min + 1) + min)).toFixed(0);
}

async function bot(user) {
    console.log(`Setting up the bot...`);
    let browser = await puppeteer.launch({
        headless: true, // TODO: true for production
        executablePath: __dirname + '/chrome-win/chrome.exe',
        timeout: 0,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox'
        ]
    });

    browser.on('disconnected', () => {
        console.log('Browser disconnected');
        process.exit();
    });

    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(0); 

    await page.goto('https://surfow.info/signin');
    await page.waitForSelector('input[name="username"]');

    console.log('Connecting to the ' + user.split(':')[0].cyan + ' account...')
    
    msleep(rn(1000, 2000));
    await page.type('input[name=username]', user.split(':')[0]);
    msleep(rn(1000, 2000));
    await page.type('input[name=password]', user.split(':')[1]);
    msleep(rn(1000, 2000));
    await page.click('.surfow_submit');
    msleep(rn(1000, 2000));

    await page.waitForSelector('.dashboard').catch(async () => {
        console.log('Failed to log in to the '.red + user.split(':')[0].cyan + ' account !'.red);
        if (await page.$('.alert-danger') !== null) {
            console.log('Details: '.red + (await page.evaluate(() => {
                return document.querySelector('.alert-danger').innerText;
            })).red);
        }
        process.exit();
    });

    console.log('Successfully logged in to the '.green + user.split(':')[0].cyan + ' account !'.green);
    console.log('Starting the exchange...');

    await page.goto('https://surfow.info/exchange');

    await page.waitForSelector('.card');

    if (await page.$('.dimmer') === null) {
        await page.waitForSelector('.surfow_submit');
        await page.click('.surfow_submit');

        msleep(rn(6000, 7000));
    }

    msleep(rn(1000, 2000));

    await page.waitForSelector('.dimmer a.btn');

    await page.click('.dimmer a.btn');
    await page.waitForSelector('#start_buttons button');

    msleep(rn(1000, 2000));
    await page.click('#start_buttons button');

    console.log(`\r\n`.repeat(12));

    process.on('exit', async () => {
        console.log('Stopping the bot !');
    
        await browser.close();
        process.exit();
    });

    while (true) {
        let points = await page.evaluate(() => {
            return document.querySelector('b#points').innerText;
        });
        let url = await page.evaluate(() => {
            return document.querySelector('span#url').innerText;
        });
        let duration = await page.evaluate(() => {
            return document.querySelector('strong#duration').innerText;
        });
        let seconds = await page.evaluate(() => {
            return document.querySelector('strong#seconds').innerText;
        });

        let percent = (100 - (parseInt(seconds) / parseInt(duration) * 100)).toFixed(0);
        let bar = '';
        for (let i = 0; i < 50; i++) {
            if (i < (percent / 2).toFixed(0)) {
                bar += '█';
            } else {
                bar += ' ';
            }
        }

        process.stdout.moveCursor(0, -8);
        process.stdout.clearScreenDown();
        process.stdout.write(
            `${points} points`.magenta + `\r\n` +
            `Browsing ` + url.cyan + ` for ` + duration.blue + ` seconds` + `\r\n` +
            `Time remaining: ` + seconds.blue + ` seconds` + `\r\n` +
            `\r\n` +
            `\t\tProgress: ` + percent.blue + `%`.blue + `\r\n` +
            `[${bar.grey}]` + `\r\n` +
            `\r\n` +
            `Press `.red + `CTRL + C`.yellow + ` to stop the bot`.red + `\r\n`
        );

        msleep(950);
    }
}