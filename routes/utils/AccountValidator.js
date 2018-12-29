// Valid Ebay Account
// Valid Access Token
// All information needed for item creation:
// merchantLocationKey, policies, mainCategoryId

var refresh = require('passport-oauth2-refresh');

module.exports = class AccountValidator {

    constructor(user) {
        this.user = user;
        this.ebayAccount = null;
    }

    validate() {
        if (!this.user) {
            return new Error("No user account found!");
        }

        this.ebayAccount = this.user.getEbayAccounts()[0];

        if (!this.ebayAccount) {
            this.createEbayAccount();
        }

        this.validateEbayAccount();
    }

    createEbayAccount(){

    }

    static refreshAccessToken(ebayAccount){
        return new Promise((resolve, reject) => {
            refresh.requestNewAccessToken('oauth2', ebayAccount.refreshToken, (err, accessToken, refreshToken) => {
                ebayAccount.setAccessToken(accessToken);
                ebayAccount.setRefreshToken(refreshToken);
                ebayAccount.save()
                    .then(() => {
                        resolve(true)
                    })
                    .catch(() => {
                        reject(false)
                    });
            });
        })
    }

    async validateEbayAccount() {
        if (!this.ebayAccount.merchantLocationKey) {
            this.createOrSetMerchantLocationKey();
        }

        if (this.isAnyPoliciesMissing()) {
            await this.getPolicies();
        }

        if (!this.ebayAccount.defaultCategoryTreeId) {
            await this.ebayAccount.setDefaultCategory()
        }
    }

    createOrSetMerchantLocationKey(){
        this.ebayAccount.getLocation().then(async (res)=>{
            if (res){
                this.ebayAccount.setLocation(res.location);
            } else {
                await this.ebayAccount.createLocation("mainWarehouse");
            }
        })
    }

    isAnyPoliciesMissing() {
        return (this.ebayAccount.fulfillmentPolicies && this.ebayAccount.paymentPolicies && this.ebayAccount.returnPolicies)
    }

    async getPolicies() {
        await this.ebayAccount.getFulfillmentPolicies().then(async (res) => {
            console.log(res);
            res.fulfillmentPolicies.forEach(async (policy) => {
                await this.ebayAccount.addPolicy("fulfillment", [{
                    name: policy.name,
                    policyId: policy.fulfillmentPolicyId
                }]);
            });
        });
        await this.ebayAccount.getReturnPolicies().then(async (res) => {
            res.returnPolicies.forEach(async (policy) => {
                await this.ebayAccount.addPolicy("return", [{
                    name: policy.name,
                    policyId: policy.returnPolicyId
                }]);
            });
        });
        await this.ebayAccount.getPaymentPolicies().then(async (res) => {
            res.paymentPolicies.forEach(async (policy) => {
                await this.ebayAccount.addPolicy("payment", [{
                    name: policy.name,
                    policyId: policy.paymentPolicyId
                }]);
            });
        });
    }


}