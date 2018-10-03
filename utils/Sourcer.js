var request = require('request-promise');
var EbayAPI = require('./Ebay');

class Sourcer{

    scrape(){
        try {
            let ebay = new EbayAPI();
            let azItems = [];
            for (let pageNumber = 1; pageNumber <= 5; ++pageNumber) {
                let categoryId = i - 1;
                let tempItems = await massEbayRequest(ebay, pageNum, categoryId);
                azItems = azItems.concat(tempItems);
                if (pageNumber === 5) {
                    azItems.forEach(function (item) {
                        // process all amazon items
                    });
                }
            }
        } catch (err) {
            console.log(err);
            throw new Error('Failed to send response' + err);
        }
    }



}

module.exports = Sourcer;