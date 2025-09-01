// src/config/index.ts
import { NODE_ENV, LOCAL_API_URL, PRODUCT_API_URL } from '@env';
export const ENV = (NODE_ENV ?? 'local') as 'local' | 'production';
console.log("🚀 ~ ENV:", ENV)
export const API_URL = ENV === 'production' ? PRODUCT_API_URL : LOCAL_API_URL;
