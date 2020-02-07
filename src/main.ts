import { Config } from './libs/Config';
import { CognitoService } from './libs/CognitoService';

// コンフィグの読み込みに失敗した場合は終了
if (!Config.instance.isValid) {
  process.exit(0);
}
(async () => {
  const options = await CognitoService.instance.fakerAdminCreateUser();
  await CognitoService.instance.adminConfirmSignUp(options.Username);

  console.info('Complete!! check your aws console.');
  console.info(
    `https://${Config.instance.region}.console.aws.amazon.com/cognito/users/?region=${Config.instance.region}#/pool/${Config.instance.UserPoolId}/users`
  );
})();
