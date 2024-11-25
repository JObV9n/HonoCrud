import { Hono } from "hono";
import { stream } from "hono/streaming";
import { v4 as uuidv4 } from "uuid";

import UrlManager from "./movies.js";

const app = new Hono();

const movieUrl = new UrlManager();

//Initial setup
try {
  await movieUrl.setup();
} catch (err) {
  console.error(err);
}

app.get("/", (c) => {
  return c.html("<h1>Hello World</h1>");
});

//
app.post("/video", async (c) => {
  const { videoName, channelName, duration } = await c.req.json();
  const newVideo = {
    id: uuidv4(),
    videoName,
    channelName,
    duration,
  };

  // videos.push(newVideo);
  await movieUrl.createURL(newVideo);

  return c.json(newVideo, 201);
});

//Get all videos

app.get("/videos", (c) => {
  return stream(c, async (stream) => {
    stream.onAbort(() => {
      console.log("Connection aborted");
    });

    // for (const video of videos) {
    for (const video of await movieUrl.readURL()) {
      await stream.writeln(JSON.stringify(video));
    }
  });
});

//Get a single video
app.get("video/:id", (c) => {
  const { id } = c.req.param();

  const video = movieUrl.urls.find((v) => v.id === id);

  if (!video) {
    return c.json({ message: "Video Not found" }, 404);
  }
  return c.json(video);
});

//PUT method for updating the video
app.put("/video/:id", async (c) => {
  const { id } = c.req.param();
  const updateData = await c.req.json();

  const updated = await movieUrl.updateUrl(id, updateData);
  return c.json(updated);
});

//delete single videos
app.delete("/video/:id", (c) => {
  try {
    const { id } = c.req.param();
    movieUrl.deleteUrl(id);
    return c.json({
      message: "Video Deleted",
    });
  } catch (err) {
    return c.json({ message: "Video not found" }, 404);
  }
});

//Error handling
app.onError((err, c) => {
  console.error(`${err}`);
  return c.text("Internal Server Error", 500);
});

app.notFound((c) => {
  return c.text("Sorry URL Not Found", 404);
});

export default {
  port: 123,
  fetch: app.fetch,
};
