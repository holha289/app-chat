import envJson from "../../env.json";

type EnvConfig = {
  DB_VERSION: string;
  DB_NAME: string;
  API_URL: string;
};

const ENV: EnvConfig = envJson as EnvConfig;

export const { DB_VERSION, DB_NAME, API_URL } = ENV;
