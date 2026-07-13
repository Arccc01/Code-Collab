import { io } from "socket.io-client";

const socket = io({
  autoConnect: false, // only connect when user is logged in
});

export default socket;
