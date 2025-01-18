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
  itemStyle,
  paypalStyle,
  docaBlingStyle,
} from "./galleryStyles";
import { usePredictions } from "./usePredictions";

export function Gallery() {
  const predictions = usePredictions();
  const [visiblePredictionCount, setVisiblePredictionCount] = useState(10);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      const root = document.documentElement;
      const moveX = (e.clientX - window.innerWidth / 2) * 0.01;
      const moveY = (e.clientY - window.innerHeight / 2) * 0.01;
      root.style.setProperty('--mouse-x', moveX + 'deg');
      root.style.setProperty('--mouse-y', moveY + 'deg');
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const images = predictions
    .filter(({ input }) => input?.animation_prompts)
    .slice(0, visiblePredictionCount)
    .map((props, i) => (
      <div
        key={`${props.id}_${i}`}
        style={{
          ...itemStyle,
          opacity: 0,
          animation: `fadeSlideIn 0.8s ease-out ${i * 0.2}s forwards`,
        }}
      >
        <HoveredVideo {...props} />
      </div>
    ));

  return (
    <div 
      style={{
        ...galleryContainerStyle,
        backgroundPosition: `${mousePosition.x * 0.02}px ${mousePosition.y * 0.02}px`,
        backgroundColor: 'transparent',
      }}
    >
      <style>
        {`
          @keyframes fadeSlideIn {
            from {
              opacity: 0;
              transform: translateY(30px) skew(-5deg);
            }
            to {
              opacity: 1;
              transform: translateY(0) skew(-5deg);
            }
          }
          
          @supports (mix-blend-mode: plus-lighter) {
            .doca-bling {
              mix-blend-mode: plus-lighter !important;
            }
          }
        `}
      </style>
      <div className="noise" />
      <div className="premium-overlay" />
      <div className="scanline" />
      <div className="vip-badge">DEPT. OF COSMIC AFFAIRS</div>
      <video
        autoPlay
        loop
        muted
        playsInline
        className="doca-bling"
        style={docaBlingStyle}
      >
        <source src="/doca_bling.mp4" type="video/mp4" />
      </video>
      <h1 style={headerStyle}>STUDIO 1111</h1>
      <i style={subHeaderStyle}>
        INTERDIMENSIONAL ARTIFACTS / CLEARANCE LEVEL Ω / REALITY DISTORTION PERMIT REQUIRED
      </i>
      <a 
        href="https://www.paypal.com/paypalme/my/profile" 
        target="_blank" 
        rel="noopener noreferrer"
        style={paypalStyle}
      >
        paypal
      </a>
      {predictions.length === 0 ? (
        <div style={loadingStyle}>VALIDATING DIMENSIONAL PASSPORT...</div>
      ) : (
        <InfiniteScroll
          pageStart={0}
          loadMore={() => setVisiblePredictionCount((prevCount) => prevCount + 3)}
          hasMore={visiblePredictionCount < predictions.length}
          loader={
            <div className="loader" key={0} style={loadingStyle}>
              ACCESSING QUANTUM ARCHIVE...
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
