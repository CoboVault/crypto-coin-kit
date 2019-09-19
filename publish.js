const { exec } = require('child_process');
const package = require('./package.json')

exec('git pull origin master -r ')

const version = package['version']

const tagVersion = `v${version}`

exec(`git tag ${tagVersion}`)

exec(`git push origin ${tagVersion}`)
