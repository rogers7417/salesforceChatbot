module.exports = {
  apps: [{
    name: 'sales-chatbot',
    script: 'src/app.js',
    cwd: __dirname,
    env: {
      NODE_ENV: 'production',
    },
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    error_file: 'logs/error.log',
    out_file: 'logs/out.log',
    merge_logs: true,
    autorestart: true,
    max_restarts: 10,
    restart_delay: 5000,
  }],
};
