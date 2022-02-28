const AWS = require("aws-sdk");
const S3 = new AWS.S3();
const DynamoClient = new AWS.DynamoDB.DocumentClient();

type DynamoItem = { [key: string]: string };
type DynamoBatches = Array<{
  PutRequest: { Item: DynamoItem };
}>;

//not sure how to type event param
export const handler = async (event: any) => {
  try {
    const [eventData] = event.Records;
    const {
      object: { key },
      bucket: { name },
    } = eventData.s3;
    console.log("key", key);
    console.log("name", name);
    const dynamoTableName = process.env.TABLE_NAME as string;
    const data = await S3.getObject({
      Bucket: name,
      Key: key,
    }).promise();
    if (!data.ContentType.includes("text/csv")) {
      console.log("invalid file type");
      return;
    }
    const body = data.Body.toString("utf-8");
    const headers = body.split("\n")[0].split(",");
    const dynamoItems: Array<DynamoItem> = body
      .split("\n")
      .filter((row: string, index: number) => index !== 0 && row)
      .map((row: string) => {
        const rowArray = row.split(",");
        const dynamoItem = headers
          .map((header: string, index: number) => ({
            [header]: rowArray[index],
          }))
          .reduce((accumulator: DynamoItem, dynamotItem: DynamoItem) => {
            accumulator = { ...accumulator, ...dynamotItem };
            return accumulator;
          }, {});
        return dynamoItem;
      });
    const dynamoBatches: DynamoBatches = dynamoItems.map((item, index) => {
      const itemWithId = { uuid: index.toString(), ...item };
      return { PutRequest: { Item: itemWithId } };
    });
    console.log("sending batches...");
    const params = {
      RequestItems: {
        [dynamoTableName]: dynamoBatches,
      },
    };
    const result = await DynamoClient.batchWrite(params).promise();
    console.log("data sucessfully saved");
    console.log(result);
    return { status: 201 };
  } catch (error) {
    console.log("error", error);
    return { status: 500 };
  }
};
