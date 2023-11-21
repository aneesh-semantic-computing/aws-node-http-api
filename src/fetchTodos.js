const AWS = require('aws-sdk');

const fetchTodos = async (event) => {
  const dynamoDB = new AWS.DynamoDB.DocumentClient();

  try {
    const results = await dynamoDB.scan({TableName: "TodoTable"}).promise();
    return {
      statusCode: 200,
      body: JSON.stringify(results.Items),
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
  handler: fetchTodos
}