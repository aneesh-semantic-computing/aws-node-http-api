import middy from '@middy/core';
import jsonBodyParser from '@middy/http-json-body-parser';
import httpErrorHandler from '@middy/http-error-handler';
import validator from '@middy/validator';
import { transpileSchema } from '@middy/validator/transpile';
import AWS from 'aws-sdk';

const updateTodo = async (event) => {
  const dynamoDB = new AWS.DynamoDB.DocumentClient();
  const { id } = event.pathParameters;
  const { todo, completed } = event.body;

  let UpdateExpression = "set ";
  const ExpressionAttributeValues = {}
  if (todo) {
    UpdateExpression += "todo = :todo";
    ExpressionAttributeValues[":todo"] = todo;
  }
  if (completed !== undefined && completed !== null) {
    if (UpdateExpression !== "set "){
      UpdateExpression += ", completed = :completed";
    } else {
      UpdateExpression += "completed = :completed";
    }
    ExpressionAttributeValues[":completed"] = completed;
  }
  if (UpdateExpression === "set ") {
    return {
      statusCode: 500,
      body: "No request payload",
    };
  }
  UpdateExpression += ", updatedAt = :updatedAt";
  ExpressionAttributeValues[":updatedAt"] = new Date().toISOString();

  
  const updatedItem = await dynamoDB.update({
    TableName: "TodoTable",
    Key: { id },
    UpdateExpression,//: "set todo = :todo, completed = :completed",
    ExpressionAttributeValues,
    ReturnValues: "ALL_NEW"
  }).promise();
  console.log("updated: ", JSON.stringify(updatedItem));
  return {
    statusCode: 200,
    body: JSON.stringify({...updatedItem.Attributes}),
  };
};

const schema = {
  type: 'object',
  properties: {
    body: {
      type: 'object',
      properties: {
        todo: { type: 'string', minLength: 3, maxLength: 30 },
        completed: { type: 'boolean' }
      },
      required: []
    }
  }
};

export const handler = middy()
                  .use(jsonBodyParser())
                  .use(validator({ eventSchema: transpileSchema(schema) }))
                  .use(httpErrorHandler())
                  .handler(updateTodo);
