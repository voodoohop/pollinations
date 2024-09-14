import { useState, useEffect, useRef } from 'react';
import { useFeedLoader } from './useFeedLoader';
import { useImageEditor, useImageSlideshow } from './useImageSlideshow';
import { GenerativeImageURLContainer, ImageURLHeading } from '../styles';
import { ServerLoadAndGenerationInfo } from './ServerLoadAndGenerationInfo';
import { ImageEditor } from './ImageEditor';
import { ImageDisplay } from './ImageDisplay';
import { CodeExamples } from '../CodeExamples';

export function GenerativeImageFeed() {
  const [lastImage, setLastImage] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [imageParams, setImageParams] = useState({});
  const imageParamsRef = useRef(imageParams);
  const { image: slideshowImage, onNewImage, stop } = useImageSlideshow();
  const { updateImage, image, isLoading } = useImageEditor({ stop, image: slideshowImage });
  const { imagesGenerated } = useFeedLoader(onNewImage, setLastImage);
  const [isInputChanged, setIsInputChanged] = useState(false);

  useEffect(() => {
    setImageParams(image);
  }, [image]);

  useEffect(() => {
    stop(tabValue === 1);
  }, [tabValue]);

  useEffect(() => {
    imageParamsRef.current = imageParams;
  }, [imageParams]);

  useEffect(() => {
    setIsInputChanged(false);
  }, [image.imageURL]);

  const handleParamChange = (param, value) => {
    setIsInputChanged(true);
    setImageParams(prevParams => ({
      ...prevParams,
      [param]: value,
    }));
  };

  const handleSubmit = () => {
    const currentImageParams = imageParamsRef.current;
    const imageURL = getImageURL(currentImageParams);
    console.log("Submitting with imageParams:", currentImageParams);
    updateImage({
      ...currentImageParams,
      imageURL
    });
  };

  const handleButtonClick = () => {
    if (!isInputChanged) {
      setImageParams(prevParams => ({
        ...prevParams,
        seed: (prevParams.seed || 0) + 1,
      }));
    }
    setTimeout(handleSubmit, 250);
  };

  const handleFocus = () => {
    setTabValue(1);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(image["imageURL"]);
  };

  return (
    <GenerativeImageURLContainer className="p-4">
      <h2 className="text-2xl font-semibold text-lime mb-4">Image Feed</h2>
      {!image["imageURL"] ? (
        <LoadingIndicator />
      ) : (
        <div className="flex flex-col space-y-4">
          <div>
            <ServerLoadAndGenerationInfo {...{ lastImage, imagesGenerated, image }} />
            <ImageDisplay image={image} handleCopyLink={handleCopyLink} />
          </div>
          <div>
            <TabSelector tabValue={tabValue} setTabValue={setTabValue} />
            {tabValue === 0 && (
              <div>
                {/* This tab is intentionally left empty */}
              </div>
            )}
            {tabValue === 1 && (
              <ImageEditor
                image={imageParams}
                handleParamChange={handleParamChange}
                handleFocus={handleFocus}
                isLoading={isLoading}
                handleSubmit={handleSubmit}
                setIsInputChanged={setIsInputChanged}
              />
            )}
            {tabValue === 2 && <CodeExamples {...image} />}
          </div>
          <div className="flex justify-center">
            <ImagineButton handleButtonClick={handleButtonClick} isLoading={isLoading} isInputChanged={isInputChanged} />
            {isLoading && <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-lime"></div>}
          </div>
        </div>
      )}
    </GenerativeImageURLContainer>
  );
}

function ImagineButton({ handleButtonClick, isLoading, isInputChanged }) {
  return (
    <button
      className={`bg-lime text-offblack px-4 py-2 rounded-md font-semibold ${isLoading ? 'hidden' : ''}`}
      onClick={handleButtonClick}
      disabled={isLoading}
    >
      {isInputChanged ? 'Imagine' : 'Re-Imagine'}
    </button>
  );
}

function getImageURL(newImage) {
  let imageURL = `https://pollinations.ai/p/${encodeURIComponent(newImage.prompt)}`;
  let queryParams = [];
  if (newImage.width && newImage.width !== 1024 && newImage.width !== "1024") queryParams.push(`width=${newImage.width}`);
  if (newImage.height && newImage.height !== 1024 && newImage.height !== "1024") queryParams.push(`height=${newImage.height}`);
  if (newImage.seed && newImage.seed !== 42 && newImage.seed !== "42") queryParams.push(`seed=${newImage.seed}`);
  if (newImage.nofeed) queryParams.push(`nofeed=${newImage.nofeed}`);
  if (newImage.nologo) queryParams.push(`nologo=${newImage.nologo}`);
  if (newImage.model && newImage.model !== "turbo") queryParams.push(`model=${newImage.model}`);
  if (queryParams.length > 0) {
    imageURL += '?' + queryParams.join('&');
  }

  return imageURL;
}

function LoadingIndicator() {
  return (
    <div className="flex justify-center items-center h-40">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-offwhite"></div>
    </div>
  );
}

function TabSelector({ tabValue, setTabValue }) {
  const tabs = ['Feed', 'Edit', 'Integrate'];

  return (
    <div className="flex justify-center">
      {tabs.map((label, index) => (
        <button
          key={label}
          className={`px-4 py-2 rounded-md font-semibold ${tabValue === index ? 'bg-lime text-offblack' : 'text-offwhite'}`}
          onClick={() => setTabValue(index)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}