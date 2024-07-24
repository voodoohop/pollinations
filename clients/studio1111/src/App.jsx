import { useDropzone } from 'react-dropzone'; // Importing from react-dropzone
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';
import { Gallery } from './Gallery';
import { Creator } from './Creator';
;

function App() {
  const predictionId = window.location.pathname.replace('/', '');// || "olgzarlbefsv46btczdti7rqim";

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
    <div><button onClick={switchMode}>
      {predictionId ? 'Go to Gallery' : 'Go to Create'}
    </button>
    {predictionId ? <Creator predictionId={predictionId} />  : <Gallery />}
    </div>
  )
}

export default App;

