const {ElvClient} = require("elv-client-js");
const fs = require("fs");
const path = require("path");



const AddMezImageWatermark = async (mezLibId, mezObjectId, watermarkJson, jsonFilePath) => {
  try {
    const client = await ElvClient.FromConfigurationUrl({
      configUrl: process.env.FABRIC_CONFIG_URL
    });

    // client.ToggleLogging(true);

    let wallet = client.GenerateWallet();
    let signer = wallet.AddAccount({
      privateKey: process.env.PRIVATE_KEY
    });
    await client.SetSigner({signer});

    client.ToggleLogging(false);

    // if image path is of form "./filename" then look for it and upload it
    const re = new RegExp("^\\./([^/]+)$");
    const match = re.exec(watermarkJson.image);

    if (match !== null) {
      const imageFilename = match[1];
      const dir = path.dirname(jsonFilePath);
      const imagePath = path.join(dir, imageFilename);
      if (fs.existsSync(imagePath)) {
        console.log("File " + imagePath + " found, uploading to object...")

        const {write_token} = await client.EditContentObject({
          libraryId: mezLibId,
          objectId: mezObjectId
        });

        const data = client.utils.BufferToArrayBuffer(fs.readFileSync(imagePath));

        const params = {
          libraryId: mezLibId,
          objectId: mezObjectId,
          writeToken: write_token,

          fileInfo: [{
            data: data,
            path: path.basename(imagePath),
            type: "file",
            mime_type: "image/*",
            size: data.byteLength
          }]
        }

        // console.debug(params);

        response = await client.UploadFiles(params);

        console.log("Finalizing object with uploaded file...");
        response = await client.FinalizeContentObject({
          libraryId: mezLibId,
          objectId: mezObjectId,
          writeToken: write_token
        });

        // console.debug(JSON.stringify(response));

        console.log("New hash: " + response.hash);
        watermarkJson.image = "/qfab/" + response.hash + "/files/" + path.basename(imagePath);

      }
    }

    console.log("Retrieving mezzanine metadata...");

    metadata = await client.ContentObjectMetadata({libraryId: mezLibId, objectId: mezObjectId});

    // read from metadata top level key 'offerings'
    if (!metadata.offerings) {
      console.log(`top level metadata key "offerings" not found`);
    }

    if (!metadata.offerings.default) {
      console.log(`top level metadata key "offerings" does not contain a "default" offering`);
    }

    metadata.offerings.default.image_watermark = watermarkJson;
    console.log("");

    console.log("Writing metadata back to object.");
    const {write_token} = await client.EditContentObject({
      libraryId: mezLibId,
      objectId: mezObjectId
    });



    response = await client.ReplaceMetadata({
      metadata: metadata,
      libraryId: mezLibId,
      objectId: mezObjectId,
      writeToken: write_token
    });

    console.log("Finalizing object");
    response = await client.FinalizeContentObject({
      libraryId: mezLibId,
      objectId: mezObjectId,
      writeToken: write_token
    });

    console.log("");
    console.log("Done with AddMezImageWatermark call.");
    console.log("");
  } catch (err) {
    console.error(err)
  }
};

const mezLibId = process.argv[2];
const mezObjectId = process.argv[3];
const watermarkJsonPath = process.argv[4];

if (!mezLibId || !mezObjectId || !watermarkJsonPath) {
  console.error(`
Usage: node add_mez_image_watermark.js mezLibId mezObjectId pathToWatermarkJsonFile
  
  Sample WatermarkJsonFile contents:
 
    {
      "align_h": "bottom",
      "align_v": "right",
      "image": "./logo.png",
      "margin_h": "1/20",
      "margin_v": "1/10",
      "target_video_height": 1080
    }
`);
  return;
}

const privateKey = process.env.PRIVATE_KEY;
if (!privateKey) {
  console.error(`
PRIVATE_KEY environment variable must be specified
`);
  return;
}

const configUrl = process.env.FABRIC_CONFIG_URL;
if (!configUrl) {
  console.error(`
FABRIC_CONFIG_URL environment variable must be specified, e.g. for test fabric, export FABRIC_CONFIG_URL=https://main.net955210.contentfabric.io/config
`);
  return;
}

const watermarkJson = JSON.parse(fs.readFileSync(watermarkJsonPath));


AddMezImageWatermark(
  mezLibId,
  mezObjectId,
  watermarkJson,
  watermarkJsonPath
);
