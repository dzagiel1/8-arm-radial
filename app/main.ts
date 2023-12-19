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
const upload = multer({ dest: './app/tmp/' });
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
  express_app.use([
    cors(corsOptions),
    bodyParser.urlencoded({ extended: false }),
    bodyParser.json(),
  ]);
  // rimraf('./app/tmp', () => {
  //   mkdirp('./app/public/data/temp', (err) => {
  //     if (err) {
  //       console.log(err);
  //     }
  //   });
  //   console.log('done');
  // });
  // rimraf.sync('./app/tmp');

  let storage = multer.diskStorage({
    //multers disk storage settings
    destination: function (req, file, cb) {
      cb(null, './app/tmp/');
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
          output: './app/tmp/' + Date.now() + '.json', // output json
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

  express_app.post('/test', (req, res) => {
    console.log(req.body);
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
    var worksheet = workbook.addWorksheet('Saline');
    worksheet.columns = [
      { header: 'id', key: 'id', width: 15, type: 'text' },
      { header: 'name', key: 'name', width: 10, type: 'text' },
      { header: 'time', key: 'time', width: 10, type: 'text' },
      { header: 'input', key: 'input', width: 10, type: 'text' },
      { header: 'errors', key: 'errors', width: 10, type: 'number' },
      { header: 'valid', key: 'valid', width: 10, type: 'number' },
      { header: 'arm1', key: 'arm1', width: 10, type: 'number' },
      { header: 'arm2', key: 'arm2', width: 10, type: 'number' },
      { header: 'arm3', key: 'arm3', width: 10, type: 'number' },
      { header: 'arm4', key: 'arm4', width: 10, type: 'number' },
      { header: 'arm5', key: 'arm5', width: 10, type: 'number' },
      { header: 'arm6', key: 'arm6', width: 10, type: 'number' },
      { header: 'arm7', key: 'arm7', width: 10, type: 'number' },
      { header: 'arm8', key: 'arm8', width: 10, type: 'number' },
    ];

    worksheet.addRow({
      id: '1_1',
      name: '1T14111',
      time: '3:10',
      input: '1122345678',
      errors: 2,
      valid: true,
      arm1: 2,
      arm2: 2,
      arm3: 1,
      arm4: 1,
      arm5: 1,
      arm6: 1,
      arm7: 1,
      arm8: 1,
    });
    worksheet.addRow({
      id: '1_1',
      name: '1T14112',
      time: '4:10',
      input: '1122345678',
      errors: 2,
      valid: true,
      arm1: 2,
      arm2: 2,
      arm3: 1,
      arm4: 1,
      arm5: 1,
      arm6: 1,
      arm7: 1,
      arm8: 1,
    });
    worksheet.addRow({
      id: '1_1',
      name: '1T14113',
      time: '4:10',
      input: '1122345678',
      errors: 2,
      valid: true,
      arm1: 2,
      arm2: 2,
      arm3: 1,
      arm4: 1,
      arm5: 1,
      arm6: 1,
      arm7: 1,
      arm8: 1,
    });
    worksheet.addRow({
      id: '1_1',
      name: 'average',
      errors: 2,
      valid: true,
    });

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
