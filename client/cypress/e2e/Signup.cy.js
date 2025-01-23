describe("Signup Page", () => {
    const apiUrl = Cypress.env("CYPRESS_API_BASE_URL");
    const walletAddress = "9JxAR3L1gPQGjkm9mFcGFrYX2cxYrhAhpENbh5XDJafH"; // Horoscope-themed wallet address
    let username, email, password;

    beforeEach(() => {
        // Define horoscope-themed test data
        const randomNum = Math.floor(Math.random() * 100000);
        const zodiacSigns = [
            "aries", "taurus", "gemini", "cancer",
            "leo", "virgo", "libra", "scorpio",
            "sagittarius", "capricorn", "aquarius", "pisces",
        ];
        const randomSign = zodiacSigns[Math.floor(Math.random() * zodiacSigns.length)];
        username = `${randomSign}Fan${randomNum}`;
        email = `${randomSign}Star${randomNum}@example.com`;
        password = "cosmic123";

        // Clean up the user from the database before each test
        cy.request({
            method: "POST",
            url: `${apiUrl}/auth/delete`, // Assuming you have an admin route for deletion
            body: { email },
            failOnStatusCode: false, // Avoid test failure if the user does not exist
        }).then((response) => {
            if (response.status === 200) {
                cy.log(`Deleted user ${email} for cleanup`);
            }
        });

        // Visit the signup page
        cy.visit("/signup");
    });

    it("should validate the form inputs", () => {
        // Attempt to submit without filling any fields
        cy.get("button[type='submit']").click();

        // Check for error messages with timeout
        cy.contains("Username is required.", { timeout: 6000 }).should("be.visible");
        cy.contains("Invalid email format.", { timeout: 6000 }).should("be.visible");
        cy.contains("Password must be at least 6 characters long.", { timeout: 6000 }).should("be.visible");

        // Check password mismatch
        cy.get("input[name='username']").type(username);
        cy.get("input[name='email']").type(email);
        cy.get("input[name='walletAddress']").type(walletAddress); // Added wallet address
        cy.get("input[name='password']").type(password);
        cy.get("input[name='confirmPassword']").type("differentpassword");
        cy.get("button[type='submit']").click();

        cy.contains("Passwords do not match.", { timeout: 6000 }).should("be.visible");
    });

    it("should display a success message on valid signup", () => {
        // Fill out the form with generated user details
        cy.get("input[name='username']").type(username);
        cy.get("input[name='email']").type(email);
        cy.get("input[name='walletAddress']").type(walletAddress);
        cy.get("input[name='password']").type(password);
        cy.get("input[name='confirmPassword']").type(password);
        cy.get("button[type='submit']").click();

        // Verify success message and redirection with timeout
        cy.contains("Signup successful! Redirecting...", { timeout: 8000 }).should("be.visible");
        cy.url({ timeout: 8000 }).should("include", "/login");
    });

    it("should display an error message on backend validation failure", () => {
        // Fill out the form with a username that already exists
        cy.get("input[name='username']").type("existinguser");
        cy.get("input[name='email']").type("existing@example.com");
        cy.get("input[name='walletAddress']").type(walletAddress);
        cy.get("input[name='password']").type(password);
        cy.get("input[name='confirmPassword']").type(password);
        cy.get("button[type='submit']").click();

        // Verify error message from the backend with timeout
        cy.contains("User already exists", { timeout: 6000 }).should("be.visible");
    });

    it("should disable the submit button and show a loader while submitting", () => {
        // Fill out the form with generated user details
        cy.get("input[name='username']").type(username);
        cy.get("input[name='email']").type(email);
        cy.get("input[name='walletAddress']").type(walletAddress);
        cy.get("input[name='password']").type(password);
        cy.get("input[name='confirmPassword']").type(password);
        cy.get("button[type='submit']").click();

        // Verify loader is displayed and button is disabled with timeout
        cy.get("button[type='submit']")
            .should("be.disabled", { timeout: 6000 })
            .and("have.attr", "aria-busy", "true");

        // Wait for backend response
        cy.wait(5000); // Adjust timeout if necessary for real backend latency

        // Verify loader disappears
        cy.get("button[type='submit']")
            .should("not.have.attr", "aria-busy", { timeout: 6000 })
            .and("not.be.disabled");
    });
});
