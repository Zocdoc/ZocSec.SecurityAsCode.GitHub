#!/bin/bash


echo  ""
echo  ""


echo  "### ##   ## ###   ###  ###  #####  ##   ##   # ##### #  #"
echo  " #  # # # # #  # #   # #  #   #   #  #  # #  #   #   #  #"
echo  " #  #  #  # # #  #   # ###    #  ###### #  # #   #   #  #"
echo  " #  #     # #    #   # #  #   #  #    # #   ##   #       "
echo  "### #     # #     ###  #   #  #  #    # #    #   #   #  #"

echo  ""

echo 'Before you move forward with this setup, you need to first configure AWS CLI and Serverless Framework. And if you have separate AWS profile, please makesure you have it configure properly'
echo 'Please see <https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-profiles.html> for AWS CLI configuration'
echo 'Please visit <https://serverless.com/framework/docs/getting-started/> for serverless CLI configuration'
echo ""
echo ""

echo 'Did you set up AWS CLI and Serverless? Enter y => Yes or Enter n => No'

read check

if [ "$check" == "y" ]; 
then

	if [[  -f ../secrets.yml ]]; then
        rm ../secrets.yml

	fi
	

  	echo -e "\nGenerating a secrets.yml file"
  	echo ""

  	echo 'Please Enter Your Organization'
  	read organization

  	echo ""

	echo 'Please Enter AWS Profile. Ex: IT-ENG or CI'
	read profile
	export ENV=$profile
	echo ""
	#echo $ENV
	echo 'Please Enter AWS Region. Ex: us-east-1'
	read region
	export AWS_REGION=$region
	#echo $AWS_REGION

	AccountId=$(aws sts get-caller-identity --output text --query 'Account'  --region $region --profile $profile)
	export ACCOUNTID=$AccountId


	arr=($(aws kms list-aliases --region $region --profile $profile | grep AliasName | cut -d '"' -f 4))
	targetkeyid=$(aws kms list-aliases --region us-east-1 --profile it-eng | grep  -A 1 -w alias/GitHub-Webhook | grep TargetKeyId | cut -d '"' -f 4)
	export KEYID=$targetkeyid

		if [ $targetkeyid ]; then
			echo 'GitHub-Webhook is Found. Will use keyID:' $targetkeyid

			echo ""
			echo "Enter your GITHUB PERSONAL ACCESS TOKEN:"

			read -s -p "Enter Token:" token

			encrypt_token=$(aws kms encrypt --key-id $targetkeyid  --plaintext $token --query CiphertextBlob --output text --region $region --profile $profile)		
			export ENCRYPTED_TOKEN=$encrypt_token


			echo ""
			echo "Enter your GITHUB WEBHOOK SECRET:"

			read -s -p "Enter Webhook Secret:" secret

			encrypt_secret=$(aws kms encrypt --key-id $targetkeyid --plaintext $secret --query CiphertextBlob --output text --region $region --profile $profile)

			export ENCRYPTED_SECRET=$encrypt_secret


			echo ""
			echo "Encrypting Your Tokens .... "

			echo $ENCRYPTED_TOKEN
			echo $ENCRYPTED_SECRET

			kmsARN=$(aws kms list-keys --region $region --profile $profile | grep $targetkeyid | grep KeyArn | cut -d '"' -f 4)
			export KMS_ARN=$kmsARN


			aws ssm put-parameter --name /GitHub-Webhook/github_access_token --type String --value $encrypt_token --region $region --profile $profile
			aws ssm put-parameter --name /GitHub-Webhook/github_webhook_secret  --type String --value $encrypt_secret --region $region --profile $profile

			echo ""
			echo "Done!"

			cd layer/.

			sls package 
			layer_ARN=$(sls deploy --package layer/ | grep octokit_Module: | awk '{print $2}')

			cd ..

			export LAYER_ARN=$layer_ARN
			
			#echo $LAYER_ARN

			cat > ../secrets.yml <<EOL
Aws_Account:
  org: ${organization}
  environment : ${ENV}
  region: ${AWS_REGION}
  account_Id: ${ACCOUNTID}
  keyId: ${KEYID}
  kms_arn: ${KMS_ARN}
  layer_arn: ${LAYER_ARN}
  webhook_secret: ${secret}

EOL


			sls deploy
			sls invoke -f initial_trigger

			unset ENCRYPTED_SECRET
			unset ENCRYPTED_TOKEN
			unset ENV
			unset AWS_REGION
			unset KMS_ARN
			unset LAYER_ARN
			unset KEYID
			unset ACCOUNTID


		else
			keyid=$(aws kms create-key --description github-webhook --region $region --profile $profile | grep KeyId | cut -d '"' -f 4)
			#echo $keyid
			export KEYID=$keyid
			aws kms create-alias --alias-name alias/GitHub-Webhook --target-key-id $keyid --region $region --profile $profile

			echo ""
			echo "Enter your GITHUB PERSONAL ACCESS TOKEN:"

			read -s -p "Enter Token:" token

			encrypt_token=$(aws kms encrypt --key-id $keyid --plaintext $token --query CiphertextBlob --output text --region $region --profile $profile)
			export ENCRYPTED_TOKEN=$encrypt_token

			echo ""
			echo "Enter your GITHUB WEBHOOK SECRET:"

			read -s -p "Enter Webhook Secret:" secret

			encrypt_secret=$(aws kms encrypt --key-id $keyid --plaintext $secret --query CiphertextBlob --output text --region $region --profile $profile)
			export ENCRYPTED_SECRET=$encrypt_secret



			echo ""
			echo "Encrypting Your Tokens .... "

			echo $ENCRYPTED_TOKEN
			echo $ENCRYPTED_SECRET

			aws ssm put-parameter --name /GitHub-Webhook/github_access_token --type String --value $encrypt_token --region $region --profile $profile
			aws ssm put-parameter --name /GitHub-Webhook/github_webhook_secret  --type String --value $encrypt_secret --region $region --profile $profile

			kmsARN=$(aws kms list-keys --region $region --profile $profile | grep $keyid | grep KeyArn | cut -d '"' -f 4)
			export KMS_ARN=$kmsARN

			echo ""
			echo "Done!"


			cd layer/.

			sls package 
			layer_ARN=$(sls deploy --package layer/ | grep octokit_Module: | awk '{print $2}')
			cd ..

			export LAYER_ARN=$layer_ARN
			
			#echo $LAYER_ARN

			cat > ../secrets.yml <<EOL
Aws_Account:
  org: ${organization}
  environment : ${ENV}
  region: ${AWS_REGION}
  account_Id: ${ACCOUNTID}
  keyId: ${KEYID}
  kms_arn: ${KMS_ARN}
  layer_arn: ${LAYER_ARN}
  webhook_secret: ${secret}

EOL

			sls deploy
			sls invoke -f initial_trigger

			unset ENCRYPTED_SECRET
			unset ENCRYPTED_TOKEN
			unset ENV
			unset AWS_REGION
			unset KMS_ARN
			unset LAYER_ARN
			unset KEYID
			unset ACCOUNTID
		fi

else
	echo "Please see <https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-profiles.html> for AWS CLI configuration"
	echo 'Please visit <https://serverless.com/framework/docs/getting-started/> for serverless CLI configuration'

fi