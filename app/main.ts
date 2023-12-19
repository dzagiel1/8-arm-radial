import { app, BrowserWindow, screen } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const crypto = require('crypto');
const xlsxtojson = require('xlsx-to-json');
const xlstojson = require('xls-to-json');
const fileExtension = require('file-extension');
const rimraf = require('rimraf');
const { mkdirp } = require('mkdirp');
const upload = multer({ dest: './app/public/data/temp/' });
const ExcelJS = require('exceljs');
const cors = require('cors');

let win: BrowserWindow | null = null;
const args = process.argv.slice(1),
  serve = args.some((val) => val === '--serve');

function createWindow(): BrowserWindow {
  const size = screen.getPrimaryDisplay().workAreaSize;

  // Create the browser window.
  win = new BrowserWindow({
    x: 0,
    y: 0,
    width: size.width,
    height: size.height,
    webPreferences: {
      nodeIntegration: true,
      allowRunningInsecureContent: serve,
      contextIsolation: false,
    },
  });

  if (serve) {
    const debug = require('electron-debug');
    debug();

    require('electron-reloader')(module);
    win.loadURL('http://localhost:4200');
  } else {
    // Path when running electron executable
    let pathIndex = './index.html';

    if (fs.existsSync(path.join(__dirname, '../dist/index.html'))) {
      // Path when running electron in local folder
      pathIndex = '../dist/index.html';
    }

    const url = new URL(path.join('file:', __dirname, pathIndex));
    win.loadURL(url.href);
  }

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store window
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });

  return win;
}

try {
  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  // Added 400 ms to fix the black background issue while using transparent window. More detais at https://github.com/electron/electron/issues/15947
  app.on('ready', () => setTimeout(createWindow, 400));

  // express app
  let corsOptions = {
    origin: ['http://localhost:4200'],
  };
  let express_app = express();

  express_app.listen(3000);
  express_app.use([cors(corsOptions), bodyParser.json()]);
  // rimraf('./app/public/data/temp/', () => {
  //   mkdirp('./app/public/data/temp', (err) => {
  //     if (err) {
  //       console.log(err);
  //     }
  //   });
  //   console.log('done');
  // });
  // rimraf.sync('./app/public/data/temp/');

  let storage = multer.diskStorage({
    //multers disk storage settings
    destination: function (req, file, cb) {
      cb(null, './app/public/data/temp/');
    },
    filename: function (req, file, cb) {
      crypto.pseudoRandomBytes(16, function (err, raw) {
        cb(
          null,
          raw.toString('hex') + Date.now() + '.' + fileExtension(file.mimetype)
        );
      });
    },
  });
  const upload = multer({
    storage: storage,
  }).single('file');

  express_app.post('/', (req, res) => {
    let excel2json;
    upload(req, res, (err) => {
      if (err) {
        res.json({ error_code: 401, err_desc: err });
        return;
      }
      if (!req.file) {
        res.json({ error_code: 404, err_desc: 'File not found!' });
        return;
      }

      if (
        req.file.originalname.split('.')[
          req.file.originalname.split('.').length - 1
        ] === 'xlsx'
      ) {
        excel2json = xlsxtojson;
      } else {
        excel2json = xlstojson;
      }

      //  code to convert excel data to json  format
      excel2json(
        {
          input: req.file.path,
          output: './app/public/data/temp/' + Date.now() + '.json', // output json
          lowerCaseHeaders: true,
        },
        (err, result) => {
          if (err) {
            res.json(err);
          } else {
            res.json(result);
          }
        }
      );
    });
  });

  express_app.get('/', function (req, res) {
    var workbook = new ExcelJS.Workbook();

    workbook.creator = 'Me';
    workbook.lastModifiedBy = 'Her';
    workbook.created = new Date(1985, 8, 30);
    workbook.modified = new Date();
    workbook.lastPrinted = new Date(2016, 9, 27);
    workbook.properties.date1904 = true;

    workbook.views = [
      {
        x: 0,
        y: 0,
        width: 10000,
        height: 20000,
        firstSheet: 0,
        activeTab: 1,
        visibility: 'visible',
      },
    ];
    var worksheet = workbook.addWorksheet('My Sheet');
    worksheet.columns = [
      { header: 'Id', key: 'id', width: 10 },
      { header: 'Name', key: 'name', width: 32 },
      {
        header: 'D.O.B.',
        key: 'dob',
        width: 10,
        outlineLevel: 1,
        type: 'date',
        formulae: [new Date(2016, 0, 1)],
      },
    ];

    worksheet.addRow({ id: 1, name: 'John Doe', dob: new Date(1970, 1, 1) });
    worksheet.addRow({ id: 2, name: 'Jane Doe', dob: new Date(1965, 1, 7) });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=' + 'Report.xlsx'
    );
    workbook.xlsx.write(res).then(function (data) {
      res.end();
      console.log('File write done........');
    });
    // res.send(workSheet);
    // res.send('Server is ready!');
  });

  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
      createWindow();
    }
  });
} catch (e) {
  // Catch Error
  // throw e;
}
