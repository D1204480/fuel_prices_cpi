var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// 在 express.js 中，使用 sqlite3 來操作數據庫，並開啟位置在 database/sqlite.db 的資料庫，需要確認是否成功打開資料庫
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database/sqlite.db', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the sqlite database.');
});


// 撰寫 /api/fuel-prices 路由，使用 SQL 來查詢 fuel_prices 所有的油價資料，回傳 json 格式的資料就好
app.get('/api/fuel-prices', (req, res) => {
  db.all('SELECT * FROM fuel_prices', (err, rows) => {
    if (err) {
      res.status(400).json({"error":err.message});
      return;
    }
    res.json(rows);
  });
});

// 撰寫 post /api/insert 路由，使用 SQLite 新增一筆油價資料 (Year, Gasoline_92, Gasoline_95, Gasoline_98, SuperDiesel)，到 fuel_prices 中，回傳文字的訊息，不要 json
app.post('/api/insert', (req, res) => {
  let year = req.body.Year;
  let gasoline_92 = req.body.Gasoline_92;
  let gasoline_95 = req.body.Gasoline_95;
  let gasoline_98 = req.body.Gasoline_98;
  let super_diesel = req.body.SuperDiesel;
  let sql = 'INSERT INTO fuel_prices (Year, Gasoline_92, Gasoline_95, Gasoline_98, SuperDiesel) VALUES (?,?,?,?,?)';
  db.run(sql, [year, gasoline_92, gasoline_95, gasoline_98, super_diesel], function(err) {
    if (err) {
      return console.error(err.message);
    }
    res.send('New fuel price inserted');
  });
});

module.exports = app;
