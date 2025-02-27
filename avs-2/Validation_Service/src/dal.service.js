require('dotenv').config();
const axios = require("axios");

var ipfsHost = '';

function init() {
  ipfsHost = process.env.IPFS_HOST;
}


async function getIPfsTask(cid) {
  const { data } = await axios.get(ipfsHost + cid);
  console.log("*recieved data ", data)

  return {
    "isAI": data.isAI,
    "image_url": data.image_url
  };
}


module.exports = {
  init,
  getIPfsTask
}