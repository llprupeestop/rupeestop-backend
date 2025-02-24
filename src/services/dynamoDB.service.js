import { PutCommand, getCommand } from "@aws-sdk/lib-dynamodb";
import DynamoDB from "../config/db";

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME;

const saveTokenToDB = async (email, tokens) => {
  const params = {
    TableName: TABLE_NAME,
    Item: {
      email: { S: email },
      tokens: { M: tokens },
      portfolio: { L: [] },
    },
  };
  await DynamoDB.send(new PutCommand(params));
  console.log("✅ Token stored successfully!");
};

const getUserTokens = async (email) => {
  const params = {
    TableName: TABLE_NAME,
    key: {
      email: { S: email },
    },
  };
  const response = await DynamoDB.send(new getCommand(params));
  return response.Item ? response.Item.tokens : null;
};

export { getUserTokens, saveTokenToDB };
