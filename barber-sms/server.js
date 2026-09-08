const express = require("express");
const Stripe = require("stripe");

const app = express();


// ============================================================
// BODY PARSING
// ============================================================

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true
  })
);


// ============================================================
// CORS
// ============================================================

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


// ============================================================
// PAGE TEMPLATE
// ============================================================

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

        * {
          box-sizing: border-box;
        }

        body {
          font-family: Arial, sans-serif;
          max-width: 820px;
          margin: 40px auto;
          padding: 20px;
          line-height: 1.6;
          color: #222;
          background: #fff;
        }

        h1 {
          margin-bottom: 12px;
        }

        h2 {
          margin-top: 32px;
        }

        a {
          color: #174ea6;
        }

        .notice {
          margin: 25px 0;
          padding: 18px;
          border: 1px solid #bbb;
          border-radius: 6px;
        }

        .links {
          margin-top: 35px;
          padding-top: 20px;
          border-top: 1px solid #ddd;
        }

        label {
          display: block;
          margin-top: 18px;
        }

        input,
        select {
          width: 100%;
          max-width: 420px;
          padding: 11px;
          margin-top: 6px;
          font-size: 16px;
        }

        .consent-box {
          margin-top: 24px;
          padding: 18px;
          border: 2px solid #555;
          border-radius: 6px;
        }

        .consent-box label {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          margin: 0;
        }

        .consent-box input {
          width: auto;
          margin-top: 6px;
        }

        button {
          margin-top: 24px;
          padding: 12px 20px;
          font-size: 16px;
          cursor: pointer;
        }

        .small {
          font-size: 14px;
        }

      </style>

    </head>

    <body>

      ${content}

    </body>

    </html>
  `);

}


// ============================================================
// BUSINESS PRO SMS HOME
// ============================================================

app.get("/", (req, res) => {

  sendPage(
    res,
    "Business Pro SMS",
    `

      <h1>Business Pro SMS</h1>

      <p>
        Business Pro SMS provides appointment booking and
        transactional SMS notification tools for
        appointment-based businesses.
      </p>

      <p>
        Customers who voluntarily opt in may receive
        appointment confirmations, reminders, scheduling
        updates, and cancellation notifications.
      </p>


      <h2>Business Pro SMS Messaging Program</h2>

      <div class="notice">

        <p>
          Customers may receive up to 6 SMS messages per
          appointment, depending on appointment activity.
        </p>

        <p>
          Message and data rates may apply.
        </p>

        <p>
          Reply STOP to opt out.
          Reply HELP for help.
        </p>

        <p>
          SMS consent is voluntary and is not required to
          book an appointment or purchase goods or services.
        </p>

      </div>


      <h2>How Customers Opt In</h2>

      <p>
        Customers enter their mobile phone number during the
        online appointment booking process.
      </p>

      <p>
        Customers who want SMS appointment notifications
        separately check an unchecked SMS consent checkbox.
      </p>

      <p>
        The checkbox is optional.
      </p>


      <div class="links">

        <p>
          <a href="/sms-consent">
            View SMS Opt-In Form
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


// ============================================================
// PRIVACY POLICY
// ============================================================

app.get("/privacy", (req, res) => {

  sendPage(
    res,
    "Privacy Policy | Business Pro SMS",
    `

      <h1>Business Pro SMS Privacy Policy</h1>

      <p>
        This Privacy Policy applies to the Business Pro SMS
        appointment booking and transactional SMS messaging
        program.
      </p>


      <h2>Information We Collect</h2>

      <p>
        Business Pro SMS may collect information voluntarily
        provided by customers when they use the appointment
        booking service.
      </p>

      <p>
        This information may include:
      </p>

      <ul>

        <li>Name</li>

        <li>Mobile phone number</li>

        <li>Appointment date and time</li>

        <li>Appointment service information</li>

        <li>SMS opt-in and consent status</li>

      </ul>


      <h2>How We Use Information</h2>

      <p>
        Customer information is used only as necessary to
        provide appointment booking and appointment-related
        communications requested by the customer.
      </p>

      <p>
        SMS messages may include appointment confirmations,
        reminders, scheduling updates, and cancellation
        notifications.
      </p>


      <h2>Mobile Information and SMS Consent</h2>

      <p>
        <strong>
          Business Pro SMS does not share, sell, rent, or
          provide mobile phone numbers, SMS opt-in data, or
          messaging consent to third parties or affiliates
          for marketing or promotional purposes.
        </strong>
      </p>

      <p>
        Mobile information and SMS consent are used only for
        the Business Pro SMS messaging program for which the
        customer voluntarily opted in.
      </p>

      <p>
        SMS consent is not transferred to another business,
        sender, third party, affiliate, or lead generator for
        marketing or promotional purposes.
      </p>


      <h2>SMS Messaging Disclosures</h2>

      <p>
        Customers may receive up to 6 SMS messages per
        appointment, depending on appointment activity.
      </p>

      <p>
        Message and data rates may apply.
      </p>

      <p>
        Reply STOP to opt out of SMS messages.
      </p>

      <p>
        Reply HELP for help.
      </p>

      <p>
        SMS consent is voluntary and is not required to
        book an appointment or purchase goods or services.
      </p>


      <h2>Customer Choice</h2>

      <p>
        Customers who do not consent to SMS messaging may
        still complete the appointment booking process.
      </p>


      <div class="links">

        <p>
          <a href="/sms-consent">
            SMS Opt-In Form
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


// ============================================================
// TERMS & CONDITIONS
// ============================================================

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


      <h2>Program Description</h2>

      <p>
        Customers who voluntarily opt in may receive
        appointment-related SMS messages from Business Pro SMS.
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


      <h2>SMS Consent</h2>

      <p>
        Customers opt in by voluntarily providing their mobile
        phone number and separately checking an unchecked SMS
        consent checkbox during the online appointment booking
        process.
      </p>

      <p>
        SMS consent is optional.
      </p>

      <p>
        SMS consent is not required to book an appointment or
        purchase goods or services.
      </p>


      <h2>Message Frequency</h2>

      <p>
        Customers may receive up to 6 SMS messages per
        appointment, depending on appointment activity.
      </p>


      <h2>Message and Data Rates</h2>

      <p>
        Message and data rates may apply according to the
        customer's wireless carrier and mobile plan.
      </p>


      <h2>Opt Out</h2>

      <p>
        Reply STOP at any time to opt out of SMS messages.
      </p>


      <h2>Help</h2>

      <p>
        Reply HELP for help.
      </p>


      <h2>Privacy</h2>

      <p>
        Business Pro SMS does not share, sell, rent, or provide
        mobile phone numbers, SMS opt-in data, or messaging
        consent to third parties or affiliates for marketing or
        promotional purposes.
      </p>

      <p>
        Read the full Privacy Policy:
      </p>

      <p>
        <a href="/privacy">
          https://village-barber-sms.onrender.com/privacy
        </a>
      </p>


      <div class="links">

        <p>
          <a href="/sms-consent">
            SMS Opt-In Form
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


// ============================================================
// SMS OPT-IN FORM
// ============================================================

app.get("/sms-consent", (req, res) => {

  sendPage(
    res,
    "SMS Opt-In | Business Pro SMS",
    `

      <h1>Business Pro SMS Appointment Booking</h1>

      <p>
        This public form demonstrates the SMS consent process
        used with the Business Pro SMS appointment booking
        workflow.
      </p>


      <form
        method="POST"
        action="/sms-consent-demo"
      >

        <label for="customer-name">
          Customer Name
        </label>

        <input
          id="customer-name"
          name="customerName"
          type="text"
          placeholder="Enter your name"
        >


        <label for="mobile-phone">
          Mobile Phone
        </label>

        <input
          id="mobile-phone"
          name="phone"
          type="tel"
          placeholder="(207) 555-0123"
        >


        <label for="appointment-date">
          Appointment Date
        </label>

        <input
          id="appointment-date"
          name="appointmentDate"
          type="date"
        >


        <label for="appointment-time">
          Appointment Time
        </label>

        <input
          id="appointment-time"
          name="appointmentTime"
          type="time"
        >


        <div class="consent-box">

          <label>

            <input
              type="checkbox"
              name="smsConsent"
              value="yes"
            >

            <span>

              By checking this box, I agree to receive
              transactional SMS messages from
              <strong>Business Pro SMS</strong> regarding
              appointment confirmations, reminders, scheduling
              updates, and cancellation notifications.

              I may receive up to 6 SMS messages per appointment,
              depending on appointment activity.

              Message and data rates may apply.

              Reply STOP to opt out.
              Reply HELP for help.

              SMS consent is optional and is not required to
              book an appointment or purchase goods or services.

              <a href="/privacy">
                Privacy Policy
              </a>

              |

              <a href="/terms">
                Terms & Conditions
              </a>

            </span>

          </label>

        </div>


        <button type="submit">
          Submit Appointment Form
        </button>

      </form>


      <p class="small">

        The SMS checkbox above is unchecked by default.
        Customers may submit the appointment form without
        selecting SMS notifications.

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


// ============================================================
// DEMONSTRATE OPTIONAL CONSENT
// ============================================================

app.post(
  "/sms-consent-demo",
  (req, res) => {

    const selectedSMS =
      req.body.smsConsent === "yes";


    sendPage(
      res,
      "Appointment Form Submitted | Business Pro SMS",
      `

        <h1>Appointment Form Submitted</h1>

        <p>
          This page demonstrates that appointment booking can
          be completed whether or not SMS consent is selected.
        </p>


        <div class="notice">

          <strong>SMS Notification Selection:</strong>

          <p>
            ${
              selectedSMS
                ? "SMS notifications were voluntarily selected."
                : "SMS notifications were not selected. The appointment form was still accepted."
            }
          </p>

        </div>


        <p>
          <a href="/sms-consent">
            Return to SMS Opt-In Form
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

      `
    );

  }
);


// ============================================================
// SEND APPOINTMENT CONFIRMATION SMS
// ============================================================

app.post(
  "/send-confirmation",
  async (req, res) => {

    try {

      const {
        TWILIO_ACCOUNT_SID,
        TWILIO_AUTH_TOKEN,
        DEMO_ALLOWED_PHONE,
        TWILIO_MESSAGING_SERVICE_SID,
        TWILIO_PHONE_NUMBER,
        TWILIO_FROM_NUMBER
      } = process.env;


      if (
        !TWILIO_ACCOUNT_SID ||
        !TWILIO_AUTH_TOKEN ||
        !DEMO_ALLOWED_PHONE
      ) {

        return res.status(500).json({

          success: false,

          error:
            "SMS server configuration is incomplete."

        });

      }


      const normalizePhone = (phone) => {

        let digits =
          String(phone || "")
            .replace(/\D/g, "");


        if (
          digits.length === 10
        ) {

          digits =
            "1" + digits;

        }


        return digits;

      };


      const requestedPhone =
        normalizePhone(
          req.body.phone
        );


      const allowedPhone =
        normalizePhone(
          DEMO_ALLOWED_PHONE
        );


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


      const appointmentDate =
        String(
          req.body.date ||
          req.body.appointmentDate ||
          "[date]"
        );


      const appointmentTime =
        String(
          req.body.time ||
          req.body.appointmentTime ||
          "[time]"
        );


      const shopName =
        String(
          req.body.shopName ||
          "The Village Barber"
        ).trim() ||
        "The Village Barber";


      const barberName =
        String(
          req.body.barber ||
          ""
        ).trim();


      const manageUrl =
        String(
          req.body.manageUrl ||
          ""
        ).trim();


      const lateCancellationHours =
        Number(req.body.lateCancellationHours) || 24;


      const lateCancellationPercent =
        Number(req.body.lateCancellationPercent) || 20;


      const messageBody =
        `${shopName}: Your appointment${barberName ? ` with ${barberName}` : ""} is confirmed for ${appointmentDate} at ${appointmentTime}. Cancellations within ${lateCancellationHours} hours have a ${lateCancellationPercent}% fee.${manageUrl ? ` Cancel or reschedule: ${manageUrl}` : ""} Reply STOP to opt out.`;


      const twilioURL =
        `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;


      const authorization =
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
        messageBody
      );


      if (
        TWILIO_MESSAGING_SERVICE_SID
      ) {

        formData.append(
          "MessagingServiceSid",
          TWILIO_MESSAGING_SERVICE_SID
        );

      } else {

        const senderNumber =
          TWILIO_PHONE_NUMBER ||
          TWILIO_FROM_NUMBER;


        if (!senderNumber) {

          return res.status(500).json({

            success: false,

            error:
              "A Twilio sender number or Messaging Service SID has not been configured."

          });

        }


        formData.append(
          "From",
          senderNumber
        );

      }


      const twilioResponse =
        await fetch(
          twilioURL,
          {

            method: "POST",

            headers: {

              Authorization:
                `Basic ${authorization}`,

              "Content-Type":
                "application/x-www-form-urlencoded"

            },

            body:
              formData.toString()

          }
        );


      const result =
        await twilioResponse.json();


      if (!twilioResponse.ok) {

        console.error(
          "Twilio SMS error:",
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


      console.log(
        "SMS sent:",
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


// ============================================================
// SEND APPOINTMENT CANCELLATION / RESCHEDULE SMS
// ============================================================

app.post(
  "/send-cancellation",
  async (req, res) => {

    try {

      const {
        TWILIO_ACCOUNT_SID,
        TWILIO_AUTH_TOKEN,
        DEMO_ALLOWED_PHONE,
        TWILIO_MESSAGING_SERVICE_SID,
        TWILIO_PHONE_NUMBER,
        TWILIO_FROM_NUMBER
      } = process.env;


      if (
        !TWILIO_ACCOUNT_SID ||
        !TWILIO_AUTH_TOKEN ||
        !DEMO_ALLOWED_PHONE
      ) {

        return res.status(500).json({
          success: false,
          error: "SMS server configuration is incomplete."
        });

      }


      const normalizePhone = (phone) => {
        let digits = String(phone || "").replace(/\D/g, "");
        if (digits.length === 10) digits = "1" + digits;
        return digits;
      };


      const requestedPhone = normalizePhone(req.body.phone);
      const allowedPhone = normalizePhone(DEMO_ALLOWED_PHONE);


      if (!requestedPhone || requestedPhone !== allowedPhone) {

        return res.status(403).json({
          success: false,
          error: "This phone number is not authorized for the demo."
        });

      }


      const messageBody = String(req.body.message || "").trim();

      if (!messageBody) {
        return res.status(400).json({
          success: false,
          error: "A cancellation message is required."
        });
      }


      const twilioURL =
        `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;


      const authorization =
        Buffer.from(
          `${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`
        ).toString("base64");


      const formData = new URLSearchParams();
      formData.append("To", DEMO_ALLOWED_PHONE);
      formData.append("Body", messageBody);


      if (TWILIO_MESSAGING_SERVICE_SID) {
        formData.append("MessagingServiceSid", TWILIO_MESSAGING_SERVICE_SID);
      } else {
        const senderNumber = TWILIO_PHONE_NUMBER || TWILIO_FROM_NUMBER;

        if (!senderNumber) {
          return res.status(500).json({
            success: false,
            error: "A Twilio sender number or Messaging Service SID has not been configured."
          });
        }

        formData.append("From", senderNumber);
      }


      const twilioResponse = await fetch(
        twilioURL,
        {
          method: "POST",
          headers: {
            Authorization: `Basic ${authorization}`,
            "Content-Type": "application/x-www-form-urlencoded"
          },
          body: formData.toString()
        }
      );


      const result = await twilioResponse.json();

      if (!twilioResponse.ok) {
        console.error("Twilio cancellation SMS error:", result);
        return res.status(twilioResponse.status).json({
          success: false,
          error: result.message || "Twilio rejected the cancellation SMS request."
        });
      }


      console.log("Cancellation SMS sent:", result.sid);

      return res.json({
        success: true,
        messageSid: result.sid
      });


    } catch (error) {

      console.error("Cancellation SMS server error:", error);

      return res.status(500).json({
        success: false,
        error: "The cancellation text could not be sent."
      });

    }

  }
);


// ============================================================
// APPOINTMENT STRIPE TEST CHECKOUT + TEST REFUNDS
// ============================================================

function getStripeTestClient() {
  const key =
    process.env.STRIPE_TEST_SECRET_KEY ||
    process.env.STRIPE_SECRET_KEY ||
    "";

  if (!key || !key.startsWith("sk_test_")) {
    throw new Error(
      "Stripe appointment testing requires a Stripe TEST secret key (sk_test_...)."
    );
  }

  return new Stripe(key);
}


function getRequestBaseUrl(req) {
  const configured = String(process.env.PUBLIC_BASE_URL || "").trim();
  if (configured) return configured.replace(/\/$/, "");

  const forwardedProto = String(req.headers["x-forwarded-proto"] || "").split(",")[0].trim();
  const protocol = forwardedProto || req.protocol || "https";
  return `${protocol}://${req.get("host")}`;
}


function cleanAppointmentValue(value, maxLength = 300) {
  return String(value || "").trim().slice(0, maxLength);
}


function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


function moneyFromCents(cents) {
  return `$${(Number(cents || 0) / 100).toFixed(2)}`;
}


function getAppointmentManageUrl(req, sessionId) {
  return `${getRequestBaseUrl(req)}/manage-test-appointment?session_id=${encodeURIComponent(sessionId)}`;
}


app.post(
  "/create-appointment-checkout-session",
  async (req, res) => {
    try {
      const stripe = getStripeTestClient();

      const bookingId = cleanAppointmentValue(req.body.bookingId, 120);
      const shopName = cleanAppointmentValue(req.body.shopName, 160) || "Barber Shop";
      const barberName = cleanAppointmentValue(req.body.barberName, 160) || "Barber";
      const serviceName = cleanAppointmentValue(req.body.serviceName, 160) || "Appointment";
      const customerName = cleanAppointmentValue(req.body.customerName, 160) || "Customer";
      const phone = cleanAppointmentValue(req.body.phone, 50);
      const appointmentDate = cleanAppointmentValue(req.body.appointmentDate, 40);
      const appointmentTime = cleanAppointmentValue(req.body.appointmentTime, 40);
      const appointmentTime24 = cleanAppointmentValue(req.body.appointmentTime24, 20);
      const appointmentStartIso = cleanAppointmentValue(req.body.appointmentStartIso, 80);
      const smsConsent = req.body.smsConsent ? "yes" : "no";
      const lateCancellationHours = Math.max(1, Number(req.body.lateCancellationHours) || 24);
      const lateCancellationPercent = Math.min(100, Math.max(0, Number(req.body.lateCancellationPercent) || 20));
      const servicePrice = Number(req.body.servicePrice || 0);
      const amountCents = Math.round(servicePrice * 100);

      if (!bookingId || !phone || !appointmentDate || !appointmentTime || !appointmentStartIso) {
        return res.status(400).json({
          success: false,
          error: "Appointment checkout is missing required booking information."
        });
      }

      if (!Number.isFinite(amountCents) || amountCents < 50 || amountCents > 100000) {
        return res.status(400).json({
          success: false,
          error: "The appointment price is not valid for test checkout."
        });
      }

      const baseUrl = getRequestBaseUrl(req);

      const metadata = {
        paymentType: "appointment-test",
        bookingId,
        shopName,
        barberName,
        serviceName,
        customerName,
        phone,
        appointmentDate,
        appointmentTime,
        appointmentTime24,
        appointmentStartIso,
        smsConsent,
        lateCancellationHours: String(lateCancellationHours),
        lateCancellationPercent: String(lateCancellationPercent)
      };

      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        client_reference_id: bookingId,
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: `${shopName} — ${serviceName}`,
                description: `${barberName} • ${appointmentDate} at ${appointmentTime}`
              },
              unit_amount: amountCents
            },
            quantity: 1
          }
        ],
        metadata,
        payment_intent_data: {
          metadata
        },
        success_url:
          `${baseUrl}/appointment-payment-complete?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url:
          `${baseUrl}/appointment-payment-cancelled`
      });

      return res.json({
        success: true,
        url: session.url,
        sessionId: session.id,
        manageUrl: getAppointmentManageUrl(req, session.id)
      });
    } catch (error) {
      console.error("Appointment Stripe test checkout error:", error);
      return res.status(500).json({
        success: false,
        error: error.message || "The Stripe test checkout could not be created."
      });
    }
  }
);


app.get(
  "/appointment-checkout-status",
  async (req, res) => {
    try {
      const stripe = getStripeTestClient();
      const sessionId = cleanAppointmentValue(req.query.session_id, 200);

      if (!sessionId || !sessionId.startsWith("cs_test_")) {
        return res.status(400).json({ success: false, error: "Invalid test checkout session." });
      }

      const session = await stripe.checkout.sessions.retrieve(sessionId);

      return res.json({
        success: true,
        status: session.status,
        paymentStatus: session.payment_status,
        paid: session.payment_status === "paid",
        amountTotal: Number(session.amount_total || 0),
        manageUrl: getAppointmentManageUrl(req, session.id)
      });
    } catch (error) {
      console.error("Appointment Stripe test status error:", error);
      return res.status(500).json({
        success: false,
        error: error.message || "The Stripe test payment status could not be checked."
      });
    }
  }
);


app.get(
  "/appointment-payment-complete",
  async (req, res) => {
    const sessionId = cleanAppointmentValue(req.query.session_id, 200);

    try {
      const stripe = getStripeTestClient();
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      const metadata = session.metadata || {};
      const paid = session.payment_status === "paid";

      sendPage(
        res,
        "Appointment Payment | Business Pro",
        `
          <h1>${paid ? "Payment Approved ✓" : "Payment Processing"}</h1>
          <div class="notice">
            <p><strong>TEST MODE:</strong> No real money was charged.</p>
            <p><strong>Service:</strong> ${escapeHtml(metadata.serviceName || "Appointment")}</p>
            <p><strong>Barber:</strong> ${escapeHtml(metadata.barberName || "Barber")}</p>
            <p><strong>Date:</strong> ${escapeHtml(metadata.appointmentDate || "")}</p>
            <p><strong>Time:</strong> ${escapeHtml(metadata.appointmentTime || "")}</p>
            <p><strong>Amount:</strong> ${moneyFromCents(session.amount_total)}</p>
          </div>
          <p>${paid ? "Return to the Business Pro customer window. Your appointment will confirm automatically and your confirmation text will be sent." : "Please wait for the payment to finish, then return to the Business Pro customer window."}</p>
          ${paid ? `<p><a href="${escapeHtml(getAppointmentManageUrl(req, session.id))}">Cancel or reschedule this appointment</a></p>` : ""}
        `
      );
    } catch (error) {
      console.error("Appointment payment completion page error:", error);
      sendPage(
        res,
        "Appointment Payment | Business Pro",
        `<h1>Payment Status Unavailable</h1><p>The test payment status could not be loaded.</p>`
      );
    }
  }
);


app.get(
  "/appointment-payment-cancelled",
  (req, res) => {
    sendPage(
      res,
      "Appointment Payment Cancelled | Business Pro",
      `
        <h1>Payment Not Completed</h1>
        <p>No appointment was confirmed. Return to the Business Pro customer window to try again.</p>
        <p><strong>TEST MODE:</strong> No real money was charged.</p>
      `
    );
  }
);


async function refundTestAppointment(stripe, session, forceFullRefund = false) {
  if (!session || session.payment_status !== "paid") {
    throw new Error("This appointment does not have a completed test payment.");
  }

  const metadata = session.metadata || {};
  const total = Number(session.amount_total || 0);
  const lateHours = Math.max(1, Number(metadata.lateCancellationHours) || 24);
  const latePercent = Math.min(100, Math.max(0, Number(metadata.lateCancellationPercent) || 20));
  const appointmentStart = new Date(metadata.appointmentStartIso || "");
  const hoursRemaining = Number.isNaN(appointmentStart.getTime())
    ? Infinity
    : (appointmentStart.getTime() - Date.now()) / 3600000;

  const feeApplies = !forceFullRefund && hoursRemaining <= lateHours;
  const feeCents = feeApplies ? Math.round(total * latePercent / 100) : 0;
  const desiredRefundCents = Math.max(0, total - feeCents);

  const paymentIntent = typeof session.payment_intent === "string"
    ? session.payment_intent
    : session.payment_intent?.id;

  if (!paymentIntent) {
    throw new Error("The Stripe test payment does not contain a payment intent.");
  }

  const existingRefunds = await stripe.refunds.list({
    payment_intent: paymentIntent,
    limit: 100
  });

  const refundedCents = existingRefunds.data
    .filter(refund => refund.status !== "failed" && refund.status !== "canceled")
    .reduce((sum, refund) => sum + Number(refund.amount || 0), 0);

  const remainingRefundCents = Math.max(0, desiredRefundCents - refundedCents);
  let refund = null;

  if (remainingRefundCents > 0) {
    refund = await stripe.refunds.create(
      {
        payment_intent: paymentIntent,
        amount: remainingRefundCents,
        metadata: {
          paymentType: "appointment-test-refund",
          bookingId: metadata.bookingId || "",
          cancellationType: forceFullRefund ? "business-cancellation" : "customer-cancellation",
          cancellationFeePercent: feeApplies ? String(latePercent) : "0"
        }
      },
      {
        idempotencyKey:
          `bp-test-refund-${session.id}-${desiredRefundCents}-${forceFullRefund ? "business" : "customer"}`
      }
    );
  }

  return {
    totalCents: total,
    feeCents,
    refundCents: desiredRefundCents,
    newlyRefundedCents: remainingRefundCents,
    refundId: refund?.id || "already-refunded",
    feeApplies,
    hoursRemaining
  };
}


app.post(
  "/refund-appointment-payment",
  async (req, res) => {
    try {
      const stripe = getStripeTestClient();
      const sessionId = cleanAppointmentValue(req.body.sessionId, 200);
      const forceFullRefund = req.body.mode === "business-full-refund";

      if (!sessionId || !sessionId.startsWith("cs_test_")) {
        return res.status(400).json({ success: false, error: "Invalid test checkout session." });
      }

      const session = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ["payment_intent"]
      });

      const result = await refundTestAppointment(stripe, session, forceFullRefund);

      return res.json({
        success: true,
        feeAmount: result.feeCents / 100,
        refundAmount: result.refundCents / 100,
        refundId: result.refundId,
        feeApplies: result.feeApplies
      });
    } catch (error) {
      console.error("Appointment Stripe test refund error:", error);
      return res.status(500).json({
        success: false,
        error: error.message || "The Stripe test refund could not be processed."
      });
    }
  }
);


app.get(
  "/manage-test-appointment",
  async (req, res) => {
    const sessionId = cleanAppointmentValue(req.query.session_id, 200);

    try {
      const stripe = getStripeTestClient();
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      const metadata = session.metadata || {};
      const lateHours = Math.max(1, Number(metadata.lateCancellationHours) || 24);
      const latePercent = Math.min(100, Math.max(0, Number(metadata.lateCancellationPercent) || 20));
      const paid = session.payment_status === "paid";
      const rescheduleBase = "https://villagebarber.businessprolocal.com/";
      const rescheduleUrl = `${rescheduleBase}?reschedule=${encodeURIComponent(metadata.bookingId || "")}&paidSession=${encodeURIComponent(session.id)}`;

      sendPage(
        res,
        "Manage Appointment | Business Pro",
        `
          <h1>Manage Your Appointment</h1>
          <div class="notice">
            <p><strong>${escapeHtml(metadata.serviceName || "Appointment")}</strong> with ${escapeHtml(metadata.barberName || "Barber")}</p>
            <p>${escapeHtml(metadata.appointmentDate || "")} at <strong>${escapeHtml(metadata.appointmentTime || "")}</strong></p>
            <p>Amount paid: <strong>${moneyFromCents(session.amount_total)}</strong> ${paid ? "✓" : ""}</p>
          </div>

          <div class="notice">
            <strong>Cancellation Policy</strong>
            <p>Cancel more than ${lateHours} hours before your appointment for a full refund. Cancellations made within ${lateHours} hours are subject to a <strong>${latePercent}% cancellation fee</strong>; the remaining ${100 - latePercent}% is refunded.</p>
          </div>

          <p><a href="${escapeHtml(rescheduleUrl)}">RESCHEDULE APPOINTMENT</a></p>

          <form method="post" action="/cancel-test-appointment">
            <input type="hidden" name="sessionId" value="${escapeHtml(session.id)}">
            <button type="submit">CANCEL APPOINTMENT</button>
          </form>

          <p class="small"><strong>TEST MODE:</strong> Payments and refunds use Stripe test mode. No real money moves.</p>
        `
      );
    } catch (error) {
      console.error("Manage test appointment error:", error);
      sendPage(
        res,
        "Manage Appointment | Business Pro",
        `<h1>Appointment Not Found</h1><p>The test appointment could not be loaded.</p>`
      );
    }
  }
);


app.post(
  "/cancel-test-appointment",
  async (req, res) => {
    const sessionId = cleanAppointmentValue(req.body.sessionId, 200);

    try {
      const stripe = getStripeTestClient();
      const session = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ["payment_intent"]
      });
      const metadata = session.metadata || {};
      const result = await refundTestAppointment(stripe, session, false);

      sendPage(
        res,
        "Appointment Cancelled | Business Pro",
        `
          <h1>Appointment Cancelled</h1>
          <div class="notice">
            <p>${escapeHtml(metadata.serviceName || "Appointment")} with ${escapeHtml(metadata.barberName || "Barber")}</p>
            <p>${escapeHtml(metadata.appointmentDate || "")} at ${escapeHtml(metadata.appointmentTime || "")}</p>
            <p>Amount paid: <strong>${moneyFromCents(result.totalCents)}</strong></p>
            <p>Cancellation fee retained: <strong>${moneyFromCents(result.feeCents)}</strong></p>
            <p>Refund: <strong>${moneyFromCents(result.refundCents)}</strong></p>
          </div>
          <p><strong>TEST MODE:</strong> This refund was processed only against Stripe test funds.</p>
        `
      );
    } catch (error) {
      console.error("Cancel test appointment error:", error);
      sendPage(
        res,
        "Cancellation Error | Business Pro",
        `<h1>Cancellation Could Not Be Completed</h1><p>${escapeHtml(error.message || "The test cancellation failed.")}</p>`
      );
    }
  }
);


// ============================================================
// BUSINESS PRO LOCAL STRIPE CHECKOUT
// ============================================================

const BUSINESS_PRO_PLANS = {

  basic: {
    name: "Basic",
    setupAmount: 99500,
    monthlyAmount: 4900,
    advertisingRate: "$0.75 per click",
    advertisingMinimum: "$25 monthly minimum"
  },

  professional: {
    name: "Professional",
    setupAmount: 149500,
    monthlyAmount: 7900,
    advertisingRate: "$1.25 per click",
    advertisingMinimum: "$50 monthly minimum"
  },

  "business-pro": {
    name: "Business Pro",
    setupAmount: 249500,
    monthlyAmount: 14900,
    advertisingRate: "$2.00 per click",
    advertisingMinimum: "$75 monthly minimum"
  }

};


function cleanCheckoutValue(value, maxLength = 500) {

  return String(value || "")
    .trim()
    .slice(0, maxLength);

}


app.post(
  "/create-checkout-session",
  async (req, res) => {

    try {

      const stripeSecretKey =
        process.env.STRIPE_SECRET_KEY;


      if (!stripeSecretKey) {

        return res.status(500).json({

          success: false,

          error:
            "Stripe server configuration is incomplete."

        });

      }


      const stripe =
        new Stripe(stripeSecretKey);


      const planKey =
        cleanCheckoutValue(
          req.body.plan,
          50
        );


      const plan =
        BUSINESS_PRO_PLANS[
          planKey
        ];


      if (!plan) {

        return res.status(400).json({

          success: false,

          error:
            "Please choose a valid Business Pro Local package."

        });

      }


      const businessName =
        cleanCheckoutValue(
          req.body.businessName,
          200
        );


      const ownerName =
        cleanCheckoutValue(
          req.body.ownerName,
          200
        );


      const phone =
        cleanCheckoutValue(
          req.body.phone,
          100
        );


      const email =
        cleanCheckoutValue(
          req.body.email,
          320
        );


      const businessAddress =
        cleanCheckoutValue(
          req.body.businessAddress,
          300
        );


      const businessNotes =
        cleanCheckoutValue(
          req.body.businessNotes,
          500
        );


      const advertising =
        req.body.advertising === "on"
          ? "ON"
          : "OFF";


      if (
        !businessName ||
        !ownerName ||
        !phone ||
        !email
      ) {

        return res.status(400).json({

          success: false,

          error:
            "Business name, contact name, phone number, and email address are required."

        });

      }


      const metadata = {
        businessName,
        ownerName,
        phone,
        email,
        businessAddress,
        plan: plan.name,
        planKey,
        advertising,
        advertisingRate:
          advertising === "ON"
            ? plan.advertisingRate
            : "Not selected",
        advertisingMinimum:
          advertising === "ON"
            ? plan.advertisingMinimum
            : "Not selected",
        businessNotes
      };


      const session =
        await stripe.checkout.sessions.create({

          mode: "subscription",

          customer_email:
            email,

          line_items: [

            {
              price_data: {
                currency: "usd",
                product_data: {
                  name:
                    `Business Pro Local ${plan.name} Website Setup`
                },
                unit_amount:
                  plan.setupAmount
              },
              quantity: 1
            },

            {
              price_data: {
                currency: "usd",
                product_data: {
                  name:
                    `Business Pro Local ${plan.name} Monthly Service`
                },
                unit_amount:
                  plan.monthlyAmount,
                recurring: {
                  interval: "month"
                }
              },
              quantity: 1
            }

          ],

          metadata,

          subscription_data: {
            metadata
          },

          success_url:
            "https://villagebarber.businessprolocal.com/join.html?payment=success&session_id={CHECKOUT_SESSION_ID}",

          cancel_url:
            "https://villagebarber.businessprolocal.com/join.html?payment=cancelled"

        });


      return res.json({
        success: true,
        url: session.url
      });


    } catch (error) {

      console.error(
        "Stripe checkout error:",
        error
      );


      return res.status(500).json({

        success: false,

        error:
          error.message ||
          "The Stripe checkout session could not be created."

      });

    }

  }
);


// ============================================================
// START SERVER
// ============================================================

const PORT =
  process.env.PORT || 3000;


app.listen(
  PORT,
  () => {

    console.log(
      `Business Pro SMS server running on port ${PORT}`
    );

  }
);
