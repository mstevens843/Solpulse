import { io } from "socket.io-client";

describe("WebSocket Integration Test", () => {
  let socket;

  beforeEach(() => {
    // Intercept the API call for posts
    cy.intercept("GET", `${Cypress.env("CYPRESS_API_BASE_URL")}/posts?page=1`, {
      statusCode: 200,
      body: { posts: [] }, // Mock response
    }).as("getPosts");

    // Visit the frontend
    cy.visit("/");

    // Wait for the API to complete
    cy.wait("@getPosts");

    // Establish WebSocket connection
    cy.window().then(() => {
      socket = io(Cypress.env("CYPRESS_WEBSOCKET_URL"), { withCredentials: true });

      socket.on("connect", () => {
        expect(socket.connected).to.be.true;
        cy.log("WebSocket connected");
      });
    });
  });

  it("should connect to the WebSocket server and receive events", () => {
    // Listen for WebSocket events
    socket.on("new_message", (data) => {
      expect(data.content).to.eq("Test message from server");
      cy.log("WebSocket Event Received:", data);
    });

    // Simulate server WebSocket event
    cy.request("POST", `${Cypress.env("CYPRESS_API_BASE_URL")}/socket/test-websocket-event`, {
      event: "new_message",
      data: { content: "Test message from server" },
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property("success", true);
    });
  });

  afterEach(() => {
    // Disconnect WebSocket after the test
    cy.window().then(() => {
      if (socket) {
        socket.disconnect();
        cy.log("WebSocket disconnected");
      }
    });
  });
});

