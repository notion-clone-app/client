/** @type {import("prettier").Config} */
export default {
  plugins: ["prettier-plugin-tailwindcss"],
  tailwindStylesheet: "./src/app/index.css",
  printWidth: 100,
  semi: true,
  singleQuote: false,
  trailingComma: "all",
};
