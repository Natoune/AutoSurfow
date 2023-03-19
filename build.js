const { resolve } = require('path');
let { version, description } = require('./package.json');
const rcedit = require('rcedit');
const fs = require('fs');
const { execSync } = require('child_process');
const { compile } = require('nexe');
const iconPath = resolve(__dirname, 'icon.ico');

const rc = {
    CompanyName: 'Natoune',
    ProductName: 'Auto Surfow',
    FileDescription: description,
    FileVersion: version,
    ProductVersion: version,
    OriginalFilename: 'auto-surfow-win64.exe',
    InternalName: 'auto-surfow-win64',
    LegalCopyright: 'Copyright © 2023 Natoune. MIT License.',
}

async function exists(filename) {
    try {
        return (await fs.promises.stat(filename)).size > 0
    } catch{ }
    return false;
}

(async function () {
    await compile({
        input: resolve(__dirname, '../index.js'),
        output: resolve(__dirname, 'build', 'auto-surfow-win64.exe'),
        targets: ['windows-x64-16.15.0'],
        name: 'Auto Surfow',
        build: true,
        ico: iconPath,
        rc: Object.assign({
            'PRODUCTVERSION': version,
            'FILEVERSION': version,
        }, rc),
        patches: [
            async (compiler, next) => {
                //nexe caches the exe after compilation, so resources are not updated after the first run unless you reset the compilation cache, but recompiling takes a VERY long time. Quickly patch the finished exe
                const exePath = compiler.getNodeExecutableLocation();
                if (await exists(exePath)) {
                    await rcedit(exePath, {
                        'version-string': rc,
                        'file-version': version,
                        'product-version': version,
                        icon: iconPath,
                    });
                }
                return next();
            }
        ]
    });
})().catch(console.error);
