import { createRequire } from "module";

const require = createRequire(import.meta.url);
const nextConfig = require("eslint-config-next");

export default [
  {
    ...nextConfig,
    rules: {
      ...nextConfig.rules,
      "@next/next/no-img-element": "off",
      "react/no-unescaped-entities": "off",
    },
  },
];
