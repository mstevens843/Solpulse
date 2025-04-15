import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import PropTypes from "prop-types";
import getCroppedImg from "@/utils/cropImage";
import "@/css/components/Profile_components/ProfilePicCropModal.css";


function ProfilePicCropModal({ image, onClose, onCropComplete }) {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

    const handleCropComplete = useCallback((_, areaPixels) => {
        setCroppedAreaPixels(areaPixels);
    }, []);

    const handleDone = async () => {
        // Pass preferred format here: "image/jpeg" or "image/png"
        const croppedImage = await getCroppedImg(image, croppedAreaPixels, "image/jpeg");
        onCropComplete(croppedImage);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content profile-pic-crop-modal" onClick={(e) => e.stopPropagation()}>
                <div className="crop-container">
                <Cropper
                    image={image}
                    crop={crop}
                    zoom={zoom}
                    aspect={1}
                    minZoom={0.4}
                    maxZoom={3}
                    zoomSpeed={0.1}
                    restrictPosition={false}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={handleCropComplete}
                />
                </div>
                <div className="controls">
                    <input
                        type="range"
                        min={1}
                        max={3}
                        step={0.1}
                        value={zoom}
                        onChange={(e) => setZoom(e.target.value)}
                    />
                    <button onClick={handleDone}>✅ Done</button>
                    <button onClick={onClose}>❌ Cancel</button>
                </div>
            </div>
        </div>
    );
}

ProfilePicCropModal.propTypes = {
    image: PropTypes.string.isRequired,
    onClose: PropTypes.func.isRequired,
    onCropComplete: PropTypes.func.isRequired,
};

export default ProfilePicCropModal;
