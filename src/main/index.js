import { app, shell, BrowserWindow, ipcMain } from 'electron'
import path, { join } from 'path'
import fs from 'fs'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import sqlite3 from 'sqlite3';


function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
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
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
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
    optimizer.watchWindowShortcuts(window);
  });

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
    projectOwner TEXT,
    projectBranch TEXT,
    raffleType TEXT,
    raffleCategory TEXT,
    raffleDate TEXT,
    raffleTime TEXT,
    raffleHouseCount INTEGER,
    raffleApplicantCount INTEGER,
    raffleTags TEXT,
    katilimciTableName TEXT,
    konutTableName TEXT
  );

  CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    projectId INTEGER,
    settingKey TEXT,
    settingValue TEXT,
    UNIQUE(projectId, settingKey),
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

// Project-related IPC handlers
// Add a new project
ipcMain.on('add-project', (event, data) => {
  const {
    projectName, projectLocation, projectOwner, projectBranch, raffleType,
    raffleCategory, raffleDate, raffleTime, raffleHouseCount, raffleApplicantCount, raffleTags
  } = data;
  const insertProjectQuery = `
    INSERT INTO projects (
      projectName, projectLocation, projectOwner, projectBranch, raffleType, raffleCategory,
      raffleDate, raffleTime, raffleHouseCount, raffleApplicantCount, raffleTags, katilimciTableName, konutTableName
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '', '');
  `;

  executeQuery(insertProjectQuery, [
    projectName, projectLocation, projectOwner, projectBranch, raffleType,
    raffleCategory, raffleDate, raffleTime, raffleHouseCount, raffleApplicantCount, raffleTags
  ], (err, result) => {
    if (err) {
      event.reply('add-project-response', { success: false, message: err.message });
    } else {
      const projectId = result.lastID;
      const katilimciTableName = `katilimci_${projectId}`;
      const konutTableName = `konut_${projectId}`;

      const updateTableNamesQuery = `
        UPDATE projects
        SET katilimciTableName = ?, konutTableName = ?
        WHERE id = ?;
      `;
      executeQuery(updateTableNamesQuery, [katilimciTableName, konutTableName, projectId], (updateErr) => {
        if (updateErr) {
          event.reply('add-project-response', { success: false, message: updateErr.message });
        } else {
          event.reply('add-project-response', { success: true, projectId, message: projectId });
        }
      });
    }
  });
});

// Update a project
ipcMain.on('edit-project', (event, data) => {
  const {
    id, projectName, projectLocation, projectOwner, projectBranch, raffleType, raffleCategory,
    raffleDate, raffleTime, raffleHouseCount, raffleApplicantCount, raffleTags
  } = data;
  const updateQuery = `
    UPDATE projects
    SET projectName = ?, projectLocation = ?, projectOwner = ?, projectBranch = ?, raffleType = ?,
        raffleCategory = ?, raffleDate = ?, raffleTime = ?, raffleHouseCount = ?,
        raffleApplicantCount = ?, raffleTags = ?
    WHERE id = ?;
  `;

  executeQuery(updateQuery, [
    projectName, projectLocation, projectOwner, projectBranch, raffleType, raffleCategory,
    raffleDate, raffleTime, raffleHouseCount, raffleApplicantCount, raffleTags, id
  ], (err) => {
    if (err) {
      event.reply('edit-project-response', { success: false, message: err.message });
    } else {
      event.reply('edit-project-response', { success: true, project: data });
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

// Project settings-related IPC handlers
// Save project settings
ipcMain.on('save-project-settings', (event, args) => {
  const { projectId, settings } = args;
  const settingsJson = JSON.stringify(settings);
  const insertQuery = `
    INSERT INTO settings (projectId, settingKey, settingValue)
    VALUES (?, 'projectSettings', ?)
    ON CONFLICT(projectId, settingKey) DO UPDATE SET settingValue = excluded.settingValue;
  `;

  executeQuery(insertQuery, [projectId, settingsJson], (err) => {
    if (err) {
      event.reply('save-project-settings-response', { success: false, message: err.message });
    } else {
      event.reply('save-project-settings-response', { success: true });
    }
  });
});

// Retrieve project settings
ipcMain.on('get-project-settings', (event, projectId) => {
  const selectQuery = `
    SELECT settingValue FROM settings WHERE projectId = ? AND settingKey = 'projectSettings';
  `;

  db.get(selectQuery, [projectId], (err, row) => {
    if (err) {
      event.reply('get-project-settings-response', { success: false, message: err.message });
    } else {
      const settings = row ? JSON.parse(row.settingValue) : null;
      event.reply('get-project-settings-response', { success: true, settings });
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

// Katilimci-related IPC handlers
// Create katilimcilar table later when attributes are provided
ipcMain.on('create-katilimcilar-table', (event, args) => {
  const { projectId, attributes } = args;
  const getTableNameQuery = `SELECT katilimciTableName FROM projects WHERE id = ?;`;

  db.get(getTableNameQuery, [projectId], (err, row) => {
    if (err) {
      event.reply('create-katilimcilar-table-response', { success: false, message: err.message });
      return;
    }
    const tableName = row.katilimciTableName;
    const columns = attributes.map(attr => `${attr} TEXT`).join(', ');
    const createTableQuery = `CREATE TABLE IF NOT EXISTS ${tableName} (id INTEGER PRIMARY KEY AUTOINCREMENT, ${columns});`;

    db.run(createTableQuery, [], (err) => {
      if (err) {
        event.reply('create-katilimcilar-table-response', { success: false, message: err.message });
      } else {
        event.reply('create-katilimcilar-table-response', { success: true });
      }
    });
  });
});

// Add katilimcilar
ipcMain.on('add-katilimcilar', (event, args) => {
  const { projectId, data } = args;
  const getTableNameQuery = `SELECT katilimciTableName FROM projects WHERE id = ?;`;

  db.get(getTableNameQuery, [projectId], (err, row) => {
    if (err) {
      event.reply('add-katilimcilar-response', { success: false, message: err.message });
      return;
    }
    const tableName = row.katilimciTableName;
    const columns = Object.keys(data[0]).join(', ');
    const placeholders = Object.keys(data[0]).map(() => '?').join(', ');
    const insertQuery = `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders});`;

    db.serialize(() => {
      for (const row of data) {
        const values = Object.values(row);
        executeQuery(insertQuery, values, (err) => {
          if (err) {
            console.error('Error in insert operation:', err.message);
          }
        });
      }
      event.reply('add-katilimcilar-response', { success: true });
    });
  });
});

// Get all katilimcilar
ipcMain.on('get-katilimcilar', (event, projectId) => {
  const getTableNameQuery = `SELECT katilimciTableName FROM projects WHERE id = ?;`;

  db.get(getTableNameQuery, [projectId], (err, row) => {
    if (err) {
      event.reply('get-katilimcilar-response', { success: false, message: err.message });
      return;
    }
    const tableName = row.katilimciTableName;
    const selectQuery = `SELECT * FROM ${tableName};`;

    db.all(selectQuery, [], (err, rows) => {
      if (err) {
        event.reply('get-katilimcilar-response', { success: false, message: err.message });
      } else {
        event.reply('get-katilimcilar-response', { success: true, data: rows });
      }
    });
  });
});

// Update a single cell in the katilimcilar table
ipcMain.on('update-katilimci-cell', (event, { projectId, id, field, value }) => {
  const getTableNameQuery = `SELECT katilimciTableName FROM projects WHERE id = ?;`;

  db.get(getTableNameQuery, [projectId], (err, row) => {
    if (err) {
      event.reply('update-katilimci-cell-response', { success: false, message: err.message });
      return;
    }
    const tableName = row.katilimciTableName;
    const updateQuery = `
      UPDATE ${tableName}
      SET ${field} = ?
      WHERE id = ?;
    `;

    executeQuery(updateQuery, [value, id], (err) => {
      if (err) {
        event.reply('update-katilimci-cell-response', { success: false, message: err.message });
      } else {
        event.reply('update-katilimci-cell-response', { success: true });
      }
    });
  });
});

// Update a single row in the katilimcilar table
ipcMain.on('update-katilimci-row', (event, { projectId, updatedRow }) => {
  const getTableNameQuery = `SELECT katilimciTableName FROM projects WHERE id = ?;`;

  db.get(getTableNameQuery, [projectId], (err, row) => {
    if (err) {
      event.reply('update-katilimci-row-response', { success: false, message: err.message });
      return;
    }
    const tableName = row.katilimciTableName;
    const { id, ...rest } = updatedRow;
    const setClause = Object.keys(rest).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(rest), id];
    const updateQuery = `
      UPDATE ${tableName}
      SET ${setClause}
      WHERE id = ?;
    `;

    executeQuery(updateQuery, values, (err) => {
      if (err) {
        event.reply('update-katilimci-row-response', { success: false, message: err.message });
      } else {
        event.reply('update-katilimci-row-response', { success: true, values: values, row: updatedRow });
      }
    });
  });
});

// Delete all katilimcilar for a project
ipcMain.on('delete-katilimcilar', (event, projectId) => {
  const getTableNameQuery = `SELECT katilimciTableName FROM projects WHERE id = ?;`;

  db.get(getTableNameQuery, [projectId], (err, row) => {
    if (err) {
      event.reply('delete-katilimcilar-response', { success: false, message: err.message });
      return;
    }
    const tableName = row.katilimciTableName;
    const deleteQuery = `DELETE FROM ${tableName};`;

    executeQuery(deleteQuery, [], (err) => {
      if (err) {
        event.reply('delete-katilimcilar-response', { success: false, message: err.message });
      } else {
        event.reply('delete-katilimcilar-response', { success: true });
      }
    });
  });
});

// Delete katilimci table
ipcMain.on('delete-katilimci-table', (event, projectId) => {
  const getTableNameQuery = `SELECT katilimciTableName FROM projects WHERE id = ?;`;

  db.get(getTableNameQuery, [projectId], (err, row) => {
    if (err) {
      event.reply('delete-katilimci-table-response', { success: false, message: err.message });
      return;
    }
    const tableName = row.katilimciTableName;
    const deleteTableQuery = `DROP TABLE IF EXISTS ${tableName};`;

    db.run(deleteTableQuery, [], (err) => {
      if (err) {
        event.reply('delete-katilimci-table-response', { success: false, message: err.message });
      } else {
        event.reply('delete-katilimci-table-response', { success: true });
      }
    });
  });
});

// Delete a single row in the katilimcilar table
ipcMain.on('delete-katilimci-row', (event, args) => {
  const { projectId, rowId } = args;
  const getTableNameQuery = `SELECT katilimciTableName FROM projects WHERE id = ?;`;

  db.get(getTableNameQuery, [projectId], (err, row) => {
    if (err) {
      event.reply('delete-katilimci-row-response', { success: false, message: err.message });
      return;
    }
    const tableName = row.katilimciTableName;
    const deleteQuery = `DELETE FROM ${tableName} WHERE id = ?;`;

    executeQuery(deleteQuery, [rowId], (err) => {
      if (err) {
        event.reply('delete-katilimci-row-response', { success: false, message: err.message });
      } else {
        event.reply('delete-katilimci-row-response', { success: true, row: row, rowId: rowId });
      }
    });
  });
});

// Konut-related IPC handlers
// Create konutlar table later when attributes are provided
ipcMain.on('create-konutlar-table', (event, args) => {
  const { projectId, attributes } = args;
  const getTableNameQuery = `SELECT konutTableName FROM projects WHERE id = ?;`;

  db.get(getTableNameQuery, [projectId], (err, row) => {
    if (err) {
      event.reply('create-konutlar-table-response', { success: false, message: err.message });
      return;
    }
    const tableName = row.konutTableName;
    const columns = attributes.map(attr => `${attr.key} TEXT`).join(', ');
    const createTableQuery = `CREATE TABLE IF NOT EXISTS ${tableName} (id INTEGER PRIMARY KEY AUTOINCREMENT, ${columns});`;

    db.run(createTableQuery, [], (err) => {
      if (err) {
        event.reply('create-konutlar-table-response', { success: false, message: err.message });
      } else {
        event.reply('create-konutlar-table-response', { success: true });
      }
    });
  });
});

// Add konutlar
ipcMain.on('add-konutlar', (event, args) => {
  const { projectId, data } = args;
  const getTableNameQuery = `SELECT konutTableName FROM projects WHERE id = ?;`;

  db.get(getTableNameQuery, [projectId], (err, row) => {
    if (err) {
      event.reply('add-konutlar-response', { success: false, message: err.message });
      return;
    }
    const tableName = row.konutTableName;
    const columns = Object.keys(data[0]).join(', ');
    const placeholders = Object.keys(data[0]).map(() => '?').join(', ');
    const insertQuery = `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders});`;

    db.serialize(() => {
      for (const row of data) {
        const values = Object.values(row);
        executeQuery(insertQuery, values, (err) => {
          if (err) {
            console.error('Error in insert operation:', err.message);
          }
        });
      }
      event.reply('add-konutlar-response', { success: true });
    });
  });
});

// Get all konutlar
ipcMain.on('get-konutlar', (event, projectId) => {
  const getTableNameQuery = `SELECT konutTableName FROM projects WHERE id = ?;`;

  db.get(getTableNameQuery, [projectId], (err, row) => {
    if (err) {
      event.reply('get-konutlar-response', { success: false, message: err.message });
      return;
    }
    const tableName = row.konutTableName;
    const selectQuery = `SELECT * FROM ${tableName};`;

    db.all(selectQuery, [], (err, rows) => {
      if (err) {
        event.reply('get-konutlar-response', { success: false, message: err.message });
      } else {
        event.reply('get-konutlar-response', { success: true, data: rows });
      }
    });
  });
});

// Delete all konutlar for a project
ipcMain.on('delete-konutlar', (event, projectId) => {
  const getTableNameQuery = `SELECT konutTableName FROM projects WHERE id = ?;`;

  db.get(getTableNameQuery, [projectId], (err, row) => {
    if (err) {
      event.reply('delete-konutlar-response', { success: false, message: err.message });
      return;
    }
    const tableName = row.konutTableName;
    const deleteQuery = `DELETE FROM ${tableName};`;

    executeQuery(deleteQuery, [], (err) => {
      if (err) {
        event.reply('delete-konutlar-response', { success: false, message: err.message });
      } else {
        event.reply('delete-konutlar-response', { success: true });
      }
    });
  });
});

// Delete konut table
ipcMain.on('delete-konut-table', (event, projectId) => {
  const getTableNameQuery = `SELECT konutTableName FROM projects WHERE id = ?;`;

  db.get(getTableNameQuery, [projectId], (err, row) => {
    if (err) {
      event.reply('delete-konut-table-response', { success: false, message: err.message });
      return;
    }
    const tableName = row.konutTableName;
    const deleteTableQuery = `DROP TABLE IF EXISTS ${tableName};`;

    db.run(deleteTableQuery, [], (err) => {
      if (err) {
        event.reply('delete-konut-table-response', { success: false, message: err.message });
      } else {
        event.reply('delete-konut-table-response', { success: true });
      }
    });
  });
});

// Delete a single row in the konutlar table
ipcMain.on('delete-konut-row', (event, args) => {
  const { projectId, rowId } = args;
  const getTableNameQuery = `SELECT konutTableName FROM projects WHERE id = ?;`;

  db.get(getTableNameQuery, [projectId], (err, row) => {
    if (err) {
      event.reply('delete-konut-row-response', { success: false, message: err.message });
      return;
    }
    const tableName = row.konutTableName;
    const deleteQuery = `DELETE FROM ${tableName} WHERE id = ?;`;

    executeQuery(deleteQuery, [rowId], (err) => {
      if (err) {
        event.reply('delete-konut-row-response', { success: false, message: err.message });
      } else {
        event.reply('delete-konut-row-response', { success: true });
      }
    });
  });
});

// Check if katilimci table exists
ipcMain.on('check-katilimcilar-table', (event, args) => {
  const { projectId } = args;
  const getTableNameQuery = `SELECT katilimciTableName FROM projects WHERE id = ?;`;

  db.get(getTableNameQuery, [projectId], (err, row) => {
    if (err) {
      event.reply('check-katilimcilar-table-response', { success: false, exists: false, message: err.message });
      return;
    }
    if (!row) {
      event.reply('check-katilimcilar-table-response', { success: false, exists: false, message: 'Project not found' });
      return;
    }
    const tableName = row.katilimciTableName;
    const checkTableQuery = `SELECT 1 FROM ${tableName} LIMIT 1;`;

    db.get(checkTableQuery, [], (err) => {
      if (err) {
        if (err.message.includes('no such table')) {
          event.reply('check-katilimcilar-table-response', { success: true, exists: false });
        } else {
          event.reply('check-katilimcilar-table-response', { success: false, exists: false, message: err.message });
        }
      } else {
        event.reply('check-katilimcilar-table-response', { success: true, exists: true });
      }
    });
  });
});

// Check if konutlar table exists
ipcMain.on('check-konutlar-table', (event, args) => {
  const { projectId } = args;
  const getTableNameQuery = `SELECT konutTableName FROM projects WHERE id = ?;`;

  db.get(getTableNameQuery, [projectId], (err, row) => {
    if (err) {
      event.reply('check-konutlar-table-response', { success: false, exists: false, message: err.message });
      return;
    }
    if (!row) {
      event.reply('check-konutlar-table-response', { success: false, exists: false, message: 'Project not found' });
      return;
    }
    const tableName = row.konutTableName;
    const checkTableQuery = `SELECT 1 FROM ${tableName} LIMIT 1;`;

    db.get(checkTableQuery, [], (err) => {
      if (err) {
        if (err.message.includes('no such table')) {
          event.reply('check-konutlar-table-response', { success: true, exists: false });
        } else {
          event.reply('check-konutlar-table-response', { success: false, exists: false, message: err.message });
        }
      } else {
        event.reply('check-konutlar-table-response', { success: true, exists: true });
      }
    });
  });
});