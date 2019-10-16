yarn build
touch release.tgz
tar --exclude='./node_modules' --exclude="./.git" --exclude='release.tgz' -czvf ./release.tgz .