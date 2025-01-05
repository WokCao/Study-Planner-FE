<p align="center">
  <a href="https://github.com/WokCao/Study-Planner-FE" target="blank"><img src="/public/gem.ico" width="120" alt="StudyGem Logo" /></a>
</p>

# StudyGem (FE)

StudyGem is a dynamic web application designed to empower users with advanced tools for task management, scheduling, and personal productivity. By combining intuitive features with cutting-edge AI insights, StudyGem offers a seamless and efficient way to stay on top of your goals, whether for work, study, or personal growth.

Here are instructions for deploying the Front-end:

## 1. Finish back-end deployment

Before proceeding, make sure you have finished setting up the database and deploying the Back-end.

## 2. Download the source code

Download the source code from this repository, then open a terminal in the folder and run:
```
$ npm install
```

## 3. Add an .env file

Configure your .env file following this template:
```
DEV=true
VITE_REACT_APP_API_LOCAL=[Link to your locally hosted Back-end's API, e.g. http://localhost:3000/api/v1]
VITE_REACT_APP_API=[Link to your publically hosted Back-end's API, e.g. https://api.study-gem.com/api/v1]
VITE_REACT_APP_GOOGLE_CLIENT_ID=[Your Google Client ID for Google OAuth, e.g. 1234-abcd.apps.googleusercontent.com]
VITE_OPENAI_API=[Your OpenAI API Key]
VITE_OPENAI_MODEL=[Your OpenAI Model, e.g. gpt-4o-mini]
```

## 4. Start the application

Run the following command and go to the displayed localhost link to start using the web app:
```
$ npm run dev
```

## 5. Login with credentials

Login with these credentials to test the imported data:
```
Email: a@gmail.com
Password: 1234
```