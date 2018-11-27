module.exports = class AmazonProductParser {

    constructor(ebayAccount) {
        this.ebayAccount = ebayAccount;
    }

    async parse(res) {
        return new Promise((resolve, reject) => {
            try {
                resolve({
                    source: "amazon",
                    ebayAccount: this.ebayAccount,
                    merchantLocationKey: this.ebayAccount.getMerchantLocationKey(),
                    sourceID: res.ItemSearchResponse.Items[0].Item[0].ASIN[0],
                    title: res.ItemSearchResponse.Items[0].Item[0].ItemAttributes[0].Title[0],
                    sourcePrice: res.ItemSearchResponse.Items[0].Item[0].ItemAttributes[0].ListPrice[0].FormattedPrice[0].replace('$', ''),
                    price: this.getPrice(res.ItemSearchResponse.Items[0].Item[0].ItemAttributes[0].ListPrice[0].FormattedPrice[0].replace('$', '')),
                    height: (res.ItemSearchResponse.Items[0].Item[0].ItemAttributes[0].ItemDimensions[0].Height[0]._ / 100).toFixed(2),
                    width: (res.ItemSearchResponse.Items[0].Item[0].ItemAttributes[0].ItemDimensions[0].Width[0]._ / 100).toFixed(2),
                    length: (res.ItemSearchResponse.Items[0].Item[0].ItemAttributes[0].ItemDimensions[0].Length[0]._ / 100).toFixed(2),
                    dimensionUnit: res.ItemSearchResponse.Items[0].Item[0].ItemAttributes[0].ItemDimensions[0].Length[0].$.Units.split('-')[1],
                    weight: (res.ItemSearchResponse.Items[0].Item[0].ItemAttributes[0].ItemDimensions[0].Weight[0]._ / 100).toFixed(2),
                    weightUnit: res.ItemSearchResponse.Items[0].Item[0].ItemAttributes[0].ItemDimensions[0].Weight[0].$.Units.split(' ')[1],
                    brand: res.ItemSearchResponse.Items[0].Item[0].ItemAttributes[0].Brand[0],
                    description: res.ItemSearchResponse.Items[0].Item[0].ItemAttributes[0].Feature[0] + '\n\n' +
                    res.ItemSearchResponse.Items[0].Item[0].EditorialReviews[0].EditorialReview[0].Content[0],
                    productDetails: res.ItemSearchResponse.Items[0].Item[0].ItemAttributes[0].Feature[0],
                    image: res.ItemSearchResponse.Items[0].Item[0].ImageSets[0].ImageSet[0].HiResImage[0].URL[0],
                    mpn: res.ItemSearchResponse.Items[0].Item[0].ItemAttributes[0].MPN[0],
                    ean: res.ItemSearchResponse.Items[0].Item[0].ItemAttributes[0].EAN[0],
                    published: false,
                    created: false,
                    itemSKU: sku.generate(),
                    paymentPolicy: this.ebayAccount.getPaymentPolicy(),
                    returnPolicy: this.ebayAccount.getReturnPolicy(),
                    fulfillmentPolicy: this.ebayAccount.getFulfillmentPolicy(),
                    categoryId: this.ebayAccount.getCategory(res.ItemSearchResponse.Items[0].Item[0].ItemAttributes[0].Title[0])
                })

            } catch (err){
                reject(err);
            }
        });
    }
};