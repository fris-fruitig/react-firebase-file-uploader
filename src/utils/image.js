// @flow
import addToBlobPolyfill from './polyfill';

export default function resizeAndCropImage(file: File, w?: number, h?: number): Promise<Blob> {
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
        // Create canvas or use provided canvas
        const canvas = document.createElement('canvas');
        const maxWidth = w || image.width;
        const maxHeight = h || image.height;
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
        const context = canvas.getContext('2d');
        if (!context) {
          return reject('Could not get the context of the canvas element');
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
