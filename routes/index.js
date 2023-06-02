const express = require('express');
const router = express.Router();

// Usando el paquete SQLite 3 
const sqlite3 = require('sqlite3').verbose();

// Creando las consultas SQL
const create_table = "CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username VARCHAR(50) NOT NULL, email EMAIL NOT NULL, password VARCHAR(20) NOT NULL, description TEXT NOT NULL, date DATETIME NOT NULL, time TEXT NOT NULL, ip TEXT NOT NULL)";
const insert_into = "INSERT INTO users (username, email, password, description, date, time, ip) VALUES (?, ?, ?, ?, ?, ?, ?)";
const select_all = "SELECT * FROM users";

//Para logear y tener los datos
let login = false;
let datas = []

// Creando Base de datos en memoria 
const db = new sqlite3.Database(':memory:', (err) => {
  if (err) {
      return console.error(err.message);
  }
  console.log('Ready!');
  db.run(create_table);
});

/* GET home page. */
router.get('/', (req, res)=>{
  res.render('index', { title: 'Cube Courses' });
});

router.get('/signin', (req, res)=>{
  res.render('signin.ejs');
});

router.post('/', (req, res)=>{
  // Obteniendo IP del usuario a través del servidor, Fecha y Hora
  let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  let dt = new Date();
  let time = ""

  //Formateando la Hora
  if(dt.getHours() >= 12){
    time = dt.getHours() + ":" + dt.getMinutes() + ":" + dt.getSeconds() + " PM";
  }
  else{
    time = dt.getHours() + ":" + dt.getMinutes() + ":" + dt.getSeconds() + " AM";
  }
  let _date = dt.toLocaleString();
  let date = "";

  //Formateando la Fecha
  for(let d = 0; d <= 9; d++){
      if(_date[d] == '/'){
        date += '-';
        continue;
      }
      else if(_date[d] == ','){
        continue;
      }
      date += _date[d];
  }

  //Formateando la IP
  if(ip){
    let ip_ls = ip.split(',');
    ip = ip_ls[ip_ls.length - 1];
  }
  else{
    console.log('IP adress not found');
  }

  // Reciviendo datos del usuario
  let data_user = [req.body.username, req.body.email, req.body.password, req.body.description, date, time, ip]; //Array

  db.run(insert_into, data_user, (err) =>{
    if (err) {
        return console.error(err.message);
    }
    
    console.log(`New User ${data_user[0]}`);
    res.render('index.ejs', {title: "Cube Courses"});
  });
});

router.post('/home', (req, res)=>{
    db.all(select_all, (err, rows) => {
      if(err){
        return console.error(err.message);
      }
      else{
        let username, password;
        datas = rows;
        console.log(datas);

        for(const r of datas){
          username = r.username;
          password = r.password;
        }

        if(req.body.username == username && req.body.password == password){
            login = true;
            res.redirect('/home');
        }
        else{
          res.redirect('/');
          console.log(`ERROR IN VERIFY THE DATAS`);
        }
      }
    });
}); 

router.get('/home', (req, res)=>{
  if(login){
    res.render("home.ejs", {data:datas});
  }
  else{
    console.log("Not is logged");
    res.render('index.ejs', {title: "Cube Courses"});
  }
});

module.exports = router;
