## Description

This is my first go in learning CDK. Bear in mind that the code is a bit rubbish, as I did not try to make it good but rather focused on undestanding the concept of cdk.

## What it does

This is a very simple, very dummy stack.
The idea here is that a S3 bucket is going to be created with a notification for when an item is added, this notification is going to call a lambda, which is going to persist this item (if csv) to a dynamoDB table.

The csv I was using for test is:

[test.csv](https://github.com/ysoares0209/simple-cdk-pipeline/files/8157389/test.csv)

```
name | middle name | age
Yan  | Soares      |  19
```
## How to test it
(or at least how I did it)

- clone the repo
- npm ci
- npm run build
- cdk boostrap
- cdk synth
- cdk deploy

On AWS console
 - Go to S3
 - there should be a bucket created by this app
 - Add the test csv there - you can add your own csv with different fields at your own risk as I did not bother testing those
 - Go to DynamoDB
 - See the `mySampleTable` table
 - check the items in this table
 - Item in csv should be there


## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `cdk deploy`      deploy this stack to your default AWS account/region
* `cdk diff`        compare deployed stack with current state
* `cdk synth`       emits the synthesized CloudFormation template
