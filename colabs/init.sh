wget https://github.com/pollinations/pollinations/archive/refs/heads/gcloud-gpu.zip
unzip gcloud-gpu.zip
mv pollinations-gcloud-gpu pollinations
pip install papermill
papermill pollinations/colabs/pollinator.ipynb pollinations/colabs/out.ipynb