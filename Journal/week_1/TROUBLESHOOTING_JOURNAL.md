# Week 1 - Setup and Authentication Issues

Issues below are recorded in the earlier journal; exact dates for these setup fixes were not recorded.

## MongoDB URI, DNS, and configuration

**Recorded:** Atlas SRV DNS resolution failed in one development environment, and omitting the database name sent test data to MongoDB's default `test` database.

Use the intended database name and validate required configuration:

```env
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>/draw9or9die
```

```js
if (!process.env.MONGO_URI) {
    console.error("MONGO_URI is not defined in the environment variables.");
    process.exit(1);
}
```

Added a temporary DNS workaround:

```js
dns.setServers(["8.8.8.8", "8.8.4.4"]);
```

It is not in the current `Backend/server.js`; check the URI, DNS/network, and Atlas access rules first. Public DNS may be blocked on some networks.

## Login cookies and CORS

**Recorded:** Login could appear successful while the browser failed to retain the cookie if only one side enabled credentials.

```js
// Backend
cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes("*")) {
            callback(null, true);
            return;
        }
        callback(new Error(`Blocked by CORS: ${origin}`));
    },
    credentials: true,
});

// Frontend
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
  withCredentials: true,
});
```

Keep the configured frontend origin aligned with `VITE_API_URL`/`FRONTEND_URL`.
