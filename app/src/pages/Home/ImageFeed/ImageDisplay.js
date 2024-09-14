import React from "react";
import { ModelInfo } from "./ModelInfo"; // Ensure correct import

export function ImageDisplay({ image, handleCopyLink }) {
  return (
    <div className="flex flex-col items-center relative">
      {image ? (
        <>
          <a href={image["imageURL"]} target="_blank" rel="noopener noreferrer">
            <div className="relative max-w-lg">
              <img src={image["imageURL"]} alt="generative_image" className="w-full h-auto" />
              <button
                onClick={handleCopyLink}
                className="absolute top-0 right-0 text-lime"
                title="Copy link"
              >
                <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h8m-4-4v8m-4-4h8m-4-4v8" />
                </svg>
              </button>
            </div>
          </a>
          <div className="flex items-center">
            <ModelInfo
              model={image["model"]}
              wasPimped={image["wasPimped"]}
              referrer={image["referrer"]}
            />
          </div>
        </>
      ) : (
        <p className="text-gray-500">Loading image...</p>
      )}
    </div>
  );
}
