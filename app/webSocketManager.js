const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const sqlite3 = require('sqlite3').verbose();

const app = express();

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

var VALID_USERS = ["sG27t8Af", "tG18b9Vq", "eC85x7Rp"];
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
      case "showsRequest":
        requestCurrentShows(message, message.uniqueID);
        break;
      case "showsUpdate":
        sendMsgToPC(message, message.uniqueID);
        break;
      default:
        ws.send("how did you get here..?");
    }
    //log the received message and send it back to the client
  });
});

function evaluateNewClientRequest(ws, uniqueID, platform) {
  if (VALID_USERS.includes(uniqueID)) {
    if (checkExistingConnection(uniqueID)) {
      // do nothing
    } else {
      createNewConnection(ws, uniqueID, platform);
    }
  } else {
    ws.send("you are not a valid user");
  }
}


function createNewConnection(ws, uniqueID, platform) {
    var connection = {
      connectionID: uniqueID,
      socketConn: ws
    };
    
    CONNECTIONS[uniqueID] = [connection];
}

function checkExistingConnection(uniqueID) {
  var output = false;

  if (CONNECTIONS[uniqueID] != null) {
    output = true;
  }

  return output;
}

function closeConnection(uniqueID, platform) {
  var ws = CONNECTIONS[uniqueID].socketConn;
  delete CONNECTIONS[uniqueID];

  if (ws != null) {
    ws.close();
  }

}

function sendMessageToApp(message, uniqueID) {
  if (CONNECTIONS[uniqueID] != null) {
      CONNECTIONS[uniqueID].socketConn.send(message);

  } else {
    console.log("UNABLE TO SEND MSG: app not present")
  }
}

function requestCurrentShows(message, uniqueID) {
  let db = new sqlite3.Database('../db/showsDatabase.db', (err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Connected to the showsDatabase.');
  });
	
  db.serialize(() => {
    db.each(`SELECT DATE as showDate,
                    VENUE as showVenue,
		    LOCATION as showLocation
             FROM SHOWS`, (err, row) => {
    if (err) {
      console.error(err.message);
    }
    
    console.log(row.showDate + "\t" + row.showVenue + "\t" + row.showLocation);
    
    //TODO: send data to client
    
  });
  
  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Closed the connection to showsDatabase.');
  });
  
});
	
	
	
}


//start our server
server.listen(8082, () => {
  console.log(`Server started on port ${server.address().port} :)`);
});
