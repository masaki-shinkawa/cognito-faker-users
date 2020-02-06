import AWS from 'aws-sdk';
import {
  ListUsersRequest,
  AdminCreateUserRequest,
  AttributeListType,
  AttributeType,
  AdminConfirmSignUpRequest
} from 'aws-sdk/clients/cognitoidentityserviceprovider';
import faker from 'faker';
import { writeLog } from './FileService';
import { Config, ConfigCognitoProps } from './Config';

interface AttributeFakerFunctions {
  [keys: string]: () => AttributeType;
}

export class CognitoService {
  private static _instance: CognitoService;
  private cognitoIdentityServiceProvider: AWS.CognitoIdentityServiceProvider;
  private userPoolId: string;

  private constructor() {
    const {
      AWS_DEFAULT_REGION,
      AWS_ACCESS_KEY_ID,
      AWS_SECRET_ACCESS_KEY,
      AWS_USER_POOL_ID
    } = process.env;
    const options: AWS.CognitoIdentity.ClientConfiguration = {
      accessKeyId: AWS_ACCESS_KEY_ID,
      secretAccessKey: AWS_SECRET_ACCESS_KEY,
      region: AWS_DEFAULT_REGION
    };
    this.cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider(
      options
    );
    this.userPoolId = AWS_USER_POOL_ID || '';
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
      UserPoolId: this.userPoolId,
      ...options
    };
    const listUsers = this.cognitoIdentityServiceProvider.listUsers(params);
    return listUsers.promise();
  }

  public async adminCreateUser(
    options: AdminCreateUserRequest = {} as AdminCreateUserRequest
  ) {
    var params: AdminCreateUserRequest = {
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
    writeLog(JSON.stringify(user));
  }

  public async fakerAdminCreateUser() {
    const options = this.createAdminCreateUserRequest(Config.instance.cognito);
    this.adminCreateUser(options);
    console.log(options);
  }

  public async adminConfirmSignUp(userName: string) {
    const options: AdminConfirmSignUpRequest = {
      UserPoolId: Config.instance.UserPoolId,
      Username: userName
    };
    const response = await this.cognitoIdentityServiceProvider
      .adminConfirmSignUp(options)
      .promise();
    console.log(response);
  }

  private createAdminCreateUserRequest(
    config: ConfigCognitoProps
  ): AdminCreateUserRequest {
    const UserAttributes: AttributeListType = this.createAttributeList(
      config.UserAttributes
    );
    const Username: string = faker.fake('{{name.lastName}}{{name.firstName}}');

    return { ...config, Username, UserAttributes } as AdminCreateUserRequest;
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
