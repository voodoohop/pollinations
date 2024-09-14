import React from "react";
import { PollinationsMarkdown } from "@pollinations/react";

const DescriptionIconSVG = () => (
  <svg className="inline w-4 h-4 ml-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const WhoWeAreContent = () => {
  const handleLinkClick = (e) => {
    e.preventDefault();
    const link = e.currentTarget.href;
    navigator.clipboard.writeText(link).then(() => {
      console.log(`Copied to clipboard: ${link}`);
    });
  };

  return (
    <>
      <h2 className="text-3xl font-bold text-offwhite mb-4">
        <PollinationsMarkdown>
          {/* Your markdown content here */}
        </PollinationsMarkdown>
      </h2>
      <div className="flex justify-between items-start w-full mb-8">
        <p className="text-white text-xl">
          To talk to us, reach out on{" "}
          <a href="https://discord.gg/k9F7SyTgqn" className="text-lime font-bold">
            Discord
          </a>{" "}
          <span className="hidden md:inline">or at </span>
          <a href="mailto:hello@pollinations.ai" onClick={handleLinkClick} className="text-lime font-bold">
            hello@pollinations.ai
          </a>.
        </p>
        <p className="text-white text-xl text-right">
          <a href="/readme" className="text-lime font-bold flex items-center">
            README <DescriptionIconSVG />
          </a>
        </p>
      </div>
    </>
  );
};

export default function WhoWeAre() {
  return (
    <div className="w-full relative bg-background_body p-4">
      <div className="flex flex-col items-start justify-center gap-4 mx-auto animate-fade-in">
        <WhoWeAreContent />
      </div>
    </div>
  );
}
