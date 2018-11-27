// Valid Ebay Account
// Valid Access Token
// All information needed for item creation:
// merchantLocationKey, policies, mainCategoryId

var EbayAccount = mongoose.model('ebayaccount');

class AccountValidator {

    constructor(user, ebayAccount) {
        this.user = user;
        this.ebayAccount = ebayAccount;
    }

    validate() {
        if (!this.user) {
            return new Error("No user account found!");
        }

        if (!this.ebayAccount) {
            this.createEbayAccount();
        }

        this.validateEbayAccount();
    }

    createEbayAccount(){

    }

    validateEbayAccount() {
        if (!this.ebayAccount.merchantLocationKey) {
            this.createOrSetMerchantLocationKey();
        }

        if (this.isAnyPoliciesMissing()) {
            this.getPolicies();
        }

        if (!this.ebayAccount.defaultCategoryTreeId) {
            this.getDefaultCategoryTreeId();
        }
    }

    createOrSetMerchantLocationKey(){

    }

    getDefaultCategoryTreeId(){

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

        setActivePolicies();
    }
}