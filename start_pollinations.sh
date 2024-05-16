#!/bin/bash
echo "Starting streamdiffusion in a new screen session..."
screen -dmS streamdiffusion bash -l -c 'cd ./image_gen; source ~/anaconda3/etc/profile.d/conda.sh; conda activate streamdiffusion; exec bash infinite_loop.sh "python -m predict"'
echo "Launching image generation server..."
screen -S streamdiffusion -X screen bash -l -c 'cd ./image_gen_server; node index_latent_consistency.js '
echo "Starting libretranslate..."
screen -S streamdiffusion -X screen bash -l -c 'libretranslate &'
echo "Activating virtual environment and starting pollinations.ai-bot..."
screen -S streamdiffusion -X screen bash -l -c 'cd /home/ubuntu/pollinations.ai-bot; source .venv/bin/activate; exec python -m main'``