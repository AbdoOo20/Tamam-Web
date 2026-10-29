# Tamam Web

Angular 22 frontend for Tamam (COD shield). Backend: https://github.com/AbdoOo20/Tamam (endpoints in its `docs/API.md`).

```bash
npm install
npm start          # ng serve (uses src/environments/environment.development.ts)
npm run build      # production build
npm test -- --watch=false
```

Set the API url and the other project-wide values in `src/environments/`.
The structure and the rules are described in [docs/Architecture.md](docs/Architecture.md).
