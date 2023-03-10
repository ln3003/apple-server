let io;

module.exports = {
  init: (server) => {
    io = require("socket.io")(server, {
      cors: {
        origin: ["https://admin.ngh.one", "https://apple.ngh.one"],
        methods: ["POST", "PUT", "GET", "OPTIONS", "HEAD"],
        credentials: true,
      },
    });
    return io;
  },
  getIO: () => {
    if (!io) {
      throw new Error("io undefined");
    }
    return io;
  },
};
// ["http://localhost:3000", "http://localhost:3001"]
