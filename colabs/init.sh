echo "APT::Get::force-yes \"true\";"  >> /etc/apt/apt.conf.d/90forceyes

curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion
nvm install 16
nvm use 16

wget https://github.com/pollinations/pollinations/archive/refs/heads/gcloud-gpu.zip
unzip gcloud-gpu.zip
mv pollinations-gcloud-gpu pollinations
cd /pollinations/app && npm run install_backend
cd ~
pip install papermill
papermill /pollinations/colabs/pollinator.ipynb /pollinations/colabs/out.ipynb -p on_colab False -p node_id 123
