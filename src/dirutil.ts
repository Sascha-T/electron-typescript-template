import * as mkdirp from "mkdirp";
export async function smkdirp(path) {
    return new Promise(async (res) => {
        mkdirp(path, () => {
            res();
        })
    });
}
