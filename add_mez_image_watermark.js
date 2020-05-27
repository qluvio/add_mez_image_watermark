const {ElvClient} = require("elv-client-js");
const fs = require("fs");
const path = require("path");

const yargs = require("yargs");
const argv = yargs
  .option("libraryId", {
    description: "Library ID of the mezzanine"
  })
  .option("objectId", {
    description: "Object ID of the mezzanine"
  })
  .option("watermarkSpec", {
    type: "string",
    description: "path pointing to json file with image watermark details"
  })
  .option("configUrl", {
    type: "string",
    description: "URL pointing to the Fabric configuration. i.e. https://main.net955210.contentfabric.io/config (for 'test' network)"
  })
  .option("offeringKey", {
    description: "Offering key to add watermark to (if key does not exist, it will be created, using either 'default' offering as template, or offering identified by --copy-offering option)",
    default: "default",
    type: "string"
  })
  .option("copyOffering", {
    description: "Specify an existing offering to copy metadata metadata from",
    type: "string"
  })
  .option("debug", {
    description: "Print out client debug log messages",
    default: false,
    type: "boolean"
  })
  .version(false)
  .demandOption(
    ["objectId", "libraryId", "watermarkSpec", "configUrl"],
    `
Usage: PRIVATE_KEY=<private-key> node add_mez_image_watermark.js --libraryId <mezzanine-library-id> --objectId <mezzanine-object-id> --watermarkSpec <path to WatermarkJsonFile> --configUrl \"<fabric-config-url>\" (--offeringKey <new-or-existing-key>) (--copyOffering <existing-key>)  (--debug)

  Sample WatermarkJsonFile contents:
 
    {
      "align_h": "right",
      "align_v": "bottom",
      "image": "./logo.png",
      "margin_h": "1/20",
      "margin_v": "1/10",
      "target_video_height": 1080
    }
`
  )
  .argv;


const AddMezImageWatermark = async ({libraryId, objectId, watermarkSpec, configUrl, offeringKey, copyOffering, debug}) => {

  const watermarkJson = JSON.parse(fs.readFileSync(watermarkSpec));

  try {
    const client = await ElvClient.FromConfigurationUrl({configUrl});

    let wallet = client.GenerateWallet();
    let signer = wallet.AddAccount({
      privateKey: process.env.PRIVATE_KEY
    });
    await client.SetSigner({signer});

    client.ToggleLogging(debug);

    // if image path is of form "./filename" then look for it and upload it
    const re = new RegExp("^\\./([^/]+)$");
    const match = re.exec(watermarkJson.image);
    let response;

    if (match !== null) {
      const imageFilename = match[1];
      const dir = path.dirname(watermarkSpec);
      const imagePath = path.join(dir, imageFilename);
      if (fs.existsSync(imagePath)) {
        console.log("File " + imagePath + " found, uploading to object...")

        const {write_token} = await client.EditContentObject({libraryId, objectId});
        const data = client.utils.BufferToArrayBuffer(fs.readFileSync(imagePath));

        const params = {
          libraryId,
          objectId,
          writeToken: write_token,
          fileInfo: [{
            data: data,
            path: path.basename(imagePath),
            type: "file",
            mime_type: "image/*",
            size: data.byteLength
          }]
        }
        response = await client.UploadFiles(params);

        console.log("Finalizing object with uploaded file...");
        response = await client.FinalizeContentObject({
          libraryId,
          objectId,
          writeToken: write_token
        });

        console.log("New hash: " + response.hash);
        watermarkJson.image = "/qfab/" + response.hash + "/files/" + path.basename(imagePath);
      }
    }

    console.log("Retrieving mezzanine metadata...");

    let metadata = await client.ContentObjectMetadata({libraryId, objectId});

    // read from metadata top level key 'offerings'
    if (!metadata.offerings) {
      console.log(`top level metadata key "offerings" not found`);
    }

    const offeringExists = metadata.offerings.hasOwnProperty(offeringKey);

    // if the offering doesn't exist, or if --copyOffering was specified, we will be copying from an existing offering
    const copying = (!offeringExists || copyOffering);

    // if we are copying, and no --copyOffering was specified, try to copy from default offering
    if (copying && !copyOffering) {
      copyOffering = "default"
      console.log("Using default offering as template...")
    }

    let targetOffering = null;

    if (copying) {
      // See if copyOffering exists
      if (!metadata.offerings.hasOwnProperty(copyOffering)) {
        console.log(`top level metadata key "offerings" does not contain an offering with key: "` + copyOffering + `"`);
        return
      }
      targetOffering = Object.assign({}, metadata.offerings[copyOffering]);
    } else {
      if (!offeringExists) {
        console.log(`top level metadata key "offerings" does not contain an offering with key: "` + offeringKey + `"`);
        return
      }
      targetOffering = Object.assign({}, metadata.offerings[offeringKey]);
    }

    targetOffering.image_watermark = watermarkJson;

    metadata.offerings[offeringKey] = targetOffering;

    console.log("Writing metadata back to object...");
    const {write_token} = await client.EditContentObject({libraryId, objectId});

    await client.ReplaceMetadata({
      metadata,
      libraryId,
      objectId,
      writeToken: write_token
    });

    console.log("Finalizing object...");
    await client.FinalizeContentObject({
      libraryId,
      objectId,
      writeToken: write_token
    });

    console.log("");
    console.log("Done with AddMezImageWatermark call.");
    console.log("");
  } catch (err) {
    console.error(err)
  }
};

const privateKey = process.env.PRIVATE_KEY;
if (!privateKey) {
  console.error(`
PRIVATE_KEY environment variable must be specified
`);
  return;
}

AddMezImageWatermark(argv);
