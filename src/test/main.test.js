import { describe, expect, test, beforeAll, afterEach } from "bun:test";
import app from "../main.js";

describe("Video API Tests", () => {
  const baseURL = "http://localhost:123";
  let testVideoId;

  // Helper function to make requests
  const fetchEndpoint = async (path, options = {}) => {
    const url = `${baseURL}${path}`;
    const response = await app.fetch(new Request(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    }));
    return response;
  };

  // Test data
  const testVideo = {
    videoName: "Test Video",
    channelName: "Test Channel",
    duration: "10:00",
  };

  // Clean up after each test
  afterEach(async () => {
    if (testVideoId) {
      await fetchEndpoint(`/video/${testVideoId}`, {
        method: "DELETE",
      });
      testVideoId = null;
    }
  });

  // Test root endpoint
  test("GET / returns Hello World", async () => {
    const response = await fetchEndpoint("/");
    expect(response.status).toBe(200);
    const text = await response.text();
    expect(text).toContain("Hello World");
  });

  // Test video creation
  test("POST /video creates a new video", async () => {
    const response = await fetchEndpoint("/video", {
      method: "POST",
      body: JSON.stringify(testVideo),
    });

    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.videoName).toBe(testVideo.videoName);
    expect(data.channelName).toBe(testVideo.channelName);
    expect(data.duration).toBe(testVideo.duration);
    expect(data.id).toBeDefined();
    
    // Save the ID for cleanup
    testVideoId = data.id;
  });

  // Test getting all videos
  test("GET /videos returns video stream", async () => {
    // 
    const createResponse = await fetchEndpoint("/video", {
      method: "POST",
      body: JSON.stringify(testVideo),
    });
    const newVideo = await createResponse.json();
    testVideoId = newVideo.id;

    // Then test the videos endpoint
    const response = await fetchEndpoint("/videos");
    expect(response.status).toBe(200);
    
    // Read the stream
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let receivedData = "";
    
    while (true) {
      const {done, value} = await reader.read();
      if (done) break;
      receivedData += decoder.decode(value);
    }
    
    expect(receivedData).toContain(testVideo.videoName);
  });

  // Test getting a single video
  test("GET /video/:id returns specific video", async () => {
    const createResponse = await fetchEndpoint("/video", {
      method: "POST",
      body: JSON.stringify(testVideo),
    });
    const newVideo = await createResponse.json();
    testVideoId = newVideo.id;

    // Then test getting it
    const response = await fetchEndpoint(`/video/${testVideoId}`);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.videoName).toBe(testVideo.videoName);
  });

  // Test updating a video
  test("PUT /video/:id updates a video", async () => {
   
    const createResponse = await fetchEndpoint("/video", {
      method: "POST",
      body: JSON.stringify(testVideo),
    });
    const newVideo = await createResponse.json();
    testVideoId = newVideo.id;

    // Update data
    const updateData = {
      videoName: "Updated Video Name",
      duration: "15:00",
    };

    // Test the update
    const response = await fetchEndpoint(`/video/${testVideoId}`, {
      method: "PUT",
      body: JSON.stringify(updateData),
    });
    
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.videoName).toBe(updateData.videoName);
    expect(data.duration).toBe(updateData.duration);
  });

  // Test deleting a video
  test("DELETE /video/:id deletes a video", async () => {
   
    const createResponse = await fetchEndpoint("/video", {
      method: "POST",
      body: JSON.stringify(testVideo),
    });
    const newVideo = await createResponse.json();
    testVideoId = newVideo.id;

    // Test deletion
    const response = await fetchEndpoint(`/video/${testVideoId}`, {
      method: "DELETE",
    });
    
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.message).toBe("Video Deleted");

    // Verify it's gone
    const getResponse = await fetchEndpoint(`/video/${testVideoId}`);
    expect(getResponse.status).toBe(404);
  });

  // Test 404 for non-existent video
  test("GET /video/:id returns 404 for non-existent video", async () => {
    const response = await fetchEndpoint("/video/nonexistent-id");
    expect(response.status).toBe(404);
  });

  // Test 404 for non-existent route
  test("Non-existent route returns 404", async () => {
    const response = await fetchEndpoint("/nonexistent-route");
    expect(response.status).toBe(404);
    const text = await response.text();
    expect(text).toBe("Sorry URL Not Found");
  });
});