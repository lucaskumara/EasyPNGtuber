const { app, BrowserWindow, dialog, ipcMain } = require('electron');


ipcMain.handle('dialog:openFile', async () => {
    const result = await dialog.showOpenDialog({ properties: ['openFile'] });

    return result.filePaths;
});


function createSettingsWindow() {
    const window = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        }
    });

    window.loadFile('src/settings/settings.html');

    window.webContents.openDevTools();
}


function createDisplayWindow() {
    const window = new BrowserWindow({
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

    window.loadFile('src/display/display.html');
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