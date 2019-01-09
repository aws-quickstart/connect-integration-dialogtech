'use strict';
const AWS = require('aws-sdk');
var http = require('https');
const DTAccessKey = process.env['access_key'];
const DTSecretAccessKey = process.env['secret_access_key'];
console.log('Loading function');
exports.handler = (event, context, callback) => {
  console.log('Received event:', JSON.stringify(event, null, 2));
  var customerNumber = event.Details.ContactData.CustomerEndpoint.Address.substring(2);
  var dialogTechUrl = 'https://custom.dialogtech.com/coreintegrations_amazon-connect/calls?access_key='
  + DTAccessKey + '&secret_access_key=' + DTSecretAccessKey
  + '&caller_id=' + customerNumber;
  console.log('test =', customerNumber);
  console.log(dialogTechUrl);
  http.get(dialogTechUrl, function (result) {
    console.log('Success, with: ' + result.statusCode);
    result.on('data', function (chunk) {
      var parsedBody = JSON.parse(chunk);
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
            st_rank: parsedBody.st_rank,
            st_referer: parsedBody.st_referer,
            st_baseuri: parsedBody.st_baseuri,
            st_lastbaseuri: parsedBody.st_lastbaseuri,
            st_lastbaseuri_title: parsedBody.st_lastbaseuri_title,
            st_activity_keyword: parsedBody.st_activity_keyword,
            st_displayed_timestamp: parsedBody.st_displayed_timestamp,
            st_ip_address: parsedBody.st_ip_address,
            st_document_title: parsedBody.st_document_title,
            st_browser: parsedBody.st_browser,
            st_os: parsedBody.st_os,
            st_ibp_custom: parsedBody.st_ibp_custom,
            st_ibp_unique_id: parsedBody.st_ibp_unique_id,
            st_pid: parsedBody.st_pid,
            st_domain_set_id: parsedBody.st_domain_set_id,
            st_location_name: parsedBody.st_location_name,
            st_sourceguard: parsedBody.st_sourceguard,
            st_campaign: parsedBody.st_campaign,
            st_platform: parsedBody.st_platform,
            st_content: parsedBody.st_content,
            st_term: parsedBody.st_term,
            st_medium: parsedBody.st_medium,
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