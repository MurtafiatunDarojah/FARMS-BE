const moment = require("moment");
const logger = require("../config/winston");

async function getRecordId(model, typeRecord, beCode, department, docName) {
    try {
        const yearMonth = moment(new Date()).format("YYMM");

        let fieldName = "";

        const fieldMappings = {
            'TA': "id_record",
            'TS': "form_submit_id",
            'HIAS': "id_record",
            'WP': "id_record",
            'VWP': "id_record",
        };
        
        if (fieldMappings.hasOwnProperty(docName)) {
            fieldName = fieldMappings[docName];
        } else {
            // Nilai default jika docName tidak ada dalam pemetaan
            fieldName = "form_record";
        }
          
        const query = {
            [fieldName]: { $regex: new RegExp(`^${beCode}-${department}-${typeRecord}-${docName}${yearMonth}`) }
        };

        const sortOptions = { [fieldName]: -1 };

        const maxSerialNumDoc = await model.findOne(query, { [fieldName]: 1 }).sort(sortOptions);

        const maxFormRecord = maxSerialNumDoc ? maxSerialNumDoc[fieldName] : null;
        const maxSerialNum = maxFormRecord ? parseInt(maxFormRecord.substr(-4)) : 0;
        const nextSerialNum = maxSerialNum + 1;

        const formIdRecord = `${beCode}-${department}-${typeRecord}-${docName}${yearMonth}${nextSerialNum.toString().padStart(4, '0')}`;

        return formIdRecord;
    } catch (error) {
        console.error(`Error: ${error.message}`);

        logger.error({
            date: new Date(),
            error: error.toString()
        });
    }
}

module.exports = {
    getRecordId
};
