require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const { client } = require("./db");

//router
const apiRouter = require("./api");

//create a server
const server = express();

//add middleware
server.use(morgan("dev"));
server.use(express.json());

//routes
server.use("/api", apiRouter);

//connect to client
client.connect();

//listen to the server
const PORT = 8000;
server.listen(PORT, () => {
  console.log("The server is up on port", PORT);
});
