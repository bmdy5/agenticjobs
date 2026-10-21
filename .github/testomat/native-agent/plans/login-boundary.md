<!-- suite -->
# Verify username preserves 20 characters and truncates the 21st according to requirements. Do not submit the form or test authentication.

### Prerequisite

* URL: http://127.0.0.1:4187/

<!-- test
priority: critical
-->
# Enter a username with exactly 20 characters and observe the input field behavior

## Requirements
http://127.0.0.1:4187/

## Steps
* Focus on the username input textbox
* Type exactly 20 characters into the username textbox

## Expected
* The username input field accepts all 20 characters without truncation

<!-- test
priority: critical
-->
# Enter a username with 21 characters and observe the input field behavior

## Requirements
http://127.0.0.1:4187/

## Steps
* Focus on the username input textbox
* Type 21 characters into the username textbox

## Expected
* The username input field accepts only the first 20 characters, and the 21st character is truncated or ignored

<!-- test
priority: critical
-->
# Paste a string longer than 20 characters into the username input field and observe behavior

## Requirements
http://127.0.0.1:4187/

## Steps
* Focus on the username input textbox
* Paste a string with more than 20 characters into the textbox

## Expected
* The username input field displays only the first 20 characters of the pasted string, truncating the rest

<!-- test
priority: critical
-->
# Input a 20-character username and then modify it to include the 21st character, observing truncation

## Requirements
http://127.0.0.1:4187/

## Steps
* Enter exactly 20 characters in the username textbox
* Attempt to add a 21st character by typing or editing

## Expected
* The input field prevents the 21st character from appearing, maintaining only 20 characters

<!-- test
priority: critical
-->
# Type a username with 15 characters, then add 5 characters to reach 20, and check the input behavior

## Requirements
http://127.0.0.1:4187/

## Steps
* Type 15 characters into the username textbox
* Add 5 more characters to reach exactly 20 characters

## Expected
* The username textbox displays all 20 characters without truncation

<!-- test
priority: critical
-->
# Enter a username with 19 characters, then add one to reach 20, verifying no truncation occurs

## Requirements
http://127.0.0.1:4187/

## Steps
* Type 19 characters into the username textbox
* Add one more character

## Expected
* The username input field displays all 20 characters without truncation

<!-- test
priority: critical
-->
# Verify that entering more than 20 characters does not submit the form and truncates input as per requirements

## Requirements
http://127.0.0.1:4187/

## Steps
* Type more than 20 characters into the username textbox

## Expected
* Only the first 20 characters are retained in the textbox, and the 21st character is truncated

