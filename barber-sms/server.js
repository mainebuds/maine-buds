const express = require("express");
const twilio = require("twilio");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Allow the barber demo website to contact this server.
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

app.get("/", (req, res) => {
  res.send("Village Barber SMS server is running.");
});

app.post("/send-confirmation", async (req, res) => {
  try {
    const {
      TWILIO_ACCOUNT_SID,
      TWILIO_AUTH_TOKEN,
      TWILIO_FROM_NUMBER,
      DEMO_ALLOWED_PHONE
    } = process.env;

    if (
      !TWILIO_ACCOUNT_SID ||
      !TWILIO_AUTH_TOKEN ||
      !TWILIO_FROM_NUMBER ||
      !DEMO_ALLOWED_PHONE
    ) {
      return res.status(500).json({
        success: false,
        error: "Server configuration is incomplete."
      });
    }

    const normalizePhone = (phone) =>
      String(phone || "").replace(/\D/g, "");

    const requestedPhone = normalizePhone(req.body.phone);
    const allowedPhone = normalizePhone(DEMO_ALLOWED_PHONE);

    if (!requestedPhone || requestedPhone !== allowedPhone) {
      return res.status(403).json({
        success: false,
        error: "This phone number is not authorized for the demo."
      });
    }

    const client = twilio(
      TWILIO_ACCOUNT_SID,
      TWILIO_AUTH_TOKEN
    );

    const message = await client.messages.create({
      body: "sms_appointment_reminders",
      from: TWILIO_FROM_NUMBER,
      to: DEMO_ALLOWED_PHONE
    });

    res.json({
      success: true,
      messageSid: message.sid
    });

  } catch (error) {
    console.error("Twilio error:", error);

    res.status(500).json({
      success: false,
      error: "The confirmation text could not be sent."
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Village Barber SMS server running on port ${PORT}`);
});
