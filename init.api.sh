#!/bin/bash
yarn init -y
yarn add dotenv express joi lodash morgan
yarn add -D nodemon ts-node types-installer typescript add-npm-scripts
yarn add-npm-scripts start "nodemon"
yarn add-npm-scripts build "tsc"
yarn types-installer

cat > nodemon.json <<EOL
  {
    "watch": ["src"],
    "ext": "ts",
    "ignore": ["src/**/*.spec.ts"],
    "exec": "node --inspect -r ts-node/register ./src/index.ts"
  }
EOL

git init 
cat > .gitignore <<EOL
node_modules
dist
yarn-error.log
init-ts-proyect.sh
EOL

cat > tsconfig.json <<EOL
    {
    "compilerOptions": {
      "module": "CommonJS",
      "target": "ES2020",
      "noImplicitAny": false,
      "strictNullChecks": true,
      "moduleResolution": "node",
      "sourceMap": true,
      "outDir": "dist",
      "baseUrl": ".",
      "paths": {
        "#/*": [
          "*"
        ]
      },
    },
    "include": [
      "src/**/*"
    ]
  }
EOL

mkdir -p src
cat > src/index.ts <<EOL
  console.log('hello world!');
EOL