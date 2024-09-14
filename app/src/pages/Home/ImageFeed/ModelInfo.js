import React from 'react';

export function ModelInfo({ model, wasPimped, referrer }) {
  const formatReferrer = (url) => {
    if (!url) return "-";
    const domain = url.replace(/^https?:\/\//, "").split("/")[0];
    return domain.split(".").slice(-2).join(".");
  };

  const renderModelInfo = (modelName, modelLink, loraLink) => (
    <p className="text-sm text-gray-400 mt-2 text-center">
      Model:{" "}
      <a href={modelLink} target="_blank" rel="noopener noreferrer" className="text-lime font-bold hover:underline">
        {modelName}
      </a>
      {loraLink && (
        <>
          &nbsp;&nbsp; LoRA:{" "}
          <a href={loraLink} target="_blank" rel="noopener noreferrer" className="text-lime font-bold hover:underline">
            DMD2
          </a>
        </>
      )}
      &nbsp;&nbsp; Prompt Enhancer:{" "}
      {wasPimped ? (
        <a
          href="https://github.com/pollinations/pollinations/blob/master/image.pollinations.ai/groqPimp.js"
          target="_blank"
          rel="noopener noreferrer"
          className="text-lime font-bold hover:underline"
        >
          Groq
        </a>
      ) : (
        <i className="text-gray-500">N/A</i>
      )}
      {referrer && (
        <>
          &nbsp;&nbsp;Referrer:{" "}
          <a href={referrer} target="_blank" rel="noopener noreferrer" className="text-lime font-bold hover:underline">
            {formatReferrer(referrer)}
          </a>
        </>
      )}
    </p>
  );

  if (model === "turbo") {
    return renderModelInfo(
      "Boltning",
      "https://civitai.com/models/413466/boltning-realistic-lightning-hyper",
      "https://huggingface.co/tianweiy/DMD2"
    );
  }

  if (model === "flux") {
    return renderModelInfo("Flux.Schnell", "https://blackforestlabs.ai/", null);
  }

  if (model === "flux-anime") {
    return renderModelInfo("Flux.Anime", "https://llmplayground.net/", null);
  }

  if (model === "flux-3d") {
    return renderModelInfo("Flux.3D", "https://llmplayground.net/", null);
  }

  if (model === "flux-realism") {
    return renderModelInfo("Flux.Realism", "https://llmplayground.net/", null);
  }

  return null;
}
