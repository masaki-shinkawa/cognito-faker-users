import { loadConfig, loadOverride } from './FileService';
import validator from 'validator';
import { DeliveryMediumListType, AdminCreateUserRequest } from 'aws-sdk/clients/cognitoidentityserviceprovider';

export interface ConfigCognitoProps {
  UserPoolId: string;
  ClientId: string;
  DesiredDeliveryMediums: DeliveryMediumListType;
  UserAttributes: string[];
}

export interface ConfigAwsProps {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  cognito: ConfigCognitoProps;
}

export interface ConfigProps {
  aws: ConfigAwsProps;
}

export class Config {
  private static _instance: Config;
  private config: ConfigProps;
  private override: AdminCreateUserRequest;
  public isValid: boolean;

  private constructor() {
    this.config = loadConfig();
    this.override = loadOverride();
    this.isValid = this.validate(this.config);
  }

  /** インスタンスの取得 */
  public static get instance(): Config {
    if (!this._instance) {
      this._instance = new Config();
    }

    return this._instance;
  }

  public get aws(): ConfigAwsProps {
    return this.config.aws;
  }

  public get cognito(): ConfigCognitoProps {
    return this.config.aws.cognito;
  }

  public get accessKeyId(): string {
    return this.config.aws.accessKeyId;
  }

  public get secretAccessKey(): string {
    return this.config.aws.secretAccessKey;
  }

  public get region(): string {
    return this.config.aws.region;
  }

  public get UserPoolId(): string {
    return this.config.aws.cognito.UserPoolId;
  }

  public get ClientId(): string {
    return this.config.aws.cognito.ClientId;
  }

  public get overrideConfig(): AdminCreateUserRequest {
    return this.override;
  }

  private validate(config: ConfigProps): boolean {
    // required Props
    if (
      !(
        config &&
        config.aws &&
        config.aws.cognito &&
        config.aws.accessKeyId &&
        config.aws.secretAccessKey &&
        config.aws.region &&
        config.aws.cognito.UserPoolId &&
        config.aws.cognito.ClientId &&
        validator.isAscii(config.aws.accessKeyId) &&
        validator.isAscii(config.aws.secretAccessKey) &&
        validator.isAscii(config.aws.region) &&
        validator.isAscii(config.aws.cognito.UserPoolId) &&
        validator.isAscii(config.aws.cognito.ClientId)
      )
    ) {
      console.error('Insufficient configuration file settings.');
      return false;
    }
    return true;
  }
}
