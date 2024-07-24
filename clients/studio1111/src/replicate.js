
// import Replicate from "replicate";

// import fetch from "node-fetch";


// const replicate = new Replicate({
//   // get your token from https://replicate.com/account
//   auth: "0ae42be11f9282b5ccadbadf2949aa20fe9d6a9d",
//   fetch: window.fetch
// });
// 
const REPLICATE_API_URL = 'https://v16.soundmosaic.pixelynx-ai.com/replicate';
// const REPLICATE_API_URL = 'http://localhost:8090/replicate';
const SOUNDMOSAIC_TOKEN = "guest"

const override_token = "pollinations";




export async function createImage(input) {

  // remove all null values. clone first
  input = removeNullValues(input);

  console.log("calling createimage with input", input)
  const response = await fetch(REPLICATE_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `${SOUNDMOSAIC_TOKEN}`
    },
    body: JSON.stringify({
      version: '36575d5a9ab91962f8d90b67d1c1eb06111c5481627ff78f4f4d9fc00c32f14f',
      input

    })
  });

  const data = await response.json();
  console.log("got data", data)

  return data.id || "";
};


function removeNullValues(input) {
  input = JSON.parse(JSON.stringify(input));
  Object.keys(input).forEach(key => input[key] == null && delete input[key]);
  return input;
}

export async function extractPrompt(base64_image_url) {
  const response = await fetch(REPLICATE_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `${SOUNDMOSAIC_TOKEN}`
    },
    body: JSON.stringify({
      version: 'd90ed1292165dbad1fc3fc8ce26c3a695d6a211de00e2bb5f5fec4815ea30e4c',
      input: {
        image: base64_image_url,
        mode: "fast"
      },
    })
  });

  const data = await response.json();
  console.log("got data", data)

  return data.id;
}

export async function getPrediction(predictionId, statusCallback = () => null) {
  // Poll for the result
  const result = await pollForResult(predictionId, statusCallback);

  return result;
};

async function pollForResult(predictionId, statusCallback) {
  const pollInterval = 3000; // 3 seconds

  while (true) {
    try {
      const response = await fetch(`${REPLICATE_API_URL}/${predictionId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${SOUNDMOSAIC_TOKEN}`
        }
      });

      const data = await response.json();
      console.log("status", data)
      statusCallback(data);
      if (data.status === 'succeeded' || data.status === 'failed') {
        return data;
      }

      // Wait for the next poll
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    } catch (error) {
      // Handle any errors here
      console.error('Error while polling for result:', error);
      return null;
    }
  }
}


export async function getPredictionList(url = null, model = "deforum-art/deforum-stable-diffusion") {

  if (!url)
    url = REPLICATE_API_URL + "/?filter=model:" + model + "&override_token=" + override_token + "&token=" + SOUNDMOSAIC_TOKEN;
  console.log("calling getPredictionList with url", url)
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `${SOUNDMOSAIC_TOKEN}`
    }
  });

  const data = await response.json();
  console.log("predictions", data)

  return [data.results, data.next];
}

