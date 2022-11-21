# BatApp

## Abstract

The project aimed to create a virtual hotspot map of new coronavirus discoveries in bat species. It consists of two parts - an AI module to search and download scientific articles to pdf files, and a module with visualisation being deployed at: https://lpopek.github.io/BatApp/

## How to use it?

1. install dependencies: pip install -r requirements.txt
2. open command prompt and change directory to the folder containing BatApp-pipline.py and folder with data
3. using the AI module for a different type of problem, prepare a representative collection containing the contents of the abstracts of the scientific articles under which the classifier is to be trained. Notepad is used for this: BatApp-NLP-clasificator.ipynb
4. create a folder in which to save the article files
5. run the BatApp-pipeline.py script using the command ./BatApp-pipeline.py

Trained classificators one can foound in folder bat-app-ai/cls

### Required packages

- bs4>=  4.9.0
- pandas >= 1.5.0
- requests >= 2.28.1
- asyncio >= 3.11.0
- aiohttp >= 3.8.3

## Visualisation tool maunal

### Contribution

In the project directory, you can run:

#### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

#### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

#### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.
