import pkg from "pg";
import * as dotenv from "dotenv";

dotenv.config();

const { Client } = pkg;

const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'my_locker_room',
    user: 'diego_admin',
    password: 'Reddevils',
  })

export default client;