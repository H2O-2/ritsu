"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ejs = require("ejs");
ejs.renderFile('layout.ejs', (err, data) => {
    if (err)
        throw err.message;
    console.log(data);
});
