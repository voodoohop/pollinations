import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import "./index.css";
import { usePollinationsImage, usePollinationsText } from "@pollinations/react";

function App() {
  const [petImage, setPetImage] = useState("https://i.imgur.com/wHQbITR.png");
  const [birthDate, setBirthDate] = useState("01-04"); // Pre-filled reasonable birth date
  const [petName, setPetName] = useState("Julyk"); // Pre-filled typical pet name

  const [prompt, setPrompt] = useState(null);

  const horoscope = usePollinationsText(prompt, {
    seed: 42,
    jsonMode: true,
    systemPrompt: `
    The end goal is to create a horoscope text and image for the pet in the form of a json object.
    
    The a horoscope text:, a mix of serious and funny, the age in dog or cat years, other celebrities who were born on this day, funny days (Coconut Day etc.), and then a photo that is generated from the pet's photo: a typical pet with the zodiac sign Fish with favorite activities or the dog merged as the famous personality who was also born on that day.
    
    The cat description contains the description of the pet in the context of the horoscope suitable for an image generator. Include details such as breed, age, gender, and any distinguishing features.

    The situation description contains a vivid description of the horoscope suitable for an image generator.
    
    return a json object with the following structure:
    {
    "horoscope": "The horoscope text",
    "catDescription": "detailed cat description",
    "situationDescription": "vivid situation description",
    "starSign": "The star sign of the pet"
    }`,
  });

  const imageUrl = usePollinationsImage(
    horoscope?.catDescription
      ? `A anime style ${horoscope.starSign} tarot card. Write the star sign in the center bottom of the card in bold letters.

# Cat
${horoscope.catDescription}

# Situation
${horoscope.situationDescription}
      `
      : "Loading text",
    { model: "flux-anime" }
  );

  const generateHoroscope = () => {
    setPrompt([
      {
        type: "text",
        text: `
The pet's name is ${petName} and birth date is ${birthDate}.
Today is ${new Date().toLocaleDateString()}.

return a json object with the following structure:
{
"horoscope": "The horoscope text",
"starSign": "The star sign of the pet",
"catDescription": "detailed cat description",
"situationDescription": "vivid situation description"
}
`,
      },
      {
        type: "image_url",
        image_url: {
          url: petImage,
        },
      },
    ]);
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setPetImage(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center text-purple-700">
            Pet Horoscope
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="pet-image" className="text-lg font-medium">
              Upload Your Pet's Image
            </Label>
            <Input
              id="pet-image"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="cursor-pointer"
            />
            {petImage && (
              <img
                src={petImage}
                alt="Your pet"
                className="mt-2 rounded-lg max-h-48 mx-auto"
              />
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="pet-name" className="text-lg font-medium">
              Pet's Name
            </Label>
            <Input
              id="pet-name"
              type="text"
              value={petName}
              onChange={(e) => setPetName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="birth-date" className="text-lg font-medium">
              Pet's Birth Date (MM-DD)
            </Label>
            <Input
              id="birth-date"
              type="text"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
            />
          </div>
          <Button
            onClick={generateHoroscope}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            disabled={!petImage || !birthDate || !petName}
          >
            Generate Horoscope
          </Button>
          {horoscope && (
            <div className="space-y-4">
              <Separator />
              <h3 className="text-xl font-semibold text-center text-purple-700">
                Your Pet's Horoscope
              </h3>
              <img
                src={imageUrl}
                alt={horoscope.catDescription}
                className="rounded-lg max-h-96 mx-auto"
              />
              <p className="text-center italic">{horoscope.horoscope}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default App;
