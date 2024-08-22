import { useEffect, useRef, useState } from "react";
import { cloudfrontify } from "./Gallery";
import { itemStyle, captionStyle } from "./galleryStyles";
import lodash from "lodash";

const MAX_WIDTH = 960;
const MAX_HEIGHT = 960;

export const VideoHolder = ({ src, style }) => {
  const [isInView, setIsInView] = useState(false);
  console.log("isInView", isInView);
  const [dimensions, setDimensions] = useState({
    width: "960px",
    height: "128px",
  });
  const videoRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    return () => {
      if (videoRef.current) {
        observer.unobserve(videoRef.current);
      }
    };
  }, []);

  const handleLoadedMetadata = (event) => {
    const { videoWidth, videoHeight } = event.target;

    let aspectRatio = videoWidth / videoHeight;

    let newWidth = videoWidth;
    let newHeight = videoHeight;

    if (videoWidth > MAX_WIDTH) {
      newWidth = MAX_WIDTH;
      newHeight = newWidth / aspectRatio;
    }

    if (newHeight > MAX_HEIGHT) {
      newHeight = MAX_HEIGHT;
      newWidth = newHeight * aspectRatio;
    }
    console.log("newWidth", newWidth);
    setDimensions({ width: newWidth, height: newHeight });
  };

  console.log("dimensions", dimensions);

  return (
    <video
      ref={videoRef}
      src={isInView ? src : ""}
      autoPlay
      loop
      muted
      style={{
        ...style,
        ...imgStyle,
        width: dimensions.width,
        height: dimensions.height,
      }}
      onLoadedMetadata={handleLoadedMetadata}
    />
  );
};

const imgStyle = {
  width: "80%",
  maxWidth: `${MAX_WIDTH}px`,
  maxHeight: `${MAX_HEIGHT}px`,
  // margin: "auto",
  padding: "10px",
};

const sanitizeFilename = (filename) => {
  return filename.replace(/[^a-z0-9]/gi, "_").toLowerCase();
};

export const HoveredVideo = ({ output, input, upscaledUrl }) => {
  console.log("upscaledUrl", upscaledUrl);
  const [isHovered, setIsHovered] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const sanitizedPrompt = input?.animation_prompts
    ? sanitizeFilename(input.animation_prompts.substring(0, 100))
    : "video";

  const downloadFilename = `${sanitizedPrompt}.mp4`;

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const response = await fetch(upscaledUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = downloadFilename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed", error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div
      style={itemStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <VideoHolder src={cloudfrontify(output)} />
      <p style={{ ...captionStyle, fontWeight: isHovered ? "bold" : "normal" }}>
        {upscaledUrl && isHovered && (
          <div>
            <button
              style={{ marginBottom: "15px", fontSize: "16px" }}
              onClick={handleDownload}
              disabled={isDownloading}
            >
              {isDownloading ? "Downloading..." : "Download High Res"}
            </button>
          </div>
        )}
        {isHovered
          ? input?.animation_prompts
          : input?.animation_prompts?.length > 100
          ? input.animation_prompts.substring(0, 100) + "..."
          : input?.animation_prompts}
      </p>
    </div>
  );
};
