const express = require("express");

const app = express();


// ========================================
// BODY PARSING
// ========================================

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true
  })
);


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
// PAGE TEMPLATE
// ========================================

function sendPage(res, title, content) {

  res.type("html").send(`
    <!DOCTYPE html>
    <html lang="en">

    <head>

      <meta charset="UTF-8">

      <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
      >

      <title>${title}</title>

      <style>

        body {
          font-family: Arial, sans-serif;
          max-width: 820px;
          margin: 40px auto;
          padding: 20px;
          line-height: 1.6;
          color: #222;
        }

        h1 {
          margin-bottom: 10px;
        }

        h2 {
          margin-top: 32px;
        }

        a {
          color: #174ea6;
        }

        .notice {
          padding: 15px;
          border: 1px solid #ccc;
          margin: 20px 0;
        }

        .links {
          margin-top: 35px;
          padding-top: 20px;
          border-top: 1px solid #ddd;
        }

        input[type="tel"] {
          padding: 10px;
          width: 100%;
          max-width: 350px;
          margin: 8px 0 20px;
        }

        .consent-box {
          padding: 15px;
          border: 1px solid #ccc;
          margin: 15px 0;
        }

      </style>

    </head>

    <body>

      ${content}

    </body>

    </html>
  `);

}


// ========================================
// BUSINESS PRO SMS HOME PAGE
// ========================================

app.get("/", (req, res) => {

  sendPage(
    res,
    "Business Pro SMS",
    `

      <h1>Business Pro SMS</h1>

      <p>
        Business Pro SMS provides web-based appointment
        notification tools for appointment-based businesses.
      </p>

      <p>
        The messaging program is used for transactional
        appointment communications such as confirmations,
        reminders, scheduling updates, and cancellation
        notifications.
      </p>


      <h2>How SMS Consent Works</h2>

      <p>
        Customers voluntarily enter their mobile phone number
        during the online appointment booking process.
      </p>

      <p>
        Customers who want text notifications separately check
        an unchecked SMS consent box.
      </p>

      <p>
        SMS consent is optional and is not required to book an
        appointment or purchase goods or services.
      </p>


      <div class="notice">

        <strong>SMS Program Disclosure</strong>

        <p>
          Message frequency varies based on appointment activity.
          Message and data rates may apply.
        </p>

        <p>
          Reply STOP to opt out.
          Reply HELP for assistance.
        </p>

      </div>


      <div class="links">

        <p>
          <a href="/sms-consent">
            SMS Consent / Opt-In Information
          </a>
        </p>

        <p>
          <a href="/privacy">
            Privacy Policy
          </a>
        </p>

        <p>
          <a href="/terms">
            Terms & Conditions
          </a>
        </p>

      </div>

    `
  );

});


// ========================================
// PRIVACY POLICY
// ========================================

app.get("/privacy", (req, res) => {

  sendPage(
    res,
    "Privacy Policy | Business Pro SMS",
    `

      <h1>Business Pro SMS Privacy Policy</h1>

      <p>
        This Privacy Policy applies to the Business Pro SMS
        appointment messaging program.
      </p>

      <p>
        Business Pro SMS collects customer information only as
        necessary to provide appointment booking and transactional
        appointment messaging services.
      </p>


      <h2>Information We Collect</h2>

      <p>
        Information collected may include:
      </p>

      <ul>

        <li>Customer name</li>

        <li>Mobile phone number</li>

        <li>Appointment date and time</li>

        <li>Selected appointment service</li>

        <li>SMS opt-in and consent status</li>

      </ul>


      <h2>How Information Is Used</h2>

      <p>
        Customer information is used to provide requested
        appointment-related services, including appointment
        confirmations, reminders, scheduling updates, and
        cancellation notifications.
      </p>


      <h2>Mobile Information and SMS Consent</h2>

      <p>
        <strong>
          We do not share, sell, rent, or provide your mobile
          phone number or messaging consent data to third parties
          or affiliates for marketing or promotional purposes.
        </strong>
      </p>

      <p>
        Mobile phone numbers, SMS opt-in information, and text
        messaging consent are not sold or transferred to third
        parties, affiliates, lead generators, or other businesses
        for marketing or promotional purposes.
      </p>

      <p>
        Text messaging originator opt-in data and consent will
        not be shared with any third parties or affiliates for
        marketing or promotional purposes.
      </p>

      <p>
        Service providers may process information only when
        necessary to operate the appointment or messaging service.
        They are not permitted to use mobile opt-in information
        for their own marketing or promotional purposes.
      </p>


      <h2>SMS Messaging</h2>

      <p>
        Customers voluntarily opt in to receive transactional
        appointment text messages.
      </p>

      <p>
        SMS consent is optional and is not required as a condition
        of purchasing goods or services or booking an appointment.
      </p>

      <p>
        Message frequency varies based on appointment activity.
        Message and data rates may apply.
      </p>

      <p>
        Reply STOP to opt out of SMS messages.
        Reply HELP for assistance.
      </p>


      <h2>Privacy Policy and SMS Opt-In</h2>

      <p>
        Consent to receive SMS messages applies only to the
        messaging program for which the customer directly opted in.
        Consent is not transferable to another business or sender.
      </p>


      <h2>Contact</h2>

      <p>
        Questions concerning this Privacy Policy or the Business
        Pro SMS messaging program may be directed through the
        appointment service through which the customer booked
        their appointment.
      </p>


      <div class="links">

        <p>
          <a href="/sms-consent">
            SMS Consent Information
          </a>
        </p>

        <p>
          <a href="/terms">
            Terms & Conditions
          </a>
        </p>

        <p>
          <a href="/">
            Business Pro SMS Home
          </a>
        </p>

      </div>

    `
  );

});


// ========================================
// TERMS AND CONDITIONS
// ========================================

app.get("/terms", (req, res) => {

  sendPage(
    res,
    "Terms & Conditions | Business Pro SMS",
    `

      <h1>Business Pro SMS Terms & Conditions</h1>

      <p>
        These Terms & Conditions apply to the Business Pro SMS
        transactional appointment messaging program.
      </p>


      <h2>Types of Messages</h2>

      <p>
        Customers who voluntarily opt in may receive messages
        concerning appointments they book or manage.
      </p>

      <p>
        Messages may include:
      </p>

      <ul>

        <li>Appointment confirmations</li>

        <li>Appointment reminders</li>

        <li>Scheduling updates</li>

        <li>Cancellation notifications</li>

      </ul>


      <h2>Consent</h2>

      <p>
        Customers provide SMS consent by voluntarily entering
        their mobile phone number and separately checking an
        unchecked SMS consent box during the online appointment
        booking process.
      </p>

      <p>
        SMS consent is optional and is not required as a condition
        of booking an appointment or purchasing goods or services.
      </p>


      <h2>Message Frequency and Charges</h2>

      <p>
        Message frequency varies based on appointment activity.
      </p>

      <p>
        Message and data rates may apply according to the
        customer's mobile carrier plan.
      </p>


      <h2>Opt Out</h2>

      <p>
        Reply STOP at any time to stop receiving SMS messages.
      </p>

      <p>
        Reply HELP for assistance.
      </p>


      <h2>Privacy</h2>

      <p>
        Mobile phone numbers, SMS opt-in information, and
        messaging consent are not shared, sold, rented, or
        provided to third parties or affiliates for marketing
        or promotional purposes.
      </p>

      <p>
        Review the full Privacy Policy here:
      </p>

      <p>
        <a href="/privacy">
          https://village-barber-sms.onrender.com/privacy
        </a>
      </p>


      <div class="links">

        <p>
          <a href="/sms-consent">
            SMS Consent Information
          </a>
        </p>

        <p>
          <a href="/">
            Business Pro SMS Home
          </a>
        </p>

      </div>

    `
  );

});


// ========================================
// SMS CONSENT / OPT-IN PAGE
// ========================================

app.get("/sms-consent", (req, res) => {

  sendPage(
    res,
    "SMS Consent | Business Pro SMS",
    `

      <h1>Business Pro SMS Appointment Consent</h1>

      <p>
        Business Pro SMS provides transactional appointment
        notifications for appointment-based businesses.
      </p>

      <p>
        Customers may voluntarily provide their mobile phone
        number when booking an appointment online.
      </p>


      <form>

        <label for="demo-phone">
          <strong>Mobile Phone</strong>
        </label>

        <br>

        <input
          id="demo-phone"
          type="tel"
          placeholder="(207) 555-0123"
        >


        <div class="consent-box">

          <label>

            <input type="checkbox">

            I agree to receive appointment confirmations,
            reminders, scheduling updates, and cancellation
            notifications by text message from Business Pro SMS.

          </label>

        </div>

      </form>


      <p>
        SMS consent is optional and is not required to book an
        appointment or purchase goods or services.
      </p>

      <p>
        Message frequency varies based on appointment activity.
        Message and data rates may apply.
      </p>

      <p>
        Reply STOP to opt out.
        Reply HELP for assistance.
      </p>

      <p>
        Mobile phone numbers and messaging consent will not be
        shared with third parties or affiliates for marketing
        or promotional purposes.
      </p>


      <div class="links">

        <p>
          <a href="/privacy">
            Privacy Policy
          </a>
        </p>

        <p>
          <a href="/terms">
            Terms & Conditions
          </a>
        </p>

        <p>
          <a href="/">
            Business Pro SMS Home
          </a>
        </p>

      </div>

    `
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


      // ====================================
      // NORMALIZE PHONE NUMBERS
      // ====================================

      const normalizePhone = (phone) =>
        String(phone || "")
          .replace(/\D/g, "");


      const requestedPhone =
        normalizePhone(req.body.phone);


      const allowedPhone =
        normalizePhone(
          DEMO_ALLOWED_PHONE
        );


      // ====================================
      // ONLY ALLOW AUTHORIZED DEMO NUMBER
      // ====================================

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


      // ====================================
      // TWILIO REQUEST
      // ====================================

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


      // ====================================
      // TWILIO ERROR
      // ====================================

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


      // ====================================
      // SUCCESS
      // ====================================

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
