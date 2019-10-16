yarn build
tar --exclude='./node_modules' --exclude="./.git" --exclude='release.tgz' -czvf ./release.tgz .