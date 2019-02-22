# GitHub_Inventory_Tool

This script will output a XLSX file with all GitHub repo information to the present working directory.
The title of the file follows this naming convention: Github_Audit_YYYY-MM-DD.xlsx

## Usage

``` $ pip3 install -r requirement.txt ```

``` $ python3 github_tasks.py -t <YOUR TOKEN> -a``` to perform full account audit

``` $ python3 github_tasks.py -t <YOUR TOKEN> -u <updated of the orginal XLSX spreadsheet>``` to add or remove Topics from Repos

## Output Sample

<img src="sample.png" width="1000" height="80"/>