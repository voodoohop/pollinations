import torch
import time
from diffusers import StableDiffusionXLPipeline, UNet2DConditionModel, EulerDiscreteScheduler
from huggingface_hub import hf_hub_download
from safetensors.torch import load_file
from tqdm import tqdm
from sfast.compilers.diffusion_pipeline_compiler import (compile,
                                                         CompilationConfig)

base = "stabilityai/stable-diffusion-xl-base-1.0"
repo = "ByteDance/SDXL-Lightning"
ckpt = "sdxl_lightning_1step_unet_x0.safetensors" # Use the correct ckpt for your step setting!

# Load model.
unet = UNet2DConditionModel.from_config(base, subfolder="unet").to("cuda", torch.float16)
unet.load_state_dict(load_file(hf_hub_download(repo, ckpt), device="cuda"))
pipe = StableDiffusionXLPipeline.from_pretrained(base, unet=unet, torch_dtype=torch.float16, variant="fp16").to("cuda")

# Ensure sampler uses "trailing" timesteps and "sample" prediction type.
pipe.scheduler = EulerDiscreteScheduler.from_config(pipe.scheduler.config, timestep_spacing="trailing", prediction_type="sample")

# Prompts for generating images
prompts = [
    "An authentic shaman making sushi",
    "A futuristic cityscape at sunset",
    "A dragon flying over a medieval castle",
    "A serene beach with crystal clear water",
    "A bustling market in an ancient town",
    "A spaceship landing on a distant planet",
    "A mystical forest with glowing plants",
    "A robot cooking in a modern kitchen",
    "A majestic mountain range under the stars",
    "A vibrant underwater coral reef"
]

# Generate images and measure time
start_time = time.time()
for i, prompt in enumerate(tqdm(prompts, desc="Generating images")):
    image = pipe(prompt, num_inference_steps=1, guidance_scale=0).images[0]
    image.save(f"output_{i}.png")
    tqdm.write(f"Saved image {i} for prompt: '{prompt}'")
end_time = time.time()

print(f"Time taken to generate 10 images: {end_time - start_time} seconds")
