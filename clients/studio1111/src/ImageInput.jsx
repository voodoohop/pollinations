import { useEffect, useState } from 'react';
import ImageDropZone from './ImageDropZone';
import { extractPrompt, getPrediction } from './replicate';

export const DEACTIVATED_STRING = "processing reference image...";

export function ImageInput({setReferencePrompt, onImageChange, defaultImage}) {
  const [status, setStatus] = useState({ status: null });
  // const [isContentVisible, setContentVisible] = useState(false);
  const [image, setImage] = useState(null);

  const processImage = async () => {
    setReferencePrompt(DEACTIVATED_STRING);
    const predictionId = await extractPrompt(image);
    const promptData = await getPrediction(predictionId, setStatus);
    console.log("got prompt data", promptData);
    setReferencePrompt(promptData?.output);
  };

  useEffect(() => {
    if (defaultImage) {
      setImage(defaultImage);
    }
  }, [defaultImage]);

  return <>
        <ImageDropZone onImageChange={(img) => {
           setImage(img);
           onImageChange(img);
        }} 
        uploadInstructions="Reference image (optional)" 
        defaultImage={defaultImage}
        />
        <button disabled={image === null} onClick={() => processImage(defaultImage)}>Extract prompt from reference</button>
        { status.status && <p><i>{status.status}</i> image analysis...</p>}
      </>;
}
