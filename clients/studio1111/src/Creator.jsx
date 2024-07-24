import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { createImage, getPrediction } from "./replicate";
import { DEACTIVATED_STRING, ImageInput } from "./ImageInput";
import ImageDropZone from "./ImageDropZone";
import { ImageViewer } from "./ImageViewer";

export function Creator({ predictionId }) {
  const [inputState, inputStateUpdater, setInputState] = useInputState();

  const [status, setStatus] = useState({ status: null, logs: null });

  const [image, setImage] = useState(null); // Changed to hold a single image

  // State for managing the collapsible section
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Toggle function for the collapsible section
  const toggleAdvanced = () => {
    setShowAdvanced(!showAdvanced);
  };

  useEffect(() => {
    if (!predictionId) return;
    getPrediction(predictionId, (newStatus) => {
      console.log("typ", typeof newStatus.input, newStatus.input);
      setInputState({ ...inputState, ...newStatus.input });
      setStatus(newStatus);
    }).then((result) => {
      console.log("got result", result);
      if (result.output) setImage(result.output); // Set single image instead of array
      setTimeout(() => (window.prerenderReady = true), 200);
    });
  }, [predictionId]);

  const generateImage = async () => {
    const predictionId = await createImage(inputState);
    if (predictionId) window.location = `${location.origin}/${predictionId}`;
    else console.error("no prediction id. not redirecting");
  };

  console.log("inputState", inputState);

  const generateDisabled =
    inputState.prompt === DEACTIVATED_STRING ||
    inputState.prompt === "" ||
    status.status === "processing" ||
    status.status === "starting";

  return (
    <div>
      {/* Add Helmet to set meta tags */}
      {status.status === "succeeded" && (
        <Helmet>
          <meta
            property="og:title"
            content={`Disc Mosaic: ${inputState.prompt}`}
          />
          <meta property="og:description" content={inputState.prompt} />
          <meta property="og:url" content={window.location.href} />
          <title>Disc Mosaic: {inputState.prompt}</title>
          {/* Set the og:image to the generated image */}
          {image && <meta property="og:image" content={image} />}
          {image && <meta property="twitter:image" content={image} />}
        </Helmet>
      )}
      <h1>Disc Mosaic</h1>
      <p>Or directly enter a prompt to generate an image.</p>
      <input
        type="text"
        value={inputState.prompt}
        onChange={inputStateUpdater("prompt")}
        style={{
          width: "100%",
          height: "50px",
          fontSize: "20px",
          margin: "10px",
        }}
        disabled={inputState.prompt === DEACTIVATED_STRING}
      />
      {/* Advanced Features */}
      <button onClick={toggleAdvanced}>
        {showAdvanced ? "Hide" : "Show"} Advanced Features
      </button>
      {showAdvanced && (
        <div>
          <h3>Mask</h3>
          <ImageDropZone
            onImageChange={inputStateUpdater("mask")}
            uploadInstructions="Upload mask here"
            defaultImage={inputState.mask}
          />
          <h3>Frame</h3>
          <ImageDropZone
            onImageChange={inputStateUpdater("image")}
            uploadInstructions="Upload frame here"
            defaultImage={inputState.image}
          />
          <p>
            Seed (each seed produces a unique output):
            <input
              type="text"
              value={inputState.seed}
              onChange={inputStateUpdater("seed", true)}
            />
          </p>
          <p>
            # Prompt strength:
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={inputState.prompt_strength}
              onChange={inputStateUpdater("prompt_strength", true)}
            />
            {inputState.prompt_strength}
          </p>
          <p>
            Interpolate Animation:
            <input
              type="checkbox"
              checked={inputState.interpolate}
              onChange={inputStateUpdater("interpolate")}
            />
          </p>
          <p>
            # Interpolate frames:
            <input
              type="range"
              min="2"
              max="16"
              value={inputState.interpolate_frames}
              onChange={inputStateUpdater("interpolate_frames", true)}
            />
            {inputState.interpolate_frames}
          </p>
          <p>
            Distance to interpolate (0-100):
            <input
              type="range"
              min="0"
              max="100"
              value={inputState.interpolate_distance}
              onChange={inputStateUpdater("interpolate_distance", true)}
            />
            {inputState.interpolate_distance}
          </p>
          <p>
            Smooth interpolation:
            <input
              type="checkbox"
              checked={inputState.smooth_interpolation}
              onChange={inputStateUpdater("smooth_interpolation")}
            />
          </p>
          <p>
            Disable rotate:
            <input
              type="checkbox"
              checked={inputState.disable_rotate}
              onChange={inputStateUpdater("disable_rotate")}
            />
          </p>
          <p>
            Negative prompt:
            <br />
            <input
              type="text"
              value={inputState.negative_prompt}
              style={{ width: "80%" }}
              onChange={inputStateUpdater("negative_prompt")}
            />
          </p>
        </div>
      )}
      <br />
      <br />
      <button onClick={generateImage} disabled={generateDisabled}>
        Generate
      </button>
      <p>
        <i>{status.status}...</i>
      </p>
      {/* Show console logs from status.logs.
              Use a display element that respects the line breaks. use pre
              Show the last 5 lines only
              */}
      {status.logs && (showAdvanced || generateDisabled) && (
        <pre>{status.logs.split("\n").slice(-5).join("\n")}</pre>
      )}
      {image && <ImageViewer images={[image]} />}{" "}
      {/* Pass single image as an array */}
    </div>
  );
}
function useInputState() {
  const [inputState, setInputState] = useState({
    prompt: "",
    image: null,
    mask: null,
  });

  const inputStateUpdater =
    (prop, convertToFloat = false) =>
    (e) => {
      let value;
      if (e?.target?.type === "checkbox") {
        value = e.target.checked;
      } else {
        value = e?.target?.value ?? e;
      }
      // if it is a range convert to int
      if (e?.target?.type === "range") {
        value = parseFloat(value);
      }

      // // if it is a string containing a number convert to float
      if (convertToFloat && !isNaN(parseFloat(value))) {
        value = parseFloat(value);
      }

      setInputState({ ...inputState, [prop]: value });
    };

  return [inputState, inputStateUpdater, setInputState];
}
