describe("Home Page Tests", () => {
    beforeEach(() => {
        // Clear localStorage and sessionStorage before each test to simulate a fresh logged-out state
        cy.window().then((win) => {
            win.localStorage.clear();
            win.sessionStorage.clear();
        });

        // Mock the response to match the user details
        cy.intercept("GET", "**/users/me", (req) => {
            const token = req.headers['authorization']?.split(' ')[1];
            if (token === "invalid_token") {
                req.reply({ statusCode: 401, body: { message: "Invalid token" } });
            } else {
                req.reply({ statusCode: 200, body: { username: "testuserskeeboo", email: "testskeboooe@example.com" } });
            }
        }).as("getUser");
    });

    it("should display loading indicator while fetching user data", () => {
        cy.visit("/");
        // Wait for the loading message to appear before checking for visibility
        cy.contains("Loading user information...", { timeout: 10000 }).should("be.visible");
        // Optionally wait for some time to simulate loading
        cy.wait(2000); // Wait 2 seconds to allow for user data loading
    });

    it("should display an error message when no token is available", () => {
        cy.visit("/", {
            onBeforeLoad(win) {
                win.localStorage.clear();
                win.sessionStorage.clear();
            },
        });
        // Assert that the error message is shown if no token is present
        cy.contains("Unable to load user data").should("be.visible");
    });

    it("should display user data when token is valid", () => {
        const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTI1NDUsInVzZXJuYW1lIjoidGVzdHVzZXJza2VlYm9vIiwiZW1haWwiOiJ0ZXN0c2tlYm9vb2VAZXhhbXBsZS5jb20iLCJpYXQiOjE3MzYzNTQ0MDEsImV4cCI6MTkxNjM1NDQwMX0.mRQANEZItfPZWKQC1Q5FBJcPP-FH-eM-3XBUX2ualmo"; // Valid token
        cy.visit("/", {
            onBeforeLoad(win) {
                win.localStorage.setItem("token", token); // Set token in localStorage
            },
        });
        cy.wait("@getUser");
        // Ensure that the username from the token is displayed after the user data is loaded
        cy.contains("Hello, testuserskeeboo!").should("be.visible");
    });

    it("should display an error message when token is invalid", () => {
        cy.visit("/", {
            onBeforeLoad(win) {
                win.localStorage.setItem("token", "invalid_token"); // Set invalid token
            },
        });
        cy.wait("@getUser"); // Wait for the mocked user request
        // Check for error message visibility and ensure it's the expected one
        cy.contains("Unable to load user data", { timeout: 10000 }).should("be.visible");
    });
    
    it("should render subcomponents like Feed and CryptoTicker", () => {
        cy.visit("/", {
            onBeforeLoad(win) {
                win.localStorage.setItem("token", "valid_token");
            },
        });
        cy.wait("@getUser");
        cy.get("section.home-feed-section").should("exist");
        cy.get("h2").contains("Explore the Latest Solana Ecosystem Trends");
        cy.get("h2").contains("Your Feed");
    });

    it("should navigate to the signup page when clicking 'Sign Up Now'", () => {
        cy.visit("/");
        cy.get("a[aria-label='Sign up for SolPulse']").click();
        cy.url().should("include", "/signup");
    });

    it("should navigate to the login page when clicking 'Log in to SolPulse'", () => {
        cy.visit("/");
        cy.get("a[aria-label='Log in to SolPulse']").click();
        cy.url().should("include", "/login");
    });
});
