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

function usePredictions(initialVisibleCount = 10) {
  const [predictions, setPredictions] = useState([]);
  const [visiblePredictionCount, setVisiblePredictionCount] =
    useState(initialVisibleCount);
  const [nextUrl, setNextUrl] = useState(null);

  useEffect(() => {
    console.log(
      "predictions",
      predictions.length,
      visiblePredictionCount,
      nextUrl
    );
    if (predictions.length <= visiblePredictionCount) {
      (async () => {
        const [ps, nextUrll] = await getPredictionList(nextUrl);

        console.log("got predictions ", ps, nextUrl);
        // collect all gifs in output lists
        const outputs = ps
          .map(({ id, output, input }) => ({
            id,
            output,
            input,
          }))
          .filter(({ output, input }) => output && input?.animation_prompts);

        if (nextUrl !== nextUrll) {
          setPredictions((prevPredictions) => [...prevPredictions, ...outputs]);
          setNextUrl(nextUrll);
        }
      })();
    }
  }, [visiblePredictionCount, nextUrl]);

  const uniquePredictions = lodash.uniqBy(predictions, ({ output }) => output);

  return {
    predictions: uniquePredictions,
    visiblePredictionCount,
    setVisiblePredictionCount,
  };
}

export function Gallery() {
  const { predictions, visiblePredictionCount, setVisiblePredictionCount } =
    usePredictions();

  console.log("visiblePredictions", visiblePredictionCount);
  const images = predictions
    .slice(0, visiblePredictionCount)
    .map(({ id, output, input }, i) => (
      <HoveredVideo key={`${id}_${i}`} output={output} input={input} />
    ));

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
