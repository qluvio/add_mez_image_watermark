# add_mez_image_watermark

Add an image overlay watermark to an existing ABR Mezzanine content object

For best results, use an image in PNG format with a transparent background.

Before running, set env vars PRIVATE_KEY and FABRIC_CONFIG_URL

(substitute appropriate PRIVATE_KEY and FABRIC_CONFIG_URL below)


```
npm install

export PRIVATE_KEY=0x0000000000000000000000000000000000000000000000000000000000000000
export FABRIC_CONFIG_URL="https://main.net955210.contentfabric.io/config" # (for Eluvio test network)

node add_mez_image_watermark.js mezLibId mezObjectId pathToWatermarkJsonFile
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