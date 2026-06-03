const { Resolver } = require('dns');
const resolver = new Resolver();
resolver.setServers(['8.8.8.8', '1.1.1.1']);
require('dns').setDefaultResultOrder('ipv4first');
require('dns').setServers(['8.8.8.8', '1.1.1.1']);
require('dotenv').config()
const app = require('./src/app')
const connectDB = require('./src/db/db')
const initsocketserver = require('./src/sockets/socket.server')
const httpServer = require('http').createServer(app)


connectDB()
initsocketserver(httpServer);


httpServer.listen(3000,()=>{
    console.log("server is running at port 3000")
})