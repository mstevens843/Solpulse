describe("Explore Page", () => {
    const apiUrl = Cypress.env("CYPRESS_API_BASE_URL");
  
    beforeEach(() => {
      // Set up intercepts for API calls
      cy.intercept("GET", `${apiUrl}/posts/trending`, {
        fixture: "trendingPosts.json",
      }).as("getTrendingPosts");
  
      cy.visit("/explore");
    });
  
    it("should display trending posts on load", () => {
      // Wait for trending posts API call
      cy.wait("@getTrendingPosts");
  
      // Verify trending posts section
      cy.get(".trending-section").within(() => {
        cy.contains("Trending Topics").should("exist");
        cy.get(".trending-post").should("have.length", 3); // Assuming 3 posts in the fixture
  
        // Verify post details
        cy.get(".trending-post").first().within(() => {
          cy.contains("Author Name").should("exist"); // Mock data from fixture
          cy.contains("This is a trending post content.").should("exist");
          cy.get(".hashtag").should("exist");
        });
      });
    });
  
    it("should search posts based on the user's query", () => {
      // Set up intercept for search API
      cy.intercept(
        "GET",
        `${apiUrl}/posts/search?query=crypto`,
        { fixture: "searchResults.json" }
      ).as("searchPosts");
  
      // Perform search
      cy.get(".search-input").type("crypto{enter}");
  
      // Wait for search API call
      cy.wait("@searchPosts");
  
      // Verify search results
      cy.get(".trending-section").within(() => {
        cy.contains("Trending Topics").should("exist");
        cy.get(".trending-post").should("have.length", 2); // Assuming 2 results in the fixture
  
        // Verify search result details
        cy.get(".trending-post").first().within(() => {
          cy.contains("Crypto Author").should("exist");
          cy.contains("This is a post about crypto.").should("exist");
          cy.get(".hashtag").should("exist");
        });
      });
    });
  
    it("should display a loading state while fetching posts", () => {
      // Mock delayed response for trending posts
      cy.intercept("GET", `${apiUrl}/posts/trending`, {
        delay: 1000,
        fixture: "trendingPosts.json",
      }).as("getTrendingPostsDelayed");
  
      cy.visit("/explore");
  
      // Verify loading state
      cy.get(".explore-loading").should("be.visible");
  
      // Wait for API call to finish
      cy.wait("@getTrendingPostsDelayed");
  
      // Verify posts are displayed after loading
      cy.get(".trending-post").should("have.length", 3);
    });
  
    it("should display an error message if trending posts fail to load", () => {
      // Mock error response for trending posts
      cy.intercept("GET", `${apiUrl}/posts/trending`, {
        statusCode: 500,
      }).as("getTrendingPostsError");
  
      cy.visit("/explore");
  
      // Wait for error response
      cy.wait("@getTrendingPostsError");
  
      // Verify error message
      cy.contains("Failed to load trending posts. Please refresh and try again.").should(
        "be.visible"
      );
    });
  
    it("should display an error message if search fails", () => {
      // Set up intercept for failed search
      cy.intercept(
        "GET",
        `${apiUrl}/posts/search?query=crypto`,
        { statusCode: 500 }
      ).as("searchPostsError");
  
      // Perform search
      cy.get(".search-input").type("crypto{enter}");
  
      // Wait for search API call
      cy.wait("@searchPostsError");
  
      // Verify error message
      cy.contains("Failed to fetch search results. Please try again.").should(
        "be.visible"
      );
    });
  
    it("should display an empty state message if no trending posts are found", () => {
      // Mock empty trending posts response
      cy.intercept("GET", `${apiUrl}/posts/trending`, {
        body: { posts: [] },
      }).as("getEmptyTrendingPosts");
  
      cy.visit("/explore");
  
      // Wait for API call
      cy.wait("@getEmptyTrendingPosts");
  
      // Verify empty state message
      cy.get(".trending-empty").should(
        "contain",
        "No trending posts found. Try searching for specific topics."
      );
    });
  });
  