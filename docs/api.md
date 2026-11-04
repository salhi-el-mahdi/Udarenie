# Udarenie API

The Udarenie API adds stress marks to Russian text over HTTP: you send text as JSON and receive the same text with stress marks added. This document is the reference for its endpoints, requests, responses and errors.

## Base address

When you run the API on your computer, it listens on:

```text
http://localhost:4000
```

To use another port, set the `PORT` environment variable before starting the server. Installing and starting the API is described in the [Quick start](../README.md#quick-start) of the README.

The server must be **running** before you send requests: start it in one terminal and leave that terminal open, then send requests from a second terminal. If a request fails with "connection refused" (curl says `Could not connect to server`), no server is listening on that address: it is not running, or you used the wrong port. Use the API's port (4000 by default), not the web app's port (3000).

## Format

- Requests and responses use **JSON**, and so do error responses.
- A request that has a body must send the header `Content-Type: application/json`.
- Text is encoded in **UTF-8**.
- The `text` field may contain at most **100,000 characters**, and the whole request body may be at most **1 MB**.

## Endpoints

### `GET /health`

Checks that the server is running and that its dictionary is loaded.

**Request:** none. No parameters and no body.

**Response:** `200 OK`

| Field | Type | Meaning |
|---|---|---|
| `status` | string | Always `"ok"` |
| `dictionaryEntries` | number | How many word forms the loaded dictionary contains |

**Example**

```bash
curl http://localhost:4000/health
```

```json
{"status":"ok","dictionaryEntries":3015599}
```

If the server is not running, there is no response: the connection is refused.

### `POST /stress`

Adds stress marks to the text you send.

**Request**

| Header | Value |
|---|---|
| `Content-Type` | `application/json` |

The body is a JSON object with one field:

| Field | Type | Required | Meaning |
|---|---|---|---|
| `text` | string | yes | The Russian text to annotate, at most 100,000 characters. It may be empty. |

**Response:** `200 OK`

| Field | Type | Meaning |
|---|---|---|
| `annotatedText` | string | The same text with stress marks added |

**Example**

```bash
curl -X POST http://localhost:4000/stress \
  -H "Content-Type: application/json" \
  -d '{"text": "Я люблю русский язык."}'
```

```json
{"annotatedText":"Я люблю́ ру́сский язы́к."}
```

**About the result**

- A stress mark is the combining acute accent (U+0301), inserted right after the stressed vowel. Everything else (letters, punctuation, spaces, line breaks, capitalization) stays exactly as sent.
- Words that are not in the dictionary are returned unchanged.
- Some words are deliberately not marked: words with a single vowel, and the letter `ё`, which is always stressed. See [Known limitations](../README.md#known-limitations).
- Error responses are described in [Errors](#errors).

## Errors

Every error response has the same JSON shape:

```json
{
  "error": {
    "code": "INVALID_REQUEST",
    "message": "Field \"text\" must be a string."
  }
}
```

- `code` identifies the kind of error. It is stable: programs should use it to decide what to do.
- `message` explains the problem to a person. Its wording may change, so do not match on it.

| Status | `code` | When it happens |
|---|---|---|
| `400` | `INVALID_REQUEST` | The body is missing, is not valid JSON, is not a JSON object, or has no `text` field that is a string. Also returned when the `Content-Type` is not `application/json`, because the body is then ignored |
| `404` | `NOT_FOUND` | The path does not exist, or the method is not supported for that path (for example `GET /stress`) |
| `413` | `TEXT_TOO_LONG` | `text` has more than 100,000 characters, or the request body is larger than 1 MB |
| `500` | `INTERNAL_ERROR` | Something unexpected failed on the server. The message is always generic, and the details are only in the server's log |

### Examples

A `text` that is not a string:

```bash
curl -i -X POST http://localhost:4000/stress \
  -H "Content-Type: application/json" \
  -d '{"text": 42}'
```

```text
HTTP/1.1 400 Bad Request
Content-Type: application/json; charset=utf-8
```

```json
{"error":{"code":"INVALID_REQUEST","message":"Field \"text\" must be a string."}}
```

A path that does not exist:

```bash
curl -i http://localhost:4000/nope
```

```text
HTTP/1.1 404 Not Found
Content-Type: application/json; charset=utf-8
```

```json
{"error":{"code":"NOT_FOUND","message":"No such endpoint."}}
```

## Notes for Windows (PowerShell)

The examples above use bash syntax (macOS and Linux). On Windows PowerShell there are two things to know. These commands were tested on Windows PowerShell 5.1.

**Use `curl.exe`, not `curl`.** In Windows PowerShell, `curl` is an alias for a different command (`Invoke-WebRequest`). Typing the `.exe` runs the real curl.

**Non-ASCII text needs care.** Windows PowerShell 5.1 encodes a request body in a legacy encoding, so Cyrillic letters become `?` before they reach the server, and the text comes back unannotated. It also removes double quotes inside arguments passed to `curl.exe`. The two methods below avoid both problems.

### Method 1: `Invoke-RestMethod` with UTF-8 bytes

```powershell
$json  = '{"text": "Я люблю русский язык."}'
$bytes = [System.Text.Encoding]::UTF8.GetBytes($json)
$r = Invoke-RestMethod -Method Post -Uri http://localhost:4000/stress `
  -ContentType "application/json; charset=utf-8" -Body $bytes
$r.annotatedText
```

Converting the text to UTF-8 bytes yourself and declaring `charset=utf-8` is what makes it work.

### Method 2: `curl.exe` with a UTF-8 file

```powershell
$json = '{"text": "Я люблю русский язык."}'
[System.IO.File]::WriteAllBytes("$PWD\body.json", [System.Text.Encoding]::UTF8.GetBytes($json))
curl.exe -s -X POST http://localhost:4000/stress -H "Content-Type: application/json" --data-binary "@body.json" -o out.json
(Get-Content out.json -Raw -Encoding utf8 | ConvertFrom-Json).annotatedText
```

- `"$PWD\body.json"` gives the full path, because .NET methods do not use PowerShell's current folder.
- Do not create the file with `Out-File -Encoding utf8`: in Windows PowerShell 5.1 it adds a byte-order mark at the start of the file.
- `-o out.json` saves the response to a file, which is then read explicitly as UTF-8.

### Requests without non-ASCII characters

For JSON that contains only ASCII characters, write it in single quotes with a backslash before each double quote inside it:

```powershell
curl.exe -s -X POST http://localhost:4000/stress -H "Content-Type: application/json" -d '{\"text\": 42}'
```

### Checking the result

The default Windows console cannot display Cyrillic, so a correct answer may appear as `?` on screen. Instead of reading it by eye, check that the answer contains the stress mark (U+0301):

```powershell
$r.annotatedText.Contains([char]0x0301)
```

This prints `True` when the text was annotated. You can also save the text to a file and open it in an editor that shows Cyrillic:

```powershell
$r.annotatedText | Out-File -Encoding utf8 result.txt
```