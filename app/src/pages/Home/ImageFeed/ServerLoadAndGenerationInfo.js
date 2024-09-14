import React from 'react';

export function ServerLoadAndGenerationInfo({ lastImage, imagesGenerated, image }) {
  return (
    <div className="flex justify-between items-center max-w-lg mx-auto">
      <ServerLoadDisplay concurrentRequests={lastImage?.concurrentRequests || 0} />
      <span className="text-lime">#: <b>{formatImagesGenerated(imagesGenerated)}</b></span>
      <TimingInfo image={lastImage} />
    </div>
  );
}

function ServerLoadDisplay({ concurrentRequests }) {
  const max = 5;
  const load = Math.min(max, Math.round(concurrentRequests / 4));
  const loadDisplay = "▁▃▅▇▉".slice(1, load + 2);

  return <span>Load: <b className="text-lime">{loadDisplay}</b> <i>({concurrentRequests})</i></span>;
}

const formatImagesGenerated = (num) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

function TimingInfo({ image }) {
  const timeMs = image?.generationTime || image?.timingInfo?.[5]?.timestamp;
  return <span>Generation time:<span className="text-lime"><b> {Math.round(timeMs / 100) / 10} s</b></span></span>;
}
