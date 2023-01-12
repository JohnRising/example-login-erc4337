import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import Datastore from "nedb";

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Connect to the database. For demonstration purposes, this uses a simple file-based database.
// This should be replaced by something more robust in a production application.
const accountsDB = new Datastore({ filename: "./accounts.db", autoload: true });

// Handle the front end's request for the account associated with an email.
app.post("/return-account", async (req, res) => {
  const { email, address } = req.body;
  // If the email doesn't yet exist, write it to the database
  if (!(await emailExists(email))) {
    console.log(email + " is not in the database. Creating...");
    createAccount(email, address);
  }

  // Search the database for the account. Throw an error if there isn't one.
  try {
    let account = await getAccountByEmail(email);
    console.log("Retrieving account from the database: ", account);
    res.send(account);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.listen(5000, () => {
  console.log("Server listening on port 5000");
});

// Check whether an email exists in the database
// TODO: replace logic for new database type when chosen
async function emailExists(email: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    accountsDB.findOne({ email }, (err: any, account: any) => {
      if (err) {
        reject(err);
      }
      resolve(account !== null);
    });
  });
}

// Create an account in the database
async function createAccount(email: string, address: string): Promise<any> {
  return new Promise((resolve, reject) => {
    accountsDB.insert({ email: email, address: address }, (err, newAccount) => {
      if (err) {
        reject(err);
      }
      resolve(newAccount);
    });
  });
}

// Search the database for an account
async function getAccountByEmail(email: string): Promise<any> {
  return new Promise((resolve, reject) => {
    accountsDB.findOne({ email }, (err, account) => {
      if (err) {
        reject(err);
      }
      resolve(account);
    });
  });
}
