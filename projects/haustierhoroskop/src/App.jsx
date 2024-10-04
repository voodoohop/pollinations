import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import ReactMarkdown from "react-markdown";
import "./index.css";
import { usePollinationsImage, usePollinationsText } from "@pollinations/react";

function App() {
  const [petImage, setPetImage] = useState("https://i.imgur.com/wHQbITR.png");
  const [birthDate, setBirthDate] = useState("01-04-2019"); // Pre-filled reasonable birth date in European format
  const [petName, setPetName] = useState("Julyk"); // Pre-filled typical pet name

  const [prompt, setPrompt] = useState(null);

  const horoscope = usePollinationsText(prompt, {
    seed: 42,
    jsonMode: true,
    model: "claude",
    systemPrompt: `
Goal: create a horoscope text and image description for the pet in the form of a json object.

Analyze the attached photo of the pet and infer the following facts.

Horoscope text
- a mix of serious and funny
- the age in dog or cat years
- one interesting fact related to the birthday: e.g. other celebrities born on this day, Halloween, World Cat Day, etc. select one that is obvious in an image.
- include many emojis and bold italic markdown formatting
- dont inlude the unique event in the horoscope text as it is listed separately

Pet image prompt
- the description of the pet in the context of the horoscope suitable for an image generator.
- the pet should be happy and healthy
- Include details such as breed, age, gender, and any distinguishing visual features.
- Don't include the name

Unique event / Celebrity
- Select the event or celebrity included in the horoscope text and describe it suitable for an image generator. (1 paragraph)

Nutrition tips
- Provide useful nutrition tips for the type of pet, its age, and its look.
- Explain how you came to the conclusion, but be very concise.

Language
- All text in German

Return a json object with the following structure:
{
    "horoscope": "The horoscope text (ca. 1 paragraph)",
    "petDescription": "detailed pet description (2 sentences)",
    "starSign": "The star sign of the pet",
    "uniqueEvent": "unique event / celebrity (1 sentence)",
    "nutritionTips": "useful nutrition tips (1-2 sentences)"
}`,
  });

  console.log("horoscope", horoscope);

  const imagePrompt = horoscope?.petDescription
    ? `A anime style ${horoscope.starSign} tarot card. Write star sign "${horoscope.starSign}" bold at center bottom.

${horoscope.petDescription}

${horoscope.uniqueEvent}
      `
    : "Loading text";

  console.log("imagePrompt", imagePrompt);
  const imageUrl = usePollinationsImage(imagePrompt, { model: "flux-pro" });
  console.log("imageUrl", imageUrl);
  const generateHoroscope = () => {
    setPrompt([
      {
        type: "text",
        text: `
The pet's name is ${petName} and birth date is ${birthDate}.
Today is ${new Date().toLocaleDateString()}.
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
      <Card className="w-full max-w-lg shadow-xl">
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
              Pet's Birth Date (DD-MM-YYYY)
            </Label>
            <Input
              id="birth-date"
              type="text"
              placeholder="DD-MM-YYYY"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              pattern="\d{2}-\d{2}-\d{4}"
              title="Please enter the date in DD-MM-YYYY format"
            />
          </div>
          <Button
            onClick={generateHoroscope}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            disabled={
              !petImage || !birthDate || !petName || (prompt && !horoscope)
            }
          >
            {prompt && !horoscope ? (
              <>
                <span className="animate-spin mr-2">&#9696;</span>
                Generating...
              </>
            ) : (
              "Generate Horoscope"
            )}
          </Button>
          {horoscope && (
            <div className="space-y-4">
              <Separator />
              <h3 className="text-xl font-semibold text-center text-purple-700">
                {petName}'s Horoscope
              </h3>
              <img
                src={
                  imageUrl ||
                  "https://image.pollinations.ai/prompt/loading%20text%20black%20on%20white%20background%20written%20with%20lots%20of%20pet%20related%20objects%20instead%20of%20letters?model=flux-pro"
                }
                alt={horoscope.petDescription}
                className="rounded-lg max-h-[600px] w-full object-contain mx-auto"
              />
              <p className="text-center font-bold">{horoscope.starSign}</p>
              <ReactMarkdown className="text-center italic">
                {horoscope.horoscope}
              </ReactMarkdown>
              <Separator />
              <p className="text-center font-bold">Unique Events</p>
              <ReactMarkdown className="text-center">
                {horoscope.uniqueEvent}
              </ReactMarkdown>
              <Separator />
              <p className="text-center font-bold">Nutrition Tips</p>
              <ReactMarkdown className="text-center">
                {horoscope.nutritionTips}
              </ReactMarkdown>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default App;
