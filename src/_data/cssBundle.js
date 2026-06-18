const { readFileSync, mkdirSync, writeFileSync } = require("fs");
const path = require("path");
const crypto = require("crypto");
const { transform } = require("lightningcss");

const CSS_FILES = [
  "fonts.css",
  "tokens.css",
  "reset.css",
  "typography.css",
  "layout.css",
  "components.css",
  "syntax.css",
];

module.exports = function () {
  const srcDir = path.join(__dirname, "..", "css");
  let combined = "";

  for (const file of CSS_FILES) {
    const filePath = path.join(srcDir, file);
    combined += readFileSync(filePath, "utf-8") + "\n";
  }

  const result = transform({
    filename: "main.css",
    code: Buffer.from(combined),
    minify: true,
    sourceMap: false,
    targets: {
      chrome: 100 << 16,
      firefox: 100 << 16,
      safari: 15 << 16,
    },
  });

  const hash = crypto
    .createHash("md5")
    .update(result.code)
    .digest("hex")
    .slice(0, 8);

  const hashedName = `main.${hash}.css`;
  const outputDir = path.join(process.cwd(), "_site", "css");

  mkdirSync(outputDir, { recursive: true });
  writeFileSync(path.join(outputDir, hashedName), result.code);

  return hashedName;
};
