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
// PRIVACY POLICY
// ========================================

app.get("/privacy", (req, res) => {

  res.type("html").send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Privacy Policy | Business Pro SMS</title>
    </head>

    <body style="font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; line-height: 1.6;">

      <h1>Privacy Policy</h1>

      <p>
        Business Pro SMS collects customer information only as needed
        to provide appointment booking, confirmation, reminder,
        and cancellation services.
      </p>

      <h2>Mobile Information</h2>

      <p>
        Mobile phone numbers and SMS consent information are not sold,
        rented, or shared with third parties or affiliates for marketing
        or promotional purposes.
      </p>

      <p>
        Mobile information may only be used by service providers when
        necessary to deliver the requested messaging service.
      </p>

      <h2>SMS Messaging</h2>

      <p>
        Customers may voluntarily opt in to receive appointment
        confirmations, reminders, and cancellation updates by text.
        Message frequency varies. Message and data rates may apply.
      </p>

      <p>
        Reply STOP to opt out of SMS messages.
        Reply HELP for assistance.
      </p>

      <h2>Information Collected</h2>

      <p>
        Information may include the customer's name, mobile phone number,
        appointment date, appointment time, selected service,
        and SMS consent status.
      </p>

      <h2>Contact</h2>

      <p>
        Questions regarding this Privacy Policy may be directed to
        Business Pro SMS through the service through which the appointment
        was booked.
      </p>

    </body>
    </html>
  `);

});


// ========================================
// TERMS AND CONDITIONS
// ========================================

app.get("/terms", (req, res) => {

  res.type("html").send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Terms & Conditions | Business Pro SMS</title>
    </head>

    <body style="font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; line-height: 1.6;">

      <h1>SMS Terms & Conditions</h1>

      <p>
        By voluntarily opting in to Business Pro SMS messaging,
        customers agree to receive transactional text messages related
        to appointments they book or manage.
      </p>

      <h2>Types of Messages</h2>

      <p>
        Messages may include appointment confirmations,
        appointment reminders, scheduling updates,
        and cancellation notifications.
      </p>

      <h2>Consent</h2>

      <p>
        SMS consent is voluntary and is not required as a condition
        of purchasing goods or services.
      </p>

      <h2>Message Frequency and Charges</h2>

      <p>
        Message frequency varies depending on appointment activity.
        Message and data rates may apply according to the customer's
        mobile carrier plan.
      </p>

      <h2>Opt Out</h2>

      <p>
        Reply STOP at any time to stop receiving SMS messages.
        Reply HELP for assistance.
      </p>

      <h2>Privacy</h2>

      <p>
        Mobile phone numbers and SMS consent information are not shared
        with third parties or affiliates for marketing or promotional
        purposes.
      </p>

      <p>
        See our Privacy Policy at:
        https://village-barber-sms.onrender.com/privacy
      </p>

    </body>
    </html>
  `);

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
