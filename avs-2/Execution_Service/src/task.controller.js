"use strict";
const { Router, json } = require("express")
const CustomError = require("./utils/validateError");
const CustomResponse = require("./utils/validateResponse");
const dalService = require("./dal.service");

const router = Router()

require('dotenv').config();
const token = process.env.BITMINDKEY;

router.post("/execute", async (req, res) => {
    console.log("Executing task");

    try {
        var taskDefinitionId = Number(req.body.taskDefinitionId) || 0;
        console.log(`taskDefinitionId: ${taskDefinitionId}`);


        // get camera verification
        var image_url = req.body.image_url;
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
                    image: image_url
                }),
            }
        );
        const res_me = await response.json();
        console.log("EXECUTIONER ########")
        console.log(res_me);
        console.log("EXECUTION########")
        // end camera verification

        const temp_data = {
            "isAI": res_me.isAI,
            "image_url": image_url
        }

        const cid = await dalService.publishJSONToIpfs(temp_data);
        // console.log("*before sending: image url", image_url)
        // console.log("*before sending data", data)

        const stringifiedData = JSON.stringify(temp_data);

        await dalService.sendTask(cid, stringifiedData, taskDefinitionId);
        return res.status(200).send(new CustomResponse({ proofOfTask: cid, data: data, taskDefinitionId: taskDefinitionId }, "Task executed successfully"));
    } catch (error) {
        console.log(error)
        return res.status(500).send(new CustomError("Something went wrong", {}));
    }
})


module.exports = router
