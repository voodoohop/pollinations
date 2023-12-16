<div id="header">
  <img src="https://i.ibb.co/p049Y5S/86964862.png" width="50"/>   <img src="https://i.ibb.co/r6JZ336/sketch1700556567238.png" width="250">
</div>

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/toolkitr/tkr/blob/main/LICENSE)
[![Python Versions](https://img.shields.io/badge/python-%203.7+%20-blue)](https://www.python.org/downloads/)

## 🌸 [pollinations.ai](https://pollinations.ai/)
Pollinations are an effort to make generative art more approachable. 
- A frontend hosting a set of [curated notebooks](https://github.com/pollinations/hive) that allow creating and experimenting with generative art.
- The Interplanetary Filesystem (IPFS) for decentralized censorship-resistant storage of models, code and generated content
- Pollinations are run on Google Colab at the moment (for the free cloud GPUs)

[Instructions](docs/instructions.md) on using Pollinations.AI.
<details>
  <summary>🐍 Python Package</summary>

```python
# Usage Example

import pollinations.ai as ai

model: object = ai.ImageModel()
# model.set_filter(ai.BANNED_WORDS)
# model.set_filter([])

image: object = model.generate(
    prompt=f'Golden retriever puppy playing in the rain {ai.realistic}',
    model=model.Turbo,
    height=512,
    seed=57184
).save('image-output.jpg')

print(image.url)
```
```javascript
// >>> https://image.pollinations.ai/prompt/Golden%20retriever%20puppy%20playing%20in%20the%20rain%20realistic,%20realism,%20real%20life,%20ultra%20realistic,%20high%20quality,%20real?model=turbo&width=1024&height=512&seed=57184
```
![image](https://github.com/flowa-ai/pollinations-patch/assets/152752280/448342b5-013f-4df9-a5a5-6d5f1f196cac)

</details>


## 🔗 Links

- Frontend: https://pollinations.ai/
- Instructions: [docs/instructions.md](docs/instructions.md)
- Discord: https://discord.gg/azGuNpvPu8

