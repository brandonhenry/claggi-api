var sku = require('./SkuGenerator');
module.exports = class AmazonProductParser {

    constructor(ebayAccount) {
        this.ebayAccount = ebayAccount;
        this.margin = 0.4;
        this.quantity = 2;
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
            product = this.concat(product, this.checkItemAttributes(res, "ASIN"));
            product = this.concat(product, this.checkItemAttributes(res, "Image"));
            product = this.concat(product, this.checkItemAttributes(res, "Title"));
            product = this.concat(product, this.checkItemAttributes(res, "ListPrice"));
            product = this.concat(product, this.checkItemAttributes(res, "ItemDimensions"));
            product = this.concat(product, this.checkItemAttributes(res, "Brand"));
            product = this.concat(product, this.checkItemAttributes(res, "Feature"));
            product = this.concat(product, this.checkItemAttributes(res, "MPN"));
            product = this.concat(product, this.checkItemAttributes(res, "EAN"));
            try {
                product = this.concat(product, {
                    source: "amazon",
                    ebayAccount: this.ebayAccount,
                    merchantLocationKey: this.ebayAccount.getMerchantLocationKey(),
                    published: false,
                    created: false,
                    itemSKU: sku.generate(),
                    paymentPolicy: this.ebayAccount.getPaymentPolicy(),
                    returnPolicy: this.ebayAccount.getReturnPolicy(),
                    fulfillmentPolicy: this.ebayAccount.getFulfillmentPolicy(),
                    quantity: this.quantity
                });
                resolve(product);
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

    checkItemAttributes(res, attr) {
        if (!res.ItemSearchResponse.Items[0].hasOwnProperty("Item")){return;}
        if (!res.ItemSearchResponse.Items[0].Item[0].hasOwnProperty("ItemAttributes")) {
            return null;
        }
        switch (attr) {
            case "ASIN":
                if (res.ItemSearchResponse.Items[0].Item[0].hasOwnProperty("ASIN")) {
                    return {
                        sourceID: res.ItemSearchResponse.Items[0].Item[0].ASIN[0]
                    };
                }
                break;
            case "Image":
                if (res.ItemSearchResponse.Items[0].Item[0].ImageSets[0].ImageSet[0].hasOwnProperty("HiResImage")) {
                    return {
                        image: res.ItemSearchResponse.Items[0].Item[0].ImageSets[0].ImageSet[0].HiResImage[0].URL[0]
                    }
                }
                break;
            case "Title":
                if (res.ItemSearchResponse.Items[0].Item[0].ItemAttributes[0].hasOwnProperty("Title")) {
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
                        json = this.concat(json,{height: (res.ItemSearchResponse.Items[0].Item[0].ItemAttributes[0].ItemDimensions[0].Height[0]._ / 100).toFixed(2)});
                    }
                    if (res.ItemSearchResponse.Items[0].Item[0].ItemAttributes[0].ItemDimensions[0].hasOwnProperty("Width")) {
                        json = this.concat(json, {width: (res.ItemSearchResponse.Items[0].Item[0].ItemAttributes[0].ItemDimensions[0].Width[0]._ / 100).toFixed(2)});
                    }
                    if (res.ItemSearchResponse.Items[0].Item[0].ItemAttributes[0].ItemDimensions[0].hasOwnProperty("Height")) {
                        json = this.concat(json, {length: (res.ItemSearchResponse.Items[0].Item[0].ItemAttributes[0].ItemDimensions[0].Length[0]._ / 100).toFixed(2)});
                    }
                    if (res.ItemSearchResponse.Items[0].Item[0].ItemAttributes[0].ItemDimensions[0].hasOwnProperty("Length")) {
                        json = this.concat(json, {dimensionUnit: res.ItemSearchResponse.Items[0].Item[0].ItemAttributes[0].ItemDimensions[0].Length[0].$.Units.split('-')[1]});
                    }
                    if (res.ItemSearchResponse.Items[0].Item[0].ItemAttributes[0].ItemDimensions[0].hasOwnProperty("Weight")) {
                        json = this.concat(json, {weight: (res.ItemSearchResponse.Items[0].Item[0].ItemAttributes[0].ItemDimensions[0].Weight[0]._ / 100).toFixed(2)});
                    }
                    if (res.ItemSearchResponse.Items[0].Item[0].ItemAttributes[0].ItemDimensions[0].hasOwnProperty("Weight")) {
                        json = this.concat(json, {weightUnit: res.ItemSearchResponse.Items[0].Item[0].ItemAttributes[0].ItemDimensions[0].Weight[0].$.Units.split(' ')[1],});
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