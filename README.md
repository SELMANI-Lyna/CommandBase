# CommandBase

A personal **cybersecurity knowledge base** — built with Electron, React, TypeScript, and SQLite.

Store, search, and run your commands, tools, workflows, resources, and notes in a fast, offline, HUD-style desktop app.

---

## 🚀 Quick Download & Install (Pre-built Binaries)

Download the installer for your operating system from the **[GitHub Releases](https://github.com/SELMANI-Lyna/CommandBase/releases)** page:

| OS | File to Download | Notes |
|:---|:---|:---|
| **Linux (Debian/Ubuntu/Kali)** | `commandbase_1.0.0_amd64.deb` | System-wide package, integrates into app menu & dock |
| **Linux (Any Distro)** | `commandbase-1.0.0.AppImage` | Portable standalone binary |
| **Windows** | `commandbase-Setup-1.0.0.exe` | Standard Windows installer |
| **macOS** | `commandbase-1.0.0.dmg` | Drag & drop to Applications folder |

---

## 💻 Download & Build from Source

If you want to clone and build the app yourself here's the detailed steps by each OS :

### 1. Prerequisites
- **Node.js**: v20 or higher ([Download Node.js](https://nodejs.org/))
- **Git**

### 2. Clone the Repository
```bash
git clone https://github.com/SELMANI-Lyna/CommandBase.git
cd CommandBase
npm install
```

### 3. Run in Development Mode
```bash
npm run dev
```

### 4. Build Installers
```bash
# For Linux (.deb and .AppImage)
npm run build:linux

# For Windows (.exe)
npm run build:win

# For macOS (.dmg) — must be run on a Mac host
npm run build:mac
```
The compiled binaries will be saved inside the `dist/` directory.

---

##  Desktop Shortcut Setup (Detailed by OS)

### 🐧 Linux

#### Option A: Install the `.deb` package (Automatic)
The `.deb` installer automatically places CommandBase into your system application launcher, dock favorites, and `/usr/share/applications/`:
```bash
sudo dpkg -i dist/commandbase_1.0.0_amd64.deb
```

#### Option B: Create a Desktop Shortcut manually
If using the AppImage or unpacked binary, create a desktop shortcut:

1. Create `~/Desktop/CommandBase.desktop` with the following command:
```bash
cat << 'EOF' > ~/Desktop/CommandBase.desktop
[Desktop Entry]
Name=CommandBase
Exec=/home/$USER/Desktop/CommandBase/dist/linux-unpacked/commandbase %U
Terminal=false
Type=Application
Icon=/home/$USER/Desktop/CommandBase/resources/icon.png
StartupWMClass=commandbase
Comment=Command & Template Management System
Categories=Utility;Development;
EOF
```
*(Adjust the `Exec=` and `Icon=` paths if your project folder is located elsewhere).*

2. Make it executable and trusted:
```bash
chmod +x ~/Desktop/CommandBase.desktop
gio set ~/Desktop/CommandBase.desktop metadata::trusted true 2>/dev/null || true
```

3. To also show it in your system **Application Menu** and **Dock**:
```bash
cp ~/Desktop/CommandBase.desktop ~/.local/share/applications/commandbase.desktop
update-desktop-database ~/.local/share/applications/ 2>/dev/null || true
```

---

###  Windows

#### Option A: Using the Installer (`.exe`)
When running `commandbase-Setup-1.0.0.exe`, the installer automatically creates a shortcut on your Desktop and in the Start Menu.

#### Option B: Manual Shortcut from compiled binary
If you built the app manually:
1. Open File Explorer and navigate to `CommandBase\dist\win-unpacked\`.
2. Right-click `commandbase.exe`.
3. Select **Show more options** (on Windows 11) → **Send to** → **Desktop (create shortcut)**.
4. Rename the shortcut on your Desktop to `CommandBase`.

Alternatively, create it instantly using PowerShell:
```powershell
$WshShell = New-Object -comObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut("$HOME\Desktop\CommandBase.lnk")
$Shortcut.TargetPath = "$PWD\dist\win-unpacked\commandbase.exe"
$Shortcut.WorkingDirectory = "$PWD\dist\win-unpacked"
$Shortcut.Description = "CommandBase"
$Shortcut.Save()
```

---

###  macOS

#### Option A: Drag to Applications
1. Double-click the downloaded `commandbase-1.0.0.dmg`.
2. Drag the **CommandBase** icon into the **Applications** folder.
3. Open Launchpad or Finder → Applications to launch.
4. Drag CommandBase from `/Applications` to your **Dock** to keep it pinned.

#### Option B: Create a Desktop Alias
If you want an icon directly on your macOS Desktop:
1. Open **Finder** and go to **Applications**.
2. Hold <kbd>⌥ Option</kbd> + <kbd>⌘ Command</kbd> and drag `CommandBase` onto your Desktop.

Or run this Terminal command:
```bash
ln -s "/Applications/CommandBase.app" "$HOME/Desktop/CommandBase"
```

---

## 📁 Data Storage & Backups

Your local SQLite database is stored securely in your user profile:

- **Linux**: `~/.config/commandbase/commandbase.db`
- **Windows**: `%APPDATA%\commandbase\commandbase.db`
- **macOS**: `~/Library/Application Support/commandbase/commandbase.db`

> **Automatic Backups**: Every time the app launches, it automatically saves a timestamped snapshot (`commandbase.db.bak-<timestamp>`) in the same folder, keeping the 5 most recent backups.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Description |
|:---|:---|
| <kbd>Ctrl</kbd> + <kbd>K</kbd> (or <kbd>⌘</kbd> + <kbd>K</kbd>) | Open Global Search modal |
| <kbd>Ctrl</kbd> + <kbd>N</kbd> (or <kbd>⌘</kbd> + <kbd>N</kbd>) | Create new command |
| <kbd>Ctrl</kbd> + <kbd>S</kbd> (or <kbd>⌘</kbd> + <kbd>S</kbd>) | Save command in editor |
| <kbd>Esc</kbd> | Close active modal / cancel dialog |
| <kbd>F1</kbd> / <kbd>?</kbd> | View keyboard shortcuts help |
| <kbd>Tab</kbd> | Indent with 2 spaces in command syntax editor |

---

## 🛠️ Tech Stack

- **Runtime**: [Electron](https://www.electronjs.org/) + [electron-vite](https://electron-vite.org/)
- **Frontend**: [React 19](https://react.dev/) + TypeScript
- **Database**: [better-sqlite3](https://github.com/WiseLibs/better-sqlite3)
- **UI & Animations**: [Tailwind / CSS](https://developer.mozilla.org/en-US/docs/Web/CSS), [Framer Motion](https://www.framer.com/motion/), [Lucide React](https://lucide.dev/)
- **Drag & Drop**: [@dnd-kit](https://dndkit.com/)

---

## 📄 License

[MIT](LICENSE) © SELMANI-Lyna
