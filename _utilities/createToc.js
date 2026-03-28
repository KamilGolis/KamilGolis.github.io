const pluginTOC = require('@uncenter/eleventy-plugin-toc');

function createToc(eleventyConfig) {
    eleventyConfig.addPlugin(pluginTOC, {
        tags: ["h2", "h3", "h4"],
        ignoredHeadings: ["[data-toc-exclude]"],
        ignoredElements: [".header-anchor"],
        ul: false,
        wrapper: (toc) => toc,
    });
}

module.exports = createToc;