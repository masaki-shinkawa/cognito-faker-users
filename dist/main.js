"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Config_1 = require("./libs/Config");
const CognitoService_1 = require("./libs/CognitoService");
// コンフィグの読み込みに失敗した場合は終了
if (!Config_1.Config.instance.isValid) {
    process.exit(0);
}
(async () => {
    const options = await CognitoService_1.CognitoService.instance.fakerAdminCreateUser();
    await CognitoService_1.CognitoService.instance.adminConfirmSignUp(options.Username);
    console.info('Complete!! check your aws console.');
    console.info(`https://${Config_1.Config.instance.region}.console.aws.amazon.com/cognito/users/?region=${Config_1.Config.instance.region}#/pool/${Config_1.Config.instance.UserPoolId}/users`);
})();
