# The Nordlys website

(Written September 2025)

This repository contains the code for the Nordlys website. 

The website is built with [Next.js](https://nextjs.org/learn) and [React.js](https://react.dev/learn).

## URL

[nordlysntnu.no](https://www.nordlysntnu.no/)

## Downloading

### Prerequisites

In order to run the code you will need to have [Node.js](https://nodejs.org/en/download) downloaded. 

### Installation

- To download and setup the repository you have to first configure ssh and add your ssh key to GutHub.
- Then you clone the repository:
```bash
git clone git@github.com:Nordlysntnu/website.git
```
- And cd into the workspace:
```bash
cd website
```
- Then install packages and dependencies: 
```bash
npm install
```
### Running the repo
- To run the code you will need to run the development server: 
```
npm run dev
```
- Build the production server: 
```
npm run build
```
- And start the production server: 
```
npm start
```

## Explanation of file structure

The file structure follows a feature based project structure

```
website/
├── public/ # Static images and videos
├── components/
├── src/
│ ├── assets/ # Non-public assets 
│ ├── features/ # Each feature contains relevant styles, data and components
│ │ ├── about/
│ │ ├── alert/
│ │ ├── blog/
│ │ ├── error/
│ │ ├── home/
│ │ ├── join/
│ │ ├── partners/
│ │ ├── team/
│ │ └── ui/
│ ├── not-in-use/
│ ├── pages/
│ └── shared/
│ │ ├── components/ # Reusable components 
│ │ ├── data/ 
│ │ └── styles/ 
├── next.config.js
├── package.json
├── restart.sh
└── tsconfig.json # Path aliases (@features, @shared, @assets)
```

## Path aliases
This project uses path aliases defined in tsconfig.json to avoid long relative imports (../../../).
### Usage
Instead of 
```
import Layout from "../../../shared/components/Layout";
```
You can write
```
import Layout from "@shared/components/Layout";
```
This keeps imports clean and easy to maintain. 

## Contributing
### Updating and navigating the repo
Whenever working on the project, it it a good idea to run  ```git pull``` often as this ensures that your local copy of the repository is synced with the online GitHub repository. When you intend on adding features or making changes to the repository, create a new branch on GitHub, run ```git fetch``` and then ```git checkout name-of-branch``` to start working.

### Committing changes
After making changes to the code, run ```git pull``` then ```git add -A``` to make git aware of which files you have changed. Alternatively, you may replace ```-A``` with the specific name(s) of the changed file(s). Then, run the command ```git commit -m ""``` and place a descriptive commit message between the quotation marks. Afterwards, run ```git push``` to sync the GitHub repository with your changes to the branch. 

### Merging code changes into main
Once you are finished with making your changes or adding a feature, you want to merge your working branch into main. On your computer, run ```git merge origin main``` and resolve any potential merge conflicts. Add, push, and commit any changes you have made, then go to the branch's page on GitHub and open a pull request. Write a bullet point list describing your changes and additions.
