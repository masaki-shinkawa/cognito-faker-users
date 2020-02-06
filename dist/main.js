"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CognitoService_1 = require("./libs/CognitoService");
const main = () => {
    const cognitoService = CognitoService_1.CognitoService.instance;
    cognitoService.listUsers();
};
(async () => main())();
