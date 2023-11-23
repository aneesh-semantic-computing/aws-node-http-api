import middy from '@middy/core';
import jsonBodyParser from '@middy/http-json-body-parser';
import httpErrorHandler from '@middy/http-error-handler';
import validator from '@middy/validator';
import { transpileSchema } from '@middy/validator/transpile';
import { v4 } from 'uuid';
import AWS from 'aws-sdk';

const addTodo = async (event) => {
  const dynamoDB = new AWS.DynamoDB.DocumentClient();
  const { todo } = event.body;
  const id = v4();
  const createdAt = new Date().toISOString();
  const newTodo = {
    id,
    todo,
    createdAt,
    updatedAt: createdAt,
    completed: false
  };
  await dynamoDB.put({
    TableName: "TodoTable",
    Item: newTodo
  }).promise();

  return {
    statusCode: 200,
    body: JSON.stringify(newTodo),
  };
};

const schema = {
  type: 'object',
  properties: {
    body: {
      type: 'object',
      properties: {
        todo: { type: 'string', minLength: 3, maxLength: 30 },
      },
      required: ['todo']
    }
  }
};


export const handler = middy()
                  .use(jsonBodyParser())
                  .use(validator({ eventSchema: transpileSchema(schema) }))
                  .use(httpErrorHandler())
                  .handler(addTodo);
