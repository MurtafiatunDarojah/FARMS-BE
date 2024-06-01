const User = require("../models/digital_approval/master/user.model");
const Division = require("../models/digital_approval/master/division.model");
const Department = require("../models/digital_approval/master/department.model");
const Level = require("../models/digital_approval/master/level.user.model");

const XLSX = require('xlsx');
const { mongoose } = require("../models");

const employeecpm = async () => {
    try {
        const workbook = XLSX.readFile('./app/seeding/employee_cpm_email_complete.xlsx');
        const sheetNameList = workbook.SheetNames;
        const xData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetNameList[0]]);
        
        for (const item of xData) {
            try {
                if (item.email) {
                    const user = await User.findOne({
                        nik: item.nik_employee
                    });

                    if (user && !user.email) {
                        user.email = item.email;
                        await user.save(); // Simpan perubahan email ke dalam database
                        console.log(`Email ${user.nik} telah diperbarui.`);
                    }
                }
            } catch (err) {
                console.log("Error:", err);
            }
        }
    } catch (error) {
        console.log("Error:", error);
    }
};

module.exports = employeecpm;
