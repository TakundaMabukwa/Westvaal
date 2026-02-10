module.exports = {
  apps: [{
    name: 'westvaal-dashboard',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    cwd: '/var/www/Westvaal',
    instances: 1,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
