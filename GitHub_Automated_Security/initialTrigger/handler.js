// initialTrigger/handler.js  || part of ZocSec.SecurityAsCode.GitHub
//
// This script will trigger (1 time) to add GitHub webhook at the organizational level at the end of cloudformation build.
//
// Owner:   Copyright © 2018-2019 Zocdoc Inc.  www.zocdoc.com
// Authors: Gary Tsai @garymalaysia                                                                                        
//          Jay Ball  @veggiespam

'use strict';

const AWS = require('aws-sdk');
const Octokit = require('@octokit/rest');
const kms = new AWS.KMS();
const apigateway = new AWS.APIGateway({apiVersion: '2015-07-09'});
AWS.config.update({region: process.env.AWS_REGION});

const encrypted = process.env.GITHUB_WEBHOOK_SECRET;
const secret = process.env.GITHUB_TOKEN;
const company = process.env.ORG;
let decrypted;
let decrypted_secret;
var all_hooks = [];


module.exports.initial_trigger = (event, context, callback) => {
  const response = {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Done! Navigate to Your Github Organizational Webhook Page to Verify Hook is Installed.'
    })
  };


  kms.decrypt({ CiphertextBlob: new Buffer(encrypted, 'base64') }, (err, data) => {
            if (err) {
                console.log('Decrypt error:', err);
                return callback(err);
            }
            
            decrypted = data.Plaintext.toString('ascii');

  const params = {};
  var regex = /-github-webhook-listener/;
  console.log("**********************************************************"); // review cloudwatch log to see if this section has kick off for debugging
    apigateway.getRestApis(params, function(err, data) {
    if (err) console.log(err, err.stack); // an error occurred

      else {    
      for (var i = 0 ; i < data['items'].length; i++){
        var api_names = data['items'][i]['name'];
        if ( regex.test(api_names) == true ){
          const api_id = data['items'][i]['id'];
          var params = {restApiId: api_id};
          
          apigateway.getStages(params, function(err2, data2) {

          if (err2) console.log(err2, err2.stack); // an error occurred

          else {     
            console.log(data2['item'][0]['stageName']);
           
            const stagename = data2['item'][0]['stageName'];
            const endpoint_URL = `https://${api_id}.execute-api.${process.env.AWS_REGION}.amazonaws.com/${stagename}/webhook`;
            console.log(endpoint_URL);


            kms.decrypt({ CiphertextBlob: new Buffer(secret, 'base64') }, (err, data) => {
            if (err) {
                console.log('Decrypt error:', err);
                return callback(err);
            }
              
            decrypted_secret = data.Plaintext.toString('ascii');

            //octokit.authenticate({ type: 'token',token: decrypted_secret }); 
            
            const octokit = new Octokit({
              auth: `token ${decrypted_secret}`
            });
            
            
            async function add_hook(organization){
              var config = {
                    url: endpoint_URL,
                    content_type:"json",
                    secret:decrypted
                    };
              try{
                const hook = await octokit.orgs.createHook({
                org: organization,
                name: 'web', 
                config,
                events: ['push','public','repository']});
              }
              catch(err){
                console.log(err["errors"])
                //For more on events see https://developer.github.com/v3/activity/events/types/
              }
              }

            async function delete_hook(organization, id){
              const del = await octokit.orgs.deleteHook({org: organization,
                hook_id: id});
            }
            
            async function list_hook(organization){
              const list = await octokit.orgs.listHooks({
                org: organization, 
                per_page: 100

              });
              for (i = 0; i<list.data.length; i++){
                all_hooks.push(list.data[i]["config"]["url"])
                if (list.data[i]["config"]["url"].includes(endpoint_URL)){
                  // do noting if the webhook API gateway exist
                } else if (list.data[i]["config"]["url"].includes("it-eng/webhook")){
                  delete_hook(organization, list.data[i]["id"])
                }              
              }
              console.log(all_hooks)
            }
            


            octokit.paginate('GET /user/orgs').then(org_data => { 
            for (var org of org_data){
              if (org.login == company) {
                console.log(org.login);
                list_hook(org.login)
                add_hook(org.login)
            }
          }
        
        });
          });
          }
        });
        }
      }
    }
  });
  });

  callback(null, response);
  };

