const User = require("../models/digital_approval/master/user.model");
const Division = require("../models/digital_approval/master/division.model");
const Department = require("../models/digital_approval/master/department.model");
const Level = require("../models/digital_approval/master/level.user.model");

const XLSX = require('xlsx');

const employeegm = async () => {
    try {
        const workbook = XLSX.readFile('./app/seeding/user-gm.xlsx');
        const sheetNameList = workbook.SheetNames;
        const xData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetNameList[0]]);
        const completeNormalize = [];

        xData.forEach((item) => {
            const newItem = {};
            Object.keys(item).forEach((key) => {
                const newKey = key.replace(/ /g, '_').replace('.', '').toLowerCase();
                newItem[newKey] = item[key];
            });
            completeNormalize.push(newItem);
        });

        completeNormalize.forEach(async (i) => {
            
        })


    } catch (error) {
        console.log(error);
    }
};


module.exports = employeegm;
