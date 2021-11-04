const chalk = require("chalk")
const axios = require('axios')
const inquirer = require("inquirer")
const fs = require('fs')
const fsPromises = fs.promises;

var regexindex = {
	imageURL: /<img id="img" src="(\S+?)"/,
	imagepagesURL: /(?:<a href="https:\/\/e-hentai.org\/s\/).+?(?=")/gi,
	imagenumber: /<p class="gpc">[\s\S]*<\/p>/i,
	title: /<h1 id="gn">[\s\S]*<\/h1>/i
};

const imagedownload = async (url, imagename, foldername) => {
	if (!fs.existsSync("./finished/"+foldername)){fs.mkdirSync("./finished/"+foldername);}
  axios({
    url,
    responseType: 'stream',
  }).then( response =>
    new Promise((resolve, reject) => {
      response.data
        .pipe(fs.createWriteStream("./temp/"+imagename))
        .on('finish', () => resolve())
        .on('error', e => reject(e));
    }).then( () => {
			fs.rename("./temp/"+imagename, "./finished/"+foldername+"/"+imagename, function (err) {
				if (err) throw err
				console.log('Successfully downloaded: '+imagename)
			})
		})
  );
}

exports.execute = async () => {
	let i = 0
	let j = 1
	let allimagepages = []
	// Asking for page URL
  const questions = [
    {
      name: "siteurl",
      type: "input",
      message: "Collection URL:"
    }
  ];
	var URL = await inquirer.prompt(questions);
	if (!URL.siteurl) {return 2+" Collection URL isn't provided"}
	if (URL.siteurl.indexOf("https://e-hentai.org/g/") !== 0) {return 2+" Collection URL isn't valid"}
	if (URL.siteurl.indexOf("?p")>0) {URL.siteurl = URL.siteurl.slice(0, URL.siteurl.indexOf("?p"))}
	// Fetching all Image pages URL
  console.log(chalk.bgRed("Fetching all Image pages URL"))
	// Fetching first page to get number of page
  const rawmain = await axios.get(URL.siteurl, {
    timeout: 10000,
    headers: {'X-Requested-With': 'XMLHttpRequest', Cookie: "nw=1;"}
  })
	rawmain.data.match(regexindex.imagepagesURL).forEach(element => {
		allimagepages.push(element.slice(9))
	})
	console.log("Number of image pages: "+Math.ceil(rawmain.data.match(regexindex.imagenumber)[0].split(" ")[6]/40))
	var currentitle = rawmain.data.match(regexindex.title)[0].slice(12,-22)
	var pagenumber = Math.ceil(rawmain.data.match(regexindex.imagenumber)[0].split(" ")[6]/40)
	// fetching all image pages
	while (j<pagenumber) {
		let rawsecd = await axios.get(URL.siteurl+"?p="+j, {
			timeout: 10000,
			headers: {'X-Requested-With': 'XMLHttpRequest', Cookie: "nw=1;"}
		})
		rawsecd.data.match(regexindex.imagepagesURL).forEach(element => {
			allimagepages.push(element.slice(9))
		})
		j+=1
	}
	// Getting all direct image URL
  console.log(chalk.bgRed("Fetching all direct Image URL"))
	while (i<allimagepages.length) {
		var rawimage = await axios.get(allimagepages[i], {
  	  timeout: 10000,
  	  headers: {'X-Requested-With': 'XMLHttpRequest', Cookie: "nw=1;"}
  	})
		// Download all images
		var imagename = /[^/]*$/.exec(rawimage.data.match(regexindex.imageURL)[1])[0];
		await imagedownload(rawimage.data.match(regexindex.imageURL)[1], i+"_"+imagename, currentitle)
		i+=1
	}
	return 1+" Finished executing successfully"
}