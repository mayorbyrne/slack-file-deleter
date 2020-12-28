let inquirer = require('inquirer');
let fs = require('fs');

inquirer
  .prompt([
    {
      type: "input",
      name: "clientID",
      message: "Enter your client ID:"
    },
    {
      type: "input",
      name: "clientSecret",
      message: "Enter your client secret:"
    },
    {
      type: "input",
      name: "redirectUri",
      message: "Enter your redirect URI:"
    },
    {
      type: "input",
      name: "adminEmail",
      message: "Enter your admin email (optional):"
    },
  ])
  .then(answers => {
    if (fs.existsSync('./.env')) {
      inquirer.prompt([
        {
          type: "confirm",
          name: "overwrite",
          message: ".env file exists, overwrite?",
          default: true,
        }
      ])
        .then(confirmation => {
          if (confirmation.overwrite) {
            writeFile(answers, complete);
          }
          else {
            complete();
          }
        });
    }
    else {
      writeFile(answers, complete);
    }
  })
  .catch(error => {
    debug(error.stack);
  });

function writeFile(answers, callback) {
  fs.writeFile(
    './.env',
    `CLIENT_ID=${answers.clientID}\nCLIENT_SECRET=${answers.clientSecret}\nREDIRECT_URI=${answers.redirectUri}\nADMIN_EMAIL=${answers.adminEmail}`,
    callback);
}

function complete() { console.log('Done.') };