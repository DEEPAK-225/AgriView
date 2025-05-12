# Firebase Studio - AgriView

This is a Next.js starter project for AgriView, a smart agriculture monitoring and control application, built in Firebase Studio.

To get started, take a look at `src/app/page.tsx`.

## Development

1.  **Install dependencies:**
    ```bash
    npm install
    ```
2.  **Set up environment variables:**
    Create a `.env.local` file in the root of the project. Add your Google Generative AI API key and your Firebase project configuration details.

    **Important:** The Firebase configuration values provided below are for the example "smartfarmtracker" project. **Replace them with your own Firebase project's credentials if you are using a different project.**

    ```env
    # .env.local
    GOOGLE_GENAI_API_KEY=YOUR_GOOGLE_GENAI_API_KEY

    # Firebase Configuration - These are for the "smartfarmtracker" project
    NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDRp-QshZEG7VNtvv8GrInMdc-SXDZEAaM
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=smartfarmtracker.firebaseapp.com
    NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://smartfarmtracker-default-rtdb.asia-southeast1.firebasedatabase.app
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=smartfarmtracker
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=smartfarmtracker.firebasestorage.app
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=953230072148
    NEXT_PUBLIC_FIREBASE_APP_ID=1:953230072148:web:0917a921b0b99c13b950c1
    # NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=YOUR_FIREBASE_MEASUREMENT_ID # Optional
    ```
    **Note:** Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser. Ensure `.env.local` is in your `.gitignore` file.

3.  **Run the development server:**
    For the Next.js application:
    ```bash
    npm run dev
    ```
    This will start the Next.js app on `http://localhost:9002`.

    For local Genkit flow development (optional, as flows are integrated into Next.js):
    ```bash
    npm run genkit:dev
    ```
    Or with watching:
    ```bash
    npm run genkit:watch
    ```

## Deployment to Firebase

This project is configured for deployment to Firebase Hosting using Firebase's Web Frameworks support for Next.js.

### Prerequisites

1.  **Firebase CLI:** Ensure you have the Firebase CLI installed globally. If not, install it:
    ```bash
    npm install -g firebase-tools
    ```
2.  **Firebase Account:** You need a Firebase account.
3.  **Firebase Project:** Create a Firebase project in the [Firebase Console](https://console.firebase.google.com/). Make sure to set up a Realtime Database if your application uses it.

### Deployment Steps

1.  **Login to Firebase:**
    ```bash
    firebase login
    ```
2.  **Connect to your Firebase Project:**
    In your project directory, link your local project to your Firebase project.
    ```bash
    firebase use --add
    ```
    Select your Firebase project from the list. This will update the `.firebaserc` file with your project ID.

3.  **Set Production Environment Variables:**
    Firebase's Web Frameworks support for Next.js allows you to define environment variables in a `.env.<project_id_or_alias>` file. For example, if your Firebase Project ID is `my-production-project`, create a file named `.env.my-production-project` in the root of your project:

    ```env
    # .env.my-production-project (Replace 'my-production-project' with your actual Firebase Project ID or alias)
    GOOGLE_GENAI_API_KEY=YOUR_PRODUCTION_GOOGLE_GENAI_API_KEY

    # Firebase Configuration for Production
    # Replace these with YOUR production Firebase project's credentials.
    # The values below are for the "smartfarmtracker" example project.
    NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDRp-QshZEG7VNtvv8GrInMdc-SXDZEAaM
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=smartfarmtracker.firebaseapp.com
    NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://smartfarmtracker-default-rtdb.asia-southeast1.firebasedatabase.app
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=smartfarmtracker
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=smartfarmtracker.firebasestorage.app
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=953230072148
    NEXT_PUBLIC_FIREBASE_APP_ID=1:953230072148:web:0917a921b0b99c13b950c1
    # NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=YOUR_PRODUCTION_FIREBASE_MEASUREMENT_ID # Optional
    ```
    **Important:** Do not commit this file to version control if it contains sensitive keys. Ensure `.env.*` is in your `.gitignore` file.

4.  **Deploy:**
    Run the deploy script:
    ```bash
    npm run deploy
    ```
    This command will build your Next.js application and deploy it to Firebase Hosting. The Next.js backend, including API routes and Genkit flows, will be deployed as a Cloud Function managed by Firebase.

    Firebase CLI will provide you with the URL of your deployed application.

### Notes

*   The `firebase.json` file is configured to use Firebase's `frameworksBackend` feature, which automates much of the Next.js deployment process.
*   The environment variables (both `GOOGLE_GENAI_API_KEY` and Firebase-specific ones) are necessary for the application features to work in production.
*   If you use a custom domain with Firebase Hosting, you might need to adjust the `experimental.serverActions.allowedOrigins` in `next.config.ts` if you encounter issues with Server Actions.
```