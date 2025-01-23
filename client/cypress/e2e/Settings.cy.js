describe("Settings Page", () => {
    const apiUrl = Cypress.env("CYPRESS_API_BASE_URL");
  
    beforeEach(() => {
      cy.visit("/settings");
    });
  
    it("should display a loader while fetching settings", () => {
      cy.intercept("GET", `${apiUrl}/users/settings`, (req) => {
        req.reply((res) => {
          res.setDelay(2000); // Simulate network delay
          res.send({});
        });
      }).as("fetchSettings");
  
      cy.get(".loader").should("be.visible");
      cy.wait("@fetchSettings");
      cy.get(".loader").should("not.exist");
    });
  
    it("should display fetched settings", () => {
      cy.intercept("GET", `${apiUrl}/users/settings`, {
        statusCode: 200,
        body: {
          email: "user@example.com",
          privacy: "public",
          walletAddress: "5d6f3a8a9b",
        },
      }).as("fetchSettings");
  
      cy.wait("@fetchSettings");
  
      // Validate settings fields
      cy.get("#email").should("have.value", "user@example.com");
      cy.get("#privacy").should("have.value", "public");
      cy.get("#walletAddress").should("have.value", "5d6f3a8a9b");
    });
  
    it("should handle invalid email format", () => {
      cy.get("#email").clear().type("invalid-email");
      cy.get("button[type=submit]").click();
      cy.get(".notification-error").should("contain.text", "Invalid email format.");
    });
  
    it("should handle short password validation", () => {
      cy.get("#password").clear().type("123");
      cy.get("button[type=submit]").click();
      cy.get(".notification-error").should("contain.text", "Password must be at least 6 characters long.");
    });
  
    it("should handle short wallet address validation", () => {
      cy.get("#walletAddress").clear().type("short");
      cy.get("button[type=submit]").click();
      cy.get(".notification-error").should("contain.text", "Wallet address is too short.");
    });
  
    it("should successfully update settings", () => {
      cy.intercept("GET", `${apiUrl}/users/settings`, {
        statusCode: 200,
        body: {
          email: "user@example.com",
          privacy: "public",
          walletAddress: "5d6f3a8a9b",
        },
      }).as("fetchSettings");
  
      cy.intercept("PUT", `${apiUrl}/users/settings`, {
        statusCode: 200,
      }).as("updateSettings");
  
      cy.wait("@fetchSettings");
  
      cy.get("#email").clear().type("newuser@example.com");
      cy.get("#password").clear().type("newpassword");
      cy.get("#privacy").select("private");
      cy.get("#walletAddress").clear().type("8e9f2b1c0a");
  
      cy.get("button[type=submit]").click();
      cy.wait("@updateSettings");
  
      cy.get(".notification-success").should("contain.text", "Settings updated successfully!");
    });
  
    it("should handle settings update failure", () => {
      cy.intercept("PUT", `${apiUrl}/users/settings`, {
        statusCode: 500,
        body: { error: "Failed to update settings. Please try again." },
      }).as("updateSettingsError");
  
      cy.get("#email").clear().type("newuser@example.com");
      cy.get("#password").clear().type("newpassword");
  
      cy.get("button[type=submit]").click();
      cy.wait("@updateSettingsError");
  
      cy.get(".notification-error").should("contain.text", "Failed to update settings. Please try again.");
    });
  
    it("should render the crypto wallet integration components", () => {
      cy.get("h3").should("contain.text", "Your Crypto Wallet");
      cy.get(".wallet-wrapper").should("exist");
      cy.get(".crypto-wallet").should("exist");
      cy.get(".crypto-transactions").should("exist");
    });
  });
  