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

    createEbayAccount() {

    }

    static refreshAccessToken(refreshToken) {
        return new Promise((resolve, reject) => {
            if (!refreshToken){
               return reject("No refresh token set");
            }
            refresh.requestNewAccessToken('oauth2', refreshToken, (err, accessToken, refreshToken) => {
                if (err) {
                    reject({error: err})
                } else {
                    resolve({accessToken: accessToken, refreshToken: refreshToken})
                }
            });
        })
    }

    async validateEbayAccount() {
        if (!this.ebayAccount.merchantLocationKey) {
            this.createOrSetMerchantLocationKey();
        }

        if (this.isAnyPoliciesMissing() && this.ebayAccount.accessToken) {
            await this.getPolicies();
        }

        if (!this.ebayAccount.defaultCategoryTreeId) {
            await this.ebayAccount.setDefaultCategory()
        }
    }

    createOrSetMerchantLocationKey() {
        this.ebayAccount.getLocation().then(async (res) => {
            if (res) {
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
            if (!res.fulfillmentPolicies){return "no policies"}
            res.fulfillmentPolicies.forEach(async (policy) => {
                await this.ebayAccount.addPolicy("fulfillment", [{
                    name: policy.name,
                    policyId: policy.fulfillmentPolicyId
                }]);
            });
        });
        await this.ebayAccount.getReturnPolicies().then(async (res) => {
            if (!res.returnPolicies){return "no policies"}
            res.returnPolicies.forEach(async (policy) => {
                await this.ebayAccount.addPolicy("return", [{
                    name: policy.name,
                    policyId: policy.returnPolicyId
                }]);
            });
        });
        await this.ebayAccount.getPaymentPolicies().then(async (res) => {
            if (!res.paymentPolicies){return "no policies"}
            res.paymentPolicies.forEach(async (policy) => {
                await this.ebayAccount.addPolicy("payment", [{
                    name: policy.name,
                    policyId: policy.paymentPolicyId
                }]);
            });
        });
    }
};