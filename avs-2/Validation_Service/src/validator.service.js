require('dotenv').config();
const dalService = require("./dal.service");
const oracleService = require("./oracle.service");

async function validate(proofOfTask) {

  require('dotenv').config();
  const token = process.env.BITMINDKEY;

  try {
    const taskResult = await dalService.getIPfsTask(proofOfTask);


    var data = await oracleService.getPrice("ETHUSDT");
    //get image and repeate
    var image_url = "https://hatrabbits.com/wp-content/uploads/2017/01/random.jpg";
    console.log(`image_url: ${image_url}`);
    //REPLACE IMAGE

    //verify the image is not deepfakle
    const response = await fetch(
      'https://api.bitmind.ai/oracle/v1/34/detect-image',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: { image_url }
        }),
      }
    );
    const res = await response.json();
    console.log("VALIDATOR ########")
    console.log(res);
    console.log("VALIDATOR ########")




    const upperBound = data.price * 1.05;
    const lowerBound = data.price * 0.95;
    let isApproved = true;
    if (taskResult.price > upperBound || taskResult.price < lowerBound) {
      isApproved = false;
    }
    return isApproved;
  } catch (err) {
    console.error(err?.message);
    return false;
  }
}

module.exports = {
  validate,
}