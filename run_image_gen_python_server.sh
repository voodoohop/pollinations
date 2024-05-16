#!/bin/bash
cd ./image_gen
source ~/anaconda3/etc/profile.d/conda.sh
conda activate streamdiffusion
exec bash infinite_loop.sh "python -m predict"
