describe("Authentication Integration Test", () => {
    const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTI1NDUsInVzZXJuYW1lIjoidGVzdHVzZXJza2VlYm9vIiwiZW1haWwiOiJ0ZXN0c2tlYm9vb2VAZXhhbXBsZS5jb20iLCJpYXQiOjE3MzYzNTQ0MDEsImV4cCI6MTkxNjM1NDQwMX0.mRQANEZItfPZWKQC1Q5FBJcPP-FH-eM-3XBUX2ualmo"; // Use the same token you generated
  
    before(() => {
      cy.visit("/", {
        onBeforeLoad(win) {
          // Set token in local storage before visiting the page
          win.localStorage.setItem("token", token);
        },
      });
    });
  
    it("should fetch user data with valid token", () => {
      // Intercept the /users/me route to return mock user data
      cy.intercept("GET", "**/users/me", {
        statusCode: 200,
        body: { username: "testuserskeeboo", email: "testskeboooe@example.com" },
      }).as("getUser");
  
      cy.visit("/"); // Trigger the page load
      cy.wait("@getUser").then((interception) => {
        expect(interception.response.statusCode).to.eq(200); // Ensure successful response
        expect(interception.response.body).to.have.property("username", "testuserskeeboo"); // Check username
      });
      cy.contains("Hello, testuserskeeboo!").should("be.visible"); // Ensure username is displayed on the page
    });
  });
  