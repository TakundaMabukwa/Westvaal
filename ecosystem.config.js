module.exports = {
  apps: [{
    name: 'westvaal-dashboard',
    script: 'node_modules/next/dist/bin/next',
    args: 'start -p 3001',
    cwd: '/var/www/Westvaal',
    instances: 1,
    exec_mode: 'cluster',
    env_file: '/var/www/Westvaal/.env.local',
    env: {
      NODE_ENV: 'production',
      PORT: 3001,
      HOSTNAME: '0.0.0.0'
    },
    error_file: '/var/www/Westvaal/logs/error.log',
    out_file: '/var/www/Westvaal/logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
}
