/**
 * This component:
 * - Accepts a `src`, `alt`, optional `className`, and `fallback` image path.
 * - Displays the `fallback` image (e.g. `/default-coin.png`) if the original `src` fails to load.
 * - Prevents infinite `onError` loops by removing the event listener after triggering once.
 *
 * Use this to standardize image fallback behavior across the app (coins, NFTs, avatars, etc).
 */

import React from "react";

const FallbackImage = ({
  src,
  alt,
  className = "",
  fallback = "/default-coin.png",
}) => (
  <img
    src={src || fallback}
    alt={alt || "Image"}
    className={className}
    onError={(e) => {
      e.target.onerror = null; // Prevents infinite loop if fallback image also fails
      e.target.src = fallback; //  Swaps to fallback image on error
    }}
  />
);

export default FallbackImage;
