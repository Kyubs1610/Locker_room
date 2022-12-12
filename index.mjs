import express, { request, response } from "express";
import * as dotenv from 'dotenv';
dotenv.config()
import pkg from "pg";
import bodyParser from "body-parser";
import dbConnect from "./db/dbConnect.mjs";
import bcrypt from 'bcrypt';


dbConnect();
const app = express()

const table = `
CREATE TABLE IF NOT EXISTS users_table(
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  UNIQUE (name, email)
);
`;

const { Client } = pkg;

const client = new Client({
  host: 'localhost',
  port: 5432,
  database: `${process.env.DATABASE}`,
  user: `${process.env.USER}`,
  password: `${process.env.MOT_MAGIQUE}`,
})

client.query(table, (err) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log("Table created");
});

client.connect();

const port = 3001;

app.use( express.static( "public" ) );
app.set('view-engine', 'ejs');
app.use(bodyParser.json());
app.use(express.json());


app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(express.urlencoded({ extended: false }))

app.get("/homepage", (request, response) => {
  response.render('../pages/homepage.ejs', {name:'Diego'});
});

app.get('/register',(req,res)=>{
  res.render('../pages/register.ejs')
})

app.post('/register', async(req,response)=>{
  try{
    const hashedPassword = await bcrypt.hash(req.body.password, 10)
      client.query(
      "INSERT INTO users_table (name,email,password) VALUES ( $1, $2, $3) RETURNING *",
      [req.body.name, req.body.email, hashedPassword],
      )
    response.redirect('/login')
  } catch {
    response.redirect('/register')
  }
})


app.get('/login',(req,res)=>{
  res.render('../pages/login.ejs')
})
app.post('/login', (req,res)=>{
  const { email, password } = req.body;
  client.query(`SELECT * FROM users_table WHERE email = '${email}'`)
  .then ((result) => {
          if(result.rows[0] === undefined) {
            res.send(`User ${email} does not exist`)
          } else {
            const validPassword = bcrypt.compareSync(password, result.rows[0].password);
            if (validPassword){
              res.render('../pages/homepage.ejs', {name:`${email}`});
            } else {
              res.send(`The password is not correct`);
            }
          }
  })
})
 

app.listen(port, () => {
  console.log(`App running on port ${port}.`);
});
