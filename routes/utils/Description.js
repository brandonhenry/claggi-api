var generate = function(listing){
    //if (shortDescription.includes('.com'){this.removeURL(shortDescription)};
    return `<title></title>
<meta charset="utf-8">
<meta http-equiv="X-UA-Compatible" content="&quot;IE=edge&quot;">
<meta name="viewport" content="&quot;width=device-width," initial-scale="1&quot;">
<link href="https://claggi.com/ebay/css/bootstrap.min.css" rel="stylesheet">
<link href="https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css" rel="stylesheet">
<link href="https://claggi.com/ebay/css/final.css" rel="stylesheet" type="text/css">
<link href="https://claggi.com/ebay/css/item.css" rel="stylesheet">
<div class="container-fluid contact-top">
    <div class="row favorite">
        <div class="col-md-12 favorite"><a class="phone" href="https://contact.ebay.com/ws/eBayISAPI.dll?FindAnswers&amp;requested=claggii" target="_blank">Contact Us </a> <a href="https://my.ebay.com/ws/eBayISAPI.dll?AcceptSavedSeller&amp;sellerid=claggii" target="_blank">Add to Favorite</a></div>
    </div>
</div>
<div class="all-content">
    <div class="header-top">
        <div class="container">
            <div class="row ">
                <div class="col-md-5 col-sm-4 col-xs-12 logo"><a href="https://ebay.com/usr/claggii" target="_blank"><img class="logo" src="https://claggi.com/ebay/images/logo10165.png"></a></div>
                <div class="col-md-7 col-sm-8 col-xs-12 hidden-xs">
                    <div class="header-buttons"><a href="https://contact.ebay.com/ws/eBayISAPI.dll?FindAnswers&amp;requested=claggii" target="_blank">Contact Us</a> <a href="https://my.ebay.com/ws/eBayISAPI.dll?AcceptSavedSeller&amp;sellerid=claggii" target="_blank"> Add to Favorite</a></div>
                </div>
            </div>
        </div>
    </div>
    <div class="value-cions detail-val">
        <div class="container">
            <div class="row">
                <div class="col-sm-3">
                    <div class="value-cion"><span><img src="https://claggi.com/ebay/images/icon1.png"></span>
                        <p>Fast Shipping</p>
                    </div>
                </div>
                <div class="col-sm-3">
                    <div class="value-cion"><span><img src="https://claggi.com/ebay/images/icon2.png"></span>
                        <p>Hassle Free Return</p>
                    </div>
                </div>
                <div class="col-sm-3">
                    <div class="value-cion"><span><img src="https://claggi.com/ebay/images/icon3.png"></span>
                        <p>eBay Money<br> Back Guarantee</p>
                    </div>
                </div>
                <div class="col-sm-3">
                    <div class="value-cion no-border"><span><img src="https://claggi.com/ebay/images/icon4.png"></span>
                        <p>Authenticity Guarantee</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="main-con">
        <div class="container">
            <div class="row">
                <div class="col-md-12 col-sm-12 col-xs-12 bor-box">
                    <div class="mob-bor">
                        <h4 class="main-title">&nbsp;</h4>
                        <div class="title titletmpl" style="">${listing.getTitle()}</div>
                        &nbsp;
                        <div class="row">
                            <div class="col-md-6 col-sm-6 col-xs-12">
                                <div class="zdz-gallery clearfix"><input autocomplete="off" checked="checked" id="imgView1" name="image-view" type="radio">
                                    <div class="img-box">
                                        <div class="img-holder" id="content1"><input autocomplete="off" id="popup-1" type="checkbox"> <label class="imgBox lightbox" for="popup-1"> </label>
                                            <div class="img-popup"><label class="imgBox lightbox" for="popup-1"><img src=${listing.getImage()}> </label></div>
                                            <label class="imgBox lightbox" for="popup-1"> </label></div>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-6 col-sm-6 col-xs-12">
                                <div class="data-table">
                                    <h2>Specification</h2>
                                    <div style="padding: 0px 10px;">
                                        <ul class="specs">
                                        ${listing.getProductDetails()}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                        &nbsp;
                        <div class="row">
                            <div class="col-md-12 col-sm-12 col-xs-12">
                                <div class="data-table">
                                    <h2>Item Description</h2>
                                </div>
                                <p class="styled">&nbsp;</p>
                                <div class="description" style="">${listing.getProductDescription()}
                                    <div class="speclist"><br>${listing.getProductDetails()}</div>
                                </div>
                                <p>&nbsp;</p>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-12 col-sm-12 col-xs-12">
                                <div class="zdzTabs mdl-Box">
                                    <div class="tabBox"><input autocomplete="off" checked="checked" id="tab1" name="tab-group" type="radio"> <label for="tab1">About us</label>
                                        <div class="panel">
                                            <div class="scrollBox">
                                                <p>Customer service is our top priority! Please be sure to read the description thoroughly to make sure that this is the item you want before making a purchasing decision. If you have any questions about this
                                                    item, please contact us via eBay messages before placing your order. We make every effort possible to accurately describe and depict the items. Please be aware that slight variations in color may be
                                                    due to differences in lighting and computer monitor resolutions. All items are in stock at the time of listing; however, in the unlikely and unforeseen event that we are unable to fulfill your order
                                                    through any of our networked warehouses, we will notify you as quickly as possible and offer you a 100% refund on your purchase. Thank you for shopping with us. We appreciate your business!</p>
                                            </div>
                                        </div>
                                        <div class="tabBox"><input autocomplete="off" id="tab2" name="tab-group" type="radio"> <label for="tab2">Payment</label>
                                            <div class="panel">
                                                <div class="scrollBox">
                                                    <p>PayPal is our preferred method of payment. If you do not have a PayPal account, all major credit cards are gladly accepted through PayPal as the payment processor. PayPal offers great buyer and seller
                                                        protection. Your order will be processed pending receipt of cleared payment through PayPal. Sales tax may be charged depending on your location.</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="tabBox"><input autocomplete="off" id="tab3" name="tab-group" type="radio"> <label for="tab3">Shipping</label>
                                            <div class="panel">
                                                <div class="scrollBox">
                                                    <p>We provide fast, free shipping. Most items are shipped within 1-3 business days of receiving cleared payment. We ship to the lower 48 contiguous United States only. We do not ship to P.O. Boxes or APOs.
                                                        For select items, we ship internationally through eBay's Global Shipping Program. We do ship most of our smaller items internationally using eBays Global Shipping Program. If ordering electrical
                                                        items outside of the U.S., please note that they will come equipped with a standard U.S. voltage plugs. You will need a suitable adapter to use the item in your country. Certain restrictions apply.
                                                        Standard or Economy Shipping is ALWAYS FREE! You will be notified via eBay messages as soon as your items ship. Special Notice for Freight Items: If an item ships via Freight (Truck) Delivery, a
                                                        valid phone number will be required so that we can contact you to schedule delivery. The item may be delivered with curbside delivery. An adult signature will be required. Please be sure to have
                                                        available help on hand to assist you with moving the item to the desired location in or outside of your home. Freight items must be inspected upon delivery. In the unlikely event that damaged is
                                                        observed, you MUST refuse delivery and note the damage on the shipping receipt and send it back via the Freight carrier. Returns will not be accepted on Freight items after they have been delivered,
                                                        inspected, and the driver has left the premises.</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="tabBox"><input autocomplete="off" id="tab5" name="tab-group" type="radio"> <label for="tab5">Returns</label>
                                            <div class="panel">
                                                <div class="scrollBox">
                                                    <p>We offer a 30 day return/exchange policy for most of our products. You can request a refund if you are dissatisfied for any reason with your product. (Restocking Fee May Apply). Only factory defects
                                                        are accepted as a reason for a return. In the case of factory defects, if available, we will replace the product for you. When returning an item, it must be in all of the original packaging and include
                                                        all of the original accessories or items that came with it. The item and package should be in original and perfect condition. You will be required to cover shipping on the return of non-defective
                                                        items. All returns MUST be done within 30 days of date of purchase. Please note that we cannot give refunds or replacements after the 30 day limit has expired. When sending in a return, please note
                                                        that it can take up to 7 business days for the return to be processed. We do our best to process as quickly as possible. We are extremely fair, and in the rare event of something out of the ordinary
                                                        happening with our products or shipping, we will gladly work with you to find a fair resolution.</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="tabBox"><input autocomplete="off" id="tab4" name="tab-group" type="radio"> <label for="tab4">Disclaimer</label>
                                            <div class="panel">
                                                <div class="scrollBox">
                                                    <p>Were sorry, but we do not honor product exchange requests. If you need to exchange an item received, you will need to go through the normal returns process identified in our returns section and then
                                                        order the correct item, if it is still available. Orders are processed immediately and dispatched to fulfillment as soon as they are received. For this reason, we are typically unable to honor cancellation
                                                        requests. If you need to cancel the transaction, please contact us as soon as possible and we will attempt to cancel the order. If the order has gone too far through the fulfillment process, we will
                                                        be unable to cancel. In that event, you would need to wait until you receive the item and go through the normal returns process as mentioned in the returns section of our policies.</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    &nbsp;
    <footer>
        <div class="fixedWidth">
            <div class="org-quick-sect">
                <div class="container">
                    <div class="row" style="margin:0px;">
                        <div class="col-md-6 col-sm-12 col-xs-12 pad-22"><img alt="#" class="res-img" src="https://claggi.com/ebay/images/secure-shopping-banner.png"></div>
                        <div class="col-md-6 col-sm-12 col-xs-12 pad-r">
                            <div class="row">
                                <div class="col-md-6 col-sm-6 col-xs-12 pad-22">
                                    <h3>Payment Options</h3>
                                    <img alt="#" class="res-img" src="https://claggi.com/ebay/images/pay-pal.png"></div>
                                <div class="col-md-6 col-sm-6 col-xs-12 pad-22">
                                    <h3>Shop With Confidence</h3>
                                    <img alt="#" class="res-img" src="https://claggi.com/ebay/images/money-bank.png"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="org-copyright">
                <div class="org-bottom-footer">
                    <ul>
                        <li><a> Copyright ©2018 Claggi, All rights reserved. </a></li>
                    </ul>
                </div>
            </div>
            <div class="clear">&nbsp;</div>
        </div>
    </footer>
</div>
    
    `;
};

module.export = generate;