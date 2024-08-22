import { useEffect, useState } from "react";
import { getPredictionList } from "./replicate";
import InfiniteScroll from "react-infinite-scroller";
import { VideoHolder } from "./Video";
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
        const outputs = ps
          .map(({ id, output, input }) => ({
            id,
            output,
            input,
          }))
          .filter(({ output, input }) => output && input?.prompt);

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
    .map(({ id, output, input }, i) => (
      <HoveredVideo key={`${id}_${i}`} id={id} output={output} input={input} />
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

const HoveredVideo = ({ id, output, input }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      key={id}
      style={itemStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <VideoHolder src={cloudfrontify(output)} />
      <p style={{ ...captionStyle, fontWeight: isHovered ? "bold" : "normal" }}>
        {isHovered
          ? input?.prompt
          : input?.prompt?.length > 100
          ? input.prompt.substring(0, 100) + "..."
          : input?.prompt}
      </p>
    </div>
  );
};

const cloudfrontify = (url) => {
  return url.replace(
    "https://dev-media.soundmosaic.pixelynx-ai.com/",
    "https://d1uiyten9tviek.cloudfront.net/"
  );
};

const galleryContainerStyle = {
  maxWidth: "1200px",
  margin: "0 auto",
  padding: "20px",
};

const headerStyle = {
  textAlign: "center",
  fontSize: "2.5rem",
  marginBottom: "10px",
};

const subHeaderStyle = {
  display: "block",
  textAlign: "center",
  marginBottom: "20px",
};

const galleryStyle = {
  // display: "flex",
  // flexWrap: "wrap",
  justifyContent: "center",
};

const itemStyle = {
  margin: "80px 10px 10px 10px", // Added more space above each image
  flexBasis: "calc(33.333% - 20px)",
};

const captionStyle = {
  fontSize: "1.2rem",
  lineHeight: "1.2",
  marginTop: "5px",
  color: "#ccc",
  maxWidth: "960px",
};

const loadingStyle = {
  fontSize: "2rem",
  textAlign: "center",
  marginTop: "50px",
};
