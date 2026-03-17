import { io } from "socket.io-client";

const socket = io(`${import.meta.env.VITE_backend_url}`, {
  autoConnect: false, // only connect when user is logged in
  withCredentials:true
});

export default socket;
