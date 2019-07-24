module.exports = {
  apps: [{
    name: 'claggi-deploy',
    script: 'app.js'
  }],
  deploy: {
    production: {
      user: 'ubuntu',
      host: 'ec2-18-191-133-154.us-east-2.compute.amazonaws.com',
      key: '~/.ssh/claggi-dev.pem',
      ref: 'origin/master',
      repo: 'git@github.com:brandonhenry/claggi-api.git',
      path: '/home/ubuntu/claggi-api',
      'post-deploy': 'npm install && pm2 startOrRestart ecosystem.config.js'
    }
  }
}