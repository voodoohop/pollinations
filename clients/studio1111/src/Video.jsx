import { useEffect, useRef, useState } from "react";

const MAX_WIDTH = 960;
const MAX_HEIGHT = 960;

export const VideoHolder = ({ src, style }) => {
  const [isInView, setIsInView] = useState(false);
  console.log("isInView", isInView);
  const [dimensions, setDimensions] = useState({
    width: "100%",
    height: "100%",
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
