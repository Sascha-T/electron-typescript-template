import {readFileSync, writeFileSync} from "fs";
import fetch from "node-fetch";

export class MinecraftSession {
    status: LoginStatus;
    accessToken: string;
    rawData: any = {};
    constructor() {
        this.status = LoginStatus.logged_out;
    }
    async load(path) {
        let data = JSON.parse(readFileSync(path, "utf8"));
        this.rawData["uuid"] = data.uuid;
        this.rawData["name"] = data.username;
        this.accessToken = data.accessToken;

        this.status = LoginStatus.logged_in;
        let request = await fetch(`https://authserver.mojang.com/validate`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                accessToken: this.accessToken,
                clientToken: "GCLAUNCHER"
            })
        });
        if(request.status >= 200 && request.status <= 300)
            return true;
        this.rawData["uuid"] = null;
        this.rawData["name"] = null;
        this.accessToken = null;
        this.status = LoginStatus.logged_out;
        return false;

    }
    async getData() {
        let data = {};
        if(this.status == LoginStatus.logged_in)
            return false;
        let request = await fetch(`https://api.mojang.com/user/profiles/${this.rawData["uuid"]}/names`, {
            method: "GET"
        });
        let reqData = await request.json();
        data["username"] = reqData[0].name;
    }
    async login(username, password) {
        let request = await fetch(`https://authserver.mojang.com/authenticate`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                agent: {
                    name: "Minecraft",
                    version: 1
                },
                username,
                password,
                clientToken: "GCLAUNCHER",
                requestUser: true
            })
        });
        console.log(request)
        if(request.status != 200) {
            return LoginResult.failed
        }
        let data = await request.json();
        this.rawData["uuid"] = data.selectedProfile.id;
        this.rawData["name"] = data.selectedProfile.name;
        this.accessToken = data.accessToken;
        this.status = LoginStatus.logged_in;
        return LoginResult.success;
    }
    async refresh(): Promise<boolean> {
        if(this.status == LoginStatus.logged_in) {
            let request = await fetch(`https://authserver.mojang.com/authenticate`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    accessToken: this.accessToken,
                    clientToken: "GCLAUNCHER"
                })
            });
            try {
                let reqJson = JSON.parse(await request.json());
                this.accessToken = reqJson.accessToken;
                return true;
            } catch (ex) {
                return false;
            }
        }
        return false;
    }
    saveToFile(file) {
        let saveStatus = {
            accessToken: this.accessToken,
            username: this.rawData["name"],
            uuid: this.rawData["uuid"]
        };
        writeFileSync(file, JSON.stringify(saveStatus), "utf8");
    }
}
export class MinecraftInstance {
}

export enum LoginStatus {
    logged_in,
    logged_out
}
export enum LoginResult {
    failed,
    success
}
