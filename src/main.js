const { BrowserWindow, app, Menu, dialog} = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
let mainWindow;

const [winWidth, winHeight] = [1000, 800];

const template = [
    {
        label: 'File',
        submenu: [
            {
                label: 'Open File',
                accelerator: 'Ctrl+O',
                click: async () => {
                    const { filePaths } = await dialog.showOpenDialog(
                        { properties: ['openFile'], filters: [{ name: 'Book File', extensions: ['pdf'] }] }
                    );
                    const location = filePaths[0];
                    mainWindow.webContents.send('file', location);
                }
            },
            {
                label: 'Home Page',
                accelerator: 'Ctrl+Shift+H',
                click: () => {
                    mainWindow.webContents.send('home');
                }
            }
        ]
    },
    { role: 'editMenu' },
    { role: 'windowMenu' },
]

function createWindow() {
    mainWindow = new BrowserWindow({
        width: winWidth,
        height: winHeight,
        title: 'Megatheos',
        icon: path.join(__dirname, 'icon.png'),
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            devTools: isDev
        }
    })

    mainWindow.loadFile('public/index.html');

    if (isDev) {
        template.push({ role: 'viewMenu' })
    }

    // Create custom Menu
    const menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menu)
}

app.whenReady().then(() => {
    createWindow()

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
})