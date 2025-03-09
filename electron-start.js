
const { spawn } = require('child_process');
const { waitOn } = require('wait-on');
const path = require('path');
const electronPath = require('electron');

// Inicia el servidor de desarrollo de Vite
const viteProcess = spawn('npm', ['run', 'dev'], {
  shell: true,
  stdio: 'inherit'
});

// Espera a que el servidor de Vite esté listo
waitOn({
  resources: ['http://localhost:8080'],
  timeout: 30000
}).then(() => {
  // Una vez que el servidor de Vite esté listo, inicia Electron
  const electronProcess = spawn(electronPath, [path.join(__dirname, 'electron/main.js')], {
    env: {
      ...process.env,
      ELECTRON_START_URL: 'http://localhost:8080',
      NODE_ENV: 'development'
    },
    stdio: 'inherit'
  });

  // Maneja la salida del proceso de Electron
  electronProcess.on('close', (code) => {
    console.log(`Electron process exited with code ${code}`);
    // Cuando Electron se cierra, cierra también el servidor de Vite
    viteProcess.kill();
    process.exit(code);
  });
}).catch(err => {
  console.error('Error starting electron:', err);
  viteProcess.kill();
  process.exit(1);
});
