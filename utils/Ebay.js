module.exports = class EbayAPI{
    // item filters: https://developer.ebay.com/devzone/finding/callref/types/ItemFilterType.html
    constructor(){
        this.ebayUrl = 'http://svcs.ebay.com/services/search/FindingService/v1';
        this.appIDParam = '&SECURITY-APPNAME=';
        this.ebayAppID = 'BrandonH-SkuGrid-PRD-066850dff-54313674';
        this.opNameParam = '?OPERATION-NAME=';
        this.opName = 'findCompletedItems';
        this.serVerParam = '&SERVICE-VERSION=';
        this.version = '1.13.0';
        this.ebayLocParam = '&GLOBAL-ID=';
        this.ebayLocID = 'EBAY-US';
        this.responseFormat = '&RESPONSE-DATA-FORMAT=';
        this.callbackParam = '&callback=';
        this.callbackFunction = 'handleEbayResponse';
        this.responseType = 'JSON';
        this.restPayload = '&REST-PAYLOAD';
        this.paginationPageParam='&paginationInput.pageNumber=';
        this.paginationParam = '&paginationInput.entriesPerPage=';
        this.paginationEntries = '100';
        this.categoryParam = '&categoryId=';
        this.pictureReq = '&outputSelector=PictureURLSuperSize';
        this.noCors = '&mode=no-cors';
        this.conditionParam = '&itemFilter(0).name=Condition';
        this.conditionValue = '&itemFilter(0).value=1000';
        this.shippingParam = '&itemFilter(1).name=FreeShippingOnly';
        this.shippingValue = '&itemFilter(1).value=true';
        this.soldParam = '&itemFilter(2).name=SoldItemsOnly';
        this.soldValue = '&itemFilter(2).value=true';
        this.listingParam = '&itemFilter(3).name=ListingType';
        this.listingValue = '&itemFilter(3).value=FixedPrice';
        this.sortParam = '&sortOrder=';
        this.sortOrder = 'EndTimeSoonest';
        this.globalCategoryList = ['11700','2984','12576','619','1281','888','220','3252'];
        this.endpoint = this.buildEbayEndpoint();
    }

    buildEbayEndpoint(){
        let ebayEndpoint = [];
        let pages = 5;

        for (let pageNumber = 1; pageNumber <= pages; pageNumber++){
            for (let j = 1; j <= this.globalCategoryList.length; j++){
                ebayEndpoint.push(this.ebayUrl
                    + this.opNameParam
                    + this.opName
                    + this.serVerParam
                    + this.version
                    + this.appIDParam
                    + this.ebayAppID
                    + this.ebayLocParam
                    + this.ebayLocID
                    + this.responseFormat
                    + this.responseType
                    + this.restPayload
                    + this.categoryParam
                    + this.globalCategoryList[j-1]
                    + this.pictureReq
                    + this.conditionParam
                    + this.conditionValue
                    + this.shippingParam
                    + this.shippingValue
                    + this.soldParam
                    + this.soldValue
                    + this.listingParam
                    + this.listingValue
                    + this.sortParam
                    + this.sortOrder
                    + this.paginationPageParam
                    + pageNumber
                    + this.paginationParam
                    + this.paginationEntries
                    + this.noCors);
            }
        }

        return ebayEndpoint;
    };

    get categoryList(){
        return this.globalCategoryList;
    }
};
