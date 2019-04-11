const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const sqlite3 = require('sqlite3').verbose();

const app = express();

let db = new sqlite3.Database('../db/showsDatabase.db', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the showsDatabase.');
});

//initialize a simple http server
const server = http.createServer(app);

//initialize the WebSocket server instance
const wss = new WebSocket.Server({
  server
});

//variables
var successful = {
  "success": true
};

var VALID_USERS = ["sG27t8Af"];
var CONNECTIONS = {};


wss.on('connection', (ws) => {
  ws.on('message', (theMessage) => {
    message = JSON.parse(theMessage);
    console.log(theMessage + "\n");
    switch (message.type) {
      case "newConnection":
        evaluateNewClientRequest(ws, message.uniqueID, message.platform);
        console.log(`Got a new connection! uniqueID= ${message.uniqueID}`);
        break;
      case "disconnect":
        closeConnection(message.uniqueID, message.platform);
        break;
      case "tradeAlert":
        sendMsgToMobile(message, message.uniqueID);
        break;
      case "tradeResponse":
        sendMsgToPC(message, message.uniqueID);
        break;
      default:
        ws.send("how did you get here..?");
    }
    //log the received message and send it back to the client
  });
});

function evaluateNewClientRequest(ws, uniqueID, platform) {
	console.log(uniqueID);
	console.log(VALID_USERS);
  if (VALID_USERS.includes(uniqueID)) {
    if (checkExistingConnection(uniqueID)) {
      updateExistingConnection(ws, uniqueID, platform)
    } else {
      createNewConnection(ws, uniqueID, platform);
    }
  } else {
    ws.send("you are not a valid user");
  }
}


function createNewConnection(ws, uniqueID, platform) {
  if (platform == "pcUser") {
    var connection = {
      connectionID: uniqueID,
      pcSocket: ws,
      mobileSocket: null
    };
    CONNECTIONS[uniqueID] = [connection];
  } else if (platform == "mobileUser") {
    var connection = {
      connectionID:uniqueID,
      pcSocket:null,
      mobileSocket:ws
    };
    CONNECTIONS[uniqueID] = [connection];
  } else {
    ws.send("you are not on a valid platform");
  }
}

function updateExistingConnection(ws, uniqueID, platform) {
  if (platform == "pcUser") {
    // close the existing connection
    if (CONNECTIONS[uniqueID].pcSocket != null) {
      closeConnection(uniqueID, "pcUser");
    }
    CONNECTIONS[uniqueID].pcSocket = ws;
  } else if (platform == "mobileUser") {
    // close the existing connection
    if (CONNECTIONS[uniqueID].mobileSocket != null) {
      closeConnection(uniqueID, "mobileUser");
    }
    CONNECTIONS[uniqueID].mobileSocket = ws;
  } else {
    ws.send("you are not on a valid platform");
  }
}

function checkExistingConnection(uniqueID) {
  var output = false;

  if (CONNECTIONS[uniqueID] != null) {
    output = true;
  }

  return output;
}

function closeConnection(uniqueID, platform) {
  if (platform == "pcUser") {
    var ws = CONNECTIONS[uniqueID].pcSocket;
    delete CONNECTIONS[uniqueID];
  } else if (platform == "mobileUser") {
    var ws = CONNECTIONS[uniqueID].mobileSocket;
    delete CONNECTIONS[uniqueID];
  } else {
    ws.send("you are not on a valid platform");
  }

  if (ws != null) {
    ws.close();
  }

}

function sendMsgToMobile(message, uniqueID) {
  if (CONNECTIONS[uniqueID] != null) {
    if (CONNECTIONS[uniqueID].mobileSocket != null) {
      CONNECTIONS[uniqueID].mobileSocket.send(message);
    }
  } else {
    console.log("UNABLE TO SEND MSG: mobile connection not present")
  }
}

function sendMsgToPC(message, uniqueID) {
  if (CONNECTIONS[uniqueID] != null) {
    if (CONNECTIONS[uniqueID].pcSocket != null) {
      CONNECTIONS[uniqueID].pcSocket.send(message);
    }
  } else {
    console.log("UNABLE TO SEND MSG: pc connection not present")
  }
}

//start our server
server.listen(8080, () => {
  console.log(`Server started on port ${server.address().port} :)`);
});
