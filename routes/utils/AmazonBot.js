var puppeteer = require('puppeteer');

class AmazonBot {
    constructor(timeout = 5000) {
        this.urls = {
            login: 'https://www.amazon.com/ap/signin?ie=UTF8&openid.pape.max_auth_age=0&openid.return_to=https%3A%2F%2Fwww.amazon.com%2Fyour-account%3Fref_%3Dnav_signin&openid.identity=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select&openid.assoc_handle=usflex&openid.ns.pape=http%3A%2F%2Fspecs.openid.net%2Fextensions%2Fpape%2F1.0&openid.mode=checkid_setup&_encoding=UTF8&openid.claimed_id=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select&openid.ns=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0&switch_account=signin&ignoreAuthState=1&disableLoginPrepopulate=1&ref_=ap_sw_aa',
            logout: 'https://www.amazon.com/gp/flex/sign-out.html/ref=nav_youraccount_bnav_ya_ad_so?ie=UTF8&action=sign-out&path=%2Fgp%2Fyourstore%2Fhome&signIn=1&useRedirectOnSuccess=1',
            item: 'www.amazon.com/gp/product',
            cart: 'www.amazon.com/gp/cart/view.html',
            redeem: 'www.amazon.com/gc/redeem',
            addresses: 'www.amazon.com/gp/css/account/address/view.html'
        };

        this.browser = null;
        this.page = null;
        this.cookies = [];
    }

    login(email, password) {
        var url = this.urls.login;
        var i = this;

        return new Promise(async function (resolve, reject) {
            var loggedIn = false;

            i.browser = await puppeteer.launch({headless: false});
            i.page = await i.browser.newPage();
            await i.page.goto(url);
            await i.page.type('input#ap_email', email);
            await i.page.click('#continue');
            await i.page.waitForSelector('input#ap_password');
            await i.page.type('input#ap_password', password);
            await i.page.click('#signInSubmit');
            try {
                await i.page.waitForSelector('.abnav-accountfor').then(function () {
                    loggedIn = true;
                }).catch();
            } catch (err) {
                // do nothing
            }

            return await i.page.cookies()
                .then(async function (cookies) {
                    i.cookies = cookies;
                    (loggedIn) ? resolve('Login successful') : reject('Login failed');
                });
        });
    }

    logout() {
        var url = this.urls.logout;
        var cookies = this.cookies;
        var i = this;

        return new Promise(async function (resolve, reject) {
            i.page.cookies(cookies);
            i.page.goto(url);

            resolve('Logout successful');

        });
    }

    close() {
        i.browser.close();
    }

    addToCart(id, quantity) {
        var url = this.urls.item + id;
        var i = this;

        return new Promise(async function (resolve, reject) {
            await i.page.cookies(i.cookies);
            await i.page.goto(url);
            await i.page.waitForSelector('#quantity');
            await i.page.select('#quantity', quantity);

            await i.page.waitForSelector('input#add-to-cart-button');
            await i.page.click('input#add-to-cart-button');
            await i.page.waitForSelector('#attachDisplayAddBaseAlert');

            return (await i.page.text('#attachDisplayAddBaseAlert') === "Added to Cart") ?
                resolve('Item added to cart') : reject('Item not added to cart');

        })
    }

    addMultipleToCart(items) {
        var i = this;
        return Promise.each(items, function (item) {
            return i.addToCart(item.id, item.quantity);
        })
    }
}

module.exports = AmazonBot;
