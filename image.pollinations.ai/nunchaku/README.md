# Nunchaku Docker Image

This Docker image contains the Nunchaku library optimized for H100 GPUs.

## Building and Pushing the Image

```bash
# Build the Docker image
docker build -t pollinations/nunchaku:h100-cuda12.4 .

# Push to Docker Hub
docker push pollinations/nunchaku:h100-cuda12.4
```

## Running the Container

```bash
# Pull the image (if not built locally)
docker pull pollinations/nunchaku:h100-cuda12.4

# Run the container with GPU support
docker run --gpus all \
  --ipc=host \
  --ulimit memlock=-1 \
  --ulimit stack=67108864 \
  -p 8000:8000 \
  pollinations/nunchaku:h100-cuda12.4
```

### Run Options Explained
- `--gpus all`: Enable GPU support
- `--ipc=host`: Shared memory settings for better performance
- `--ulimit memlock=-1`: Remove memory lock limits
- `--ulimit stack=67108864`: Set stack size limit
- `-p 8000:8000`: Map container port 8000 to host

The image is built with:
- CUDA 12.4.1 with cuDNN
- PyTorch 2.4.1 with CUDA 12.4 support
- H100 (sm_90) architecture support
- Pollinations fork of Nunchaku