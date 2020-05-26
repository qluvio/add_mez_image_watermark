# add_mez_image_watermark

Add an image overlay watermark to an existing ABR Mezzanine content object

For best results, use an image in PNG format with a transparent background.

Before running, set env vars PRIVATE_KEY and FABRIC_CONFIG_URL

(substitute appropriate PRIVATE_KEY and FABRIC_CONFIG_URL below)

For now, the image must be uploaded to the fabric separately in preparation. Once you have uploaded the image to the fabric, get the hash of the object substitute it and the image filename in the "image" property of the sample_image_watermark.json file.

```
npm install

export PRIVATE_KEY=0x0000000000000000000000000000000000000000000000000000000000000000
export FABRIC_CONFIG_URL="https://main.net955210.contentfabric.io/config" # (test network)

node add_mez_image_watermark.js mezLibId mezObjectId pathToWatermarkJsonFile
```

Example contents for WatermarkJsonFile:

```
{
  "align_h": "bottom",
  "align_v": "right",
  "image": "/qfab/hq__C8vZUxtSdiW1zBKQWbUZVL6ZK3qctmiMVQ2XsQDfP3jqwQ2upKGPcg3DBd5dheMbepBrTDTLWi/files/watermark.png",
  "margin_h": "1/20",
  "margin_v": "1/10",
  "target_video_height": 1080
}
```
The **image** property is a fabric link to the watermark file.