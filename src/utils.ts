export const getBase64StringFromDataUrl = (dataUrl = "") =>
  dataUrl.replace("data:", "").replace(/^.+,/, "");

export function dataURLtoFile(dataurl: string, filename: string) {
  const arr = dataurl.split(",");
  if (arr.length === 0) return;

  const mime = arr[0].match(/:(.*?);/);
  if (mime && !mime[1]) return;

  const bstr = atob(arr[1]);
  let n = bstr.length;
  let u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new File([u8arr], filename, { type: mime![1] });
}

export const toDataURL = (image: any) => {
  const canvasCreated = document.createElement("canvas");

  // We use naturalWidth and naturalHeight to get the real image size vs the size at which the image is shown on the page
  canvasCreated.width = Number(image.width);
  canvasCreated.height = Number(image.height);

  // We get the 2d drawing context and draw the image in the top left
  canvasCreated?.getContext("2d")?.drawImage(image, 0, 0);

  // Convert canvas to DataURL and log to console
  const dataURL = canvasCreated.toDataURL();
  console.log(dataURL);
  // logs data:image/png;base64,wL2dvYWwgbW9yZ...

  // Convert to Base64 string
  const base64 = getBase64StringFromDataUrl(dataURL);
  console.log(base64);
  // Logs wL2dvYWwgbW9yZ...
};

// Usage example:
// const file = dataURLtoFile(
//   "data:text/plain;base64,aGVsbG8gd29ybGQ=",
//   "hello.txt"
// );
// const file = getBase64StringFromDataUrl(base64);
// console.log(file);
