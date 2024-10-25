const { app, BrowserWindow, dialog, ipcMain } = require('electron');


ipcMain.handle('dialog:openFile', async () => {
    const result = await dialog.showOpenDialog({ properties: ['openFile'] });

    return result.filePaths;
});


let settingsWindow;
let displayWindow;


function createSettingsWindow() {
    settingsWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        }
    });

    settingsWindow.loadFile('src/settings/settings.html');

    settingsWindow.webContents.openDevTools();

    settingsWindow.on('closed', () => {
        if (displayWindow) {
            displayWindow.close();
        }
        
        settingsWindow = null;
    });
}


function createDisplayWindow() {
    displayWindow = new BrowserWindow({
        width: 800,
        height: 600,
        transparent: true,
        alwaysOnTop: true,
        // autoHideMenuBar: true,
        frame: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        }
    });

    displayWindow.loadFile('src/display/display.html');
}

app.whenReady().then(() => {
    createSettingsWindow();
    createDisplayWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createSettingsWindow();
            createDisplayWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});