import fs, { NoParamCallback } from 'fs';
import { resultFilePath, configFilePath, overrideFilePath } from '../const';

export const writeLog = (text: string) => {
  const callback: NoParamCallback = error => {
    if (error) console.log(error);
  };
  fs.appendFile(resultFilePath, text, callback);
};

export const loadConfig = () => load(configFilePath)
export const loadOverride = () => load(overrideFilePath)

export const load = (path: string) => {
  const line = fs.readFileSync(path, { encoding: 'utf-8' });
  try {
    return JSON.parse(line);
  } catch (error) {
    console.error(
      `Failed to read configuration file. [Path: ${path}]`
    );
    return {};
  }
};
