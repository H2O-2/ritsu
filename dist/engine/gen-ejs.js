"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ejs = require("ejs");
ejs.renderFile(__dirname + '/../../theme-notes/struct/layout.ejs', function (err, data) {
    console.log(err || data);
});
