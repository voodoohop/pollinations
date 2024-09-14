import { textContent } from "../assets"
import MarkDownContent from "./MarkDownContent"
import { SEOImage, SEOMetadata } from "./Helmet"

const PageTemplate = ({ label }) => {
  if (!label) return <></>

  return (
    <div className="flex justify-center w-full max-w-2xl mx-auto mt-24 relative">
      <div className="p-4">
        <div className="prose">
          <SEOMetadata title={`${label[0].toUpperCase()}${label.slice(1)}`} />
          <SEOImage />
          <MarkDownContent url={textContent[label]} />
        </div>
        <img
          src='gradient_background.png'
          className="fixed top-0 left-0 w-full h-full opacity-50 transform rotate-180 -z-10 object-cover"
          alt="hero_bg_overlay"
        />
      </div>
    </div>
  )
}

export default PageTemplate
