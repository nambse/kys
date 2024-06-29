import { app, shell, BrowserWindow, ipcMain } from 'electron'
import path, { join } from 'path'
import fs from 'fs'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import sqlite3 from 'sqlite3';


function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: false,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      nodeIntegration: true,
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.

// Path to the database file
const dbFilePath = path.join('DB', 'kys.db');

// Ensure the database directory exists
if (!fs.existsSync('DB')) {
  fs.mkdirSync('DB', { recursive: true });
}

// Open the database connection
const db = new sqlite3.Database(dbFilePath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

// SQL queries to create the necessary tables
const createTablesQuery = `
  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    projectName TEXT,
    projectLocation TEXT,
    raffleTimeout DOUBLE,
    raffleUserCount INTEGER
  );
  
  CREATE TABLE IF NOT EXISTS katilimcilar (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    projectId INTEGER,
    siraNo TEXT UNIQUE,
    adSoyad TEXT,
    basvuruNo TEXT,
    asilYedek TEXT,
    basvuruKategorisi TEXT,
    tc TEXT,
    il TEXT,
    ilce TEXT,
    mahalle TEXT,
    huid TEXT,
    FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE
  );
  
  CREATE TABLE IF NOT EXISTS konutlar (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    projectId INTEGER,
    konutSiraNo TEXT UNIQUE,
    bbNo TEXT,
    etap TEXT,
    blokNo TEXT,
    katNo TEXT,
    daireNo TEXT,
    odaSayisi TEXT,
    brüt TEXT,
    FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    projectId INTEGER,
    settingKey TEXT,
    settingValue TEXT,
    FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE
  );
`;

// Execute the table creation queries
db.serialize(() => {
  db.exec(createTablesQuery, (err) => {
    if (err) {
      console.error('Error creating tables:', err.message);
    }
  });
});

// Helper function to handle database operations with error logging
function executeQuery(query, params = [], callback) {
  db.run(query, params, function (err) {
    if (err) {
      console.error('Error executing query:', err.message);
      callback(err);
    } else {
      callback(null, this);
    }
  });
}

// Add a new project
ipcMain.on('add-project', (event, data) => {
  const { projectName, projectLocation, raffleTimeout, raffleUserCount } = data;
  const insertQuery = `
    INSERT INTO projects (projectName, projectLocation, raffleTimeout, raffleUserCount)
    VALUES (?, ?, ?, ?);
  `;

  executeQuery(insertQuery, [projectName, projectLocation, raffleTimeout, raffleUserCount], (err, result) => {
    if (err) {
      event.reply('add-project-response', { success: false, message: err.message });
    } else {
      event.reply('add-project-response', { success: true, projectId: result.lastID });
    }
  });
});

// Update a project
ipcMain.on('edit-project', (event, data) => {
  const { id, projectName, projectLocation, raffleTimeout, raffleUserCount } = data;
  const updateQuery = `
    UPDATE projects
    SET projectName = ?, projectLocation = ?, raffleTimeout = ?, raffleUserCount = ?
    WHERE id = ?;
  `;

  executeQuery(updateQuery, [projectName, projectLocation, raffleTimeout, raffleUserCount, id], (err) => {
    if (err) {
      event.reply('edit-project-response', { success: false, message: err.message });
    } else {
      event.reply('edit-project-response', { success: true });
    }
  });
});

// Delete a project
ipcMain.on('delete-project', (event, projectId) => {
  const deleteQuery = `
    DELETE FROM projects WHERE id = ?;
  `;

  executeQuery(deleteQuery, [projectId], (err) => {
    if (err) {
      event.reply('delete-project-response', { success: false, message: err.message });
    } else {
      event.reply('delete-project-response', { success: true });
    }
  });
});

// List all projects
ipcMain.on('get-projects', (event) => {
  const selectQuery = `
    SELECT * FROM projects;
  `;

  db.all(selectQuery, [], (err, rows) => {
    if (err) {
      event.reply('get-projects-response', { success: false, message: err.message });
    } else {
      event.reply('get-projects-response', { success: true, data: rows });
    }
  });
});

// Add katilimcilar
ipcMain.on('add-katilimcilar', (event, args) => {
  const { projectId, data } = args;
  const insertQuery = `
    INSERT INTO katilimcilar (projectId, siraNo, adSoyad, basvuruNo, asilYedek, basvuruKategorisi, tc, il, ilce, mahalle, huid)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(siraNo) DO UPDATE SET 
      adSoyad=excluded.adSoyad, 
      basvuruNo=excluded.basvuruNo, 
      asilYedek=excluded.asilYedek, 
      basvuruKategorisi=excluded.basvuruKategorisi, 
      tc=excluded.tc, 
      il=excluded.il, 
      ilce=excluded.ilce, 
      mahalle=excluded.mahalle, 
      huid=excluded.huid;
  `;

  db.serialize(() => {
    for (const row of data) {
      executeQuery(insertQuery, [projectId, row.siraNo, row.adSoyad, row.basvuruNo, row.asilYedek, row.basvuruKategorisi, row.tc, row.il, row.ilce, row.mahalle, row.huid], (err) => {
        if (err) {
          console.error('Error in upsert operation:', err.message);
        }
      });
    }
    event.reply('add-katilimcilar-response', { success: true });
  });
});

// Get all katilimcilar
ipcMain.on('get-katilimcilar', (event, projectId) => {
  const selectQuery = `
    SELECT * FROM katilimcilar WHERE projectId = ?;
  `;

  db.all(selectQuery, [projectId], (err, rows) => {
    if (err) {
      event.reply('get-katilimcilar-response', { success: false, message: err.message });
    } else {
      event.reply('get-katilimcilar-response', { success: true, data: rows });
    }
  });
});

// Delete all katilimcilar for a project
ipcMain.on('delete-katilimcilar', (event, projectId) => {
  const deleteQuery = `
    DELETE FROM katilimcilar WHERE projectId = ?;
  `;

  executeQuery(deleteQuery, [projectId], (err) => {
    if (err) {
      event.reply('delete-katilimcilar-response', { success: false, message: err.message });
    } else {
      event.reply('delete-katilimcilar-response', { success: true });
    }
  });
});

// Add konutlar
ipcMain.on('add-konutlar', (event, args) => {
  const { projectId, data } = args;
  const insertQuery = `
    INSERT INTO konutlar (projectId, konutSiraNo, bbNo, etap, blokNo, katNo, daireNo, odaSayisi, brüt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(konutSiraNo) DO UPDATE SET 
      bbNo=excluded.bbNo, 
      etap=excluded.etap, 
      blokNo=excluded.blokNo, 
      katNo=excluded.katNo, 
      daireNo=excluded.daireNo, 
      odaSayisi=excluded.odaSayisi, 
      brüt=excluded.brüt;
  `;

  db.serialize(() => {
    for (const row of data) {
      executeQuery(insertQuery, [projectId, row.konutSiraNo, row.bbNo, row.etap, row.blokNo, row.katNo, row.daireNo, row.odaSayisi, row.brüt], (err) => {
        if (err) {
          console.error('Error in upsert operation:', err.message);
        }
      });
    }
    event.reply('add-konutlar-response', { success: true });
  });
});

// Get all konutlar
ipcMain.on('get-konutlar', (event, projectId) => {
  const selectQuery = `
    SELECT * FROM konutlar WHERE projectId = ?;
  `;

  db.all(selectQuery, [projectId], (err, rows) => {
    if (err) {
      event.reply('get-konutlar-response', { success: false, message: err.message });
    } else {
      event.reply('get-konutlar-response', { success: true, data: rows });
    }
  });
});

// Delete all konutlar for a project
ipcMain.on('delete-konutlar', (event, projectId) => {
  const deleteQuery = `
    DELETE FROM konutlar WHERE projectId = ?;
  `;

  executeQuery(deleteQuery, [projectId], (err) => {
    if (err) {
      event.reply('delete-konutlar-response', { success: false, message: err.message });
    } else {
      event.reply('delete-konutlar-response', { success: true });
    }
  });
});

// Add settings
ipcMain.on('add-settings', (event, args) => {
  const { projectId, data } = args;
  const insertQuery = `
    INSERT INTO settings (projectId, settingKey, settingValue)
    VALUES (?, ?, ?)
    ON CONFLICT(settingKey) DO UPDATE SET 
      settingValue=excluded.settingValue;
  `;

  db.serialize(() => {
    for (const row of data) {
      executeQuery(insertQuery, [projectId, row.settingKey, row.settingValue], (err) => {
        if (err) {
          console.error('Error in upsert operation:', err.message);
        }
      });
    }
    event.reply('add-settings-response', { success: true });
  });
});

// Get settings
ipcMain.on('get-settings', (event, projectId) => {
  const selectQuery = `
    SELECT * FROM settings WHERE projectId = ?;
  `;

  db.all(selectQuery, [projectId], (err, rows) => {
    if (err) {
      event.reply('get-settings-response', { success: false, message: err.message });
    } else {
      event.reply('get-settings-response', { success: true, data: rows });
    }
  });
});

// Update settings
ipcMain.on('edit-settings', (event, args) => {
  const { projectId, settingKey, settingValue } = args;
  const updateQuery = `
    UPDATE settings
    SET settingValue = ?
    WHERE projectId = ? AND settingKey = ?;
  `;

  executeQuery(updateQuery, [settingValue, projectId, settingKey], (err) => {
    if (err) {
      event.reply('edit-settings-response', { success: false, message: err.message });
    } else {
      event.reply('edit-settings-response', { success: true });
    }
  });
});

// Get project details
ipcMain.on('get-project-details', (event, projectId) => {
    const selectQuery = `
      SELECT * FROM projects WHERE id = ?;
    `;
  
    db.get(selectQuery, [projectId], (err, row) => {
      if (err) {
        event.reply('get-project-details-response', { success: false, message: err.message });
      } else {
        event.reply('get-project-details-response', { success: true, projectInfo: row });
      }
    });
  });

// Update a single cell in the katilimcilar table
ipcMain.on('update-katilimci-cell', (event, { projectId, id, field, value }) => {
  console.log("update katilimci worked");
  const updateQuery = `
    UPDATE katilimcilar
    SET ${field} = ?
    WHERE id = ? AND projectId = ?;
  `;

  executeQuery(updateQuery, [value, id, projectId], (err) => {
    if (err) {
      event.reply('update-katilimci-cell-response', { success: false, message: err.message });
    } else {
      event.reply('update-katilimci-cell-response', { success: true });
    }
  });
});

// Update a single row in the katilimcilar table
ipcMain.on('update-katilimci-row', (event, { projectId, updatedRow }) => {
  const { id, siraNo, adSoyad, basvuruNo, asilYedek, basvuruKategorisi, tc, il, ilce, mahalle, huid } = updatedRow;
  const updateQuery = `
    UPDATE katilimcilar
    SET siraNo = ?, adSoyad = ?, basvuruNo = ?, asilYedek = ?, basvuruKategorisi = ?, tc = ?, il = ?, ilce = ?, mahalle = ?, huid = ?
    WHERE id = ? AND projectId = ?;
  `;

  executeQuery(updateQuery, [siraNo, adSoyad, basvuruNo, asilYedek, basvuruKategorisi, tc, il, ilce, mahalle, huid, id, projectId], (err) => {
    if (err) {
      event.reply('update-katilimci-row-response', { success: false, message: err.message });
    } else {
      event.reply('update-katilimci-row-response', { success: true });
    }
  });
});
