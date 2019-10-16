yarn build
tar --exclude='./node_modules' --exclude="./.git" -czvf ./release.tgz .