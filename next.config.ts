import type { NextConfig } from "next";

const {
  DB_TOKEN,
  DB_HOST_NAME,
  DB_HTTP_PATH,
  LB_CONNECT_STRING,

  LB_USERNAME,
  LB_PASSWORD,
} = process.env;

if (
  !DB_TOKEN ||
  !DB_HOST_NAME ||
  !DB_HTTP_PATH ||
  !LB_CONNECT_STRING ||
  !LB_USERNAME ||
  !LB_PASSWORD
) {
  throw new Error(
    "Missing required environment variables: DB_TOKEN, DB_HOST_NAME, or DB_HTTP_PATH",
  );
}

const nextConfig: NextConfig = {
  /* config options here */

  env: {
    DB_TOKEN: DB_TOKEN,
    DB_HOST_NAME: DB_HOST_NAME,
    DB_HTTP_PATH: DB_HTTP_PATH,
    LB_CONNECT_STRING: LB_CONNECT_STRING,
    LB_USERNAME: LB_USERNAME,
    LB_PASSWORD: LB_PASSWORD,
  },
  serverExternalPackages: ["@databricks/sql", "lz4"],
};

export default nextConfig;
