import 'cross-fetch/polyfill';
import CognitoIdentityServiceProvider, {
  ListUsersRequest,
  AdminCreateUserRequest,
  AttributeListType,
  AttributeType
} from 'aws-sdk/clients/cognitoidentityserviceprovider';
import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails
} from 'amazon-cognito-identity-js';
import faker from 'faker';
import { writeLog } from './FileService';
import { Config, ConfigCognitoProps } from './Config';
import { temporaryPassword } from '../const';
import { CognitoIdentity } from 'aws-sdk/clients/all';
import deepmerge from 'deepmerge';


interface AttributeFakerFunctions {
  [keys: string]: () => AttributeType;
}

export class CognitoService {
  private static _instance: CognitoService;
  private cognitoIdentityServiceProvider: CognitoIdentityServiceProvider;
  private cognitoUserPool: CognitoUserPool;

  private constructor() {
    const { accessKeyId, secretAccessKey, region } = Config.instance.aws;
    const options: CognitoIdentity.ClientConfiguration = {
      accessKeyId,
      secretAccessKey,
      region
    };
    this.cognitoIdentityServiceProvider = new CognitoIdentityServiceProvider(
      options
    );

    // CognitoUserPoolの初期化
    this.cognitoUserPool = new CognitoUserPool({
      UserPoolId: Config.instance.UserPoolId,
      ClientId: Config.instance.ClientId
    });
  }

  /** インスタンスの取得 */
  public static get instance(): CognitoService {
    if (!this._instance) {
      this._instance = new CognitoService();
    }

    return this._instance;
  }

  public async listUsers(options: ListUsersRequest = {} as ListUsersRequest) {
    const params = {
      UserPoolId: Config.instance.UserPoolId,
      ...options
    };
    const listUsers = this.cognitoIdentityServiceProvider.listUsers(params);
    return listUsers.promise();
  }

  public async adminCreateUser(
    options: AdminCreateUserRequest = {} as AdminCreateUserRequest
  ) {
    var params: AdminCreateUserRequest = {
      UserPoolId: Config.instance.UserPoolId /* required */,
      Username: 'STRING_VALUE' /* required */,
      ClientMetadata: {},
      DesiredDeliveryMediums: ['SMS', 'EMAIL'],
      ForceAliasCreation: true || false,
      MessageAction: 'SUPPRESS',
      TemporaryPassword: temporaryPassword,
      UserAttributes: [],
      ValidationData: [],
      ...options
    };

    const user = await this.cognitoIdentityServiceProvider
      .adminCreateUser(params)
      .promise();
    writeLog(JSON.stringify(user));
  }

  public async fakerAdminCreateUser() {
    const options = this.createAdminCreateUserRequest(
      Config.instance.cognito,
      Config.instance.overrideConfig
    );
    await this.adminCreateUser(options);
    return options;
  }

  public async adminConfirmSignUp(userName: string) {
    const userData = {
      Username: userName,
      Pool: this.cognitoUserPool
    };
    const cognitoUser = new CognitoUser(userData);

    const authenticationData = {
      Username: userName,
      Password: temporaryPassword
    };

    const authenticationDetails = new AuthenticationDetails(authenticationData);

    // Callbackを取得
    const completeNewPasswordChallenge = this.completeNewPasswordChallenge;

    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: () => {},
      onFailure: () => {},
      newPasswordRequired: userAttributes => {
        delete userAttributes.email_verified;
        completeNewPasswordChallenge(
          cognitoUser,
          temporaryPassword,
          userAttributes
        );
      }
    });
  }

  private completeNewPasswordChallenge(
    cognitoUser: CognitoUser,
    temporaryPassword: string,
    sessionUserAttributes: any
  ) {
    cognitoUser.completeNewPasswordChallenge(
      temporaryPassword,
      sessionUserAttributes,
      {
        onSuccess: () => {},
        onFailure: (err: any) => console.log(err)
      }
    );
  }

  private createAdminCreateUserRequest(
    config: ConfigCognitoProps,
    override: AdminCreateUserRequest
  ): AdminCreateUserRequest {
    const UserAttributes: AttributeListType = this.createAttributeList(
      config.UserAttributes
    );
    const Username: string = faker.fake('{{name.lastName}}{{name.firstName}}');

    const baseConfig = {
      ...config,
      Username,
      UserAttributes,
    };
    console.log(baseConfig);
    const requestConfig = deepmerge(baseConfig, override)
    console.log(requestConfig);
    delete requestConfig.ClientId;
    return requestConfig as AdminCreateUserRequest;
  }

  private createAttributeList(attributes: string[] = []): AttributeListType {
    const attributeFakerFunctions = this.attributeFakerFactory();
    return attributes.reduce((attributeList, attribute) => {
      attributeList.push(attributeFakerFunctions[attribute]());
      return attributeList;
    }, [] as AttributeListType);
  }

  private attributeFakerFactory(): AttributeFakerFunctions {
    return {
      address: (): AttributeType => {
        return { Name: 'address', Value: faker.fake('{{address.city}}') };
      },
      birthdate: (): AttributeType => {
        return { Name: 'birthdate', Value: faker.fake('{{date.past}}') };
      },
      email: (): AttributeType => {
        return { Name: 'email', Value: faker.fake('{{internet.email}}') };
      },
      family_name: (): AttributeType => {
        return { Name: 'family_name', Value: faker.fake('{{name.lastName}}') };
      },
      gender: (): AttributeType => {
        return {
          Name: 'gender',
          Value: ['female', 'male'][Math.floor(Math.random() * 2)]
        };
      },
      given_name: (): AttributeType => {
        return { Name: 'given_name', Value: faker.fake('{{name.firstName}}') };
      },
      locale: (): AttributeType => {
        return { Name: 'locale', Value: faker.fake('{{random.locale}}') };
      },
      middle_name: (): AttributeType => {
        return { Name: 'middle_name', Value: faker.fake('{{name.firstName}}') };
      },
      name: (): AttributeType => {
        return { Name: 'name', Value: faker.fake('{{name.findName}}') };
      },
      nickname: (): AttributeType => {
        return { Name: 'nickname', Value: faker.fake('{{internet.userName}}') };
      },
      phone_number: (): AttributeType => {
        return {
          Name: 'phone_number',
          Value: faker.fake('{{phone.phoneNumber}}')
        };
      },
      picture: (): AttributeType => {
        return { Name: 'picture', Value: faker.fake('{{image.imageUrl}}') };
      },
      preferred_username: (): AttributeType => {
        return {
          Name: 'preferred_username',
          Value: faker.fake('{{name.findName}}')
        };
      },
      profile: (): AttributeType => {
        return { Name: 'profile', Value: faker.fake('{{internet.url}}') };
      },
      timezone: (): AttributeType => {
        return { Name: 'timezone', Value: faker.fake('{{random.locale}}') };
      },
      updated_at: (): AttributeType => {
        return { Name: 'updated_at', Value: faker.fake('{{date.past}}') };
      },
      website: (): AttributeType => {
        return { Name: 'website', Value: faker.fake('{{internet.url}}') };
      }
    };
  }
}
