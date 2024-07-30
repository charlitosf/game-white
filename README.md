# Game-White

This is a VueJS 3 + Firebase project about a game called "White". An explanation of the rules can be found in the about page of this project.

## Libraries used

- Vue Router
- Pinia
- Fontawesome

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur) + [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin).

### Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin) to make the TypeScript language service aware of `.vue` types.

If the standalone TypeScript plugin doesn't feel fast enough to you, Volar has also implemented a [Take Over Mode](https://github.com/johnsoncodehk/volar/discussions/471#discussioncomment-1361669) that is more performant. You can enable it by the following steps:

1. Disable the built-in TypeScript Extension
   1. Run `Extensions: Show Built-in Extensions` from VSCode's command palette
   2. Find `TypeScript and JavaScript Language Features`, right click and select `Disable (Workspace)`
2. Reload the VSCode window by running `Developer: Reload Window` from the command palette.

## Project Setup

All commands should run in the project root.

```sh
npm install
```

### Compile and Hot-Reload for Development

The Firebase-CLI (`firebase`) should be previously installed and developer should be authenticated:

```sh
firebase login
```

To start development environment:

```sh
npm run dev
firebase emulators:start
```

To open development server to the local network (i.e., to test with a real smartphone on-the-fly too):

```sh
npm run dev:open
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

Files will be exported to the `dist/` folder.

### Deploy to Firebase

Build and deploy to the Firebase hosting and database rules.

Copy the `.env.local.copy` file into `.env.local` and fill it with the appropriate keys. Then the `.firebaserc` file should be modified according to the production environment and the Firebase configuration of the `main.ts` file should be updated.

```javascript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "<your-domain>",
  databaseURL: "<your-database-url>",
  projectId: "<your-project-id>",
  storageBucket: "<your-storage-bucket>",
  messagingSenderId: "<your-messaging-sender-id>",
  appId: "<your-app-id>",
  measurementId: "<your-measurement-id>",
};
```

Then run:

```sh
npm run deploy
```

## License

This project is licensed under the terms of the MIT license.
