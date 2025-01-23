describe("Post Detail Page", () => {
    const apiUrl = Cypress.env("CYPRESS_API_BASE_URL");
    const postId = 1;
  
    beforeEach(() => {
      cy.visit(`/posts/${postId}`);
    });
  
    it("should display a loader while fetching the post", () => {
      cy.intercept("GET", `${apiUrl}/posts/${postId}`, (req) => {
        req.reply((res) => {
          res.setDelay(2000); // Simulate network delay
          res.send({});
        });
      }).as("fetchPost");
  
      cy.get(".loader").should("be.visible");
      cy.wait("@fetchPost");
      cy.get(".loader").should("not.exist");
    });
  
    it("should display post details on successful API response", () => {
      cy.intercept("GET", `${apiUrl}/posts/${postId}`, {
        statusCode: 200,
        body: {
          id: postId,
          author: "crypto_enthusiast",
          content: "Blockchain is the future.",
          cryptoTag: "SOL",
          media: "/path/to/media.jpg",
          mediaType: "image",
          likes: 5,
          comments: [
            { id: 1, content: "Great post!", userId: 2 },
            { id: 2, content: "I agree with you!", userId: 3 },
          ],
        },
      }).as("fetchPost");
  
      cy.wait("@fetchPost");
  
      // Validate post details
      cy.get(".post-info").within(() => {
        cy.contains("crypto_enthusiast").should("be.visible");
        cy.contains("Blockchain is the future.").should("be.visible");
        cy.get(".crypto-tag").should("contain.text", "#SOL");
        cy.get("img").should("have.attr", "src", "/path/to/media.jpg");
      });
  
      // Validate comments section
      cy.get(".comments-section").within(() => {
        cy.contains("Comments").should("be.visible");
        cy.get(".comment-item").should("have.length", 2);
        cy.contains("Great post!").should("be.visible");
        cy.contains("I agree with you!").should("be.visible");
      });
    });
  
    it("should handle errors gracefully when API fails", () => {
      cy.intercept("GET", `${apiUrl}/posts/${postId}`, {
        statusCode: 500,
        body: { message: "Failed to load the post." },
      }).as("fetchPostError");
  
      cy.wait("@fetchPostError");
  
      cy.get(".error-container").should("be.visible");
      cy.contains("Failed to load the post. Please try again.").should("be.visible");
  
      // Retry functionality
      cy.intercept("GET", `${apiUrl}/posts/${postId}`, {
        statusCode: 200,
        body: {
          id: postId,
          author: "crypto_enthusiast",
          content: "Blockchain is the future.",
          likes: 5,
          comments: [],
        },
      }).as("fetchPostRetry");
  
      cy.get(".error-container button").contains("Retry").click();
      cy.wait("@fetchPostRetry");
      cy.get(".post-info").should("contain.text", "Blockchain is the future.");
    });
  
    it("should display the 'No comments yet' message when no comments exist", () => {
      cy.intercept("GET", `${apiUrl}/posts/${postId}`, {
        statusCode: 200,
        body: {
          id: postId,
          author: "crypto_enthusiast",
          content: "Blockchain is the future.",
          likes: 5,
          comments: [],
        },
      }).as("fetchPost");
  
      cy.wait("@fetchPost");
  
      cy.get(".comments-section").should("contain.text", "No comments yet. Be the first to comment!");
    });
  
    it("should allow adding a new comment", () => {
      cy.intercept("GET", `${apiUrl}/posts/${postId}`, {
        statusCode: 200,
        body: {
          id: postId,
          author: "crypto_enthusiast",
          content: "Blockchain is the future.",
          comments: [],
        },
      }).as("fetchPost");
  
      cy.intercept("POST", `${apiUrl}/comments`, {
        statusCode: 201,
        body: { id: 101, content: "This is a test comment", userId: 2 },
      }).as("addComment");
  
      cy.wait("@fetchPost");
  
      cy.get(".comments-section").within(() => {
        cy.get("textarea").type("This is a test comment");
        cy.get("button").contains("Comment").click();
      });
  
      cy.wait("@addComment");
  
      cy.get(".comments-section").should("contain.text", "This is a test comment");
    });
  
    it("should allow liking the post", () => {
      cy.intercept("GET", `${apiUrl}/posts/${postId}`, {
        statusCode: 200,
        body: {
          id: postId,
          likes: 5,
        },
      }).as("fetchPost");
  
      cy.intercept("POST", `${apiUrl}/posts/${postId}/like`, {
        statusCode: 200,
        body: { likes: 6 },
      }).as("likePost");
  
      cy.wait("@fetchPost");
  
      cy.get(".post-actions").within(() => {
        cy.contains("5").should("be.visible");
        cy.get(".like-button").click();
      });
  
      cy.wait("@likePost");
  
      cy.get(".post-actions").should("contain.text", "6");
    });
  
    it("should allow retweeting the post", () => {
      cy.intercept("GET", `${apiUrl}/posts/${postId}`, {
        statusCode: 200,
        body: {
          id: postId,
          retweets: 2,
        },
      }).as("fetchPost");
  
      cy.intercept("POST", `${apiUrl}/posts/${postId}/retweet`, {
        statusCode: 200,
        body: { retweets: 3 },
      }).as("retweetPost");
  
      cy.wait("@fetchPost");
  
      cy.get(".post-actions").within(() => {
        cy.contains("2").should("be.visible");
        cy.get(".retweet-button").click();
      });
  
      cy.wait("@retweetPost");
  
      cy.get(".post-actions").should("contain.text", "3");
    });
  });
  