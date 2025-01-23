describe("Post Creation Page", () => {
    const apiUrl = Cypress.env("CYPRESS_API_BASE_URL");
  
    beforeEach(() => {
      cy.visit("/post-creation");
    });
  
    it("should display the form elements", () => {
      cy.get(".post-content-textarea").should("exist").and("be.visible");
      cy.get(".crypto-tag-input").should("exist").and("be.visible");
      cy.get(".media-upload-input").should("exist").and("be.visible");
      cy.get(".submit-button").should("exist").and("be.disabled");
    });
  
    it("should display an error for empty content", () => {
      cy.get(".submit-button").click();
      cy.get(".error-message").should("contain.text", "Content cannot be empty.");
    });
  
    it("should display an error for exceeding character limit", () => {
      const longContent = "A".repeat(281); // Exceeding the 280-character limit
      cy.get(".post-content-textarea").type(longContent);
      cy.get(".submit-button").click();
      cy.get(".error-message").should("contain.text", "Content cannot exceed 280 characters.");
    });
  
    it("should validate media upload type and size", () => {
      // Test for unsupported file type
      cy.get(".media-upload-input").selectFile("cypress/fixtures/unsupported_file.txt", {
        force: true,
      });
      cy.get(".media-upload-error").should("contain.text", "Only JPG, PNG, and MP4 files are allowed.");
  
      // Test for file size exceeding limit
      cy.get(".media-upload-input").selectFile("cypress/fixtures/large_file.jpg", { force: true });
      cy.get(".media-upload-error").should("contain.text", "File size must not exceed 5MB.");
    });
  
    it("should allow valid media upload", () => {
      cy.get(".media-upload-input").selectFile("cypress/fixtures/sample_image.jpg", { force: true });
      cy.get(".selected-file").should("contain.text", "sample_image.jpg");
    });
  
    it("should display a success message on successful post creation", () => {
      cy.intercept("POST", `${apiUrl}/posts`, {
        statusCode: 201,
        body: { message: "Post created successfully!" },
      }).as("createPost");
  
      cy.get(".post-content-textarea").type("This is a test post.");
      cy.get(".crypto-tag-input").type("SOL");
      cy.get(".media-upload-input").selectFile("cypress/fixtures/sample_image.jpg", { force: true });
      cy.get(".submit-button").click();
  
      cy.wait("@createPost");
      cy.get(".success-message").should("contain.text", "Post created successfully!");
    });
  
    it("should display an error message on failed post creation", () => {
      cy.intercept("POST", `${apiUrl}/posts`, {
        statusCode: 500,
        body: { error: "Failed to create post." },
      }).as("createPostError");
  
      cy.get(".post-content-textarea").type("This is a test post.");
      cy.get(".crypto-tag-input").type("BTC");
      cy.get(".submit-button").click();
  
      cy.wait("@createPostError");
      cy.get(".error-message").should("contain.text", "Failed to create the post. Please try again.");
    });
  
    it("should reset the form after a successful post", () => {
      cy.intercept("POST", `${apiUrl}/posts`, {
        statusCode: 201,
        body: { message: "Post created successfully!" },
      }).as("createPost");
  
      cy.get(".post-content-textarea").type("Test reset functionality.");
      cy.get(".crypto-tag-input").type("ETH");
      cy.get(".media-upload-input").selectFile("cypress/fixtures/sample_image.jpg", { force: true });
      cy.get(".submit-button").click();
  
      cy.wait("@createPost");
      cy.get(".post-content-textarea").should("have.value", "");
      cy.get(".crypto-tag-input").should("have.value", "");
      cy.get(".selected-file").should("not.exist");
    });
  });
  