describe("Profile Page with CryptoWalletIntegration", () => {
    const apiUrl = Cypress.env("CYPRESS_API_BASE_URL");
    const userId = 1;
  
    beforeEach(() => {
      cy.visit(`/profile/${userId}`);
    });
  
    it("should display the loader while fetching profile data", () => {
      cy.intercept("GET", `${apiUrl}/users/${userId}`, (req) => {
        req.reply((res) => {
          res.setDelay(2000);
          res.send({});
        });
      }).as("fetchProfile");
  
      cy.get(".loader").should("be.visible");
      cy.wait("@fetchProfile");
      cy.get(".loader").should("not.exist");
    });
  
    it("should display user details and posts on successful API response", () => {
      cy.intercept("GET", `${apiUrl}/users/${userId}`, {
        statusCode: 200,
        body: {
          user: {
            id: userId,
            username: "crypto_enthusiast",
            bio: "Blockchain is the future.",
            walletAddress: "5d6f3a8a9b",
          },
          posts: [
            { id: 1, content: "Bitcoin to the moon!", likes: 5 },
            { id: 2, content: "Ethereum 2.0 is a game-changer.", likes: 3 },
          ],
        },
      }).as("fetchProfile");
  
      cy.wait("@fetchProfile");
  
      // Validate user details
      cy.get(".user-card").should("contain.text", "crypto_enthusiast");
      cy.get(".bio-display p").should("contain.text", "Blockchain is the future.");
      cy.get(".crypto-wallet-container").should("exist");
  
      // Validate posts section
      cy.get(".posts-section").within(() => {
        cy.contains("Posts").should("be.visible");
        cy.get(".post-item").should("have.length", 2);
        cy.contains("Bitcoin to the moon!").should("be.visible");
      });
    });
  
    it("should allow editing and saving the bio", () => {
      cy.intercept("GET", `${apiUrl}/users/${userId}`, {
        statusCode: 200,
        body: {
          user: {
            id: userId,
            username: "crypto_enthusiast",
            bio: "Blockchain is the future.",
            walletAddress: "5d6f3a8a9b",
          },
          posts: [],
        },
      }).as("fetchProfile");
  
      cy.intercept("PUT", `${apiUrl}/users/${userId}`, {
        statusCode: 200,
      }).as("updateBio");
  
      cy.wait("@fetchProfile");
  
      cy.get(".bio-display button").contains("Edit Bio").click();
      cy.get(".edit-bio textarea")
        .clear()
        .type("Exploring the Solana ecosystem.");
      cy.get(".edit-bio button").contains("Save").click();
  
      cy.wait("@updateBio");
  
      cy.get(".bio-display p").should("contain.text", "Exploring the Solana ecosystem.");
    });
  
    it("should handle API errors gracefully", () => {
      cy.intercept("GET", `${apiUrl}/users/${userId}`, {
        statusCode: 500,
        body: { message: "Failed to load profile." },
      }).as("fetchProfileError");
  
      cy.wait("@fetchProfileError");
  
      cy.get(".error-container").should("be.visible");
      cy.contains("Failed to load profile. Please try again.").should("be.visible");
      cy.get(".error-container button").contains("Retry").click();
  
      // Retry the API request
      cy.intercept("GET", `${apiUrl}/users/${userId}`, {
        statusCode: 200,
        body: {
          user: {
            id: userId,
            username: "crypto_enthusiast",
            bio: "Blockchain is the future.",
            walletAddress: "5d6f3a8a9b",
          },
          posts: [],
        },
      }).as("fetchProfileRetry");
  
      cy.wait("@fetchProfileRetry");
  
      cy.get(".user-card").should("contain.text", "crypto_enthusiast");
    });
  
    it("should handle wallet integration and display balance", () => {
      cy.intercept("GET", `${apiUrl}/users/${userId}`, {
        statusCode: 200,
        body: {
          user: {
            id: userId,
            username: "crypto_enthusiast",
            bio: "Blockchain is the future.",
            walletAddress: "5d6f3a8a9b",
          },
          posts: [],
        },
      }).as("fetchProfile");
  
      cy.intercept("GET", `${apiUrl}/wallet/balance/5d6f3a8a9b`, {
        statusCode: 200,
        body: {
          address: "5d6f3a8a9b",
          balance: 3.25,
        },
      }).as("fetchWalletBalance");
  
      cy.wait("@fetchProfile");
  
      cy.get(".crypto-wallet-container").should("exist");
      cy.wait("@fetchWalletBalance");
      cy.get(".wallet-balance").should("contain.text", "3.25 SOL");
    });
  
    it("should handle sending SOL to a recipient", () => {
      cy.intercept("GET", `${apiUrl}/users/${userId}`, {
        statusCode: 200,
        body: {
          user: {
            id: userId,
            username: "crypto_enthusiast",
            bio: "Blockchain is the future.",
            walletAddress: "5d6f3a8a9b",
          },
          posts: [],
        },
      }).as("fetchProfile");
  
      cy.intercept("GET", `${apiUrl}/wallet/balance/5d6f3a8a9b`, {
        statusCode: 200,
        body: {
          address: "5d6f3a8a9b",
          balance: 3.25,
        },
      }).as("fetchWalletBalance");
  
      cy.intercept("POST", `${apiUrl}/wallet/send`, {
        statusCode: 200,
        body: {
          message: "Transaction successful!",
          transactionLink: "https://explorer.solana.com/tx/mock123?cluster=mainnet-beta",
        },
      }).as("sendTransaction");
  
      cy.wait("@fetchProfile");
      cy.wait("@fetchWalletBalance");
  
      cy.get(".wallet-form input[placeholder='Recipient Wallet Address']").type(
        "6d7g8h9j0k1"
      );
      cy.get(".wallet-form input[placeholder='Amount (SOL)']").type("1.5");
      cy.get(".wallet-form button").contains("Send").click();
  
      cy.wait("@sendTransaction");
  
      cy.get(".wallet-success").should("contain.text", "Transaction successful!");
      cy.contains("View on Explorer").should(
        "have.attr",
        "href",
        "https://explorer.solana.com/tx/mock123?cluster=mainnet-beta"
      );
    });
  
    it("should display 'No posts available' if there are no posts", () => {
      cy.intercept("GET", `${apiUrl}/users/${userId}`, {
        statusCode: 200,
        body: {
          user: {
            id: userId,
            username: "crypto_enthusiast",
            bio: "Blockchain is the future.",
            walletAddress: "5d6f3a8a9b",
          },
          posts: [],
        },
      }).as("fetchProfileNoPosts");
  
      cy.wait("@fetchProfileNoPosts");
  
      cy.get(".posts-section").should("contain.text", "No posts available");
    });
  });
  