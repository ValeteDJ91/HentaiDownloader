const inquirer = require("inquirer");
const chalk = require("chalk");
const figlet = require("figlet");
const shell = require("shelljs");
const fs = require('fs');
const util = require('util');
const fsExtra = require('fs-extra')
const fsPromises = fs.promises;

const init = async () => {
  let allsitesout
  let allsitesin = []
  console.log(
    chalk.blue(
      figlet.textSync("Hentai Downloader", {
        font: "colossal",
        horizontalLayout: "default",
        verticalLayout: "default"
      })
    )
  );
  //await fs.rmdirSync("./temp", { recursive: true }).then(() => {if (!fs.existsSync("./temp")){fs.mkdirSync("./temp");}})
  await fsExtra.emptyDirSync("./temp")
  return allsitesout = await fsPromises.readdir("./sites/", (err, files) => {
    if (err) return console.error(err);
    files.forEach(file => {
      if (!file.endsWith(".js")) return;
      let sitename = file.split(".")[0];
      allsitesin.push(sitename);
    });
  });
};

const askQuestions = (quarryin) => {
  const questions = [
    //{
    //  name: "foo",
    //  type: "input",
    //  message: "question ?"
    //},
    {
      type: "list",
      name: "module",
      message: "Choose a module",
      choices: quarryin
    }
  ];
  return inquirer.prompt(questions);
};

const run = async () => {
  // show script introduction
  const choices = await init();

  // ask questions
  if (choices.length > 0) {
    var answers = await askQuestions(choices);
  } else {
    console.log(chalk.bgMagenta.bold("No sites installed"))
    return
  }
  const { module } = answers;

  let loadplugin = await require(`./sites/${module}`);

  let result = await loadplugin.execute();

  console.log(chalk.bgRedBright("Finished executing "+module))
  if (result) {
    console.log(chalk.bgRedBright("Exiting with code: ")+result)
  }
};

run();