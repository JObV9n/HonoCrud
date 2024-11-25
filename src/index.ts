import { Hono } from "hono";
import { poweredBy } from "hono/powered-by";
import { logger } from "hono/logger";
import connect from "./db/connect";
import FavVideosModel from "./db/fav-youtube-model";
import { isValidObjectId } from "mongoose";
// import { streamText } from "hono/streaming";

const app = new Hono();
//middlewares
app.use(poweredBy());
app.use(logger());

connect()
  .then(() => {
    //routes
    //Get
    app.get("/", async (c) => {
      const doc = await FavVideosModel.find();
      return c.json(
        doc.map((d) => d.toObject()),
        200
      );
    });

    app.get("/hello", (c) => {
      console.log("Here");
      return c.text("Hello");
    });

    //Creating
    //post route
    app.post("/", async (c) => {
      const data = await c.req.json();

      if (!data.thumbnailUrl) delete data.thumbnailUrl;

      const favYoutubeVideosObj = new FavVideosModel(data);

      try {
        await favYoutubeVideosObj.save();

        return c.json({ message: "Data Saved" }, 201);
      } catch (err) {
        return c.json((err as any)?.message || "Internal Server Error", 500);
      }
    });

    //get video by id
    app.get("/:id", async (c) => {
      const id = c.req.param("id");
      if (!isValidObjectId(id)) {
        return c.json("Invalid ID");
      }

      const document = await FavVideosModel.findById(id);
      if (!document) return c.json("Document not found", 404);

      return c.json(document.toObject(), 200);
    });

    //patch

    app.patch("/:id", async (c) => {
      const id = c.req.param("id");
      if (!isValidObjectId(id)) {
        return c.json("Invalid ID");
      }
      const document = await FavVideosModel.findById(id);
      if (!document) return c.json("Document not found", 400);

      const data = await c.req.json();
      if (!data.thumbnailUrl) delete data.thumbnailUrl;

      try {
        const updatedData = await FavVideosModel.findByIdAndUpdate(id, data, {
          new: true,
        });
        return c.json(updatedData?.toObject());
      } catch (error) {
        return c.json((error as any)?.message || "Internal Server Error", 500);
      }
    });

    //delete

    app.delete("/:id", async (c) => {
      const id = c.req.param("id");
      if (!isValidObjectId(id)) return c.json("Invalid ID");
      try {
        const deletedData = await FavVideosModel.findByIdAndDelete(id);
        if (!deletedData) return c.json("Document not found", 400);

        return c.json(deletedData.toObject(), 200);
      } catch (error) {
        return c.json((error as any)?.message || "Internal Server Error", 500);
      }
    });
    //end of routes
  })
  .catch((err) => {
    app.get("/*", (c) => {
      return c.text(`Failed to connect to database: ${err.message}`);
    });
    console.log(err);
    process.exit(1);
  });

app.onError((err, c) => {
  return c.text(`Error: ${err.message}`);
});

// export default app;
export default {
  port: 1234,
  fetch: app.fetch,
};
