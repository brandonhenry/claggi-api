var authorizationURL = 'https://auth.sandbox.ebay.com/oauth2/authorize?',
    tokenURL = 'https://api.sandbox.ebay.com/identity/v1/oauth2/token',
    clientID = 'BrandonH-SkuGrid-SBX-2bc40d285-5e9137e5',
    clientSecret = 'SBX-bc40d28559c1-7758-4fd5-a999-9b40',
    redirectURLName = 'Brandon_Henry-BrandonH-SkuGri-nvdhdguy',
    scope = 'https://api.ebay.com/oauth/api_scope https://api.ebay.com/oauth/api_scope/sell.marketing.readonly https://api.ebay.com/oauth/api_scope/sell.marketing https://api.ebay.com/oauth/api_scope/sell.inventory.readonly https://api.ebay.com/oauth/api_scope/sell.inventory https://api.ebay.com/oauth/api_scope/sell.account.readonly https://api.ebay.com/oauth/api_scope/sell.account https://api.ebay.com/oauth/api_scope/sell.fulfillment.readonly https://api.ebay.com/oauth/api_scope/sell.fulfillment https://api.ebay.com/oauth/api_scope/sell.analytics.readonly';


var eBayCredentials = {
    auth: authorizationURL,
    token: tokenURL,
    id: clientID,
    secret: clientSecret,
    redirect: redirectURLName,
    scope: scope
};

var oktaCredentials = {
	authKey: "00eiglWU6Ulkv8vYPyNIAx0Dn4kz243OLVE7-NUh3D",
	clientKey: "0oa1047vvhR9PytaF357"
}
module.exports = eBayCredentials;