"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("cross-fetch/polyfill");
const cognitoidentityserviceprovider_1 = __importDefault(require("aws-sdk/clients/cognitoidentityserviceprovider"));
const amazon_cognito_identity_js_1 = require("amazon-cognito-identity-js");
const faker_1 = __importDefault(require("faker"));
const FileService_1 = require("./FileService");
const Config_1 = require("./Config");
const const_1 = require("../const");
class CognitoService {
    constructor() {
        const { accessKeyId, secretAccessKey, region } = Config_1.Config.instance.aws;
        const options = {
            accessKeyId,
            secretAccessKey,
            region
        };
        this.cognitoIdentityServiceProvider = new cognitoidentityserviceprovider_1.default(options);
        // CognitoUserPoolの初期化
        this.cognitoUserPool = new amazon_cognito_identity_js_1.CognitoUserPool({
            UserPoolId: Config_1.Config.instance.UserPoolId,
            ClientId: Config_1.Config.instance.ClientId
        });
    }
    /** インスタンスの取得 */
    static get instance() {
        if (!this._instance) {
            this._instance = new CognitoService();
        }
        return this._instance;
    }
    async listUsers(options = {}) {
        const params = {
            UserPoolId: Config_1.Config.instance.UserPoolId,
            ...options
        };
        const listUsers = this.cognitoIdentityServiceProvider.listUsers(params);
        return listUsers.promise();
    }
    async adminCreateUser(options = {}) {
        var params = {
            UserPoolId: Config_1.Config.instance.UserPoolId /* required */,
            Username: 'STRING_VALUE' /* required */,
            ClientMetadata: {},
            DesiredDeliveryMediums: ['SMS', 'EMAIL'],
            ForceAliasCreation: true || false,
            MessageAction: 'SUPPRESS',
            TemporaryPassword: const_1.temporaryPassword,
            UserAttributes: [],
            ValidationData: [],
            ...options
        };
        const user = await this.cognitoIdentityServiceProvider
            .adminCreateUser(params)
            .promise();
        FileService_1.writeLog(JSON.stringify(user));
    }
    async fakerAdminCreateUser() {
        const options = this.createAdminCreateUserRequest(Config_1.Config.instance.cognito);
        await this.adminCreateUser(options);
        return options;
    }
    async adminConfirmSignUp(userName) {
        const userData = {
            Username: userName,
            Pool: this.cognitoUserPool
        };
        const cognitoUser = new amazon_cognito_identity_js_1.CognitoUser(userData);
        const authenticationData = {
            Username: userName,
            Password: const_1.temporaryPassword
        };
        const authenticationDetails = new amazon_cognito_identity_js_1.AuthenticationDetails(authenticationData);
        // Callbackを取得
        const completeNewPasswordChallenge = this.completeNewPasswordChallenge;
        cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: () => { },
            onFailure: () => { },
            newPasswordRequired: userAttributes => {
                delete userAttributes.email_verified;
                completeNewPasswordChallenge(cognitoUser, const_1.temporaryPassword, userAttributes);
            }
        });
    }
    completeNewPasswordChallenge(cognitoUser, temporaryPassword, sessionUserAttributes) {
        cognitoUser.completeNewPasswordChallenge(temporaryPassword, sessionUserAttributes, {
            onSuccess: () => { },
            onFailure: (err) => console.log(err)
        });
    }
    createAdminCreateUserRequest(config) {
        const UserAttributes = this.createAttributeList(config.UserAttributes);
        const Username = faker_1.default.fake('{{name.lastName}}{{name.firstName}}');
        const requestConfig = {
            ...config,
            Username,
            UserAttributes
        };
        delete requestConfig.ClientId;
        return requestConfig;
    }
    createAttributeList(attributes = []) {
        const attributeFakerFunctions = this.attributeFakerFactory();
        return attributes.reduce((attributeList, attribute) => {
            attributeList.push(attributeFakerFunctions[attribute]());
            return attributeList;
        }, []);
    }
    attributeFakerFactory() {
        return {
            address: () => {
                return { Name: 'address', Value: faker_1.default.fake('{{address.city}}') };
            },
            birthdate: () => {
                return { Name: 'birthdate', Value: faker_1.default.fake('{{date.past}}') };
            },
            email: () => {
                return { Name: 'email', Value: faker_1.default.fake('{{internet.email}}') };
            },
            family_name: () => {
                return { Name: 'family_name', Value: faker_1.default.fake('{{name.lastName}}') };
            },
            gender: () => {
                return {
                    Name: 'gender',
                    Value: ['female', 'male'][Math.floor(Math.random() * 2)]
                };
            },
            given_name: () => {
                return { Name: 'given_name', Value: faker_1.default.fake('{{name.firstName}}') };
            },
            locale: () => {
                return { Name: 'locale', Value: faker_1.default.fake('{{random.locale}}') };
            },
            middle_name: () => {
                return { Name: 'middle_name', Value: faker_1.default.fake('{{name.firstName}}') };
            },
            name: () => {
                return { Name: 'name', Value: faker_1.default.fake('{{name.findName}}') };
            },
            nickname: () => {
                return { Name: 'nickname', Value: faker_1.default.fake('{{internet.userName}}') };
            },
            phone_number: () => {
                return {
                    Name: 'phone_number',
                    Value: faker_1.default.fake('{{phone.phoneNumber}}')
                };
            },
            picture: () => {
                return { Name: 'picture', Value: faker_1.default.fake('{{image.imageUrl}}') };
            },
            preferred_username: () => {
                return {
                    Name: 'preferred_username',
                    Value: faker_1.default.fake('{{name.findName}}')
                };
            },
            profile: () => {
                return { Name: 'profile', Value: faker_1.default.fake('{{internet.url}}') };
            },
            timezone: () => {
                return { Name: 'timezone', Value: faker_1.default.fake('{{random.locale}}') };
            },
            updated_at: () => {
                return { Name: 'updated_at', Value: faker_1.default.fake('{{date.past}}') };
            },
            website: () => {
                return { Name: 'website', Value: faker_1.default.fake('{{internet.url}}') };
            }
        };
    }
}
exports.CognitoService = CognitoService;
