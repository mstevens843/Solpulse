describe("Messages Page", () => {
    const apiUrl = Cypress.env("CYPRESS_API_BASE_URL");
    const token =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJ0ZXN0dXNlciIsImlhdCI6MTY4MzQyNzYwMCwiZXhwIjoxNjgzNTM2MjAwfQ.DummyJWT";
  
    beforeEach(() => {
      cy.intercept("GET", `${apiUrl}/messages?page=1`, {
        statusCode: 200,
        body: {
          messages: [
            {
              id: 1,
              sender: "Alice",
              content: "Hello, how are you?",
              cryptoTip: 0.1,
              read: false,
              createdAt: "2025-01-08T12:00:00.000Z",
            },
            {
              id: 2,
              sender: "Bob",
              content: "Don't forget the meeting tomorrow.",
              cryptoTip: 0,
              read: true,
              createdAt: "2025-01-07T12:00:00.000Z",
            },
          ],
          totalMessages: 2,
          totalPages: 1,
          currentPage: 1,
        },
      }).as("fetchMessages");
  
      cy.visit("/messages", {
        onBeforeLoad(win) {
          // Mock the token for authentication
          win.localStorage.setItem("authToken", token);
        },
      });
    });
  
    it("should display messages fetched from the API", () => {
      cy.wait("@fetchMessages");
      cy.get(".message-list").within(() => {
        cy.contains("Alice").should("exist");
        cy.contains("Hello, how are you?").should("exist");
        cy.contains("Bob").should("exist");
        cy.contains("Don't forget the meeting tomorrow.").should("exist");
      });
    });
  
    it("should mark a message as read when clicked", () => {
      cy.intercept("PATCH", `${apiUrl}/messages/1/read`, {
        statusCode: 200,
        body: { message: "Message marked as read.", id: 1 },
      }).as("markAsRead");
  
      cy.get(".message-item.unread").first().click();
      cy.wait("@markAsRead");
      cy.get(".message-item.read").should("exist");
    });
  
    it("should send a new message", () => {
      cy.intercept("POST", `${apiUrl}/messages`, {
        statusCode: 201,
        body: {
          id: 3,
          sender: "testuser",
          content: "This is a test message.",
          cryptoTip: 0.5,
          read: false,
          createdAt: "2025-01-09T12:00:00.000Z",
        },
      }).as("sendMessage");
  
      cy.get("#recipient").type("John");
      cy.get("#newMessage").type("This is a test message.");
      cy.get("#cryptoTip").type("0.5");
      cy.get("button[type='submit']").click();
  
      cy.wait("@sendMessage");
      cy.get(".messages-success").should("contain", "Message sent successfully!");
      cy.get(".message-list").within(() => {
        cy.contains("This is a test message.").should("exist");
      });
    });
  
    it("should display an error when failing to send a message", () => {
      cy.intercept("POST", `${apiUrl}/messages`, {
        statusCode: 500,
        body: { error: "Failed to send message." },
      }).as("sendMessageFail");
  
      cy.get("#recipient").type("UnknownUser");
      cy.get("#newMessage").type("This is a test message.");
      cy.get("button[type='submit']").click();
  
      cy.wait("@sendMessageFail");
      cy.get(".messages-error").should("contain", "Failed to send message.");
    });
  
    it("should display an error when failing to fetch messages", () => {
      cy.intercept("GET", `${apiUrl}/messages?page=1`, {
        statusCode: 500,
        body: { error: "Failed to load messages." },
      }).as("fetchMessagesFail");
  
      cy.reload();
      cy.wait("@fetchMessagesFail");
      cy.get(".messages-error").should("contain", "Failed to load messages.");
    });
  });
  