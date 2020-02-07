import fs, { NoParamCallback } from 'fs';
import { resultFilePath, configFilePath } from '../const';

export const writeLog = (text: string) => {
  const callback: NoParamCallback = error => {
    if (error) console.log(error);
  };
  fs.appendFile(resultFilePath, text, callback);
};

export const loadConfig = () => {
  const line = fs.readFileSync(configFilePath, { encoding: 'utf-8' });
  try {
    return JSON.parse(line);
  } catch (error) {
    console.error(
      `Failed to read configuration file. [Path: ${configFilePath}]`
    );
    return null;
  }
};
