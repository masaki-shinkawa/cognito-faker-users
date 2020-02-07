"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const const_1 = require("../const");
exports.writeLog = (text) => {
    const callback = error => {
        if (error)
            console.log(error);
    };
    fs_1.default.writeFile(const_1.resultFilePath, text, callback);
};
exports.loadConfig = () => {
    const line = fs_1.default.readFileSync(const_1.configFilePath, { encoding: 'utf-8' });
    try {
        return JSON.parse(line);
    }
    catch (error) {
        console.error(`Failed to read configuration file. [Path: ${const_1.configFilePath}]`);
        return null;
    }
};
