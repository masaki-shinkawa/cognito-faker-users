# Cognitoにログイン済みのアカウントを作成する

## 実行方法

```
$ docker build -t cognito-create-users .

$ docker run --rm -it \
-v ${PWD}/config.json:/project/config.json \
-v ${PWD}/override.json:/project/override.json \
cognito-create-users
```

## コンフィグ

### config.json

AWSの設定と作成するユーザーの設定を記述する
config.json.sampleを参照

### override.json

デフォルトではUsernameやUserAttributeの値はランダムに生成されるので、
固定の値を設定したい場合は記述する
override.json.sampleを参照
