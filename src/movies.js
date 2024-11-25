import { promises as fs } from "fs";
import path from "path";

class UrlManager {
  constructor(filename = "urls.json") {
    this.filePath = path.join(path.resolve(), filename);
    this.urls = [];
  }

  //initilize
  async setup() {
    try {
      try {
        await fs.access(this.filePath);
        // If file exists, read it
        var data = await this.readURL();

        if ( !data || data.length === 0) {
          data = JSON.parse(data);
          this.urls = data;
        }
      } catch (err) {
        if (err.code === "ENOENT") {
          await fs.writeFile(this.filePath, JSON.stringify([], null, 2));
          this.urls = [];
        }
      }
    } catch (err) {
      throw new Error(`Error initializing the file: ${err.messsage}`);
    }
  }

  /*----------CRUD URLS---------*/

  //save url to JSON
  async saveUrl(url) {
    try {
      await fs.writeFile(this.filePath, JSON.stringify(url, null, 2));
    } catch (err) {
      throw new Error(`Error Saving the URL: ${err.messsage}`);
    }
  }

  //read from JSON
  async readURL() {
    try {
      const data = await fs.readFile(this.filePath, "utf8");
      this.urls = JSON.parse(data);

      return this.urls;
    } catch (err) {
      throw new Error(`Error Reading the URLs: ${err}`);
    }
  }

  //Create URL
  async createURL(url) {
    try {
      // const urls = await this.readURL();
      console.log(this.urls);
      const newUrl = {
        ...url,
        createdAt: new Date().toISOString(),
      };
      this.urls.push(newUrl);
      await this.saveUrl(this.urls); //save the url to the file
    } catch (err) {
      throw new Error(`Error Creating URL: ${err}`);
    }
  }

  //Update URL
  async updateUrl(id, newUrl) {
    try {
      // const urls = await this.readURL();
      const index = this.urls.findIndex((url) => url.id === id);

      if (index === -1) {
        throw new Error(`URL not Found`);
      }

      this.urls[index] = {
        ...this.urls[index],
        ...newUrl,
        updatedAt: new Date().toISOString(),
      };

      // await fs.writeFile(this.filePath, JSON.stringify(this.urls, null, 2));
      await this.saveUrl(this.urls);
      return this.urls[index];
    } catch (err) {
      throw new Error(`Error Updating the URLs: ${err}`);
    }
  }

  //delete url with the id

  async deleteUrl(id) {
    try {
      //find the url or that id
      const urlIndex = this.urls.findIndex((url) => url.id === id);

      if (urlIndex === -1) {
        throw new Error(`Url not Found.`);
      }
      //start with the url index and deletes onyl one element
      this.urls.splice(urlIndex, 1);
      //
      // await fs.writeFile(this.filePath, JSON.stringify(this.urls, null, 2));
      await this.saveUrl(this.urls);
      console.log("URL Deleted");
    } catch (err) {
      throw new Error(`Error Deleting the URL: ${err.messsage}`);
    }
  }
}

export { UrlManager as default };
