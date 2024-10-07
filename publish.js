const { execSync } = require('child_process');
const { readFileSync, writeFileSync, rm } = require('fs');
const { join } = require('path');

const package = process.argv[2];
const packagePath = process.argv[3];

if (!package) {
    throw new Error('Cannot publish undefined package');
}

const packageLocation = join(
    __dirname,
    'packages',
    ...(packagePath ? [packagePath] : [package])
);

const packageJsonPath = join(packageLocation, 'package.json');
const raw = readFileSync(packageJsonPath, { encoding: 'utf-8' });
const packageJson = JSON.parse(raw);
packageJson.main = './dist/index.js';
packageJson.types = './dist/index.d.ts';
packageJson.license = 'MIT';
packageJson.publishConfig = {
    access: 'public',
};
packageJson.author = 'Jonathan Rydholm';
packageJson.repository = {
    type: 'git',
    url: 'git+https://github.com/jonathanrydholm/honout.git',
    directory: `packages/${packagePath || package}`,
};
packageJson.files = ['dist'];
packageJson.keywords = [
    'honout',
    'injection',
    'framework',
    'typescript',
    'opiniated',
];

packageJson.dependencies = Object.entries(packageJson.dependencies).reduce(
    (acc, [packageName, version]) => {
        if (packageName.startsWith('@honout')) {
            const description = require(join(packageName, 'package.json'));
            return {
                ...acc,
                [packageName]: description.version,
            };
        }
        return {
            ...acc,
            [packageName]: version,
        };
    },
    {}
);

console.log(packageJson.dependencies);

try {
    console.log('BUILDING');
    execSync(`yarn workspace @honout/${package} build`);
    console.log('WRITING PACKAGE_JSON');
    writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 4) + '\n');
    console.log('PUBLISHING');
    execSync(`yarn workspace @honout/${package} publish --access public`);
    console.log('DONE');
} catch (e) {
    console.log('ERROR', e);
} finally {
    console.log('RESETTING');
    writeFileSync(
        packageJsonPath,
        JSON.stringify(JSON.parse(raw), null, 4) + '\n'
    );
    rm(
        join(packageLocation, 'dist'),
        {
            recursive: true,
            force: true,
        },
        () => {}
    );
    rm(
        join(packageLocation, 'tsconfig.tsbuildinfo'),
        { force: true },
        () => {}
    );
}
