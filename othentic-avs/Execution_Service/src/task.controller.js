"use strict";
const { Router } = require("express")
const CustomError = require("./utils/validateError");
const CustomResponse = require("./utils/validateResponse");
const oracleService = require("./oracle.service");
const dalService = require("./dal.service");

const router = Router()

//load the api key from .env
require('dotenv').config();
const token = process.env.BITMINDKEY;


router.post("/execute", async (req, res) => {
    console.log("Executing task");

    try {
        var taskDefinitionId = Number(req.body.taskDefinitionId) || 0;
        console.log(`taskDefinitionId: ${taskDefinitionId}`);

        var image_url = req.body.image_url || "https://example.com/image.jpg";
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
        console.log("########")
        console.log(res);
        console.log("########")



        const result = await oracleService.getPrice("ETHUSDT");
        result.price = req.body.fakePrice || result.price;
        const cid = await dalService.publishJSONToIpfs(result);
        const data = "hello";
        await dalService.sendTask(cid, data, taskDefinitionId);
        return res.status(200).send(new CustomResponse({ proofOfTask: cid, data: data, taskDefinitionId: taskDefinitionId }, "Task executed successfully"));
    } catch (error) {
        console.log(error)
        return res.status(500).send(new CustomError("Something went wrong", {}));
    }
})


module.exports = router
