import { useEffect, useState } from "react";
import { getPredictionList } from "./replicate";
import InfiniteScroll from "react-infinite-scroller";
import { HoveredVideo } from "./Video";
import lodash from "lodash";
import {
  galleryContainerStyle,
  headerStyle,
  subHeaderStyle,
  loadingStyle,
  galleryStyle,
} from "./galleryStyles";
import { usePredictions } from "./usePredictions"; // Import usePredictions

export function Gallery() {
  const predictions = usePredictions();
  console.log("got predictions", predictions);
  const [visiblePredictionCount, setVisiblePredictionCount] = useState(10);
  console.log("visiblePredictions", visiblePredictionCount);

  const images = predictions
    .filter(({ input }) => input?.animation_prompts)
    .slice(0, visiblePredictionCount)
    .map((props, i) => <HoveredVideo key={`${props.id}_${i}`} {...props} />);

  return (
    <div style={galleryContainerStyle}>
      <h1 style={headerStyle}>Studio 1111 Gallery</h1>
      <i style={subHeaderStyle}>
        Click on any of the images to tweak (coming soon)
      </i>
      {predictions.length === 0 ? (
        <div style={loadingStyle}>Loading...</div>
      ) : (
        <InfiniteScroll
          pageStart={0}
          loadMore={() =>
            setVisiblePredictionCount((prevCount) => prevCount + 5)
          }
          hasMore={visiblePredictionCount < predictions.length}
          loader={
            <div className="loader" key={0}>
              Loading ...
            </div>
          }
        >
          <div style={galleryStyle}>{images}</div>
        </InfiniteScroll>
      )}
    </div>
  );
}

export const cloudfrontify = (url) => {
  return url.replace(
    "https://dev-media.soundmosaic.pixelynx-ai.com/",
    "https://d1uiyten9tviek.cloudfront.net/"
  );
};
