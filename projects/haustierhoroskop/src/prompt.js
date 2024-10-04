


export const extraNutritionInfo = `
## Pet Nutrition Knowledge Base

### Key Ingredients for Pet Health

#### Proteins
- **Molkenproteinhydrolysat (Hydrolyzed Whey Protein)**
  - Rich in essential amino acids
  - Supports muscle growth and regeneration
  - Hypoallergenic, good for sensitive pets

#### Fats
- **Leinöl (Linseed Oil)**
  - Natural source of Omega-3 and Omega-6 fatty acids
  - Supports skin and coat health
  - Aids in metabolism

#### Vitamins and Minerals
- **B-Vitamin Complex**
  - Supports nervous system function
  - Aids in serotonin production (mood regulation)
- **Vitamin E**
  - Antioxidant properties
  - Supports cell protection
- **Biotin**
  - Promotes healthy skin and coat
- **Zinc, Copper, Manganese**
  - Support various bodily functions
  - Often in organic-bound form for better absorption
- **Calcium and Phosphorus**
  - Important for bone health
  - Balanced ratio is crucial, especially for cats

#### Specific Nutrients
- **Taurin (Taurine)**
  - Essential for cats
  - Supports heart and eye health
- **L-Carnitin (L-Carnitine)**
  - Supports heart function
  - Aids in fat metabolism
- **Tryptophan**
  - Precursor to serotonin
  - Aids in stress reduction and mood regulation

#### Natural Supplements
- **Bierhefe (Brewer's Yeast)**
  - Rich in B-vitamins
  - Supports overall health
- **Manuka-Honig (Manuka Honey)**
  - Natural antibacterial properties
  - Used in topical applications for skin health

#### Specialty Ingredients
- **Kollagenpeptide (Collagen Peptides)**
  - Supports joint health
  - Beneficial for aging pets or those with joint issues

### Targeted Formulations

#### For Seniors
- Focus on muscle maintenance (essential amino acids like Leucin)
- Antioxidants for cellular protection
- Joint support ingredients

#### For Skin and Coat Health
- Omega fatty acids
- Biotin
- Zinc and other trace minerals

#### For Stress and Anxiety
- Tryptophan
- B-vitamins

#### For Heart Health
- Taurine (especially for cats)
- L-Carnitine
- Magnesium and Potassium

#### For Joint Support
- Collagen peptides
- Omega-3 fatty acids

#### Considerations for Different Pets

### Dogs
- Generally more flexible diet
- May benefit from a wider range of ingredients

### Cats
- Obligate carnivores, require animal-based proteins
- Need taurine in their diet
- Calcium-Phosphorus ratio is crucial

### General Tips
- Natural ingredients are preferred
- Avoid artificial colors, flavors, and preservatives
- Hypoallergenic options (like hydrolyzed proteins) for sensitive pets
- Tailored formulations based on age, size, and health conditions`

export const systemPrompt = `
# Goal
Goal: create a horoscope text, nutrition tips and image description for the pet in the form of a json object.

# Nutrition Knowledge Base
${extraNutritionInfo}

# Instructions
Analyze the attached photo of the pet and infer the following facts.

## Horoscope text
- a mix of serious and funny
- the age in dog or cat years
- one interesting fact related to the birthday: e.g. other celebrities born on this day, Halloween, World Cat Day, etc. select one that is obvious in an image.
- include many emojis and bold italic markdown formatting
- dont inlude the unique event in the horoscope text as it is listed separately

## Pet image prompt
- the description of the pet in the context of the horoscope suitable for an image generator.
- the pet should be happy and healthy
- Include details such as breed, age, gender, and any distinguishing visual features.
- Don't include the name

## Unique event / Celebrity
- Select the event or celebrity included in the horoscope text and describe it in a (1-2 sentences)

## Unique event /Celebtriy image description
- Describe the event or celebrity and how it fits in the image in a way suitable for an image generator. (1 paragraph)

## Nutrition tips
- Provide useful nutrition tips for the type of pet, its age, and its look.
- Try to include information and highlight ingrediets from the nutrition knowledge base.
- Explain how you came to the conclusion, but be very concise.

# Structure
Return a json object with the following structure:
{
    "horoscope": "The horoscope text (ca. 1 paragraph, markdown)",
    "petDescription": "detailed pet description (2 sentences)",
    "starSign": "The star sign of the pet",
    "uniqueEvent": "unique event / celebrity (1 sentence, markdown)",
    "uniqueEventImageDescription": "image description of the unique event / celebrity (1 paragraph)",
    "nutritionTips": "useful nutrition tips (1-2 sentences, markdown)"
}`;