const { resolve } = require('path');
let { version, description } = require('./package.json');
const rcedit = require('rcedit');
const fs = require('fs');
const { execSync } = require('child_process');
const { compile } = require('nexe');
const iconPath = resolve(__dirname, 'icon.ico');

const prettyPlatform = {
    win32: 'windows',
    windows: 'windows',
    win: 'windows',
    darwin: 'mac',
    macos: 'mac',
    mac: 'mac',
    linux: 'linux',
    static: 'alpine',
    alpine: 'alpine',
}

const prettyArch = {
    x86: 'x86',
    arm6: 'arm',
    arm64: 'arm64',
    arm6l: 'arm',
    arm: 'arm',
    arm7: 'arm',
    arm7l: 'arm',
    amd64: 'x64',
    ia32: 'x86',
    x32: 'x86',
    x64: 'x64',
}

function isVersion(x) {
    if (!x) {
        return false;
    }
    return /^[\d]+$/.test(x.replace(/v|\.|\s+/g, ''));
}

function isPlatform(x) {
    return x in prettyPlatform;
}

function isArch(x) {
    return x in prettyArch;
}

let os = process.platform;
if (os == 'win32') {
    os = 'windows';
} else if (os == 'darwin') {
    os = 'mac';
}
if (process.argv[2] && process.argv[2] != os) {
    os = process.argv[2];
}

if (!isPlatform(os)) {
    console.log('OS not supported');
    console.log('Supported OS: windows, mac, alpine, linux');
    process.exit();
}

let arch = process.arch;
if (arch == 'x32') {
    arch = 'x86';
}
if (process.argv[3] && process.argv[3] != arch) {
    arch = process.argv[3];
}

if (!isArch(arch)) {
    console.log('Architecture not supported');
    console.log('Supported architectures: x86, x64, arm, arm64');
    process.exit();
}

let nodeVersion = '16.15.0';
if (process.argv[4] && process.argv[4] != nodeVersion) {
    nodeVersion = process.argv[4];
}

if (!isVersion(nodeVersion)) {
    console.log('Node version not supported');
    process.exit();
}

let target = os + '-' + arch + '-' + nodeVersion;
let fileName = 'auto-surfow-' + target + (os == 'windows' ? '.exe' : '');

const rc = {
    CompanyName: 'Natoune',
    ProductName: 'Auto Surfow',
    FileDescription: description,
    FileVersion: version,
    ProductVersion: version,
    OriginalFilename: fileName,
    InternalName: (fileName.split('.')[0] + '.exe').replace(/-/g, '_' + ' '),
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
        output: resolve(__dirname, 'build', fileName),
        targets: [
            target
        ],
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
