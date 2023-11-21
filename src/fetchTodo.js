const AWS = require('aws-sdk');

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

module.exports = {
  handler: fetchTodo
}