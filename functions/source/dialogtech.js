'use strict';
const AWS = require('aws-sdk');
var http = require('https');
const encryptedAccessKey = process.env['access_key'];
const encryptedSecretAccessKey = process.env['secret_access_key'];
let decryptedAccessKey = '';
let decryptedSecretAccessKey = '';
console.log('Loading function');
function processEvent(event, context, callback) {
  console.log('Received event:', JSON.stringify(event, null, 2));
  var customerNumber = event.Details.ContactData.CustomerEndpoint.Address.substring(2);
  var dialogTechUrl = 'https://custom.dialogtech.com/coreintegrations_amazon-connect/calls?access_key='
  + decryptedAccessKey + '&secret_access_key=' + decryptedSecretAccessKey
  + '&caller_id=' + customerNumber;
  console.log('test =', customerNumber);
  console.log(dialogTechUrl);
  http.get(dialogTechUrl, function (result) {
    console.log('Success, with: ' + result.statusCode);
    result.on('data', function (chunk) {
      var parsedBody = JSON.parse(chunk)
      function buildResponse(parsedBody) {
        if (parsedBody.sid !== undefined) {
          console.log('BODY Content: ' + parsedBody.sid);
          return {
            date_added: parsedBody.date_added,
            sid: parsedBody.sid,
            call_type: parsedBody.call_type,
            dnis: parsedBody.dnis,
            ani: parsedBody.ani,
            last_name: parsedBody.last_name,
            first_name: parsedBody.first_name,
            street_address: parsedBody.street_address,
            city: parsedBody.city,
            state: parsedBody.state,
            zipcode: parsedBody.zipcode,
            phone_label: parsedBody.phone_label,
            url_tag: parsedBody.URL_Tag,
            search_term: parsedBody.Search_Term,
            google_client_id: parsedBody.Google_UA_Client_ID,
            gclid: parsedBody.gclid,
            pool_name: parsedBody.Pool_Name,
            keyword: parsedBody.Keyword,
            match_type: parsedBody.Match_Type,
            network: parsedBody.Network,
            device: parsedBody.Device,
            device_model: parsedBody.Device_Model,
            creative: parsedBody.Creative,
            placement: parsedBody.Placement,
            target: parsedBody.Target,
            param1: parsedBody.Param1,
            param2: parsedBody.Param2,
            random: parsedBody.Random,
            ace_id: parsedBody.Ace_Id,
            ad_position: parsedBody.Ad_Position,
            product_target_id: parsedBody.Product_Target_ID,
            ad_type: parsedBody.Ad_Type,
            lambdaResult:'Success'
          };
        } else {
          return {
            error: parsedBody.error,
            lambdaResult:'Failed'
          }
        }
      }
      callback(null, buildResponse(parsedBody));
    });
  }).on('error', function (err) {
    console.log('Error, with: ' + err.message);
    context.done('Failed');
  });
}

exports.handler = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  // Decrypt
  const kms = new AWS.KMS();
  kms.decrypt({ CiphertextBlob: new Buffer(encryptedAccessKey, 'base64')
}, (err, data) => {
  if (err) {
    console.log('Decrypt error:', err);
    return callback(err);
  }
  decryptedAccessKey = data.Plaintext.toString('ascii');
  kms.decrypt({ CiphertextBlob: new Buffer(encryptedSecretAccessKey,
    'base64') }, (err, data) => {
      if (err) {
        console.log('Decrypt error:', err);
        return callback(err);
      }
      decryptedSecretAccessKey = data.Plaintext.toString('ascii');
      processEvent(event, context, callback);
    });
  });
};
