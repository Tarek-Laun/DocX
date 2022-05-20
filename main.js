const fs = require('fs');
const path = require('path');

var showdown  = require('showdown');
showdown.setFlavor('github');
var converter = new showdown.Converter();

// Load Config.
var Config = JSON.parse(fs.readFileSync('./Config.json', 'utf8'));

console.log("-----------------------")
console.log("-     DocX v0.0.1     -")
console.log("-     ©Tarek Laun     -")
console.log("-----------------------")
console.log("")

// Load Template.
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
            // TODO: Linkt to Page.
            var Name = path.basename(element).toString().replace(".md", "");
            Path = Path.replace("./res/", "./");
            content += "<li><a href='" + Path + Name + ".html'>" + path.basename(element).toString().replace(".md", "") + "</a></li>";
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
        
    CopyTemplate("./Template/");

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

    var content = converter.makeHtml(fs.readFileSync('./res/' + File, 'utf8'));

    hfile = htmlfile;

    hfile = hfile.toString().replace("#Title", Config["Name"]);
    hfile = hfile.toString().replace("#Copyright", Config["Copyright"]);
    hfile = hfile.toString().replace("#Nav", GenNav());
    hfile = hfile.toString().replace("#Title", Config["Name"]);
    hfile = hfile.toString().replace("#Content", content);

    fs.writeFileSync(Path, hfile);
}

function CopyTemplate(Path) {
    var dir = fs.readdirSync(Path);

    var newDir = Path;
    newDir = newDir.replace("./Template/", "./Export/") + "/";
    console.log(newDir);

    if (!fs.existsSync(newDir)) 
        fs.mkdirSync(newDir);

    dir.forEach(element => {
        if (element != "Template.html") {
            if (!fs.lstatSync(Path + "/" + element).isDirectory()) {
                fs.copyFileSync(Path + "/" + element, newDir + element);
            }else {
                CopyTemplate(Path + element);
            }
        }
    });
}