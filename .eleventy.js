const slugify = require("slugify");
const filesMinifier = require("./_utilities/filesMinifier");
const generateSlug = require('./_utilities/markdownSlug');
const syntaxHighlight = require("./_utilities/syntaxHighlight");
const dateFilter = require("./_utilities/dateFilter");
const urlEncode = require("./_utilities/urlEncode");
const tagsListCollection = require("./_utilities/tagsListCollection");
const filterByTag = require("./_utilities/filterByTag");
const imageShortcode = require("./_utilities/imageShortcode");
const getIcons = require("./_utilities/getIcons");
const pagefindSync = require("./_utilities/pagefindSync");
const createToc = require("./_utilities/createToc");

module.exports = function (eleventyConfig) {

  filesMinifier(eleventyConfig);
  generateSlug(eleventyConfig, slugify);
  syntaxHighlight(eleventyConfig);
  eleventyConfig.addFilter("readableDate", dateFilter);
  eleventyConfig.addFilter("urlEncode", urlEncode);
  eleventyConfig.addCollection("tagsList", tagsListCollection);
  eleventyConfig.addFilter("filterByTag", filterByTag);
  eleventyConfig.addLiquidShortcode("image", imageShortcode);
  getIcons(eleventyConfig);
  pagefindSync(eleventyConfig);
  createToc(eleventyConfig);

  eleventyConfig.addPassthroughCopy({
    "src/public": "/",
  });

  return {
    dir: {
      input: "src",
      output: "_site",
    },
  };
};