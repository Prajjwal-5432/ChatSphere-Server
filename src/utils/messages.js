const generateTextMessage = (message, username = "") => {
  return {
    username,
    text: message,
    type: "text",
    createdAt: new Date().getTime(),
  };
};

const generateAccessMessage = (message, username = "") => {
  return {
    username,
    text: message,
    type: "access",
    createdAt: new Date().getTime(),
  };
};

const generateLocationMessage = (message, username = "") => {
  return {
    username,
    text: message,
    type: "location",
    createdAt: new Date().getTime(),
  };
};

module.exports = {
  generateTextMessage,
  generateLocationMessage,
  generateAccessMessage,
};
