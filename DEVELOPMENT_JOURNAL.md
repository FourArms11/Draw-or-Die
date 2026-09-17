# Draw or Die: Development Journal

## Introduction

This journal records the problems encountered while developing **Draw or Die** and the progress completed so far. The project is a multiplayer drawing-and-guessing game built with React, Node.js, Express, MongoDB, and the planned Socket.IO real-time layer.

## 1. Project structure and setup

The project uses separate `Frontend` and `Backend` applications. This made the code easier to organize, but dependencies must be installed in both folders, the applications use different ports, and the frontend must point to the correct backend URL.

Environment variables and separate startup instructions were documented to make local development more predictable.

## 2. Node.js and MongoDB DNS problem

The backend had trouble connecting to MongoDB Atlas because Atlas connection strings use DNS SRV records. With the latest Node.js version/environment used during development, hostname resolution was not working reliably. The application could stop during startup even when the MongoDB URI was correct.

As a temporary workaround, the following was added to `Backend/server.js` before the database connection:

```js
import dns from "dns";

dns.setServers(["8.8.8.8", "8.8.4.4"]);
```

This makes Node.js use Google's public DNS resolvers and helped resolve the MongoDB host during development.

This is a workaround rather than a permanent production fix. Public DNS may be blocked by a company, school, VPN, firewall, or hosting provider. The long-term solution is to use a supported Node.js LTS version, verify normal DNS resolution, check the MongoDB Atlas network access list, and remove the forced DNS servers if the deployment environment works correctly.

## 3. Backend configuration

Missing environment variables originally caused confusing errors later in startup. The backend configuration now checks for:

- `MONGO_URI`
- `PORT`
- `JWT_SECRET`

Failing early makes configuration problems easier to identify and prevents the server from running in a partially configured state.


## 4. Login and authentication

Login was added after registration. Users can log in with either an email address or username. During frontend/backend integration, request field names were not always consistent, so the backend supports `identifier` as well as the older email/username forms.

The API validates missing credentials and returns suitable status codes:

- `400` for missing login fields.
- `401` for invalid credentials.
- `500` for unexpected server errors.

Successful login creates a JWT and stores it in an HTTP-only cookie.

## 5. CORS and browser cookies

The Vite frontend and Express backend run on different local origins. Browser security rules caused requests and cookies to fail until both sides were configured correctly.

The fix required:

- Allowing the configured frontend origin in the backend CORS settings.
- Enabling `credentials` in Express CORS.
- Enabling `withCredentials` in Axios.
- Keeping the API URL configurable through `VITE_API_URL`.

Without all of these settings, login could appear successful in server logs while the browser failed to retain the cookie.


## Current progress

Completed so far:

1. Frontend/backend project structure.
2. Node.js, Express, React, and Vite setup.
3. MongoDB and Mongoose configuration.
4. Environment variable validation.
5. DNS workaround for the Node.js/MongoDB hostname resolution issue.
6. User registration with bcrypt password hashing.
7. Login with username/email support and JWT cookies.
8. CORS and credential support.
9. Axios frontend integration.
10. Initial home page, authentication modals, and theme switching.

The next milestone is to finish the Socket.IO room and game flow and test it with multiple connected clients, refreshes, disconnects, and server restarts.
