const { v4 } = require('uuid');
const AWS = require('aws-sdk');

const updateTodo = async (event) => {
  const dynamoDB = new AWS.DynamoDB.DocumentClient();
  const { id } = event.pathParameters;
  const { todo, completed } = JSON.parse(event.body);
  const createdAt = new Date().toISOString();

  let UpdateExpression = "set ";
  const ExpressionAttributeValues = {}
  if (todo) {
    UpdateExpression += "todo = :todo";
    ExpressionAttributeValues[":todo"] = todo;
  }
  if (completed !== undefined && completed !== null) {
    if (UpdateExpression !== "set "){
      UpdateExpression += " , completed = :completed";
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

module.exports = {
  handler: updateTodo
}