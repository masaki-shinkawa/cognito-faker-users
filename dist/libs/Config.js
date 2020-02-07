"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const FileService_1 = require("./FileService");
const validator_1 = __importDefault(require("validator"));
class Config {
    constructor() {
        this.config = FileService_1.loadConfig();
        this.isValid = this.validate(this.config);
    }
    /** インスタンスの取得 */
    static get instance() {
        if (!this._instance) {
            this._instance = new Config();
        }
        return this._instance;
    }
    get aws() {
        return this.config.aws;
    }
    get cognito() {
        return this.config.aws.cognito;
    }
    get accessKeyId() {
        return this.config.aws.accessKeyId;
    }
    get secretAccessKey() {
        return this.config.aws.secretAccessKey;
    }
    get region() {
        return this.config.aws.region;
    }
    get UserPoolId() {
        return this.config.aws.cognito.UserPoolId;
    }
    validate(config) {
        // required Props
        if (!(config &&
            config.aws &&
            config.aws.cognito &&
            config.aws.accessKeyId &&
            config.aws.secretAccessKey &&
            config.aws.region &&
            config.aws.cognito.UserPoolId &&
            validator_1.default.isAscii(config.aws.accessKeyId) &&
            validator_1.default.isAscii(config.aws.secretAccessKey) &&
            validator_1.default.isAscii(config.aws.region) &&
            validator_1.default.isAscii(config.aws.cognito.UserPoolId))) {
            console.error('Insufficient configuration file settings.');
            return false;
        }
        return true;
    }
}
exports.Config = Config;
