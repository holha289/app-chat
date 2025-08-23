// env.d.ts
declare module '@env' {
  export const NODE_ENV: 'local' | 'prod';
  export const LOCAL_API_URL: string;
  export const PRODUCT_API_URL: string;
}
