'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = resizeAndCropImage;

var _polyfill = require('./polyfill');

var _polyfill2 = _interopRequireDefault(_polyfill);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function resizeAndCropImage(file, w, h) {
  if (!HTMLCanvasElement.prototype.toBlob) {
    (0, _polyfill2.default)();
  }
  return new Promise(function (resolve, reject) {
    // Create file reader
    var reader = new FileReader();
    reader.onload = function (readerEvent) {
      // Create image object
      var image = new Image();
      image.onload = function (imageEvent) {
        // Create canvas or use provided canvas
        var canvas = document.createElement('canvas');
        var maxWidth = w || image.width;
        var maxHeight = h || image.height;
        canvas.width = maxWidth;
        canvas.height = maxHeight;
        // Calculate scaling
        var horizontalScale = maxWidth / image.width;
        var verticalScale = maxHeight / image.height;
        var scale = Math.max(horizontalScale, verticalScale);
        // Calculate cropping
        var width = scale * image.width,
            height = scale * image.height;

        var verticalOffset = Math.min((maxHeight - height) / 2, 0);
        var horizontalOffset = Math.min((maxWidth - width) / 2, 0);
        // Obtain the context for a 2d drawing
        var context = canvas.getContext('2d');
        if (!context) {
          return reject('Could not get the context of the canvas element');
        }
        // Draw the resized and cropped image
        context.drawImage(image, horizontalOffset, verticalOffset, width, height);
        canvas.toBlob(function (blob) {
          resolve(blob);
        }, file.type);
      };
      image.src = readerEvent.target.result;
    };
    reader.readAsDataURL(file);
  });
}