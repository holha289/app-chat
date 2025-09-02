import envJson from "../../env.json";

type EnvConfig = {
  DB_VERSION: string;
  DB_NAME: string;
  LOCAL_API_URL: string;
  PRODUCT_API_URL: string;
  ENVIRONMENT: string;
};

const ENV: EnvConfig = envJson as EnvConfig;

const { DB_VERSION, DB_NAME, LOCAL_API_URL, PRODUCT_API_URL, ENVIRONMENT } = ENV;

const API_URL = ENVIRONMENT === "production" ? PRODUCT_API_URL : LOCAL_API_URL;

export {
  DB_VERSION,
  DB_NAME,
  API_URL
};
