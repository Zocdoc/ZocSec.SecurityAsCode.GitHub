# enable_vuln.py || part of ZocSec.SecurityAsCode.GitHub
#
# A tool for extracting important informaiton about all repos in an organization.
#
# Owner:	Copyright © 2018-2019 Zocdoc Inc.  www.zocdoc.com
# Authors:	Gary Tsai @garymalaysia
#           Jay Ball  @veggiespam
#			

from github import Github
from github import enable_console_debug_logging
from github import GithubException
import argparse
import requests
import json



if __name__ == "__main__":


	parser = argparse.ArgumentParser(description='This tool allow user to audit Enterprise Repos.')
	parser.add_argument("-t", "--token", required=True, help="GitHub User Private Token")
	parser.add_argument("-o",'--organization',help="Enter the Organization/Company")
	args = vars(parser.parse_args())

	token = args["token"]
	org = args["organization"].lower()
	headers = {'Authorization': 'token ' + token, # https://developer.github.com/changes/2019-04-24-vulnerability-alerts/
	 'Accept':'application/vnd.github.dorian-preview+json'}

	try:# Error checking for user credential
		user = Github(token)
		try:# Error checking for organization 
			organization = user.get_organization(org)
			repos = organization.get_repos()
			for repo in repos:
				repo_name = repo.full_name
				login = requests.put('https://api.github.com/repos/%s/vulnerability-alerts' % repo_name , headers=headers)
				print (repo_name +": Enabled -> ", login.ok)
		except GithubException as org_err:
			print (org_err.data)
	except GithubException as login_err:
		print (type(login_err.data))

			
