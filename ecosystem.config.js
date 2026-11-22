module.exports = {
  apps: [
    {
      name: 'shortedge-api',
      cwd: './server',
      script: 'dist/index.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      }
    },
    {
      name: 'shortedge-client',
      cwd: './client',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3000',
      instances: 1,
      env: {
        NODE_ENV: 'production'
      }
    },
    {
      name: 'shortedge-vendor',
      cwd: './vendor',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3001',
      instances: 1,
      env: {
        NODE_ENV: 'production'
      }
    },
    {
      name: 'shortedge-admin',
      cwd: './admin',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3002',
      instances: 1,
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};
