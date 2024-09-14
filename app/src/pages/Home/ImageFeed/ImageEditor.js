// ImageEditor.js
import React from 'react';

export function ImageEditor({
  image,
  handleParamChange,
  handleFocus,
  isLoading,
  setIsInputChanged,
}) {
  const { width, height, seed, nofeed, nologo, model, prompt } = image;

  const handleInputChange = (param, value) => {
    setIsInputChanged(true);
    handleParamChange(param, value);
  };

  if (!image.imageURL) {
    return (
      <p className="text-gray-500 text-center">Loading...</p>
    );
  }

  return (
    <div className="bg-transparent mt-0">
      <div className="grid grid-cols-1 gap-4">
        {/* Prompt */}
        <div>
          <label className="block text-sm text-gray-400">Prompt</label>
          <textarea
            className="w-full p-2 bg-transparent text-white text-lg"
            value={prompt}
            onChange={(e) => handleInputChange("prompt", e.target.value)}
            onFocus={handleFocus}
            disabled={isLoading}
            rows={3}
          />
        </div>

        {/* Model, Width, Height */}
        <div className="grid grid-cols-3 gap-4">
          {/* Model */}
          <div>
            <label className="block text-sm text-gray-400">Model</label>
            <select
              className="w-full p-2 bg-transparent border border-gray-500 rounded text-white"
              value={model || "flux"}
              onChange={(e) => handleInputChange("model", e.target.value)}
              onFocus={handleFocus}
              disabled={isLoading}
            >
              <option value="turbo">Turbo</option>
              <option value="flux">Flux</option>
              <option value="flux-realism">Flux-Realism</option>
              <option value="flux-anime">Flux-Anime</option>
              <option value="flux-3d">Flux-3D</option>
            </select>
          </div>

          {/* Width */}
          <div>
            <label className="block text-sm text-gray-400">Width</label>
            <input
              type="number"
              className="w-full p-2 bg-transparent border border-gray-500 rounded text-white"
              value={width}
              onChange={(e) => handleInputChange("width", parseInt(e.target.value))}
              onFocus={handleFocus}
              disabled={isLoading}
            />
          </div>

          {/* Height */}
          <div>
            <label className="block text-sm text-gray-400">Height</label>
            <input
              type="number"
              className="w-full p-2 bg-transparent border border-gray-500 rounded text-white"
              value={height}
              onChange={(e) => handleInputChange("height", parseInt(e.target.value))}
              onFocus={handleFocus}
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Seed, Private, No Logo */}
        <div className="grid grid-cols-3 gap-4">
          {/* Seed */}
          <div>
            <label className="block text-sm text-gray-400">Seed</label>
            <input
              type="number"
              className="w-full p-2 bg-transparent border border-gray-500 rounded text-white"
              value={seed}
              onChange={(e) => handleInputChange("seed", parseInt(e.target.value))}
              onFocus={handleFocus}
              disabled={isLoading}
            />
          </div>

          {/* Private */}
          <div className="flex items-center">
            <input
              type="checkbox"
              className="mr-2"
              checked={nofeed}
              onChange={(e) => handleInputChange("nofeed", e.target.checked)}
              onFocus={handleFocus}
              disabled={isLoading}
            />
            <label className="text-sm text-gray-400">Private</label>
            <span className="ml-2 text-gray-400" title="Activating 'private' prevents images from appearing in the feed.">ℹ️</span>
          </div>

          {/* No Logo */}
          <div className="flex items-center">
            <input
              type="checkbox"
              className="mr-2"
              checked={nologo}
              onChange={(e) => handleInputChange("nologo", e.target.checked)}
              onFocus={handleFocus}
              disabled={isLoading}
            />
            <label className="text-sm text-gray-400">No Logo</label>
            <span className="ml-2 text-gray-400" title="Hide the pollinations.ai logo. Get the password in Pollinations' Discord community.">ℹ️</span>
          </div>
        </div>
      </div>
    </div>
  );
}
