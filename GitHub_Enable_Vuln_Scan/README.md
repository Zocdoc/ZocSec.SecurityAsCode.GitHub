# Enable Vulnerability Scanning on All GitHub Repo

## Summary
Due to high demand on new endpoints to manage the vulnerability alerts setting for your repositories, GitHub released API for you to do just that [HERE](https://developer.github.com/changes/2019-04-24-vulnerability-alerts/).

This script is a Proof of Concept (PoC) for any to enable vulnerability scanning to all of their repos in organization.

*Note
You need be in Admin role for the repo or your organization

## Usage
```$ pip3 install requirement.txt```

```$ python3 enable_vuln.py -t <Your Personal Access Token> -o <your company/organization>```

## Warning
You may introduce more work for your team and developers
![Screenshot](more_work.png)

## About

This project was released to the public as part of the Zocdoc's ZocSec.SecurityAsCode initiative.

The primary contributors to this effort are Jay Ball ([@veggiespam](https://github.com/veggiespam)) and Gary Tsai ([@garymalaysia](https://github.com/garymalaysia)).

Copyright © 2018-2019 Zocdoc Inc.  www.zocdoc.com                                                                          

<!-- vim: spell expandtab
-->


