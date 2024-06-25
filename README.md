### HitFactor.Info

A Better Classification System for Action Shooting Sports

#### Project Goals

1. Pick Data-Driven Recommended HHF for All Classifiers/Divisions.
2. Implement Closer-To-Major-Match-Performance Classification Algorithm 
3. Provide Better Classification System or at least Partial Improvements to All Interested Action Shooting Sport Organizations

#### Running

##### Locally against MONGO_URL
For faster turn around when developing API, use:
This starts up the app with a Mongo instance running in Docker.
(Hydrates in less than 5 seconds)


```
npm i
npm run local
```


##### Locally with Docker

Note: You must supply `MONGO_URL={URL_OF_SANDBOX_DATABASE}` to test in this manner.

```
npm i
npm start
```

###### In Production

Currently deployed on Koyeb using Dockerfiles. To run api/web in prod mode, use:

```
npm i
npm run prod
```

Note: `npm` i is required, because it uses vite build as a post-install step and serves frontend files from the node itself, instead of running two processes concurrently.

##### Technical Stack

- Main language: JavaScript (ES13), TypeScript when needed
- Monorepo, Node/Fastify Backend, React (vite-swc) Frontend.
- Backend serves API and static files: (build of React Frontend, downloadables, etc)
- Mongo 

##### Folder Structure

- `scripts/` -- standalone scripts
- `data/` -- imported (partially processed / split) data, mostly used by backend
- `shared/` -- source code imported by both front- and backend
- `api/` -- backend
- `web/` -- frontend
- package.json -- monorepo wrapper scripts

For more info, see READMEs in each root folder

