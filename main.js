const fs = require('fs');
const path = require('path');

var showdown  = require('showdown');
showdown.setFlavor('github');
var converter = new showdown.Converter();

var Config = JSON.parse(fs.readFileSync('./Config.json', 'utf8'));

console.log("-----------------------")
console.log("-     DocX v0.0.1     -")
console.log("-     ©Tarek Laun     -")
console.log("-----------------------")
console.log("")

var htmlfile = fs.readFileSync("./Template/Template.html");

GenNav();
ExportDoc();

//Gen Navigation
function GenNav() {
    
    var Content = "<ul id='UL'>";

    var dir = fs.readdirSync("./res/");
    
    Content += GetFolder("./res/");

    Content += "</ul>";

    return Content;
}

function GetFolder(Path) {
    var dir = fs.readdirSync(Path);

    folder = path.basename(Path);

    var content = "";

    if (folder != "res") {
        content = "<li>" + folder + "</li>";
        content += "<ul class='nested'>";
    }

    dir.forEach(element => {

        if (element.endsWith(".md")) {
            content += "<li><a href=''>" + path.basename(element).toString().replace(".md", ""); + "</a></li>";
        }else {
            content += GetFolder(Path + element);
        }

    });

    if (folder != "res") {
        content += "</ul>";
    }

    return content;
}

//Export Documentation
function ExportDoc() {
    if (!fs.existsSync('./Export/')) 
        fs.mkdirSync('./Export/');
        
    ExportFile(Config["Firstpage"]);
    
    ExportFolder("./res/");
    
}

function ExportFolder(Path) {
    var dir = fs.readdirSync(Path);

    dir.forEach(element => {
        if (element != Config["Firstpage"]) {
            if (element.endsWith(".md")) {
                console.log(Path + element);
                ExportFile(Path.replace("./res/", "") + element);
            }else if (element != Config["Firstpage"]) {
                if (!fs.existsSync('./Export/' + element)) 
                    fs.mkdirSync('./Export/' + element);
    
                ExportFolder(Path + element + "/");
            }
        }

    });
}

function ExportFile(File) {
    var Path = "./Export/" + File.replace(".md", ".html");

    hfile = htmlfile;

    hfile = hfile.toString().replace("#Title", Config["Name"]);
    hfile = hfile.toString().replace("#Copyright", Config["Copyright"]);
    hfile = hfile.toString().replace("#Nav", GenNav());
    hfile = hfile.toString().replace("#Title", Config["Name"]);
    hfile = hfile.toString().replace("#Content", converter.makeHtml(fs.readFileSync('./res/' + File, 'utf8')).replace("<a href>" , "").replace("</a>", ""));

    fs.writeFileSync(Path, hfile);
}