// utils/cropImage.js
export default function getCroppedImg(imageSrc, pixelCrop, format = "image/jpeg") {
    const canvas = document.createElement("canvas");
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;
    const ctx = canvas.getContext("2d");

    const image = new Image();
    image.src = imageSrc;

    return new Promise((resolve) => {
        image.onload = () => {
            ctx.drawImage(
                image,
                pixelCrop.x,
                pixelCrop.y,
                pixelCrop.width,
                pixelCrop.height,
                0,
                0,
                pixelCrop.width,
                pixelCrop.height
            );
            canvas.toBlob((blob) => {
                const extension = format === "image/png" ? "png" : "jpg";
                const file = new File([blob], `cropped.${extension}`, { type: format });
                resolve(file);
            }, format);
        };
    });
}