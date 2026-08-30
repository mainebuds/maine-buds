const express = require("express");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// ========================================
// CORS
// ========================================

app.use((req, res, next) => {

  res.setHeader(
    "Access-Control-Allow-Origin",
    "*"
  );

  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type"
  );

  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS"
  );

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();

});


// ========================================
// TEST HOME PAGE
// ========================================

app.get("/", (req, res) => {

  res.send(
    "Village Barber SMS server is running."
  );

});


// ========================================
// SEND CONFIRMATION TEXT
// ========================================

app.post(
  "/send-confirmation",
  async (req, res) => {

    try {

      const {
        TWILIO_ACCOUNT_SID,
        TWILIO_AUTH_TOKEN,
        DEMO_ALLOWED_PHONE
      } = process.env;


      if (
        !TWILIO_ACCOUNT_SID ||
        !TWILIO_AUTH_TOKEN ||
        !DEMO_ALLOWED_PHONE
      ) {

        return res.status(500).json({
          success: false,
          error:
            "Server configuration is incomplete."
        });

      }


      // ------------------------------------
      // NORMALIZE PHONE NUMBERS
      // ------------------------------------

      const normalizePhone = (phone) =>
        String(phone || "")
          .replace(/\D/g, "");


      const requestedPhone =
        normalizePhone(req.body.phone);

      const allowedPhone =
        normalizePhone(
          DEMO_ALLOWED_PHONE
        );


      // ------------------------------------
      // ONLY ALLOW VERIFIED DEMO NUMBER
      // ------------------------------------

      if (
        !requestedPhone ||
        requestedPhone !== allowedPhone
      ) {

        return res.status(403).json({
          success: false,
          error:
            "This phone number is not authorized for the demo."
        });

      }


      // ------------------------------------
      // TWILIO TRIAL REQUEST
      // ONLY SEND TO + BODY
      // ------------------------------------

      const twilioURL =
        `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;


      const auth =
        Buffer.from(
          `${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`
        ).toString("base64");


      const formData =
        new URLSearchParams();

      formData.append(
        "To",
        DEMO_ALLOWED_PHONE
      );

      formData.append(
        "Body",
        "sms_appointment_reminders"
      );


      const twilioResponse =
        await fetch(
          twilioURL,
          {
            method: "POST",

            headers: {
              Authorization:
                `Basic ${auth}`,

              "Content-Type":
                "application/x-www-form-urlencoded"
            },

            body:
              formData.toString()
          }
        );


      const result =
        await twilioResponse.json();


      // ------------------------------------
      // TWILIO ERROR
      // ------------------------------------

      if (!twilioResponse.ok) {

        console.error(
          "Twilio error:",
          result
        );

        return res
          .status(twilioResponse.status)
          .json({
            success: false,
            error:
              result.message ||
              "Twilio rejected the SMS request."
          });

      }


      // ------------------------------------
      // SUCCESS
      // ------------------------------------

      console.log(
        "SMS sent successfully:",
        result.sid
      );


      return res.json({
        success: true,
        messageSid:
          result.sid
      });


    } catch (error) {

      console.error(
        "SMS server error:",
        error
      );


      return res.status(500).json({
        success: false,
        error:
          "The confirmation text could not be sent."
      });

    }

  }
);


// ========================================
// START SERVER
// ========================================

const PORT =
  process.env.PORT || 3000;


app.listen(PORT, () => {

  console.log(
    `Village Barber SMS server running on port ${PORT}`
  );

});
