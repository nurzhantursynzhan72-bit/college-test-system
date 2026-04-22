const { spawn } = require('child_process');

function run(command, args, name) {
  const child = spawn(command, args, {
    stdio: 'inherit',
    shell: process.platform === 'win32'
  });
  child.on('exit', (code) => {
    if (code && code !== 0) {
      process.exitCode = code;
      console.error(`[${name}] exited with code ${code}`);
    }
  });
  return child;
}

const server = run('npm', ['run', 'dev:server'], 'server');
const client = run('npm', ['run', 'dev:client'], 'client');

function shutdown() {
  server.kill();
  client.kill();
}

process.on('SIGINT', () => {
  shutdown();
  process.exit(0);
});
process.on('SIGTERM', () => {
  shutdown();
  process.exit(0);
});

