describe("Login Page", () => {
    const apiUrl = Cypress.env("CYPRESS_API_BASE_URL");
  
    beforeEach(() => {
      cy.visit("/login");
    });
  
    it("should render the login form", () => {
      cy.get("form.login-form").should("exist");
      cy.get("input#email").should("exist");
      cy.get("input#password").should("exist");
      cy.get("button[type='submit']").should("exist").and("not.be.disabled");
    });
  
    it("should validate email and password inputs", () => {
      // Attempt to submit with invalid email
      cy.get("input#email").type("invalid-email");
      cy.get("input#password").type("short");
      cy.get("button[type='submit']").click();
  
      cy.contains("Invalid email format.").should("be.visible");
  
      // Update email and password with valid inputs
      cy.get("input#email").clear().type("valid@example.com");
      cy.get("input#password").clear().type("validpassword");
      cy.get("button[type='submit']").click();
  
      cy.contains("Invalid email format.").should("not.exist");
    });
  
    it("should show a loading spinner on form submission", () => {
      cy.intercept("POST", `${apiUrl}/auth/login`, {
        delay: 1000,
        statusCode: 200,
        body: { token: "mock-token" },
      }).as("loginRequest");
  
      cy.get("input#email").type("valid@example.com");
      cy.get("input#password").type("validpassword");
      cy.get("button[type='submit']").click();
  
      // Verify loading spinner is visible
      cy.get("button[type='submit']")
        .should("be.disabled")
        .find(".spinner")
        .should("exist");
  
      // Wait for the request to complete
      cy.wait("@loginRequest");
  
      cy.get("button[type='submit']").should("not.have.attr", "aria-busy", "true");
    });
  
    it("should handle successful login and redirect to dashboard", () => {
      cy.intercept("POST", `${apiUrl}/auth/login`, {
        statusCode: 200,
        body: { token: "mock-token" },
      }).as("loginRequest");
  
      cy.get("input#email").type("valid@example.com");
      cy.get("input#password").type("validpassword");
      cy.get("button[type='submit']").click();
  
      // Wait for the login request
      cy.wait("@loginRequest").then(({ requestBody }) => {
        expect(requestBody.email).to.equal("valid@example.com");
        expect(requestBody.password).to.equal("validpassword");
      });
  
      // Verify redirection to the dashboard
      cy.url().should("include", "/dashboard");
  
      // Verify token is stored in localStorage
      cy.window().its("localStorage.token").should("eq", "mock-token");
    });
  
    it("should display an error message for invalid login credentials", () => {
      cy.intercept("POST", `${apiUrl}/auth/login`, {
        statusCode: 400,
        body: { message: "Invalid credentials" },
      }).as("loginRequest");
  
      cy.get("input#email").type("invalid@example.com");
      cy.get("input#password").type("wrongpassword");
      cy.get("button[type='submit']").click();
  
      // Wait for the login request
      cy.wait("@loginRequest");
  
      // Verify error message is displayed
      cy.contains("Invalid credentials").should("be.visible");
    });
  
    it("should display a server error message on unexpected failures", () => {
      cy.intercept("POST", `${apiUrl}/auth/login`, {
        statusCode: 500,
        body: { message: "Server error" },
      }).as("loginRequest");
  
      cy.get("input#email").type("user@example.com");
      cy.get("input#password").type("validpassword");
      cy.get("button[type='submit']").click();
  
      // Wait for the login request
      cy.wait("@loginRequest");
  
      // Verify error message is displayed
      cy.contains("Unable to log in. Please try again later.").should("be.visible");
    });
  
    it("should redirect to sign-up and reset-password pages from footer links", () => {
      cy.get("a[aria-label='Sign up for SolPulse']").click();
      cy.url().should("include", "/signup");
  
      cy.visit("/login"); // Return to the login page
      cy.get("a[aria-label='Reset your password']").click();
      cy.url().should("include", "/reset-password");
    });
  });
  