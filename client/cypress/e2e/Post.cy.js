describe("API Integration Tests", () => {
    const token =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OCwidXNlcm5hbWUiOiJib2JieWJ1c2hheTUiLCJpYXQiOjE3MzY0MjA0NjUsImV4cCI6MTczODIyMDQ2NX0.3L_wGpwmqaytGy_nHJjHJlnk67Y3CBqeXQepxfAKRz4";
  
    it("should fetch posts", () => {
      cy.request({
        method: "GET",
        url: `${Cypress.env("CYPRESS_API_BASE_URL")}/posts`,
        headers: {
          Authorization: `Bearer ${token}`, // Include authorization if required
        },
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property("posts"); // Check if the 'posts' key exists
        expect(response.body.posts).to.be.an("array"); // Check if 'posts' is an array
        if (response.body.posts.length > 0) {
          // Only validate properties if posts exist
          expect(response.body.posts[0]).to.have.property("content"); // Validate a sample property
          expect(response.body.posts[0]).to.have.property("cryptoTag"); // Ensure cryptoTag exists
        }
      });
    });
  
    it("should create a new post", () => {
      cy.request({
        method: "POST",
        url: `${Cypress.env("CYPRESS_API_BASE_URL")}/posts`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: {
          content: "This is a test post.", // Required field
          cryptoTag: "solana", // Optional field
        },
      }).then((response) => {
        expect(response.status).to.eq(201); // Status code should indicate success
        expect(response.body).to.have.property("post"); // Ensure 'post' exists in the response
        expect(response.body.post).to.have.property("content", "This is a test post."); // Validate content
        expect(response.body.post).to.have.property("cryptoTag", "solana"); // Validate cryptoTag
      });
    });
  
    it("should update a post", () => {
      const updatedContent = "Updated test post content.";
      const updatedCryptoTag = "ethereum";
  
      cy.request({
        method: "POST",
        url: `${Cypress.env("CYPRESS_API_BASE_URL")}/posts`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: {
          content: "This is a post to update.", // Initial content
          cryptoTag: "bitcoin", // Initial cryptoTag
        },
      }).then((createResponse) => {
        const postId = createResponse.body.post.id; // Extract post ID
  
        cy.request({
          method: "PUT",
          url: `${Cypress.env("CYPRESS_API_BASE_URL")}/posts/${postId}`,
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: {
            content: updatedContent, // Updated content
            cryptoTag: updatedCryptoTag, // Updated cryptoTag
          },
        }).then((updateResponse) => {
          expect(updateResponse.status).to.eq(200); // Status code for successful update
          expect(updateResponse.body.post).to.have.property("content", updatedContent); // Validate updated content
          expect(updateResponse.body.post).to.have.property("cryptoTag", updatedCryptoTag); // Validate updated cryptoTag
        });
      });
    });
  
    it("should like a post", () => {
      cy.request({
        method: "POST",
        url: `${Cypress.env("CYPRESS_API_BASE_URL")}/posts`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: {
          content: "This is a post to like.", // Post to like
          cryptoTag: "cardano", // Tag for the post
        },
      }).then((createResponse) => {
        const postId = createResponse.body.post.id; // Extract post ID
  
        cy.request({
          method: "POST",
          url: `${Cypress.env("CYPRESS_API_BASE_URL")}/posts/${postId}/like`,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }).then((likeResponse) => {
          expect(likeResponse.status).to.eq(200); // Status code for successful like
          expect(likeResponse.body).to.have.property("likes"); // Ensure 'likes' exists
          expect(likeResponse.body.likes).to.be.greaterThan(0); // Validate increment in likes
        });
      });
    });
  
    it("should retweet a post", () => {
      cy.request({
        method: "POST",
        url: `${Cypress.env("CYPRESS_API_BASE_URL")}/posts`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: {
          content: "This is a post to retweet.", // Post to retweet
          cryptoTag: "polkadot", // Tag for the post
        },
      }).then((createResponse) => {
        const postId = createResponse.body.post.id; // Extract post ID
  
        cy.request({
          method: "POST",
          url: `${Cypress.env("CYPRESS_API_BASE_URL")}/posts/${postId}/retweet`,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }).then((retweetResponse) => {
          expect(retweetResponse.status).to.eq(200); // Status code for successful retweet
          expect(retweetResponse.body).to.have.property("retweets"); // Ensure 'retweets' exists
          expect(retweetResponse.body.retweets).to.be.greaterThan(0); // Validate increment in retweets
        });
      });
    });
  
    it("should delete a post", () => {
      cy.request({
        method: "POST",
        url: `${Cypress.env("CYPRESS_API_BASE_URL")}/posts`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: {
          content: "This is a post to delete.", // Post to delete
          cryptoTag: "binancecoin", // Tag for the post
        },
      }).then((createResponse) => {
        const postId = createResponse.body.post.id; // Extract post ID
  
        cy.request({
          method: "DELETE",
          url: `${Cypress.env("CYPRESS_API_BASE_URL")}/posts/${postId}`,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }).then((deleteResponse) => {
          expect(deleteResponse.status).to.eq(204); // Status code for successful deletion
  
          // Confirm the post is deleted
          cy.request({
            method: "GET",
            url: `${Cypress.env("CYPRESS_API_BASE_URL")}/posts/${postId}`,
            failOnStatusCode: false, // Avoid test failure on 404
          }).then((fetchResponse) => {
            expect(fetchResponse.status).to.eq(404); // Validate the post is not found
          });
        });
      });
    });
  });
  