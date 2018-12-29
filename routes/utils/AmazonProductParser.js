var sku = require('./SkuGenerator');
module.exports = class AmazonProductParser {

    constructor(ebayAccount) {
        this.ebayAccount = ebayAccount;
        this.margin = 0.4;
    }

    getPrice(price) {
        var calcPrice;
        calcPrice = Number(price) + (Number(price) * this.margin);
        calcPrice = calcPrice.toFixed(2);
        return calcPrice;
    }

    async parse(res) {
        return new Promise((resolve, reject) => {
            var product = {};

            try {
                resolve({
                    source: "amazon",
                    ebayAccount: this.ebayAccount,
                    merchantLocationKey: this.ebayAccount.getMerchantLocationKey(),
                    published: false,
                    created: false,
                    itemSKU: sku.generate(),
                    paymentPolicy: this.ebayAccount.getPaymentPolicy(),
                    returnPolicy: this.ebayAccount.getReturnPolicy(),
                    fulfillmentPolicy: this.ebayAccount.getFulfillmentPolicy(),

                })

            } catch (err) {
                reject(err);
            }
        });
    }

    concat(o1, o2) {
        for (var key in o2) {
            o1[key] = o2[key];
        }
        return o1;
    }

    addASINandImage(res) {
        if (res.ItemSearchResponse.Items[0].Item[0].hasOwnProperty("ASIN")) {
            return {
                sourceID: res.ItemSearchResponse.Items[0].Item[0].ASIN[0],
                image: res.ItemSearchResponse.Items[0].Item[0].ImageSets[0].ImageSet[0].HiResImage[0].URL[0],
            };
        }
    }

    checkItemAttributes(res, attr) {
        if (!res.ItemSearchResponse.Items[0].Item[0].hasOwnProperty("ItemAttributes")) {
            return null;
        }
        switch (attr) {
            case "Title":
                if (res.ItemSearchResponse.Items[0].Item[0].ItemAttributes[0].hasOwnProperty("")) {
                    return {
                        title: res.ItemSearchResponse.Items[0].Item[0].ItemAttributes[0].Title[0],
                        categoryId: this.ebayAccount.getCategory(res.ItemSearchResponse.Items[0].Item[0].ItemAttributes[0].Title[0])
                    };
                }
                break;
            case "ListPrice":
                return {
                    sourcePrice: res.ItemSearchResponse.Items[0].Item[0].ItemAttributes[0].ListPrice[0].FormattedPrice[0].replace('$', ''),
                    price: this.getPrice(res.ItemSearchResponse.Items[0].Item[0].ItemAttributes[0].ListPrice[0].FormattedPrice[0].replace('$', ''))
                };
            case "ItemDimensions":
                var json = {};
                if (res.ItemSearchResponse.Items[0].Item[0].ItemAttributes[0].hasOwnProperty("ItemDimensions")) {
                    if (res.ItemSearchResponse.Items[0].Item[0].ItemAttributes[0].ItemDimensions[0].hasOwnProperty("Height")) {
                        json.put({height: (res.ItemSearchResponse.Items[0].Item[0].ItemAttributes[0].ItemDimensions[0].Height[0]._ / 100).toFixed(2)});
                    }
                    if (res.ItemSearchResponse.Items[0].Item[0].ItemAttributes[0].ItemDimensions[0].hasOwnProperty("Width")) {
                        json.put({width: (res.ItemSearchResponse.Items[0].Item[0].ItemAttributes[0].ItemDimensions[0].Width[0]._ / 100).toFixed(2)});
                    }
                    if (res.ItemSearchResponse.Items[0].Item[0].ItemAttributes[0].ItemDimensions[0].hasOwnProperty("Height")) {
                        json.put({length: (res.ItemSearchResponse.Items[0].Item[0].ItemAttributes[0].ItemDimensions[0].Length[0]._ / 100).toFixed(2)});
                    }
                    if (res.ItemSearchResponse.Items[0].Item[0].ItemAttributes[0].ItemDimensions[0].hasOwnProperty("Length")) {
                        json.put({dimensionUnit: res.ItemSearchResponse.Items[0].Item[0].ItemAttributes[0].ItemDimensions[0].Length[0].$.Units.split('-')[1]});
                    }
                    if (res.ItemSearchResponse.Items[0].Item[0].ItemAttributes[0].ItemDimensions[0].hasOwnProperty("Weight")) {
                        json.put({weight: (res.ItemSearchResponse.Items[0].Item[0].ItemAttributes[0].ItemDimensions[0].Weight[0]._ / 100).toFixed(2)});
                    }
                    if (res.ItemSearchResponse.Items[0].Item[0].ItemAttributes[0].ItemDimensions[0].hasOwnProperty("Weight")) {
                        json.put({weightUnit: res.ItemSearchResponse.Items[0].Item[0].ItemAttributes[0].ItemDimensions[0].Weight[0].$.Units.split(' ')[1],});
                    }
                    return json;
                }
                break;
            case "Brand":
                if (res.ItemSearchResponse.Items[0].Item[0].ItemAttributes[0].hasOwnProperty("Brand")) {
                    return {brand: res.ItemSearchResponse.Items[0].Item[0].ItemAttributes[0].Brand[0]};
                }
                break;
            case "Feature":
                if (res.ItemSearchResponse.Items[0].Item[0].ItemAttributes[0].hasOwnProperty("Feature")) {
                    return {
                        description: res.ItemSearchResponse.Items[0].Item[0].ItemAttributes[0].Feature[0] + '\n\n' +
                            res.ItemSearchResponse.Items[0].Item[0].EditorialReviews[0].EditorialReview[0].Content[0],
                        productDetails: res.ItemSearchResponse.Items[0].Item[0].ItemAttributes[0].Feature[0],
                    };
                }
                break;
            case "MPN":
                if (res.ItemSearchResponse.Items[0].Item[0].ItemAttributes[0].hasOwnProperty("MPN")) {
                    return {mpn: res.ItemSearchResponse.Items[0].Item[0].ItemAttributes[0].MPN[0]};
                }
                break;
            case "EAN":
                if (res.ItemSearchResponse.Items[0].Item[0].ItemAttributes[0].hasOwnProperty("EAN")) {
                    return {ean: res.ItemSearchResponse.Items[0].Item[0].ItemAttributes[0].EAN[0]};
                }
                break;
        }
    }

};