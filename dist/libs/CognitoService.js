"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const aws_sdk_1 = __importDefault(require("aws-sdk"));
class CognitoService {
    constructor() {
        const { AWS_DEFAULT_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_USER_POOL_ID } = process.env;
        const options = {
            accessKeyId: AWS_ACCESS_KEY_ID,
            secretAccessKey: AWS_SECRET_ACCESS_KEY,
            region: AWS_DEFAULT_REGION
        };
        this.cognitoidentity = new aws_sdk_1.default.CognitoIdentity(options);
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
    listUsers(options = {}) {
        const params = {
            UserPoolId: this.userPoolId,
            ...options
        };
        this.cognitoIdentityServiceProvider.listUsers(params, function (err, data) {
            if (err)
                console.log(err, err.stack); // an error occurred
            else
                console.log(data); // successful response
        });
        return true;
    }
}
exports.CognitoService = CognitoService;
