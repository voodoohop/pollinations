import { useState, useEffect } from "react";
import { getPredictionList } from "./replicate";
import lodash from "lodash";

function usePredictions() {
    const [predictions, setPredictions] = useState([]);
    useEffect(() => {
        (async () => {
            const allPredictions = await getAllPredictionsWithUpscale();
            console.log("got all predictions ", allPredictions);
            // collect all gifs in output lists
            const outputs = allPredictions
                .filter(({ output }) => output);

            setPredictions(outputs);
        })();
    }, []);

    const uniquePredictions = lodash.uniqBy(predictions, ({ output }) => output);

    return uniquePredictions;
}

async function getAllPredictions(model = "deforum-art/deforum-stable-diffusion") {
    let allPredictions = [];
    let nextUrl = null;

    do {
        const [ps, nextUrll] = await getPredictionList(nextUrl, model);
        allPredictions = [...allPredictions, ...ps];
        nextUrl = nextUrll;
    } while (nextUrl);

    return allPredictions;
}

export async function getAllPredictionsWithUpscale() {
    const esrganPredictions = await getAllPredictions("lucataco/real-esrgan-video");
    const videoPredictions = await getAllPredictions("deforum-art/deforum-stable-diffusion");

    const matchedPredictions = videoPredictions.map(videoPrediction => {
        const matchedEsrgan = esrganPredictions.find(esrganPrediction => esrganPrediction.input?.video_path === videoPrediction.output);
        return {
            ...videoPrediction,
            upscaledUrl: matchedEsrgan?.output,
        };
    })
        .filter(({ upscaledUrl }) => upscaledUrl);

    return matchedPredictions;
}

getAllPredictionsWithUpscale();

export { usePredictions };