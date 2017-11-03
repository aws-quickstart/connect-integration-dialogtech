'use strict';
var https = require('https');
console.log('Loading function');

var send = function(event, context, responseStatus, responseData, physicalResourceId) {

    var responseBody = JSON.stringify({
        Status: responseStatus,
        Reason: "See the details in CloudWatch Log Stream: " + context.logStreamName,
        PhysicalResourceId: physicalResourceId || context.logStreamName,
        StackId: event.StackId,
        RequestId: event.RequestId,
        LogicalResourceId: event.LogicalResourceId,
        Data: responseData
    });

    console.log("Response body:\n", responseBody);

    var url = require("url");

    var parsedUrl = url.parse(event.ResponseURL);
    var options = {
        hostname: parsedUrl.hostname,
        port: 443,
        path: parsedUrl.path,
        method: "PUT",
        headers: {
            "content-type": "",
            "content-length": responseBody.length
        }
    };

    var request = https.request(options, function(response) {
        console.log("Status code: " + response.statusCode);
        console.log("Status message: " + response.statusMessage);
        context.done();
    });

    request.on("error", function(error) {
        console.log("send(..) failed executing https.request(..): " + error);
        context.done();
    });

    request.write(responseBody);
    request.end();
}

exports.handler = (event, context, callback) => {


    if (event.RequestType == 'Create') {

        console.log('Create event:', null);

        var config = {
            accessKey: event.ResourceProperties.accessKey,
            secretAccessKey: event.ResourceProperties.secretAccessKey,
            customerNumber: event.ResourceProperties.customerNumber
        };

        if (config.accessKey === undefined || config.accessKey.length !== 64 || config.secretAccessKey === undefined || config.secretAccessKey.length !== 64) {
            console.log('Failed - Missing or invalid access key(s)');
            send(event,context,"FAILED",{});
        } else {

            var dialogTechUrl = 'https://custom.dialogtech.com/coreintegrations_amazon-connect/calls?access_key='
                + config.accessKey + '&secret_access_key=' + config.secretAccessKey
                + '&caller_id=' + config.customerNumber;
            console.log('test =', config.customerNumber);
            console.log(dialogTechUrl);
            https.get(dialogTechUrl, function (result) {

                if (result.statusCode == '200') {
                    console.log('Success, with: ' + result.statusCode);
                    send(event,context,"SUCCESS",{});
                } else {
                    console.log('Failed, with: ' + result.statusCode);
                    send(event,context,"FAILED",{});
                }

            }).on('error', function (err) {
                console.log('Error, with: ' + err.message);
                send(event,context,"FAILED",{});
            });
        }
    } else if (event.RequestType == 'Update') {
        send(event, context, "SUCCESS");
    } else if (event.RequestType == 'Delete') {
        send(event, context, "SUCCESS");
    }

}