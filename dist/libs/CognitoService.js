"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const faker_1 = __importDefault(require("faker"));
const FileService_1 = require("./FileService");
const Config_1 = require("./Config");
class CognitoService {
    constructor() {
        const { AWS_DEFAULT_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_USER_POOL_ID } = process.env;
        const options = {
            accessKeyId: AWS_ACCESS_KEY_ID,
            secretAccessKey: AWS_SECRET_ACCESS_KEY,
            region: AWS_DEFAULT_REGION
        };
        this.cognitoIdentityServiceProvider = new aws_sdk_1.default.CognitoIdentityServiceProvider(options);
        this.userPoolId = AWS_USER_POOL_ID || '';
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
            UserPoolId: this.userPoolId,
            ...options
        };
        const listUsers = this.cognitoIdentityServiceProvider.listUsers(params);
        return listUsers.promise();
    }
    async adminCreateUser(options = {}) {
        var params = {
            UserPoolId: this.userPoolId /* required */,
            Username: 'STRING_VALUE' /* required */,
            ClientMetadata: {},
            DesiredDeliveryMediums: ['SMS', 'EMAIL'],
            ForceAliasCreation: true || false,
            MessageAction: 'SUPPRESS',
            TemporaryPassword: 'Passw0rd!',
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
        this.adminCreateUser(options);
        console.log(options);
    }
    async adminConfirmSignUp(userName) {
        const options = {
            UserPoolId: Config_1.Config.instance.UserPoolId,
            Username: userName
        };
        const response = await this.cognitoIdentityServiceProvider
            .adminConfirmSignUp(options)
            .promise();
        console.log(response);
    }
    createAdminCreateUserRequest(config) {
        const UserAttributes = this.createAttributeList(config.UserAttributes);
        const Username = faker_1.default.fake('{{name.lastName}}{{name.firstName}}');
        return { ...config, Username, UserAttributes };
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
