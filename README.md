# Math League Competition

Repository for the 2026 Math League quiz.

## Student flow
Students enter only their full name and WhatsApp number. No Firebase Authentication is used. The quiz contains 10 questions and is intended for one submission per WhatsApp number.

## Firebase
Project: mlgo-86f79. Enable Firestore and deploy firestore.rules.

## Important
Replace the placeholder apiKey in src/main.js with the Firebase Web API key already associated with this project. The admin password is **faithful** in the current UI; for production, move admin verification to a server-side endpoint so the password is not exposed in client JavaScript.