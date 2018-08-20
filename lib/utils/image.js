"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = resizeAndCropImage;

var _polyfill = require("./polyfill");

var _polyfill2 = _interopRequireDefault(_polyfill);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Modified from https://stackoverflow.com/a/32490603, cc by-sa 3.0
// -2 = not jpeg, -1 = no data, 1..8 = orientations
function getExifOrientation(file) {
  return new Promise(function (resolve, reject) {
    // Suggestion from http://code.flickr.net/2012/06/01/parsing-exif-client-side-using-javascript-2/:
    if (file.slice) {
      file = file.slice(0, 131072);
    } else if (file.webkitSlice) {
      file = file.webkitSlice(0, 131072);
    }

    var reader = new FileReader();
    reader.onload = function (e) {
      var view = new DataView(e.target.result);
      if (view.getUint16(0, false) != 0xffd8) {
        return resolve(-2);
      }
      var length = view.byteLength;
      var offset = 2;
      while (offset < length) {
        var marker = view.getUint16(offset, false);
        offset += 2;
        if (marker == 0xffe1) {
          if (view.getUint32(offset += 2, false) != 0x45786966) {
            return resolve(-1);
          }
          var little = view.getUint16(offset += 6, false) == 0x4949;
          offset += view.getUint32(offset + 4, little);
          var tags = view.getUint16(offset, little);
          offset += 2;
          for (var i = 0; i < tags; i++) {
            if (view.getUint16(offset + i * 12, little) == 0x0112) {
              return resolve(view.getUint16(offset + i * 12 + 8, little));
            }
          }
        } else if ((marker & 0xff00) != 0xff00) break;else offset += view.getUint16(offset, false);
      }
      return resolve(-1);
    };
    reader.readAsArrayBuffer(file);
  });
}

// Derived from https://stackoverflow.com/a/40867559, cc by-sa

function imgToCanvasWithOrientation(image, rawWidth, rawHeight, orientation) {
  var canvas = document.createElement("canvas");
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

  var ctx = canvas.getContext("2d");
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

function resizeAndCropImage(file, w, h, quality) {
  if (!HTMLCanvasElement.prototype.toBlob) {
    (0, _polyfill2.default)();
  }
  return new Promise(function (resolve, reject) {
    quality = quality || 1;
    // Create file reader
    var reader = new FileReader();
    reader.onload = function (readerEvent) {
      // Create image object
      var image = new Image();
      image.onload = function (imageEvent) {
        getExifOrientation(file).then(function (orientation) {
          alert("orientation " + orientation);
          var maxWidth = void 0;
          var maxHeight = void 0;
          // Calculate height based on provided width
          if (w && !h) {
            maxWidth = Math.min(w, image.width);
            maxHeight = image.height / (image.width / maxWidth);
            // Calculate width based on provided height
          } else if (h && !w) {
            maxHeight = Math.min(h, image.height);
            maxWidth = image.width / (image.height / maxHeight);
            // Otherwise use provided width and height or the image width and height (whichever is smaller)
          } else {
            maxWidth = Math.min(w, image.width);
            maxHeight = Math.min(h, image.height);
          }

          // maxWidth = maxWidth || image.width;
          // maxHeight = maxHeight || image.height;

          alert("maxWidth " + maxWidth);
          alert("maxHeight " + maxHeight);

          var width = image.width;
          var height = image.height;
          var scale = orientation > 4 ? Math.min(maxHeight / width, maxWidth / height, 1) : Math.min(maxWidth / width, maxHeight / height, 1);
          alert("scale " + scale);
          height = Math.round(height * scale);
          width = Math.round(width * scale);
          alert("width " + width);
          alert("height " + height);

          var canvas = imgToCanvasWithOrientation(image, width, height, orientation);
          canvas.toBlob(function (blob) {
            alert("blob " + blob);
            console.log("Resized image to " + w + "x" + h + ", " + (blob.size >> 10) + "kB");
            resolve(blob);
          }, "image/jpeg", quality);
        });

        // const canvas = document.createElement("canvas");
        // let maxWidth;
        // let maxHeight;

        // // Create canvas or use provided canvas
        // canvas.width = maxWidth;
        // canvas.height = maxHeight;
        // // Calculate scaling
        // const horizontalScale = maxWidth / image.width;
        // const verticalScale = maxHeight / image.height;
        // const scale = Math.max(horizontalScale, verticalScale);
        // // Calculate cropping
        // const [width, height] = [scale * image.width, scale * image.height];
        // const verticalOffset = Math.min((maxHeight - height) / 2, 0);
        // const horizontalOffset = Math.min((maxWidth - width) / 2, 0);
        // // Obtain the context for a 2d drawing
        // const context = canvas.getContext("2d");
        // if (!context) {
        //   return reject("Could not get the context of the canvas element");
        // }
        // // Draw the resized and cropped image
        // context.drawImage(
        //   image,
        //   horizontalOffset,
        //   verticalOffset,
        //   width,
        //   height
        // );
        // canvas.toBlob(blob => {
        //   resolve(blob);
        // }, file.type);
      };
      image.src = readerEvent.target.result;
    };
    reader.readAsDataURL(file);
  });
}