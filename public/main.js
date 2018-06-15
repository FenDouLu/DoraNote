const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const isDev = require('electron-is-dev');
const path = require('path');
const Menu = electron.Menu
const remote = electron.remote;
const dialog = require('electron').dialog
const fs = require('fs');


let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({width: 900, height: 680});
    mainWindow.loadURL(isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, '../build/index.html')}`);

    app.setAboutPanelOptions({
        applicationName: "Mook",
        applicationVersion: "0.0.1",
    })

    mainWindow.on('closed', () => mainWindow = null);
}
app.on('ready', createWindow);


// 打开开发者工具，默认不打开
// mainWindow.webContents.openDevTools();

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});






let template = [
    {
        label: '文件',
        submenu: [
            {
                label: '打开文件',
                accelerator: 'CmdOrCtrl+O',
                click: function (item, focusedWindow) {
                    dialog.showOpenDialog({
                        properties: ['openFile', 'openDirectory',  'multiSelections', 'showHiddenFiles']
                    }, function (files) {

                        if(files === undefined){
                            console.log("No file selected");
                            return false;
                        }


                        console.log("files " + files);

                        openfilename = files[0];

                        fs.readFile(openfilename, 'utf-8', (err, data) => {
                            if(err){
                                alert("An error ocurred reading the file :" + err.message);
                                return;
                            }

                            mainWindow.webContents.send('open-file-messages', data)

                        });

                    })
                }
            },
            {
                label: '保存文件',
                accelerator: 'CmdOrCtrl+S',
                click: function (item, focusedWindow) {


                    dialog.showSaveDialog({
                        type: 'info',
                        buttons: ['OK', 'Cancel'],
                        detail: '本地保存？',
                        properties: ['openFile', 'multiSelections']
                    },(filepath)=>{

                        mainWindow.webContents.send('save-file-messages', filepath);

                    })

                }
            },

            {
                label: '打开项目',
                accelerator: 'CmdOrCtrl+P',
                click: function (item, focusedWindow) {

                    dialog.showOpenDialog({
                        properties: ['openDirectory', 'showHiddenFiles']
                    }, function (files) {

                        if(files === undefined){
                            console.log("No file selected");
                            return false;
                        }


                        opendir = files[0];
                        // console.log("files " + opendir);

                        fs.readdir(opendir, (err, file) => {
                            if (err) {

                                return false;
                            }
                            this.fileslist = []
                            for (let filename of file) {
                                const stat = fs.statSync(path.join(opendir, filename))
                                if (stat.isFile()) {
                                    if (path.extname(filename).toLowerCase() === '.md') {
                                        this.fileslist.push({
                                            filename: filename,
                                            leaf: true
                                        })
                                    }
                                }
                            }

                            // console.log("files " + tableData);

                            mainWindow.webContents.send('open-project-messages',  {
                                fileslist: fileslist,
                                projectname: "project",
                                opendir:opendir
                            });
                        });



                    })
                }
            },



        ]
    },
    {
    label: '编辑',
    submenu: [{
        label: '撤销',
        accelerator: 'CmdOrCtrl+Z',
        role: 'undo'
    }, {
        label: '重做',
        accelerator: 'Shift+CmdOrCtrl+Z',
        role: 'redo'
    }, {
        type: 'separator'
    }, {
        label: '剪切',
        accelerator: 'CmdOrCtrl+X',
        role: 'cut'
    }, {
        label: '复制',
        accelerator: 'CmdOrCtrl+C',
        role: 'copy'
    }, {
        label: '粘贴',
        accelerator: 'CmdOrCtrl+V',
        role: 'paste'
    }, {
        label: '全选',
        accelerator: 'CmdOrCtrl+A',
        role: 'selectall'
    }]
}, {
    label: '查看',
    submenu: [{
        label: '重载',
        accelerator: 'CmdOrCtrl+R',
        click: function (item, focusedWindow) {
            if (focusedWindow) {
                // 重载之后, 刷新并关闭所有的次要窗体
                if (focusedWindow.id === 1) {
                    BrowserWindow.getAllWindows().forEach(function (win) {
                        if (win.id > 1) {
                            win.close()
                        }
                    })
                }
                focusedWindow.reload()
            }
        }
    }, {
        label: '切换全屏',
        accelerator: (function () {
            if (process.platform === 'darwin') {
                return 'Ctrl+Command+F'
            } else {
                return 'F11'
            }
        })(),
        click: function (item, focusedWindow) {
            if (focusedWindow) {
                focusedWindow.setFullScreen(!focusedWindow.isFullScreen())
            }
        }
    }, {
        label: '切换开发者工具',
        accelerator: (function () {
            if (process.platform === 'darwin') {
                return 'Alt+Command+I'
            } else {
                return 'Ctrl+Shift+I'
            }
        })(),
        click: function (item, focusedWindow) {
            if (focusedWindow) {
                focusedWindow.toggleDevTools()
            }
        }
    }, {
        type: 'separator'
    }, {
        label: '应用程序菜单演示',
        click: function (item, focusedWindow) {
            if (focusedWindow) {
                const options = {
                    type: 'info',
                    title: '应用程序菜单演示',
                    buttons: ['好的'],
                    message: '此演示用于 "菜单" 部分, 展示如何在应用程序菜单中创建可点击的菜单项.'
                }
                electron.dialog.showMessageBox(focusedWindow, options, function () {})
            }
        }
    }]
}, {
    label: '窗口',
    role: 'window',
    submenu: [{
        label: '最小化',
        accelerator: 'CmdOrCtrl+M',
        role: 'minimize'
    }, {
        label: '关闭',
        accelerator: 'CmdOrCtrl+W',
        role: 'close'
    }, {
        type: 'separator'
    }, {
        label: '重新打开窗口',
        accelerator: 'CmdOrCtrl+Shift+T',
        enabled: false,
        key: 'reopenMenuItem',
        click: function () {
            app.emit('activate')
        }
    }]
}, {
    label: '帮助',
    role: 'help',
    submenu: [{
        label: '学习更多',
        click: function () {
            electron.shell.openExternal('http://electron.atom.io')
        }
    }]
}]

function addUpdateMenuItems (items, position) {
    if (process.mas) return

    const version = electron.app.getVersion()
    let updateItems = [{
        label: `Version ${version}`,
        enabled: false
    }, {
        label: '正在检查更新',
        enabled: false,
        key: 'checkingForUpdate'
    }, {
        label: '检查更新',
        visible: false,
        key: 'checkForUpdate',
        click: function () {
            require('electron').autoUpdater.checkForUpdates()
        }
    }, {
        label: '重启并安装更新',
        enabled: true,
        visible: false,
        key: 'restartToUpdate',
        click: function () {
            require('electron').autoUpdater.quitAndInstall()
        }
    }]

    items.splice.apply(items, [position, 0].concat(updateItems))
}

function findReopenMenuItem () {
    const menu = Menu.getApplicationMenu()
    if (!menu) return

    let reopenMenuItem
    menu.items.forEach(function (item) {
        if (item.submenu) {
            item.submenu.items.forEach(function (item) {
                if (item.key === 'reopenMenuItem') {
                    reopenMenuItem = item
                }
            })
        }
    })
    return reopenMenuItem
}

if (process.platform === 'darwin') {
    const name = electron.app.getName()
    template.unshift({
        label: name,
        submenu: [{
            label: `关于 ${name}`,
            role: 'about'
        }, {
            type: 'separator'
        }, {
            label: '服务',
            role: 'services',
            submenu: []
        }, {
            type: 'separator'
        }, {
            label: `隐藏 ${name}`,
            accelerator: 'Command+H',
            role: 'hide'
        }, {
            label: '隐藏其它',
            accelerator: 'Command+Alt+H',
            role: 'hideothers'
        }, {
            label: '显示全部',
            role: 'unhide'
        }, {
            type: 'separator'
        }, {
            label: '退出',
            accelerator: 'Command+Q',
            click: function () {
                app.quit()
            }
        }]
    })

    // 窗口菜单.
    template[3].submenu.push({
        type: 'separator'
    }, {
        label: '前置所有',
        role: 'front'
    })

    addUpdateMenuItems(template[0].submenu, 1)
}

if (process.platform === 'win32') {
    const helpMenu = template[template.length - 1].submenu
    addUpdateMenuItems(helpMenu, 0)
}

app.on('ready', function () {
    const menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menu)
})

app.on('browser-window-created', function () {
    let reopenMenuItem = findReopenMenuItem()
    if (reopenMenuItem) reopenMenuItem.enabled = false
})

app.on('window-all-closed', function () {
    let reopenMenuItem = findReopenMenuItem()
    if (reopenMenuItem) reopenMenuItem.enabled = true
})

