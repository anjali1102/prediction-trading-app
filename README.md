# bun-react-tailwind-template

To install dependencies:

```bash
bun install
```

To start a development server:

```bash
bun dev
```

To run for production:

```bash
bun start
```

To type check:

```bash
bun check
```

## Authentication and balance API

Set `JWT_SECRET` in `.env` before logging in. Use a long, random value, for
example one generated with `openssl rand -base64 32`.

1. Sign up or log in with `POST /api/v1/auth/signup` or
   `POST /api/v1/auth/login`, sending `{"username":"...","password":"..."}`.
   The login response includes a one-hour JWT at `data.token`.
2. Add simulated funds with `POST /api/v1/auth/onramp`, sending
   `{"amount":500}` and include the login token in an `Authorization` header.
   The response is `{"balance":500}` (or the user's updated balance).
3. Read the authenticated user's balance with `GET /api/v1/auth/profile`,
   using the same authorization header.

The on-ramp endpoint credits a simulated balance; it does not process a real
payment.

Run `bun fmt` to format the code.

This project was created using `bun init` in bun v1.4.5. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.
