const IS_PROD = import.meta.env.PROD;
const BASE_URL = IS_PROD
  ? import.meta.env.BASE_URL
  : import.meta.env.VITE_APP_DEV_BASE_URL;

export { BASE_URL };
