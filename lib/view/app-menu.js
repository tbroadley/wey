const gui = require('gui')

const accountManager = require('../controller/account-manager')

class AppMenu {
  constructor(win) {
    const menus = []

    // The main menu.
    if (process.platform === 'darwin') {
      menus.push({
        label: require('../../package.json').productName,
        submenu: [
          {
            label: 'Quit',
            accelerator: 'Cmd+Q',
            onClick() { require('../controller/window-manager').quit() },
          },
        ],
      })
    }

    // Edit menu.
    menus.push({
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'select-all' },
      ],
    })

    // Accounts menu.
    this.accountsMenu = gui.Menu.create([
      { type: 'separator' },
    ])
    for (const account of accountManager.accounts)
      this.addAccount(account)
    for (const service of accountManager.getServices()) {
      this.accountsMenu.append(gui.MenuItem.create({
        label: 'Login to ' + service.name,
        onClick: service.login.bind(service),
      }))
    }
    menus.push({label: 'Accounts', submenu: this.accountsMenu})
    this.subscriptions = {
      onAddAccount: accountManager.onAddAccount.add(this.addAccount.bind(this)),
      onRemoveAccount: accountManager.onRemoveAccount.add(this.removeAccount.bind(this)),
    }

    // Windows menu.
    menus.push({
      label: 'Window',
      role: 'window',
      submenu: [
        {
          label: 'New Window',
          accelerator: 'CmdOrCtrl+Shift+N',
          onClick: this.newWindow.bind(this),
        },
        {
          label: 'Close Window',
          accelerator: 'CmdOrCtrl+W',
          onClick: this.closeWindow.bind(this, win),
        },
      ],
    })

    // Create the native menu.
    this.menu = gui.MenuBar.create(menus)
  }

  addAccount(account) {
    const i = accountManager.accounts.length
    const item = gui.MenuItem.create({
      label: account.name,
      accelerator: `CmdOrCtrl+${i + 1}`,
      onClick: () => { accountManager.onSelectAccount.dispatch(account) },
    })
    this.accountsMenu.insert(item, i)
  }

  removeAccount(account) {
    const i = accountManager.accounts.indexOf(account)
    this.accountsMenu.remove(this.accountsMenu.itemAt(i))
  }

  newWindow() {
    const MainWindow = require('./main-window')
    new MainWindow()
  }

  closeWindow(win) {
    if (process.platform === 'darwin') {
      for (const win of require('../controller/window-manager').windows) {
        if (win.window.isActive()) {
          win.window.close()
          break
        }
      }
    } else {
      win.window.close()
    }
  }
}

module.exports = AppMenu