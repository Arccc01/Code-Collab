import { io } from 'socket.io-client'


const socket = io(`${import.meta.env.backend_url}`, {
  autoConnect: false, // only connect when user is logged in
})

export default socket