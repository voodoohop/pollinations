import { useState } from 'react';
import { Image } from './Image';

export function ImageViewer({ images }) {
  const [showFrames, setShowFrames] = useState(false);

  const videos = images.filter((image) => image.endsWith(".gif") || image.endsWith(".mp4"));
  const frames = images.filter((image) => !image.endsWith(".gif") && !image.endsWith(".mp4"));

  const handleToggle = () => {
    setShowFrames(!showFrames);
  };

  return (
    <div>
      {/* copy link to share */}
      <button onClick={() => navigator.clipboard.writeText(window.location.href)} style={{
        position: "fixed",
        top: "0",
        right: "0",
        margin: "10px",
        padding: "10px",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
      }}>Copy link</button>

      {videos.reverse().map((image) => <Image src={image} style={{display:"block"}}/>)}
      {frames.length > 0 && <button onClick={handleToggle}>
        {showFrames ? 'Hide' : 'Show'} frames
      </button> }
      {showFrames && frames.reverse().map((image) => <Image src={image} style={{display:"block"}} />)}

    </div>
  );
}

