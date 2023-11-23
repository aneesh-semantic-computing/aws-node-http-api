import middy from '@middy/core';
import httpErrorHandler from '@middy/http-error-handler';
import AWS from 'aws-sdk';

const fetchTodo = async (event) => {
  const dynamoDB = new AWS.DynamoDB.DocumentClient();
  const { id } = event.pathParameters;

  try {
    const result = await dynamoDB.get({
      TableName: "TodoTable",
      Key: { id }
    }).promise();
    return {
      statusCode: 200,
      body: JSON.stringify(result.Item),
    };
  } catch (exception) {
    console.log(exception);
    return {
      statusCode: 500,
      body: 'There is an issue when serving this request'
    }
  }
};

export const handler = middy()
                  .use(httpErrorHandler())
                  .handler(fetchTodo);
