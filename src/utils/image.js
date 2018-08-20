// @flow
import addToBlobPolyfill from "./polyfill";

// const determineAspectRatio

export default function resizeAndCropImage(
  file: File,
  w?: number,
  h?: number
): Promise<Blob> {
  if (!HTMLCanvasElement.prototype.toBlob) {
    addToBlobPolyfill();
  }
  return new Promise((resolve, reject) => {
    // Create file reader
    const reader = new FileReader();
    reader.onload = readerEvent => {
      // Create image object
      const image = new Image();
      image.onload = imageEvent => {
        const canvas = document.createElement("canvas");
        let maxWidth;
        let maxHeight;
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
        // Create canvas or use provided canvas
        canvas.width = maxWidth;
        canvas.height = maxHeight;
        // Calculate scaling
        const horizontalScale = maxWidth / image.width;
        const verticalScale = maxHeight / image.height;
        const scale = Math.max(horizontalScale, verticalScale);
        // Calculate cropping
        const [width, height] = [scale * image.width, scale * image.height];
        const verticalOffset = Math.min((maxHeight - height) / 2, 0);
        const horizontalOffset = Math.min((maxWidth - width) / 2, 0);
        // Obtain the context for a 2d drawing
        const context = canvas.getContext("2d");
        if (!context) {
          return reject("Could not get the context of the canvas element");
        }
        // Draw the resized and cropped image
        context.drawImage(
          image,
          horizontalOffset,
          verticalOffset,
          width,
          height
        );
        canvas.toBlob(blob => {
          resolve(blob);
        }, file.type);
      };
      image.src = readerEvent.target.result;
    };
    reader.readAsDataURL(file);
  });
}
