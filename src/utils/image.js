// @flow
import addToBlobPolyfill from "./polyfill";

// Modified from https://stackoverflow.com/a/32490603, cc by-sa 3.0
// -2 = not jpeg, -1 = no data, 1..8 = orientations
function getExifOrientation(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    // Suggestion from http://code.flickr.net/2012/06/01/parsing-exif-client-side-using-javascript-2/:
    if (file.slice) {
      file = file.slice(0, 131072);
    } else if (file.webkitSlice) {
      file = file.webkitSlice(0, 131072);
    }

    const reader = new FileReader();
    reader.onload = function(e) {
      const view = new DataView(e.target.result);
      if (view.getUint16(0, false) != 0xffd8) {
        return resolve(-2);
      }
      const length = view.byteLength;
      let offset = 2;
      while (offset < length) {
        let marker = view.getUint16(offset, false);
        offset += 2;
        if (marker == 0xffe1) {
          if (view.getUint32((offset += 2), false) != 0x45786966) {
            return resolve(-1);
          }
          const little = view.getUint16((offset += 6), false) == 0x4949;
          offset += view.getUint32(offset + 4, little);
          const tags = view.getUint16(offset, little);
          offset += 2;
          for (let i = 0; i < tags; i++)
            if (view.getUint16(offset + i * 12, little) == 0x0112) {
              return resolve(view.getUint16(offset + i * 12 + 8, little));
            }
        } else if ((marker & 0xff00) != 0xff00) break;
        else offset += view.getUint16(offset, false);
      }
      return resolve(-1);
    };
    reader.readAsArrayBuffer(file);
  });
}

// Derived from https://stackoverflow.com/a/40867559, cc by-sa
function imgToCanvasWithOrientation(
  image: Image,
  rawWidth: number,
  rawHeight: number,
  orientation: number
) {
  const canvas = document.createElement("canvas");
  if (orientation > 4) {
    canvas.width = rawHeight;
    canvas.height = rawWidth;
  } else {
    canvas.width = rawWidth;
    canvas.height = rawHeight;
  }

  if (orientation > 1) {
    console.log("EXIF orientation = " + orientation + ", rotating picture");
  }

  const ctx = canvas.getContext("2d");
  switch (orientation) {
    case 2:
      ctx.transform(-1, 0, 0, 1, rawWidth, 0);
      break;
    case 3:
      ctx.transform(-1, 0, 0, -1, rawWidth, rawHeight);
      break;
    case 4:
      ctx.transform(1, 0, 0, -1, 0, rawHeight);
      break;
    case 5:
      ctx.transform(0, 1, 1, 0, 0, 0);
      break;
    case 6:
      ctx.transform(0, 1, -1, 0, rawHeight, 0);
      break;
    case 7:
      ctx.transform(0, -1, -1, 0, rawHeight, rawWidth);
      break;
    case 8:
      ctx.transform(0, -1, 1, 0, 0, rawWidth);
      break;
  }
  ctx.drawImage(image, 0, 0, rawWidth, rawHeight);
  return canvas;
}

export default function resizeAndCropImage(
  file: File,
  maxWidth?: number,
  maxHeight?: number,
  quality?: number
): Promise<Blob> {
  if (!HTMLCanvasElement.prototype.toBlob) {
    addToBlobPolyfill();
  }
  return new Promise((resolve, reject) => {
    quality = quality ? Math.min(quality, 1) : 1;

    // Create file reader
    const reader = new FileReader();
    reader.onload = readerEvent => {
      // Create image object
      const image = new Image();
      image.onload = imageEvent => {
        getExifOrientation(file).then(orientation => {
          let width;
          let height;
          if (maxWidth && !maxHeight) {
            // Calculate height based on maximum width
            width = Math.min(maxWidth, image.width);
            height = image.height / (image.width / width);
          } else if (maxHeight && !maxWidth) {
            // Calculate width based on maximum height
            height = Math.min(maxHeight, image.height);
            width = image.width / (image.height / height);
          } else {
            // Otherwise use provided maximum values or the image dimensions (whichever is smaller)
            width = Math.min(maxWidth, image.width);
            height = Math.min(maxHeight, image.height);
          }
          const canvas = imgToCanvasWithOrientation(
            image,
            width,
            height,
            orientation
          );
          canvas.toBlob(resolve, file.type, quality);
        });
      };
      image.src = readerEvent.target.result;
    };
    reader.readAsDataURL(file);
  });
}
