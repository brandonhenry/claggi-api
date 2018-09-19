var router = require('express').Router();
var mongoose = require('mongoose');
var Listing = mongoose.model('Listing');

var appID = 'BrandonH-SkuGrid-PRD-066850dff-54313674';
var ebayToken = 'v^1.1#i^1#I^3#f^0#r^0#p^3#t^H4sIAAAAAAAAAOVXW2wUVRju9oaAVWMIkAbCMi0ol9k9M7Mzuzuwm2xpsSu0XbulFUSaszNntkNnZ9aZM7QrxJSa8GJijVHLg1HEEECIoSqCJoIYDSZCqiYomhgTULw8oZTSmEA8s+2WbQ2Xtjw0cV8285//9n3//58L6CqduXxX7a5rZa4ZhXu6QFehy8XMBjNLS1Y8UFRYXlIA8hRce7oqu4q7i35fbcGUlhYbkZU2dAu5O1OabolZYYiyTV00oKVaog5TyBKxJMYjdetF1gPEtGlgQzI0yh2tDlEJTklwcpDn/QorJARIpHrOZ5MRohiOTfg4hQPkx7GQJ+uWZaOobmGo4xDFAiZAgyDNBJtYIHIBkRc8go/bRLmbkWmphk5UPIAKZ9MVs7ZmXq63TxVaFjIxcUKFo5G18YZItLqmvmm1N89XeISHOIbYtsZ+rTFk5G6Gmo1uH8bKaotxW5KQZVHe8HCEsU7FSC6ZSaSfpZpDKOiHrMKyPiDxAN4TKtcaZgri2+fhSFSZVrKqItKxijN3YpSwkdiKJDzyVU9cRKvdzt8TNtRURUVmiKqpimzcEK9ppNzxWMw0tqkykh2kDMdwAsOyfIAKSxpMJlV1JMSwnxGCx8VYY+iy6tBluesNXIVIvmg8K2weK0SpQW8wIwp2csnXY3PsccFNTjmH62fjNt2pKEoRCtzZzztzn2uGm+W/V+0g+VlF4gWekXiOYyV0i3ZwZn1CLRF2qhKJxbxOLigBM3QKmu0IpzUoIVoi9NopZKqyyPEKywUURMtCUKF9QUWhE7ws0IyCEEAokZCCgf9HZ2Bsqgkbo9HuGL+QhReiHDZFFSoiNtqR3pRJI2q8Zna7GWmJTitEtWGcFr3ejo4OTwfnMcyklwWA8T5Ztz4utaEU2QRyuuqdlWk12xxOrxB9EZMEQlQn6T0SXE9S4caatY018drWpoZ1NfW5vh2TWXi89BZI45KRRjFDU6XM9ILImXIMmjgTR5pGBFMCaTkgpxM8Z9apsOPDIk5gWvU4HeeRjJTXgGS/ckSt2azdd6PktQhJnuHpJ949JoKyoWuZyRhPwEbVt5ERMszMZAKOGk/ABkqSYet4MuFGTCdgodiaomqas0tMJmCe+UTS1KGWwapkjYacUuNH0umoPJ0anwpXmVAnwGrpeLv9GDmd6FhjNQ0EIcADmRxMvM85OPy+KcGuS6rTBzWZdX8WOeML+vxMkOV4APxTwleNtk23sgYDgqQkBB8NkQBpH2QZOsgrCVphGSj4AUQ8p0wJ8xpNJaM0/Y7iWsPCSJ4aNHJbnF6gnJnMjaQioCBNbooS7fOzPB2ASKYZLsHeLeRxgryr13/u296xT91wQfbHdLuOgm5XH3ktAy9YwlSAxaVFG4qL7i+3VIw85JrmsdSkTl5wJvK0o0waqmZhqeupBUcOtuY9rvc8DeaPPq9nFjGz897aYMHNlRLmwXllTAAEyagCLsALm0DFzdViZm7xnPd2Xo4PfX7jwpWBHx/XF4VaLkY3HABlo0ouV0lBcberIFZ++pf9uzPJ86/dWLajp/nclTeWP7d31XYq1dnd1PXzC83fnTm+t7y3X1zZz3xw8sXD/Y+eP8VUfvTxpUO73/xeN+Nv9Veknxn89MJngYJm16VXVpzakvpjyB5QqL/2bb5+eH9m6Oqzq9X94XUfwusLT2yZNevXenT8eddPZzff2Kj8dubyUEkLXl5yInNf2WDft22HK7946N3X8dzF185ePdZcsd7Nlw6eOzmvssW2a985d8C/vevrvy/+U7D17F565w8rF/W2DAzOqgu9z8xRzh+r39Fz6eARoa334ZZPXqKOHF96um/RI70vgxNHF7791Z+v9jDMN1WrCpeemd+3T+/JLN3ZeuzQki+XHZwxXL5/AWyyZLf2EAAA';

var options = {
	url: 'https://api.ebay.com/sell/inventory/v1/inventory_item',
	headers: {
		Authorization: Bearer <ebayToken>,
		Content-Language: en-US,
		X-EBAY-C-MARKETPLACE-ID: EBAY_US	
	}
};
	
function callback(error, response, body){
	if (!error && response.statusCode == 200) {
		var info = JSON.parse(body);
		
		info.each(function(item, index){
			var newListing = new Listing(item);
			allListings.push(newListing)
		}
	};
	
	resolve(allListings);
	
	}
}

async function getListings(){
	var allListings = [];
	
	return new Promise(function(resolve, reject){
		request(options, callback);
	}
}

router.use('/', function(req, res, next){
	res.send(await getListings());
}

module.exports = router;