---
title: "Content Delivery with Node.js Streams"
description: "Learn how Node.js streams enable efficient content delivery"
pubDate: "Jun 26 2023"
tags: ["Node.js", "Next.js"]
---

## The problem

In a project I'm currently working on, I have an API endpoint that retrieves the content of a file. However, this endpoint requires a private token for authentication, making it unsuitable to call directly from the browser due to the token exposure risk.

Fortunately, I'm using Next.js, which allows me to leverage API endpoints to safely make the call on the backend and then access the endpoint from the front end.

However, the external endpoint can return content of any type, making it challenging to parse the response and send it to the browser. One possible but undesirable solution would be manually checking the [`Content-Type`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type) header and using different parsing methods based on its value. This approach is brittle and relies on imperative programming.

Furthermore, it involves having the entire response in memory before sending it to the client, which can lead to memory overhead, slow response times, and even application crashes when handling large files.

A better approach is to forward the [`Content-Type`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type) header from the external API endpoint and let the browser handle the response's content based on that. This approach means that I need to pass the response body as-is, without parsing it on the backend. Fortunately, Node.js streams provide an elegant solution to this problem.

## Implementation of the solution

To address this challenge, I have implemented a solution using Node.js streams and Next.js API endpoints. Here's the code, and below it, a step-by-step explanation:

```js
// api/content/[filename].ts
import { fetchWithAuth } from "./fetch-with-auth";
import { NextApiRequest, NextApiResponse } from "next";
import { pipeline } from "stream/promises";
import { Readable } from "stream";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    const { filename: _filename = "" } = req.query;
    const file = Array.isArray(_filename) ? _filename[0] : _filename;

    const response = await fetchWithAuth(
      "https://example.com/api/v1/content/" + file,
      {
        headers: {
          Accept: "*/*",
        },
      }
    );

    const contentType = response.headers.get("content-type");

    if (!contentType) {
      console.error("Missing content type");
      return res.status(500).end();
    }

    const readable = response.body;

    if (!readable) {
      console.error("Missing body from API");
      return res.status(500).end();
    }

    const nodeReadable = Readable.fromWeb(readable);

    res.setHeader("Content-Type", contentType);

    await pipeline(nodeReadable, res);

    res.end();
  }

  return res.status(405);
}
```

Here's how the solution works:

1. The code checks if the request method is GET; otherwise, I return [405](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/405) status (`Method Not Allowed`).

2. Extract the filename from the request query, allowing dynamic content retrieval based on the requested filename.

3. Since I'm using Node.js 18, I have access to the [`fetch`](https://undici.nodejs.org/#/?id=undicifetchinput-init-promise) function, which I use in a custom `fetchWithAuth` that abstracts away my auth logic, my custom implementation has the same function signature as [`fetch`](https://undici.nodejs.org/#/?id=undicifetchinput-init-promise).

4. The code retrieves the [`Content-Type`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type) header from the API response. If the content type is missing, an error is logged, and a [500](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/500) status (`Internal Server Error`) is returned to the client. This approach ensures consistency as the API should always include the header, even though modern browsers perform [content sniffing](https://www.w3.org/TR/2008/WD-html5-20080610/history.html#content-type-sniffing), and I could still send the response to it.

5. `response.body` is a [readable stream](https://undici.nodejs.org/#/?id=responsebody). If the body is missing, an error is logged, and a [500](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/500) status (`Internal Server Error`) is returned since that means there's nothing to stream back to the client.

6. According to the spec of [`fetch`](https://undici.nodejs.org/#/?id=undicifetchinput-init-promise) implemented in [`undici`](https://undici.nodejs.org/#/), despite it being used in a Node.js environment the `response.body` is a [web readable stream](https://developer.mozilla.org/en-US/docs/Web/API/Streams_API/Using_readable_streams) so I have to convert it into a Node.js stream using [`Readable.fromWeb()`](https://nodejs.org/api/stream.html#streamreadablefromwebreadablestream-options)

7. I forward the [`Content-Type`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type) header for the response using res.setHeader.

8. The pipeline function is used to stream the content from the readable stream to the response.

9. Finally, when the pipeline finishes, I end the response with `res.end()`.

With this approach, I can securely utilize the external API and confidently include my own endpoint as the source for any HTML tag (`<img>`, `<video>`, `<iframe>`, etc.), without concerns about passing incorrect content.
