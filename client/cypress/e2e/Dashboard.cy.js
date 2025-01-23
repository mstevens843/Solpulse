describe("Dashboard Page", () => {
    const apiUrl = Cypress.env("CYPRESS_API_BASE_URL");
    const token =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OCwidXNlcm5hbWUiOiJib2JieWJ1c2hheTUiLCJpYXQiOjE3MzY0MjA0NjUsImV4cCI6MTczODIyMDQ2NX0.3L_wGpwmqaytGy_nHJjHJlnk67Y3CBqeXQepxfAKRz4";
  
    beforeEach(() => {
      cy.intercept("GET", `${apiUrl}/users/me`, { fixture: "user.json" }).as(
        "getUser"
      );
      cy.intercept("GET", `${apiUrl}/transactions`, {
        fixture: "transactions.json",
      }).as("getTransactions");
      cy.intercept("GET", `${apiUrl}/messages/recent`, {
        fixture: "recentMessages.json",
      }).as("getMessages");
      cy.intercept("GET", `${apiUrl}/wallets`, {
        fixture: "wallets.json",
      }).as("getWallets");
      cy.intercept("GET", `${apiUrl}/trending`, {
        fixture: "trendingCoins.json",
      }).as("getTrendingCoins");
      cy.intercept("GET", `${apiUrl}/notifications`, {
        fixture: "notifications.json",
      }).as("getNotifications");
  
      cy.visit("/dashboard", {
        onBeforeLoad(win) {
          win.localStorage.setItem("authToken", token);
        },
      });
    });
  
    it("should display notifications and mark them as read", () => {
      cy.wait("@getNotifications");
  
      // Verify unread notification count
      cy.get(".notification-bell").should("contain", "5");
  
      // Open notifications dropdown
      cy.get(".notification-bell").click();
      cy.get(".notification-item").should("have.length", 5);
  
      // Mock marking a notification as read
      cy.intercept("PUT", `${apiUrl}/notifications/1/read`, {
        statusCode: 200,
        body: { message: "Notification marked as read" },
      }).as("markNotificationRead");
  
      // Mark the first notification as read
      cy.get(".notification-item").first().within(() => {
        cy.contains("Mark as read").click();
      });
  
      cy.wait("@markNotificationRead");
      cy.get(".notification-item").first().should("contain", "Read");
    });
  
    it("should handle following and unfollowing users", () => {
      cy.intercept("POST", `${apiUrl}/users/9/follow`, { statusCode: 201 }).as(
        "followUser"
      );
      cy.intercept("DELETE", `${apiUrl}/users/9/unfollow`, { statusCode: 200 }).as(
        "unfollowUser"
      );
  
      // Click follow button
      cy.get(".dashboard-summary").within(() => {
        cy.get("button").contains("Follow").click();
      });
      cy.wait("@followUser");
      cy.get(".dashboard-summary").should("contain", "Following");
  
      // Click unfollow button
      cy.get(".dashboard-summary").within(() => {
        cy.get("button").contains("Unfollow").click();
      });
      cy.wait("@unfollowUser");
      cy.get(".dashboard-summary").should("contain", "Follow");
    });
  
    it("should display the dashboard with user details, notifications, and metrics", () => {
      cy.wait("@getUser");
      cy.wait("@getTransactions");
      cy.wait("@getMessages");
      cy.wait("@getWallets");
      cy.wait("@getTrendingCoins");
      cy.wait("@getNotifications");
  
      // Verify notifications section
      cy.get(".dashboard-notifications").within(() => {
        cy.contains("Notifications").should("exist");
        cy.get(".notification-item").should("have.length", 5);
      });
  
      // Verify metrics section
      cy.get(".dashboard-metrics").within(() => {
        cy.contains("Total Portfolio").should("exist");
        cy.contains("$12,345.67").should("exist");
  
        cy.contains("Transactions").should("exist");
        cy.contains("25 (20 Credits / 5 Debits)").should("exist");
  
        cy.contains("Top Token").should("exist");
        cy.contains("SOL (50 SOL)").should("exist");
  
        cy.contains("Unread Messages").should("exist");
        cy.contains("5").should("exist");
      });
    });
  
    it("should display an error message if notifications fail to load", () => {
      cy.intercept("GET", `${apiUrl}/notifications`, { statusCode: 500 }).as(
        "getNotificationsError"
      );
  
      cy.visit("/dashboard", {
        onBeforeLoad(win) {
          win.localStorage.setItem("authToken", token);
        },
      });
  
      // Wait for error response
      cy.wait("@getNotificationsError");
  
      // Verify error message
      cy.contains("Failed to load notifications.").should("be.visible");
    });
  });
  