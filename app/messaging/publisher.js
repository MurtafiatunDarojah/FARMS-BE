const queueURL = require("../config/producer.config");
const awsKey = require("../config/aws-config");
let log = require('../config/winston');
let AWS = require('aws-sdk');

let sqs = new AWS.SQS(awsKey.sqsKey);

const publish = (data) => {

    let params;

    if (data.wa_group) {

        params = {
            MessageAttributes: {
                "group": {
                    DataType: "String",
                    StringValue: data.wa_group
                },
            },
            MessageBody: data.message,
            QueueUrl: queueURL.SQSUrlWA
        };

    } else {
        params = {
            MessageAttributes: {
                "number": {
                    DataType: "String",
                    StringValue: process.env.ENV === 'production' ? data.number : '6285977300189'
                },
            },
            MessageBody: data.message,
            QueueUrl: queueURL.SQSUrlWA
        };

    }

    sqs.sendMessage(params, function (err, data) {
        if (err) {
            console.log("Error", err);
            log.error({
                date: new Date(),
                error: err.toString()
            })
        } else {
            console.log("Success", data.MessageId);
        }
    });
}

const publish_email = (data) => {

    let params;

    params = {
        MessageAttributes: {
            "email": {
                DataType: "String",
                StringValue: data.email
            },
            "address": {
                DataType: "String",
                StringValue: process.env.ENV === 'production' ? data.email : 'mohamad.fahlevi@brm.co.id'
            },
            "subject": {
                DataType: "String",
                StringValue: data.subject
            },
            "business_entity": {
                DataType: "String",
                StringValue: data.business_entity
            },
        },
        MessageBody: data.message,
        QueueUrl: queueURL.SQSUrlEMAIL
    };

    sqs.sendMessage(params, function (err, data) {
        if (err) {
            console.log("Error", err);
            log.error({
                date: new Date(),
                error: err.toString()
            })
        } else {
            console.log("Success", data.MessageId);
        }
    });

}

module.exports = {
    publish,
    publish_email
}
