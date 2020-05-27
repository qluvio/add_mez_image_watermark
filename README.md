# add_mez_image_watermark

Add an image overlay watermark to an existing ABR Mezzanine content object, optionally creating a new offering based on an existing one.

For best results, use an image in PNG format with a transparent background.

Before running, set env var PRIVATE_KEY

(substitute appropriate PRIVATE_KEY below)


```
npm install

export PRIVATE_KEY=0x0000000000000000000000000000000000000000000000000000000000000000

node add_mez_image_watermark.js --libraryId mezLibId --objectId mezObjectId --watermarkSpec pathToWatermarkJsonFile --configUrl fabricConfigUrl
```

```
Options:
  --help           Show help                                           [boolean]
  --libraryId      Library ID of the mezzanine                        [required]
  --objectId       Object ID of the mezzanine                         [required]
  --watermarkSpec  path pointing to json file with image watermark details
                                                             [string] [required]
  --configUrl      URL pointing to the Fabric configuration. i.e.
                   https://main.net955210.contentfabric.io/config (for 'test'
                   network)                                  [string] [required]
  --offeringKey    Offering key to add watermark to (if key does not exist, it
                   will be created, using either 'default' offering as template,
                   or offering identified by --copy-offering option)
                                                   [string] [default: "default"]
  --copyOffering   Specify an existing offering to copy metadata metadata from
                                                                        [string]
  --debug          Print out client debug log messages[boolean] [default: false]

Usage: PRIVATE_KEY=<private-key> node add_mez_image_watermark.js --libraryId <mezzanine-library-id> --objectId <mezzanine-object-id> --watermarkSpec <path to WatermarkJsonFile> --configUrl "<fabric-config-url>" (--offeringKey <new-or-existing-key>) (--copyOffering <existing-key>)  (--debug)

```

---
**Example contents for WatermarkJsonFile** (uploading local image file to mezzanine - file should be in same directory as the watermark json file):

```
{
  "align_h": "right",
  "align_v": "bottom",
  "image": "./logo.png",
  "margin_h": "1/20",
  "margin_v": "1/10",
  "target_video_height": 1080
}
```

---

**Example contents for WatermarkJsonFile** (using an image that has already been uploaded to fabric):




```
{
  "align_h": "right",
  "align_v": "bottom",
  "image": "/qfab/hq__C8vZUxtSdiW1zBKQWbUZVL6ZK3qctmiMVQ2XsQDfP3jqwQ2upKGPcg3DBd5dheMbepBrTDTLWi/files/watermark.png",
  "margin_h": "1/20",
  "margin_v": "1/10",
  "target_video_height": 1080
}
```
The **image** property in this case would refer to the hash of the object containing the image file.