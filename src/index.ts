import { app, BrowserWindow } from 'electron';
let win;
let conf = {
    width: 800,
    height: 600
};

let file = "index.html";

async function ready() {
    win = new BrowserWindow(conf);
    await win.loadFile(file);
    console.log("App is ready.")
    await app_ready();
}

async function app_ready() {

}

app.on('ready', ready)
