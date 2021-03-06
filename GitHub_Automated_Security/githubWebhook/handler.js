// githubWebhook/handler.js  || part of ZocSec.SecurityAsCode.GitHub
//
// This script will trigger everytime GitHub webhook sends a notification base on your webhook config at Organization level.
//
// Owner:	Copyright © 2018-2019 Zocdoc Inc.  www.zocdoc.com
// Authors: Gary Tsai @garymalaysia
//          Jay Ball  @veggiespam




"use strict";

const crypto = require('crypto');
const https = require('https');
const Octokit = require('@octokit/rest');

// Load the AWS SDK for Node.js
var AWS = require('aws-sdk');
const kms = new AWS.KMS();

// Set region
AWS.config.update({region: process.env.AWS_REGION});

function signRequestBody(key, body) {
  return `sha1=${crypto.createHmac('sha1', key).update(body, 'utf-8').digest('hex')}`;
}

module.exports.githubWebhookListener = (event, context, callback) => {

const token = process.env.GITHUB_WEBHOOK_SECRET;
let decrypted_secret_token;


// decrypting webhook secret phrase
kms.decrypt({ CiphertextBlob: new Buffer(token, 'base64') }, (err, data) => {
  if (err) {
      console.log('Decrypt error:', err);
      return callback(err);
    }
    decrypted_secret_token = data.Plaintext.toString('ascii');
    //console.log(decrypted_secret_token);


  var errMsg; // eslint-disable-line
  const headers = event.headers;
  const body = JSON.parse(event.body);
  console.log(body);
  const sig = headers['X-Hub-Signature'];
  const githubEvent = headers['X-GitHub-Event'];
  const id = headers['X-GitHub-Delivery'];
  const calculatedSig = signRequestBody(decrypted_secret_token, event.body);
  const acct_id = JSON.stringify(context.invokedFunctionArn).split(':')[4];
  var topic = []


  if (typeof decrypted_secret_token !== 'string') {
    errMsg = 'Must provide a \'GITHUB_WEBHOOK_SECRET\' env variable';
    return callback(null, {
      statusCode: 401,
      headers: { 'Content-Type': 'text/plain' },
      body: errMsg,
    });
  }

  if (!sig) {
    errMsg = 'No X-Hub-Signature found on request';
    return callback(null, {
      statusCode: 401,
      headers: { 'Content-Type': 'text/plain' },
      body: errMsg,
    });
  }

  if (!githubEvent) {
    errMsg = 'No X-Github-Event found on request';
    return callback(null, {
      statusCode: 422,
      headers: { 'Content-Type': 'text/plain' },
      body: errMsg,
    });
  }

  if (!id) {
    errMsg = 'No X-Github-Delivery found on request';
    return callback(null, {
      statusCode: 401,
      headers: { 'Content-Type': 'text/plain' },
      body: errMsg,
    });
  }

  if (sig !== calculatedSig) {
    errMsg = 'X-Hub-Signature incorrect. Github webhook token doesn\'t match';
    return callback(null, {
      statusCode: 401,
      headers: { 'Content-Type': 'text/plain' },
      body: errMsg,
    });
  }

  /* eslint-disable */
  console.log('---------------------------------');
  console.log(`Github-Event: "${githubEvent}" with action: ${body.action}`);
  console.log('---------------------------------');
  console.info('Payload', body);
  
  // Do custom stuff here with github event data


const encrypted_github_token = process.env.GITHUB_TOKEN;
let decrypted_github_token;

// decrypting github token
kms.decrypt({ CiphertextBlob: new Buffer(encrypted_github_token, 'base64') }, (err, data) => {
  if (err) {
      console.log('Decrypt error:', err);
      return callback(err);
    }
    decrypted_github_token = data.Plaintext.toString('ascii');

// Auth process
    const octokit = new Octokit({
      auth: `token ${decrypted_github_token}`
    });

function enable_vuln() {
  const data = JSON.stringify({
 
})

const options = {
  hostname: 'api.github.com',
  path: `/repos/${body.organization.login}/${body.repository.name}/vulnerability-alerts`,
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${decrypted_github_token}`,
    'accept':'application/vnd.github.dorian-preview+json',
    'User-Agent':'AWS-Lambda-Github-Webhoot'
  }
}

const req = https.request(options, (res) => {
  console.log(`statusCode: ${res.statusCode}`)

  res.on('data', (d) => {
    process.stdout.write(d)
  })
})

req.on('error', (error) => {
  console.error(error)
})

req.write(data)
req.end()

/*
Reference:

1) https://developer.github.com/changes/2019-04-24-vulnerability-alerts/
2) https://flaviocopes.com/node-make-http-requests/
3) https://medium.com/dev-bits/a-guide-for-adding-jwt-token-based-authentication-to-your-single-page-nodejs-applications-c403f7cf04f4
*/  
}

async function label_open_source(user, repository, topic_to_add){
  enable_vuln()
  const result = await octokit.repos.replaceTopics({
    owner:user ,
    repo:repository ,
    names: topic_to_add,
    headers: {
      accept: 'application/vnd.github.mercy-preview+json'}
  })
}

async function take_action(){
  try{
    const result = await octokit.repos.update({
      owner: `${body.organization.login}`, 
      repo : `${body.repository.name}`,
      name: `${body.repository.name}`,
      private: true})
  }
  catch(err){
    console.log(err["errors"])
    if (err["errors"][0]["message"].includes("Public forks can\'t be made private")){
      topic.push("open-source")
      label_open_source(`${body.organization.login}`, `${body.repository.name}`, topic)
    }
  }
}


async function list_topic_and_action(){
  const result = await octokit.repos.listTopics({
    owner: `${body.organization.login}`,
    repo:  `${body.repository.name}`,
    headers: {
      accept: 'application/vnd.github.mercy-preview+json'}
    });

    if (result.data.names.includes('open-source') === false && body.repository.private === false ){
      take_action();
      enable_vuln();
     
      var params = {
      Message: `Repository: "${body.repository.full_name}" changed to Private,
      User: ${body.sender.login},
      Updated at: ${body.repository.updated_at},
      Private was: ${body.repository.private},
      Repo Topics (none if blank): ${result.data.names} 
      
      This action was corrected.`,  /* required */
      TopicArn: `arn:aws:sns:${process.env.AWS_REGION}:${acct_id}:github-repo-monitor`, // Makesure a topic is created using 'github-repo-monitor'
    };
    console.log(body.repository.name); // used for debugging
    
  // Create promise and SNS service object
    var publishTextPromise = new AWS.SNS({apiVersion: '2010-03-31'}).publish(params).promise();
    
    // handle promise's fulfilled/rejected states
    publishTextPromise.then(
      function(data) {
        console.log(`Message ${params.Message} send sent to the topic ${params.TopicArn}`);
        console.log("MessageID is " + data.MessageId);
      }).catch(
        function(err) {
        console.error(err, err.stack);
    
    });
    }
      
    }
if (typeof (`${body.repository.name}`) !== 'underfind'){
  list_topic_and_action(); // initiate action 
}


  const response = {
    statusCode: 200,
    body: JSON.stringify({
      input: event,
    }),
  };

  return callback(null, response);
});
});
};
