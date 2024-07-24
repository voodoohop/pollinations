import { useEffect, useState } from "react";
import { getPredictionList } from "./replicate";
import InfiniteScroll from "react-infinite-scroller";
import { Image } from "./Image";
import lodash from "lodash";

const blacklist = ["pdotkw3bbyry5jd7efofjfiw4e"];

export function Gallery() {
  const [predictions, setPredictions] = useState([]);
  const [visiblePredictionCount, setVisiblePredictionCount] = useState(10);
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
        console.log("calling getPredictionList with url");
        const [ps, nextUrll] = await getPredictionList(nextUrl);

        console.log("got predictions ", ps, nextUrl);
        // collect all gifs in output lists
        const outputs = ps.map(({ id, output }) => ({ id, output }));

        if (nextUrl !== nextUrll) {
          setPredictions((prevPredictions) => [...prevPredictions, ...outputs]);
          setNextUrl(nextUrll);
        }
      })();
    }
  }, [visiblePredictionCount, predictions]);

  // filter unique by .gif property
  const uniquePredictions = lodash.uniqBy(predictions, ({ output }) => output);
  console.log("visiblePredictions", visiblePredictionCount);
  const images = uniquePredictions
    .slice(0, visiblePredictionCount)
    .map(({ id, output }, i) => (
      <a href={`/${id}`} key={`${id}_${i}`}>
        <Image src={cloudfrontify(output)} />
      </a>
    ));

  return (
    <div>
      <h1>Studio 1111 Gallery</h1>
      <i>Click on any of the images to tweak</i>
      <InfiniteScroll
        pageStart={0}
        loadMore={() => setVisiblePredictionCount((prevCount) => prevCount + 5)}
        hasMore={visiblePredictionCount < predictions.length}
        loader={
          <div className="loader" key={0}>
            Loading ...
          </div>
        }
      >
        {images}
      </InfiniteScroll>
    </div>
  );
}

const cloudfrontify = (url) => {
  return url.replace(
    "https://dev-media.soundmosaic.pixelynx-ai.com/",
    "https://d1uiyten9tviek.cloudfront.net/"
  );
};
