import React from 'react';

export const ImageStyle = ({ src, alt }) => (
  <img src={src} alt={alt} className="w-full h-auto max-w-lg max-h-lg" />
);

export const GenerativeImageURLContainer = ({ children }) => (
  <div className="text-offwhite bg-transparent m-0 p-0 max-w-3xl rounded-none w-11/12">
    {children}
  </div>
);

export const ImageURLHeading = ({ children, whiteText = true, width = 500, height = 150, customPrompt }) => {
  const foregroundColor = whiteText ? "white" : "black";
  const backgroundColor = whiteText ? "black" : "white";
  const defaultPrompt = `an image with the text "${children}" displayed in an elegant, decorative serif font. The font has high contrast between thick and thin strokes, that give the text a sophisticated and stylized appearance. The text is in ${foregroundColor}, set against a solid ${backgroundColor} background, creating a striking and bold visual contrast. Incorporate elements related to pollinations, digital circuitry, such as flowers, chips, insects, wafers, and other organic forms into the design of the font. Each letter features unique, creative touches that make the typography stand out. Incorporate elements related to pollinations, digital circuitry, and organic forms into the design of the font.`;
  const prompt = encodeURIComponent(customPrompt || defaultPrompt);
  const seed = Math.floor(Math.random() * 10);
  const imageUrl = `https://image.pollinations.ai/prompt/${prompt}?width=${width}&height=${height}&nologo=true&seed=${seed}`;

  return (
    <div className="text-center my-2">
      <img src={imageUrl} alt={children} className="w-full max-w-lg h-auto" />
    </div>
  );
};

export const ImageContainer = ({ children }) => (
  <div className="m-0 flex">
    {children}
  </div>
);

export const URLExplanation = ({ children }) => (
  <div className="m-0 text-sm">
    {children}
  </div>
);
