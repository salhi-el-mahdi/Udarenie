# Chapter 08: APIs and HTTP

## Why this matters

An **API** lets one program ask another to do something. Nearly every modern system is built from them: a web app talking to a server, a mobile app talking to the same server, services talking to each other. If you understand HTTP and how to design a small API, you can understand most of the internet.

## 1. Clients and servers

A restaurant is the usual picture. You (the **client**) do not enter the kitchen. You read the menu, place an order with the waiter, and receive a dish. The kitchen (the **server**) does the work and you never see how.

The **contract** is the menu: what you can ask for, in what form, and what you will get back. Clients depend on the contract, not on the implementation, so the server can change inside without breaking anyone.

## 2. HTTP: the conversation

Clients and servers talk over **HTTP**. Every conversation is one **request** followed by one **response**.

```
POST /stress HTTP/1.1
Host: localhost:4000
Content-Type: application/json

{ "text": "some text" }
```

```
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

{ "annotatedText": "some text" }
```

| Term | Meaning |
|---|---|
| **URL** | The address: `http://localhost:4000/health` |
| **Host and port** | `localhost` is this computer. The port is like an apartment number: one machine can run many servers on different ports (the web dev server often uses 3000, so an API uses 4000) |
| **Endpoint / route** | A path that does one job (`/health`, `/stress`) |
| **Method** | The kind of request (see below) |
| **Header** | A label attached to a request or response, such as `Content-Type: application/json` |
| **Body** | The data being sent |
| **JSON** | A text format for structured data: `{ "key": value }`. The standard for web APIs |
| **Status code** | A number in the response saying how it went |

## 3. Methods

| Method | Meaning | Body? |
|---|---|---|
| `GET` | Give me something. Should not change anything. | no |
| `POST` | Here is data, process it or create something | yes |
| `PUT` / `PATCH` | Replace / partially update something | yes |
| `DELETE` | Remove something | usually no |

Why `POST` and not `GET` for sending text to be processed? `GET` has no body, so the data would have to go in the URL, which has length limits and is stored in logs. `POST` carries a body of reasonable size and is the convention for "send data to be processed", even when nothing on the server changes.

## 4. Status codes

The first three digits tell the client what happened. The family is the key idea:

| Family | Meaning |
|---|---|
| **2xx** | Success |
| **4xx** | The **client** did something wrong (fix the request) |
| **5xx** | The **server** failed (not the client's fault; report it) |

| Code | Name | Typical use |
|---|---|---|
| 200 | OK | It worked |
| 201 | Created | A new thing was created |
| 400 | Bad Request | Malformed or invalid request |
| 401 / 403 | Unauthorized / Forbidden | Not logged in / not allowed |
| 404 | Not Found | That address does not exist |
| 413 | Payload Too Large | The request body is over the limit |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | A bug or failure on the server |

## 5. Designing the contract

Decide these things before writing server code:

1. **Endpoints and methods.** Name them for what they do. Not everything must be "pure REST" (resources and methods); an action like `POST /stress` is perfectly reasonable.
2. **Request and response shapes.** Use **objects**, not bare values, so fields can be added later without breaking clients. Give different things different names (`text` in, `annotatedText` out).
3. **Limits.** Maximum body size, maximum text length. A server has finite memory and (in Node) one thread: a huge request can stall everyone else.
4. **One error shape.** For example `{ "error": { "code": "TEXT_TOO_LONG", "message": "..." } }`. The `code` is for programs to react to, the `message` for people.
5. **Which status code for which failure.** Bad input gives `400`, too large gives `413`, a bug gives `500`.
6. **A health endpoint**, such as `GET /health`, so people and monitoring tools can ask "are you alive and ready?".

Write the contract as **shared types** that both sides import, so a mismatch is a compile error instead of a runtime surprise (chapter 07).

**Evolving a contract:** adding an optional field is safe. Renaming or removing a field, or changing its type, breaks existing clients. When breaking changes are unavoidable, version the API (for example a `/v1/` prefix).

## 6. Express in four ideas

**Express** is a library that receives HTTP requests and lets you decide the answer.

1. **The app:** `const app = express();`
2. **A route:** "when a request with this method and path arrives, run this handler": `app.get("/health", handler)`.
3. **A handler:** a function `(req, res) => { ... }`. `req` describes the request, `res` is how you answer: `res.json(body)` sends JSON; `res.status(400).json(body)` sets the code first. Send exactly one response.
4. **Middleware:** functions every request passes through *before* the route, for example one that reads JSON bodies. Think of a security check at an entrance.

```ts
import express from "express";

export function createApp(dictionary: StressDictionary) {
  const app = express();

  app.get("/health", (_req, res) => {
    res.json({ status: "ok", dictionaryEntries: dictionary.size });
  });

  return app;                       // does not listen; the caller decides
}
```

A separate startup file creates the real dependencies, builds the app, and calls `app.listen(PORT)`. Keeping `createApp` free of side effects is what lets tests use it without a network (chapter 03).

Unknown addresses get Express's default HTML 404 page unless you add your own handler, so a JSON API should add a JSON "not found" handler and a JSON error handler.

## 7. Validate everything that comes in

A request from the internet is the ultimate **untrusted boundary** (chapter 05). Types do not exist at runtime, so the server must check the real data: is the body an object, does it have the field, is the field the right type and within the limit? Only then call the logic. Reject bad input with a clear `4xx` and a useful message.

## 8. Errors and security basics

- **Never leak internals** in error responses: no stack traces, file paths or library names. Log the details on the server and return a generic message with a `500`.
- Servers often advertise themselves in a header (`X-Powered-By: Express`). Turning this off is a small, common hardening step.
- Set limits on body size and consider rate limiting before exposing a server publicly.
- Things to add when the API is exposed to real users: authentication, HTTPS, and CORS settings for browsers (a later chapter).

## 9. Trying an API by hand

```powershell
Invoke-RestMethod http://localhost:4000/health          # fetch and parse JSON
curl.exe -i http://localhost:4000/health                 # show status line and headers too

# sending a POST body from PowerShell
$body = @{ text = "some text" } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri http://localhost:4000/stress -ContentType "application/json" -Body $body
```

A browser can only make simple `GET` requests by typing an address; for everything else use these tools, or a client like Postman or Insomnia.

## 10. Text encoding over HTTP (why you sometimes see `?`)

HTTP carries **bytes**, not text. Text is turned into bytes by an **encoding** (almost always **UTF-8** on the web) and turned back by the receiver. Both sides must agree.

- The `Content-Type` header can declare it: `application/json; charset=utf-8`. JSON is defined to be UTF-8, and servers like Express read it that way.
- If a client encodes with a **narrower encoding** (for example Latin-1, which has no Cyrillic, Greek or Chinese letters), characters it cannot represent are replaced with `?` **before they are sent**. The server then receives genuine question marks. It did nothing wrong, and nothing on the server can restore what was lost.
- Garbled text with odd symbols (`Ð¿Ñ€Ð¸Ð²ÐµÑ‚`) is the opposite mistake: UTF-8 bytes decoded with the wrong encoding. It is called **mojibake**.
- **How to tell which side is at fault:** test the server from code that is known to send UTF-8 (a supertest test, or a small Node script). If that works, the fault is in the client or the terminal. A terminal can also *display* correct text as `?` when its output encoding is not UTF-8, so check the actual characters (for example, ask whether the result contains a specific code point) instead of trusting how it looks.
- Windows PowerShell 5.1 is a known trap: a string passed to `Invoke-RestMethod -Body` without a charset is encoded in a narrow legacy encoding. Send UTF-8 bytes explicitly and declare the charset:

```powershell
$json  = @{ text = "Привет" } | ConvertTo-Json
$bytes = [System.Text.Encoding]::UTF8.GetBytes($json)
Invoke-RestMethod -Method Post -Uri http://localhost:4000/stress `
  -ContentType "application/json; charset=utf-8" -Body $bytes
```

PowerShell 7 and later default to UTF-8. Check your version with `$PSVersionTable.PSVersion`.

## Common mistakes

- Starting to write server code before the contract is clear.
- Returning `200` with an error message inside, instead of a proper `4xx` or `5xx`.
- Trusting the request body without checking it.
- Sending internal error details to clients.
- Forgetting the body-size limit.
- Doing long CPU work inside a request handler in Node.
- Starting a server inside the function that builds the app, which makes testing hard.
- Blaming the server for `?` characters that a client with the wrong encoding produced.

## Practice

1. Which status code would you return for a request whose JSON is malformed? For a request that is syntactically fine but too big?
2. Why use `{ "annotatedText": "..." }` instead of a bare string?
3. What is the difference between a 4xx and a 5xx?
4. Why does `createApp` not call `listen`?
5. A client sends `{ "text": 42 }`. What should the server do, and where?

**Answers.** (1) `400`; `413`. (2) Fields can be added later without breaking clients. (3) 4xx means the client should change its request; 5xx means the server failed. (4) So tests can use the app without opening a port or loading real resources. (5) Reject it with a `400` and an error message, at the request boundary before any logic runs.

## Where it appeared in Udarenie

The `GET /health` and `POST /stress` contract, the shared request, response and error types, the `createApp` / `server.ts` split, the 100,000-character limit explained by the single thread, and the smoke script that proved the packages connect.
