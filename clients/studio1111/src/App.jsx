import { useState, useEffect } from 'react';
import { useDropzone } from "react-dropzone"; // Importing from react-dropzone
import "./App.css";
import { Gallery } from "./Gallery";
import { Creator } from "./Creator";
import { docaLogoStyle } from './galleryStyles';

function App() {
  const predictionId = window.location.pathname.replace("/", ""); // || "olgzarlbefsv46btczdti7rqim";
  const [selectedDoca, setSelectedDoca] = useState(1);

  useEffect(() => {
    setSelectedDoca(Math.floor(Math.random() * 4) + 1);
  }, []);

  // Helper function to switch mode
  const switchMode = () => {
    if (predictionId) {
      // If in create mode (predictionId exists), go to gallery mode
      window.location = `${window.location.origin}/`;
    } else {
      // If in gallery mode (predictionId does not exist), go to create mode with a pre-defined predictionId
      window.location = `${window.location.origin}/sdthzplbal5e3jvsripyy4ctw4`;
    }
  };

  return (
    <>
      <style>
        {`
          body {
            margin: 0;
            padding: 0;
            background: #000;
            min-height: 100vh;
            overflow-x: hidden;
          }
        `}
      </style>
      <img 
        src={`/doca_svgs/doca${selectedDoca}.svg`}
        alt="DOCA Logo"
        style={docaLogoStyle}
      />
      <div>
        <button onClick={switchMode} disabled>
          {predictionId ? "Go to Gallery" : "Go to Create (coming soon)"}
        </button>
        {predictionId ? <Creator predictionId={predictionId} /> : <Gallery />}
      </div>
    </>
  );
}

export default App;
