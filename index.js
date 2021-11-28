require('dotenv').config()
const {CLIENT_URL}= process.env

const SOCKETPORT = process.env.PORT || 3009 ;
  const io = require("socket.io")(SOCKETPORT, {
    cors: {
      origin: `${CLIENT_URL}`,
    },
  });

  let users =[]

    const addUser = (userId, socketId) => {
    !users.some((user) => user.userId === userId) &&
      users.push({ userId, socketId });
  };

  const getUser = (userId) => {
    return users.find((user) => user.userId === userId);
  };

  const removeUser = (socketId) => {
    users = users.filter((user) => user.socketId !== socketId);
  };

  io.on("connection", (socket) => {
    //getting Connected
    console.log("a user is connected")
    // io.emit("welcome","helo this is socket server")     // sends data to all users connected in server
    socket.on("addUser",userId=>{
        addUser(userId,socket.id)
        io.emit("getUsers",users)
    })

    //send and get message
    socket.on("sendMessage", async({ senderId, receiverId, text },req,res) => {
      try {
        const user = await getUser(receiverId);
        io.to(user.socketId).emit("getMessage", {
        senderId,
        text,
      });
      } catch (error) {
        res.status(500).json({msg:"internal server error"})
        console.log(error)
      } 
      
    });
     //when disconnect
     socket.on("disconnect", () => {
        console.log("a user disconnected!");
        removeUser(socket.id);
        io.emit("getUsers", users); 
      })
    });