const https = require("https");
const { exec } = require('child_process');
const package = require('./package.json')

const version = package['version']

const tagVersion = `v${version}`

options = {
    host: 'api.github.com',
    path: '/repos/cobowallet/crypto-coin-kit/releases/latest',
    method: 'GET',
    headers: {'user-agent': 'node.js'}
}


https.get(options, res => {
    res.setEncoding("utf8");
    let body = "";
    res.on("data", data => {
      body += data;
    });
    res.on("end", () => {
      result = JSON.parse(body);
      const tag = result['tag_name']
      console.log('current version:', tag)
      if(tag ==tagVersion) {
        console.log('skip this build')
      } else {
        exec(`git tag ${tagVersion}`)
        exec(`git push origin ${tagVersion}`)        
      }
    });
});
