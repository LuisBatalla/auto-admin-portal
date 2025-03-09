
const { app, BrowserWindow } = require('electron');
const path = require('path');
const url = require('url');

// Mantén una referencia global del objeto window para evitar que la ventana 
// se cierre automáticamente cuando el objeto JavaScript sea eliminado por el recolector de basura.
let mainWindow;

function createWindow() {
  // Crear la ventana del navegador.
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    icon: path.join(__dirname, '../public/favicon.ico')
  });

  // Determina la URL a cargar basada en el entorno
  const startUrl = process.env.ELECTRON_START_URL || url.format({
    pathname: path.join(__dirname, '../dist/index.html'),
    protocol: 'file:',
    slashes: true
  });
  
  // Carga la URL en la ventana
  mainWindow.loadURL(startUrl);

  // Abre las herramientas de desarrollo si estamos en modo desarrollo
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  // Emitido cuando la ventana es cerrada.
  mainWindow.on('closed', function () {
    // Elimina la referencia al objeto window.
    mainWindow = null;
  });
}

// Este método será llamado cuando Electron haya terminado
// la inicialización y esté listo para crear ventanas del navegador.
app.whenReady().then(createWindow);

// Salir cuando todas las ventanas estén cerradas.
app.on('window-all-closed', function () {
  // En macOS es común para las aplicaciones y sus barras de menú
  // que estén activas hasta que el usuario salga explícitamente con Cmd + Q
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', function () {
  // En macOS es común volver a crear una ventana en la aplicación
  // cuando el icono del dock es clickeado y no hay otras ventanas abiertas.
  if (mainWindow === null) createWindow();
});
