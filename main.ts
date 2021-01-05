import { app, BrowserWindow, Menu, session, Tray } from "electron";
import * as path from "path";

// Bug: When the User gets notified. The notification disappears Once the action center gets opened.
// However it should persist until the User chooses to remove the notification.
// This might be helpful: https://stackoverflow.com/questions/47810041/electron-with-node-notifier-display-windows-10-notification

const userAgent =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36";
let tray: Tray;

function createWindow() {
  app.setAppUserModelId("Google Calender");

  const mainWindow = new BrowserWindow({
    title: "Google Calendar",
    width: 1400,
    height: 1000,
    center: true,
    webPreferences: { nodeIntegration: true },
    autoHideMenuBar: true,
    icon: path.join(__dirname, "./logo.png"),
    show: false,
  });

  mainWindow.loadURL("https://calendar.google.com");

  return mainWindow;
}

app.on("ready", () => {
  session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    details.requestHeaders["User-Agent"] = userAgent;
    callback({ cancel: false, requestHeaders: details.requestHeaders });
  });

  const window = createWindow();

  tray = createTray(window);

  window.on("restore", () => {
    window.show();
    window.setSkipTaskbar(false);
    tray.destroy();
  });

  window.on("close", (ev) => {
    ev.preventDefault();
    window.hide();
    if (!tray || tray.isDestroyed()) {
      tray = createTray(window);
    }
  });

  window.on("minimize", () => {
    window.hide();
    if (!tray || tray.isDestroyed()) {
      tray = createTray(window);
    }
  });

  app.on("activate", () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  console.log("exiting app now");
  if (process.platform !== "darwin") {
    app.quit();
  }
});

function createTray(mainWindow: BrowserWindow) {
  const appIcon = new Tray(path.join(__dirname, "./logo.png"));
  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Show",
      click: () => {
        mainWindow.show();
      },
    },
    {
      label: "Exit",
      click: () => {
        app.exit();
      },
    },
  ]);

  appIcon.on("double-click", () => {
    mainWindow.show();
  });

  appIcon.setToolTip("Google Calender");
  appIcon.setContextMenu(contextMenu);
  return appIcon;
}
