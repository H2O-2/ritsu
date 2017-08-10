"use strict";
var invalidDate = 'hello';
var dateObj = new Date(invalidDate);
console.log(isNaN(dateObj.getDate()));
