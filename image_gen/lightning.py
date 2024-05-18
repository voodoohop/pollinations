import torch
import time
from diffusers import StableDiffusionXLPipeline, UNet2DConditionModel, EulerDiscreteScheduler
from huggingface_hub import hf_hub_download
from safetensors.torch import load_file
from tqdm import tqdm
from sfast.compilers.diffusion_pipeline_compiler import (compile,
                                                         CompilationConfig)

from diffusers import AutoPipelineForText2Image, DPMSolverMultistepScheduler
import torch

# "GraydientPlatformAPI/boltning-xl"
# 'lykon/dreamshaper-xl-lightning'
pipe = AutoPipelineForText2Image.from_pretrained("GraydientPlatformAPI/boltning-xl")#, torch_dtype=torch.float16, variant="fp16")
pipe.scheduler = DPMSolverMultistepScheduler.from_config(pipe.scheduler.config)
pipe = pipe.to("cuda", dtype=torch.float16)


def sfast_compile(pipe):
    config = CompilationConfig.Default()
# xformers and Triton are suggested for achieving best performance.
    try:
        import xformers
        config.enable_xformers = True
    except ImportError:
        print('xformers not installed, skip')
    try:
        import triton
        config.enable_triton = True
    except ImportError:
        print('Triton not installed, skip')
# CUDA Graph is suggested for small batch sizes and small resolutions to reduce CPU overhead.
# But it can increase the amount of GPU memory used.
# For StableVideoDiffusionPipeline it is not needed.
    config.enable_cuda_graph = True

    pipe = compile(pipe, config)
    return pipe

pipe = sfast_compile(pipe) 

# Prompts for generating images
prompts = [
    "coiffed-hair translucent-ensemble demonstrating Heist hosiery Louboutin heels glamour pose 3",
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

# Generate one image before starting to do the timing
initial_prompt = "A serene beach with crystal clear water"
initial_image = pipe(initial_prompt, num_inference_steps=1, guidance_scale=0).images[0]
initial_image.save("initial_output.png")
tqdm.write(f"Saved initial image for prompt: '{initial_prompt}'")

# Generate images and measure time
start_time = time.time()
for i, prompt in enumerate(tqdm(prompts, desc="Generating images")):
    image = pipe(prompt, num_inference_steps=10, guidance_scale=2, width=1024, height=1024).images[0]
    image.save(f"output_{i}.png")
    tqdm.write(f"Saved image {i} for prompt: '{prompt}'")
end_time = time.time()

print(f"Time taken to generate 10 images: {end_time - start_time} seconds")
