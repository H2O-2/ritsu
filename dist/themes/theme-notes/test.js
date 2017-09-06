"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ejs = require("ejs");
const yaml = require("js-yaml");
const fs = require("fs-extra");
let themeConfig, siteConfig;
// Implement function to read css lib from node_modules.
// function libLoader()
fs.readFile('./theme-config.yaml', 'utf8')
    .then((themeContent) => themeConfig = yaml.safeLoad(themeContent))
    .then(() => fs.readFile('./site-config.yaml', 'utf8'))
    .then((siteContent) => siteConfig = yaml.safeLoad(siteContent))
    .then(() => {
    ejs.renderFile('view/layout.ejs', { theme: themeConfig, site: siteConfig, postNum: 10, isIndex: false }, (err, data) => {
        if (err)
            throw err;
        console.log(data);
    });
})
    .catch((e) => console.error(e.message));
// ejs.renderFile('layout.ejs', (err: Error, data: string) => {
//     if (err) throw err.message;
//     console.log(data);
// });
