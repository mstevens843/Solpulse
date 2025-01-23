describe("Followers and Following Page", () => {
    const apiUrl = Cypress.env("CYPRESS_API_BASE_URL");
  
    beforeEach(() => {
      // Set up intercepts for API calls
      cy.intercept("GET", `${apiUrl}/users/1/followers`, {
        fixture: "followers.json",
      }).as("getFollowers");
  
      cy.intercept("GET", `${apiUrl}/users/1/following`, {
        fixture: "following.json",
      }).as("getFollowing");
  
      cy.visit("/followers-following");
    });
  
    it("should display followers and following on load", () => {
      // Wait for API calls
      cy.wait("@getFollowers");
      cy.wait("@getFollowing");
  
      // Verify followers section
      cy.get(".followers-header").contains("Followers (2)").should("exist");
      cy.get(".user-list").eq(0).within(() => {
        cy.get(".user-card").should("have.length", 2); // Assuming 2 followers in the fixture
      });
  
      // Verify following section
      cy.get(".followers-header").contains("Following (3)").should("exist");
      cy.get(".user-list").eq(1).within(() => {
        cy.get(".user-card").should("have.length", 3); // Assuming 3 following in the fixture
      });
    });
  
    it("should display a loading state while fetching data", () => {
      // Mock delayed API responses
      cy.intercept("GET", `${apiUrl}/users/1/followers`, {
        delay: 1000,
        fixture: "followers.json",
      }).as("delayedGetFollowers");
  
      cy.intercept("GET", `${apiUrl}/users/1/following`, {
        delay: 1000,
        fixture: "following.json",
      }).as("delayedGetFollowing");
  
      cy.visit("/followers-following");
  
      // Verify loading message
      cy.contains("Loading followers and following data...").should("be.visible");
  
      // Wait for API calls to finish
      cy.wait("@delayedGetFollowers");
      cy.wait("@delayedGetFollowing");
  
      // Verify data is displayed after loading
      cy.get(".user-list").should("exist");
    });
  
    it("should display an error message if API fails", () => {
      // Mock error responses for APIs
      cy.intercept("GET", `${apiUrl}/users/1/followers`, { statusCode: 500 }).as(
        "getFollowersError"
      );
      cy.intercept("GET", `${apiUrl}/users/1/following`, { statusCode: 500 }).as(
        "getFollowingError"
      );
  
      cy.visit("/followers-following");
  
      // Wait for error responses
      cy.wait("@getFollowersError");
      cy.wait("@getFollowingError");
  
      // Verify error message
      cy.contains("Failed to fetch followers and following. Please try again later.").should(
        "be.visible"
      );
    });
  
    it("should display an empty message if no followers or following", () => {
      // Mock empty API responses
      cy.intercept("GET", `${apiUrl}/users/1/followers`, {
        body: { followers: [] },
      }).as("getEmptyFollowers");
  
      cy.intercept("GET", `${apiUrl}/users/1/following`, {
        body: { following: [] },
      }).as("getEmptyFollowing");
  
      cy.visit("/followers-following");
  
      // Wait for API responses
      cy.wait("@getEmptyFollowers");
      cy.wait("@getEmptyFollowing");
  
      // Verify empty state messages
      cy.contains("No followers yet.").should("be.visible");
      cy.contains("Not following anyone yet.").should("be.visible");
    });
  });
  