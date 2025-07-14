import { app, BrowserWindow, Menu, shell, ipcMain } from 'electron'
import path from 'path'
import { isDev } from './utils'
import { existsSync } from 'fs'

let mainWindow: BrowserWindow | null = null
let loadAttempts = 0
const MAX_LOAD_ATTEMPTS = 3

async function createWindow(): Promise<void> {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 1000,
    minHeight: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: !isDev, // Disable only for development
      allowRunningInsecureContent: isDev,
      experimentalFeatures: false,
      enableBlinkFeatures: '', // Disable experimental features
      webgl: true,
      plugins: false,
      // Security settings for production
      sandbox: false, // Keep disabled for preload script access
      // Allow accessing file:// URLs in production
      ...(isDev ? {} : {
        allowRunningInsecureContent: false,
        webSecurity: false, // Required for file:// protocol in packaged app
      }),
    },
    titleBarStyle: 'hiddenInset',
    show: false,
    backgroundColor: '#0a0a0a',
    // icon: path.join(__dirname, '../../assets/icon.png'), // Remove icon for now
  })

  let startUrl: string
  
  if (isDev) {
    startUrl = 'http://localhost:5173'
  } else {
    // Production path resolution for ASAR packaging
    const isAsar = __dirname.includes('.asar')
    console.log('Environment info:', {
      isDev,
      isAsar,
      __dirname,
      resourcesPath: process.resourcesPath,
      appPath: app.getAppPath(),
      platform: process.platform
    })
    
    let indexPath: string
    
    if (isAsar) {
      // When packaged in ASAR, use the app path directly
      indexPath = path.join(app.getAppPath(), 'dist', 'index.html')
      console.log('ASAR mode - using app path:', indexPath)
    } else {
      // When not in ASAR (development build), try multiple paths
      const possiblePaths = [
        path.join(__dirname, '../dist/index.html'),
        path.join(__dirname, '../../dist/index.html'),
        path.join(process.resourcesPath, 'dist/index.html'),
        path.join(app.getAppPath(), 'dist/index.html')
      ]
      
      indexPath = possiblePaths.find(p => existsSync(p)) || possiblePaths[0]
      console.log('Non-ASAR mode - tried paths:', possiblePaths)
      console.log('Selected path:', indexPath)
    }
    
    // Verify the file exists before proceeding
    if (existsSync(indexPath)) {
      console.log('✓ Index file found at:', indexPath)
    } else {
      console.error('✗ Index file not found at:', indexPath)
      
      // Alternative: try to find any index.html in the app
      const alternativePaths = [
        path.join(app.getAppPath(), 'index.html'),
        path.join(process.resourcesPath, 'app', 'dist', 'index.html'),
        path.join(process.resourcesPath, 'app.asar.unpacked', 'dist', 'index.html')
      ]
      
      for (const altPath of alternativePaths) {
        if (existsSync(altPath)) {
          console.log('✓ Found alternative path:', altPath)
          indexPath = altPath
          break
        }
      }
    }
    
    // Use file:// protocol with proper encoding
    startUrl = `file://${indexPath.replace(/\\/g, '/')}`
    console.log('Final URL to load:', startUrl)
  }

  // Validate resources before loading
  const isValid = await validateAndPrepareApp()
  if (!isValid && !isDev) {
    console.error('❌ App validation failed, showing error page')
    showErrorPage()
    return
  }

  loadAppWithRetry(startUrl)
  
  // Enhanced error handling for loading issues
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error(`❌ Failed to load ${validatedURL}:`, {
      errorCode,
      errorDescription,
      loadAttempts: loadAttempts + 1,
      maxAttempts: MAX_LOAD_ATTEMPTS,
      isDev,
      platform: process.platform
    })
    
    loadAttempts++
    
    if (loadAttempts < MAX_LOAD_ATTEMPTS) {
      console.log(`🔄 Retrying load attempt ${loadAttempts + 1}/${MAX_LOAD_ATTEMPTS}`)
      setTimeout(() => {
        if (isDev) {
          // Try alternative ports in development
          const fallbackUrls = ['http://localhost:5174', 'http://localhost:3000', 'http://localhost:8080']
          const fallbackUrl = fallbackUrls[loadAttempts - 1] || fallbackUrls[0]
          console.log('🔄 Trying fallback URL:', fallbackUrl)
          mainWindow?.loadURL(fallbackUrl)
        } else {
          // Retry the same URL in production
          console.log('🔄 Retrying production URL:', startUrl)
          loadAppWithRetry(startUrl)
        }
      }, 1000 * loadAttempts) // Exponential backoff
    } else {
      console.error('💥 Max load attempts reached, showing error page')
      showErrorPage()
    }
  })

  // Additional debugging events
  mainWindow.webContents.on('dom-ready', () => {
    console.log('✅ DOM is ready')
  })

  mainWindow.webContents.on('did-start-loading', () => {
    console.log('🔄 Page started loading')
  })

  mainWindow.webContents.on('did-stop-loading', () => {
    console.log('⏹️ Page stopped loading')
  })

  // Console message forwarding for debugging
  mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
    console.log(`[Renderer ${level}]:`, message)
  })

  // Add timeout for loading
  const loadTimeout = setTimeout(() => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      console.error('Page load timeout, showing error page')
      showErrorPage()
    }
  }, 15000) // 15 second timeout

  mainWindow.webContents.once('did-finish-load', () => {
    clearTimeout(loadTimeout)
    loadAttempts = 0 // Reset counter on successful load
    console.log('App loaded successfully')
  })

  mainWindow.once('ready-to-show', () => {
    clearTimeout(loadTimeout)
    mainWindow?.show()
    
    if (isDev) {
      mainWindow?.webContents.openDevTools()
    }
  })

  mainWindow.on('closed', () => {
    clearTimeout(loadTimeout)
    mainWindow = null
    loadAttempts = 0
  })

  // Open external links in the default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })
}

async function loadAppWithRetry(url: string) {
  if (!mainWindow || mainWindow.isDestroyed()) {
    console.error('Main window is not available')
    return
  }

  console.log(`🚀 Loading app from: ${url}`)
  
  try {
    // Pre-validate the URL
    if (url.startsWith('file://')) {
      const filePath = url.replace('file://', '')
      if (!existsSync(filePath)) {
        throw new Error(`File does not exist: ${filePath}`)
      }
      console.log('✓ File exists, proceeding with load')
    }

    // Set a loading indicator
    mainWindow.webContents.once('did-start-loading', () => {
      console.log('📡 Started loading...')
    })

    // Track successful loading
    mainWindow.webContents.once('did-finish-load', () => {
      console.log('✅ Loading completed successfully')
      loadAttempts = 0 // Reset on success
    })

    // Load the URL with proper error handling
    await mainWindow.loadURL(url)
  } catch (error) {
    console.error('❌ Error loading URL:', error)
    throw error
  }
}

async function validateAndPrepareApp() {
  console.log('🔍 Validating app resources...')
  
  if (!isDev) {
    // In production, verify critical assets exist
    const appPath = app.getAppPath()
    const distPath = path.join(appPath, 'dist')
    
    console.log('Checking paths:', {
      appPath,
      distPath,
      distExists: existsSync(distPath)
    })
    
    if (!existsSync(distPath)) {
      console.error('❌ dist directory not found in app bundle')
      return false
    }

    // Check for critical files
    const criticalFiles = [
      path.join(distPath, 'index.html'),
      path.join(distPath, 'assets')
    ]

    for (const file of criticalFiles) {
      if (!existsSync(file)) {
        console.error(`❌ Critical file missing: ${file}`)
        return false
      }
    }
    
    console.log('✅ All critical resources found')
  }
  
  return true
}

function showErrorPage() {
  if (mainWindow && !mainWindow.isDestroyed()) {
    const errorHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Mavit - Cash</title>
          <style>
            body {
              margin: 0;
              padding: 0;
              background: #0a0a0a;
              color: #ffffff;
              font-family: 'Inter', system-ui, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              text-align: center;
            }
            .error-container {
              max-width: 400px;
              padding: 2rem;
            }
            .error-title {
              font-size: 2rem;
              font-weight: bold;
              color: #dc143c;
              margin-bottom: 1rem;
            }
            .error-message {
              font-size: 1rem;
              color: #a0a0a0;
              margin-bottom: 2rem;
              line-height: 1.5;
            }
            .retry-button {
              background: #dc143c;
              color: white;
              border: none;
              padding: 0.75rem 1.5rem;
              border-radius: 0.5rem;
              font-size: 1rem;
              cursor: pointer;
              transition: background-color 0.3s;
            }
            .retry-button:hover {
              background: #b91c46;
            }
          </style>
        </head>
        <body>
          <div class="error-container">
            <div class="error-title">Erro ao Carregar</div>
            <div class="error-message">
              Houve um problema ao carregar o Mavit - Cash. Verifique sua conexão de internet e tente novamente.
            </div>
            <button class="retry-button" onclick="location.reload()">Tentar Novamente</button>
          </div>
        </body>
      </html>
    `
    
    mainWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(errorHtml)}`)
  }
}

app.whenReady().then(async () => {
  console.log('🚀 Electron app is ready!')
  console.log('📍 App Info:', {
    version: app.getVersion(),
    name: app.getName(),
    path: app.getAppPath(),
    resourcesPath: process.resourcesPath,
    platform: process.platform,
    arch: process.arch,
    isDev,
    electronVersion: process.versions.electron,
    nodeVersion: process.versions.node,
    chromeVersion: process.versions.chrome
  })

  try {
    await createWindow()
  } catch (error) {
    console.error('❌ Failed to create window:', error)
    app.quit()
  }

  app.on('activate', async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      console.log('🔄 Reactivating app, creating new window')
      try {
        await createWindow()
      } catch (error) {
        console.error('❌ Failed to recreate window:', error)
      }
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// Set application menu
const template: Electron.MenuItemConstructorOptions[] = [
  {
    label: 'File',
    submenu: [
      {
        label: 'New Expense',
        accelerator: 'CmdOrCtrl+N',
        click: () => {
          mainWindow?.webContents.send('menu-new-expense')
        }
      },
      {
        label: 'Export Data',
        accelerator: 'CmdOrCtrl+E',
        click: () => {
          mainWindow?.webContents.send('menu-export-data')
        }
      },
      { type: 'separator' },
      { role: 'quit' }
    ]
  },
  {
    label: 'Edit',
    submenu: [
      { role: 'undo' },
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' }
    ]
  },
  {
    label: 'View',
    submenu: [
      { role: 'reload' },
      { role: 'forceReload' },
      { role: 'toggleDevTools' },
      { type: 'separator' },
      { role: 'resetZoom' },
      { role: 'zoomIn' },
      { role: 'zoomOut' },
      { type: 'separator' },
      { role: 'togglefullscreen' }
    ]
  },
  {
    label: 'Window',
    submenu: [
      { role: 'minimize' },
      { role: 'close' }
    ]
  }
]

const menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menu)

// IPC handlers
ipcMain.handle('get-app-version', () => {
  return app.getVersion()
})

ipcMain.handle('get-app-name', () => {
  return app.getName()
})