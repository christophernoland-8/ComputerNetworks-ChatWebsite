try {
    // Creating an instance of the WebSocket
    socket = new WebSocket("ws://localhost:8000/messaging");
    
    // Adding an event listener to when the connection is opened
    socket.onopen = (ws, event) => {
      console.log("connected");
      handleShowSnackBar("Connected", "Success");
    };
    
    // Listening to messages from the server
    socket.onmessage = (event) => {
      try {
        // parse the data from string to JSON object
        const data = JSON.parse(event.data);

        // If the message is of type connect
        // set the client id
        if (data["type"] == "connect") {
          senderId = data["id"];
        } else if (data["type"] == "disconnected") {
          // if another client get disconnected show the current client
          // that the other user left
          handleShowSnackBar("Disconnected", `Client ` + data["id"]);
        } else {
          // if it is a regular message add it to the array of messages.
          messages = [data, ...messages];
        }
      } catch (e) {
        console.log(event.data);
        console.error(e);
      }
    };

    socket.onerror = (event) => {
      console.log("Failed to connect to websocket");
    };

    socket.close = (event) => {
      handleShowSnackBar("Disconnected", "Client disconnected");
      console.log("Connection closed");
    };
  } catch (e) {
    console.log("Failed to connect to websocket");
  }