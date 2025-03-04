const express = require("express");
const router = express.Router();
const { validateAndBroadcast } = require("../../utils/websocket");

router.post("/test-websocket-event", (req, res) => {
    const { event, data } = req.body;

    if (typeof event !== "string" || !event.trim()) {
        return res.status(400).json({ error: "Invalid or missing event name" });
    }

    if (!data || typeof data !== "object") {
        return res.status(400).json({ error: "Invalid or missing data" });
    }

    validateAndBroadcast(event, data); // Emit the event via WebSocket
    res.status(200).json({ success: true });
});

module.exports = router;

