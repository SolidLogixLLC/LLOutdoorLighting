# L&L Outdoor Lightning

This repo contains all the code for the new L&L Outdoor Lightning website, it make uses of [Nunjucks](https://mozilla.github.io/nunjucks/) which is a JavaScript templating engine and [Webpack](https://webpack.js.org/) to compile it.

## How to Run

Install the packages running the following command.
```bash
npm ci
```

By running the ci flag we make sure that we install the packages and peer dependencies specified in the `package.json` and `package-lock.json` 

Once the installation has finish all we need to do is run
```bash
npm run start:dev
```

Or
```bash
npm run build
```

The last command will create the files for a production ready environment.

