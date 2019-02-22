# GitHub_Inventory_Tool

This script will output a XLSX file with all Github repo information to the present working directory.
The title of the file follows this naming convention: Github_Audit_YYYY-MM-DD.xlsx

## Usage

``` $ pip3 install -r requirement.txt ```

``` $ python3 github_tasks.py -t <YOUR TOKEN> -a``` to perform full Zocdoc Repo audit

``` $ python3 github_tasks.py -t <YOUR TOKEN> -u <updated of the orginal XLSX spreadsheet>``` to add or remove Topics from Repos