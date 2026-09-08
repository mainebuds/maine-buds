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
// APPOINTMENT SMS HELPERS
// ============================================================

function normalizeSmsPhone(phone) {
  let digits = String(phone || "").replace(/\D/g, "");
  if (digits.length === 10) digits = "1" + digits;
  if (digits.length !== 11 || !digits.startsWith("1")) return "";
  return `+${digits}`;
}

function formatServerTime12(value) {
  const raw = String(value || "").trim();
  if (/\b(?:AM|PM)\b/i.test(raw)) return raw;
  const match = raw.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return raw;
  let hour = Number(match[1]);
  const minute = match[2];
  const period = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;
  return `${hour}:${minute} ${period}`;
}

async function sendTwilioMessage(phone, messageBody) {
  const {
    TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN,
    TWILIO_MESSAGING_SERVICE_SID,
    TWILIO_PHONE_NUMBER,
    TWILIO_FROM_NUMBER
  } = process.env;

  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
    throw new Error("SMS server configuration is incomplete.");
  }

  const to = normalizeSmsPhone(phone);
  if (!to) {
    throw new Error("A valid 10-digit mobile phone number is required.");
  }

  const twilioURL =
    `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;

  const authorization =
    Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString("base64");

  const formData = new URLSearchParams();
  formData.append("To", to);
  formData.append("Body", String(messageBody || "").trim());

  if (TWILIO_MESSAGING_SERVICE_SID) {
    formData.append("MessagingServiceSid", TWILIO_MESSAGING_SERVICE_SID);
  } else {
    const senderNumber = TWILIO_PHONE_NUMBER || TWILIO_FROM_NUMBER;
    if (!senderNumber) {
      throw new Error("A Twilio sender number or Messaging Service SID has not been configured.");
    }
    formData.append("From", senderNumber);
  }

  const response = await fetch(twilioURL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${authorization}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: formData.toString()
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Twilio rejected the SMS request.");
  }

  return result;
}


// ============================================================
// SEND APPOINTMENT CONFIRMATION SMS
// ============================================================

app.post("/send-confirmation", async (req, res) => {
  try {
    const shopName = cleanAppointmentValue(req.body.shopName, 160) || "The Village Barber";
    const barberName = cleanAppointmentValue(req.body.barber || req.body.barberName, 160);
    const appointmentDate = cleanAppointmentValue(
      req.body.appointmentDateDisplay || req.body.date || req.body.appointmentDate,
      80
    );
    const appointmentTime = formatServerTime12(
      req.body.appointmentTimeDisplay || req.body.time || req.body.appointmentTime
    );
    const manageUrl = cleanAppointmentValue(req.body.manageUrl, 500);

    const messageBody =
      `${shopName}: Your appointment${barberName ? ` with ${barberName}` : ""} is confirmed for ${appointmentDate} at ${appointmentTime}.` +
      `${manageUrl ? ` Cancel or reschedule: ${manageUrl}` : ""} Reply STOP to opt out.`;

    const result = await sendTwilioMessage(req.body.phone, messageBody);

    return res.json({ success: true, messageSid: result.sid });
  } catch (error) {
    console.error("SMS confirmation error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "The confirmation text could not be sent."
    });
  }
});


// ============================================================
// SEND APPOINTMENT CANCELLATION / RESCHEDULE SMS
// ============================================================

app.post("/send-cancellation", async (req, res) => {
  try {
    const messageBody = cleanAppointmentValue(req.body.message, 1200);
    if (!messageBody) {
      return res.status(400).json({ success: false, error: "A cancellation message is required." });
    }

    const result = await sendTwilioMessage(req.body.phone, messageBody);
    return res.json({ success: true, messageSid: result.sid });
  } catch (error) {
    console.error("Cancellation SMS error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "The cancellation text could not be sent."
    });
  }
});


// ============================================================
// APPOINTMENT STRIPE TEST CARD SETUP + PAYMENT CHOICE
// ============================================================

function getStripeTestClient() {
  const key =
    process.env.STRIPE_TEST_SECRET_KEY ||
    process.env.STRIPE_SECRET_KEY ||
    "";

  if (!key || !key.startsWith("sk_test_")) {
    throw new Error("Stripe appointment testing requires a Stripe TEST secret key (sk_test_...).");
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

function appointmentHoldExpired(metadata) {
  const expiresAt = Date.parse(metadata.holdExpiresAt || "");
  return Number.isFinite(expiresAt) && expiresAt <= Date.now();
}

function appointmentHoursRemaining(metadata) {
  const start = new Date(metadata.appointmentStartIso || "");
  if (Number.isNaN(start.getTime())) return Infinity;
  return (start.getTime() - Date.now()) / 3600000;
}

async function getSetupPaymentMethod(session) {
  const setupIntent = session.setup_intent;
  if (!setupIntent) return "";

  if (typeof setupIntent === "string") {
    return "";
  }

  return typeof setupIntent.payment_method === "string"
    ? setupIntent.payment_method
    : setupIntent.payment_method?.id || "";
}

function getAppointmentMetadata(session) {
  const sessionMetadata = session?.metadata || {};
  const setupIntentMetadata =
    session?.setup_intent && typeof session.setup_intent !== "string"
      ? session.setup_intent.metadata || {}
      : {};

  return { ...sessionMetadata, ...setupIntentMetadata };
}

async function updateAppointmentMetadata(stripe, session, changes) {
  const setupIntentId =
    typeof session.setup_intent === "string"
      ? session.setup_intent
      : session.setup_intent?.id;

  if (!setupIntentId) {
    throw new Error("The Stripe card setup could not be found.");
  }

  const metadata = getAppointmentMetadata(session);

  await stripe.setupIntents.update(setupIntentId, {
    metadata: {
      ...metadata,
      ...changes
    }
  });
}

async function sendAppointmentConfirmationFromSession(req, session) {
  const metadata = getAppointmentMetadata(session);

  if (metadata.smsConsent !== "yes") {
    return { sent: false, skipped: true, messageSid: "" };
  }

  if (metadata.smsSentAt) {
    return { sent: true, skipped: false, messageSid: metadata.smsMessageSid || "" };
  }

  const manageUrl = getAppointmentManageUrl(req, session.id);
  const shopName = metadata.shopName || "The Village Barber";
  const barberName = metadata.barberName || "";
  const date = metadata.appointmentDateDisplay || metadata.appointmentDate || "";
  const time = metadata.appointmentTimeDisplay || formatServerTime12(metadata.appointmentTime || "");

  const message =
    `${shopName}: Your appointment${barberName ? ` with ${barberName}` : ""} is confirmed for ${date} at ${time}. ` +
    `Cancel or reschedule: ${manageUrl} Reply STOP to opt out.`;

  const sms = await sendTwilioMessage(metadata.phone, message);

  const stripe = getStripeTestClient();
  await updateAppointmentMetadata(stripe, session, {
    smsSentAt: new Date().toISOString(),
    smsMessageSid: sms.sid || "",
    smsError: ""
  });

  return { sent: true, skipped: false, messageSid: sms.sid || "" };
}

app.post("/create-appointment-card-setup-session", async (req, res) => {
  try {
    const stripe = getStripeTestClient();

    const bookingId = cleanAppointmentValue(req.body.bookingId, 120);
    const shopName = cleanAppointmentValue(req.body.shopName, 160) || "Barber Shop";
    const barberName = cleanAppointmentValue(req.body.barberName, 160) || "Barber";
    const serviceName = cleanAppointmentValue(req.body.serviceName, 160) || "Appointment";
    const customerName = cleanAppointmentValue(req.body.customerName, 160) || "Customer";
    const phone = cleanAppointmentValue(req.body.phone, 50);
    const appointmentDate = cleanAppointmentValue(req.body.appointmentDate, 40);
    const appointmentDateDisplay = cleanAppointmentValue(req.body.appointmentDateDisplay, 80) || appointmentDate;
    const appointmentTime = cleanAppointmentValue(req.body.appointmentTime, 40);
    const appointmentTimeDisplay = cleanAppointmentValue(req.body.appointmentTimeDisplay, 40) || formatServerTime12(appointmentTime);
    const appointmentStartIso = cleanAppointmentValue(req.body.appointmentStartIso, 80);
    const smsConsent = req.body.smsConsent ? "yes" : "no";
    const lateCancellationHours = Math.max(1, Number(req.body.lateCancellationHours) || 24);
    const lateCancellationPercent = Math.min(100, Math.max(0, Number(req.body.lateCancellationPercent) || 20));
    const servicePrice = Number(req.body.servicePrice || 0);
    const amountCents = Math.round(servicePrice * 100);
    const requestedExpiry = Date.parse(cleanAppointmentValue(req.body.holdExpiresAt, 80));
    const maximumExpiry = Date.now() + 3 * 60 * 1000;
    const holdExpiresAt = new Date(
      Number.isFinite(requestedExpiry)
        ? Math.min(requestedExpiry, maximumExpiry)
        : maximumExpiry
    ).toISOString();

    if (!bookingId || !phone || !appointmentDate || !appointmentTime || !appointmentStartIso) {
      return res.status(400).json({
        success: false,
        error: "Appointment setup is missing required booking information."
      });
    }

    if (!Number.isFinite(amountCents) || amountCents < 50 || amountCents > 100000) {
      return res.status(400).json({
        success: false,
        error: "The appointment price is not valid for test payment."
      });
    }

    const metadata = {
      paymentType: "appointment-card-setup-test",
      bookingId,
      shopName,
      barberName,
      serviceName,
      customerName,
      phone,
      appointmentDate,
      appointmentDateDisplay,
      appointmentTime,
      appointmentTimeDisplay,
      appointmentStartIso,
      smsConsent,
      lateCancellationHours: String(lateCancellationHours),
      lateCancellationPercent: String(lateCancellationPercent),
      amountCents: String(amountCents),
      holdExpiresAt,
      appointmentStatus: "pending_payment",
      paymentChoice: ""
    };

    const customer = await stripe.customers.create({
      name: customerName,
      phone: normalizeSmsPhone(phone) || undefined,
      metadata: {
        bookingId,
        paymentType: "appointment-test"
      }
    });

    const baseUrl = getRequestBaseUrl(req);

    const session = await stripe.checkout.sessions.create({
      mode: "setup",
      customer: customer.id,
      payment_method_types: ["card"],
      metadata,
      setup_intent_data: { metadata },
      custom_text: {
        submit: {
          message: `No charge yet. After your card is saved, choose PAY NOW or PAY AT STORE. Cancellations within ${lateCancellationHours} hours are subject to a ${lateCancellationPercent}% fee.`
        }
      },
      success_url: `${baseUrl}/appointment-payment-choice?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/appointment-payment-cancelled?session_id={CHECKOUT_SESSION_ID}`
    });

    return res.json({
      success: true,
      url: session.url,
      sessionId: session.id,
      holdExpiresAt,
      manageUrl: getAppointmentManageUrl(req, session.id)
    });
  } catch (error) {
    console.error("Appointment card setup error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "The secure card setup could not be created."
    });
  }
});

app.get("/appointment-card-setup-status", async (req, res) => {
  try {
    const stripe = getStripeTestClient();
    const sessionId = cleanAppointmentValue(req.query.session_id, 200);

    if (!sessionId || !sessionId.startsWith("cs_test_")) {
      return res.status(400).json({ success: false, error: "Invalid test setup session." });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["setup_intent"]
    });
    const metadata = getAppointmentMetadata(session);
    const confirmed = metadata.appointmentStatus === "confirmed";

    return res.json({
      success: true,
      setupComplete: session.status === "complete",
      confirmed,
      expired: !confirmed && appointmentHoldExpired(metadata),
      paymentChoice: metadata.paymentChoice || "",
      paymentIntentId: metadata.paymentIntentId || "",
      smsSent: Boolean(metadata.smsSentAt),
      confirmedAt: metadata.confirmedAt || "",
      manageUrl: getAppointmentManageUrl(req, session.id)
    });
  } catch (error) {
    console.error("Appointment setup status error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "The appointment payment status could not be checked."
    });
  }
});

app.get("/appointment-payment-choice", async (req, res) => {
  const sessionId = cleanAppointmentValue(req.query.session_id, 200);

  try {
    const stripe = getStripeTestClient();
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["setup_intent"]
    });
    const metadata = getAppointmentMetadata(session);

    if (metadata.appointmentStatus === "confirmed") {
      return sendPage(
        res,
        "Appointment Confirmed | Business Pro",
        `<h1>Appointment Confirmed ✓</h1><p>Your payment choice has already been saved.</p><p><a href="${escapeHtml(getAppointmentManageUrl(req, session.id))}">Cancel or reschedule this appointment</a></p>`
      );
    }

    if (session.status !== "complete") {
      return sendPage(
        res,
        "Card Setup Incomplete | Business Pro",
        `<h1>Card Setup Incomplete</h1><p>Your appointment has not been confirmed.</p>`
      );
    }

    if (appointmentHoldExpired(metadata)) {
      return sendPage(
        res,
        "Appointment Hold Expired | Business Pro",
        `<h1>3-Minute Hold Expired</h1><p>Your appointment was not confirmed and the time has been released.</p>`
      );
    }

    sendPage(
      res,
      "Choose Payment | Business Pro",
      `
        <h1>Choose How to Pay</h1>
        <div class="notice">
          <p><strong>${escapeHtml(metadata.serviceName || "Appointment")}</strong> with ${escapeHtml(metadata.barberName || "Barber")}</p>
          <p>${escapeHtml(metadata.appointmentDateDisplay || metadata.appointmentDate || "")} at <strong>${escapeHtml(metadata.appointmentTimeDisplay || formatServerTime12(metadata.appointmentTime || ""))}</strong></p>
          <p>Service total: <strong>${moneyFromCents(metadata.amountCents)}</strong></p>
        </div>
        <div class="notice">
          <strong>Cancellation Policy</strong>
          <p>Cancel more than ${escapeHtml(metadata.lateCancellationHours || "24")} hours before your appointment for a full refund. Cancellations made within ${escapeHtml(metadata.lateCancellationHours || "24")} hours are subject to a <strong>${escapeHtml(metadata.lateCancellationPercent || "20")}% cancellation fee</strong>.</p>
          <p>Your card is now securely saved for this appointment.</p>
        </div>
        <form method="post" action="/choose-appointment-payment">
          <input type="hidden" name="sessionId" value="${escapeHtml(session.id)}">
          <button type="submit" name="choice" value="pay-now">PAY NOW — ${moneyFromCents(metadata.amountCents)}</button>
          <button type="submit" name="choice" value="pay-at-store">PAY AT STORE</button>
        </form>
        <p class="small"><strong>TEST MODE:</strong> No real money moves.</p>
      `
    );
  } catch (error) {
    console.error("Payment choice page error:", error);
    sendPage(res, "Payment Choice Error | Business Pro", `<h1>Payment Choice Unavailable</h1><p>${escapeHtml(error.message || "The payment choice could not be loaded.")}</p>`);
  }
});

app.post("/choose-appointment-payment", async (req, res) => {
  const sessionId = cleanAppointmentValue(req.body.sessionId, 200);
  const choice = cleanAppointmentValue(req.body.choice, 40);

  try {
    const stripe = getStripeTestClient();
    let session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["setup_intent"]
    });
    let metadata = getAppointmentMetadata(session);

    if (metadata.appointmentStatus === "confirmed") {
      return sendPage(
        res,
        "Appointment Confirmed | Business Pro",
        `<h1>Appointment Confirmed ✓</h1><p>Your payment choice has already been saved.</p><p><a href="${escapeHtml(getAppointmentManageUrl(req, session.id))}">Cancel or reschedule this appointment</a></p>`
      );
    }

    if (session.status !== "complete") {
      throw new Error("Card setup has not been completed.");
    }

    if (appointmentHoldExpired(metadata)) {
      return sendPage(
        res,
        "Appointment Hold Expired | Business Pro",
        `<h1>3-Minute Hold Expired</h1><p>Your appointment was not confirmed and the time has been released.</p>`
      );
    }

    if (!['pay-now', 'pay-at-store'].includes(choice)) {
      throw new Error("Please choose PAY NOW or PAY AT STORE.");
    }

    const paymentMethod = await getSetupPaymentMethod(session);
    const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;

    if (!paymentMethod || !customerId) {
      throw new Error("The saved card could not be found.");
    }

    let paymentIntentId = "";

    if (choice === "pay-now") {
      const amountCents = Number(metadata.amountCents || 0);
      const paymentIntent = await stripe.paymentIntents.create(
        {
          amount: amountCents,
          currency: "usd",
          customer: customerId,
          payment_method: paymentMethod,
          confirm: true,
          off_session: true,
          description: `${metadata.shopName || "Barber Shop"} — ${metadata.serviceName || "Appointment"}`,
          metadata: {
            ...metadata,
            paymentType: "appointment-pay-now-test",
            setupSessionId: session.id
          }
        },
        { idempotencyKey: `bp-pay-now-${session.id}` }
      );

      paymentIntentId = paymentIntent.id;
    }

    const confirmedAt = new Date().toISOString();

    await updateAppointmentMetadata(stripe, session, {
      appointmentStatus: "confirmed",
      paymentChoice: choice,
      paymentIntentId,
      confirmedAt
    });

    session = await stripe.checkout.sessions.retrieve(session.id, {
      expand: ["setup_intent"]
    });
    metadata = getAppointmentMetadata(session);

    let smsResult = { sent: false, skipped: metadata.smsConsent !== "yes" };
    let smsError = "";

    try {
      smsResult = await sendAppointmentConfirmationFromSession(req, session);
      session = await stripe.checkout.sessions.retrieve(session.id, { expand: ["setup_intent"] });
      metadata = getAppointmentMetadata(session);
    } catch (error) {
      smsError = error.message || "The confirmation text could not be sent.";
      console.error("Appointment confirmation SMS after payment choice failed:", error);
      await updateAppointmentMetadata(stripe, session, {
        smsError: smsError.slice(0, 450)
      });
    }

    sendPage(
      res,
      "Appointment Confirmed | Business Pro",
      `
        <h1>Appointment Confirmed ✓</h1>
        <div class="notice">
          <p><strong>${escapeHtml(metadata.serviceName || "Appointment")}</strong> with ${escapeHtml(metadata.barberName || "Barber")}</p>
          <p>${escapeHtml(metadata.appointmentDateDisplay || metadata.appointmentDate || "")} at <strong>${escapeHtml(metadata.appointmentTimeDisplay || formatServerTime12(metadata.appointmentTime || ""))}</strong></p>
          <p>Payment: <strong>${choice === "pay-now" ? `Paid now — ${moneyFromCents(metadata.amountCents)}` : "Pay at store — card on file"}</strong></p>
        </div>
        <p>${metadata.smsConsent !== "yes" ? "SMS notifications were not selected." : smsResult.sent ? "✓ Confirmation text sent to the phone number entered." : `Appointment confirmed, but the text could not be sent: ${escapeHtml(smsError)}`}</p>
        <p><a href="${escapeHtml(getAppointmentManageUrl(req, session.id))}">Cancel or reschedule this appointment</a></p>
        <p class="small"><strong>TEST MODE:</strong> No real money moves.</p>
      `
    );
  } catch (error) {
    console.error("Payment choice error:", error);
    sendPage(res, "Payment Error | Business Pro", `<h1>Payment Could Not Be Completed</h1><p>${escapeHtml(error.message || "The payment choice failed.")}</p>`);
  }
});

app.get("/appointment-payment-cancelled", (req, res) => {
  sendPage(
    res,
    "Card Setup Cancelled | Business Pro",
    `<h1>Card Setup Not Completed</h1><p>Your appointment has not been confirmed. The 3-minute hold will release automatically.</p><p><strong>TEST MODE:</strong> No real money was charged.</p>`
  );
});

app.get("/manage-test-appointment", async (req, res) => {
  const sessionId = cleanAppointmentValue(req.query.session_id, 200);

  try {
    const stripe = getStripeTestClient();
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["setup_intent"]
    });
    const metadata = getAppointmentMetadata(session);
    const lateHours = Math.max(1, Number(metadata.lateCancellationHours) || 24);
    const latePercent = Math.min(100, Math.max(0, Number(metadata.lateCancellationPercent) || 20));
    const paymentChoice = metadata.paymentChoice || "";
    const rescheduleBase = "https://villagebarber.businessprolocal.com/";
    const rescheduleUrl = `${rescheduleBase}?reschedule=${encodeURIComponent(metadata.bookingId || "")}&setupSession=${encodeURIComponent(session.id)}`;

    sendPage(
      res,
      "Manage Appointment | Business Pro",
      `
        <h1>Manage Your Appointment</h1>
        <div class="notice">
          <p><strong>${escapeHtml(metadata.serviceName || "Appointment")}</strong> with ${escapeHtml(metadata.barberName || "Barber")}</p>
          <p>${escapeHtml(metadata.appointmentDateDisplay || metadata.appointmentDate || "")} at <strong>${escapeHtml(metadata.appointmentTimeDisplay || formatServerTime12(metadata.appointmentTime || ""))}</strong></p>
          <p>Payment: <strong>${paymentChoice === "pay-now" ? `Paid ${moneyFromCents(metadata.amountCents)}` : "Pay at store — card on file"}</strong></p>
        </div>
        <div class="notice">
          <strong>Cancellation Policy</strong>
          <p>Cancel more than ${lateHours} hours before your appointment for a full refund. Cancellations made within ${lateHours} hours are subject to a <strong>${latePercent}% cancellation fee</strong>.</p>
        </div>
        <p><a href="${escapeHtml(rescheduleUrl)}">RESCHEDULE APPOINTMENT</a></p>
        <form method="post" action="/cancel-test-appointment">
          <input type="hidden" name="sessionId" value="${escapeHtml(session.id)}">
          <button type="submit">CANCEL APPOINTMENT</button>
        </form>
        <p class="small"><strong>TEST MODE:</strong> Payments, card holds, charges, and refunds use Stripe test mode.</p>
      `
    );
  } catch (error) {
    console.error("Manage appointment error:", error);
    sendPage(res, "Manage Appointment | Business Pro", `<h1>Appointment Not Found</h1><p>${escapeHtml(error.message || "The appointment could not be loaded.")}</p>`);
  }
});

app.post("/cancel-test-appointment", async (req, res) => {
  const sessionId = cleanAppointmentValue(req.body.sessionId, 200);

  try {
    const stripe = getStripeTestClient();
    let session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["setup_intent"]
    });
    let metadata = getAppointmentMetadata(session);

    if (metadata.appointmentStatus === "canceled") {
      return sendPage(res, "Appointment Cancelled | Business Pro", `<h1>Appointment Already Cancelled</h1><p>No additional charge or refund was processed.</p>`);
    }

    const latePercent = Math.min(100, Math.max(0, Number(metadata.lateCancellationPercent) || 20));
    const feeApplies = appointmentHoursRemaining(metadata) <= (Number(metadata.lateCancellationHours) || 24);
    const totalCents = Number(metadata.amountCents || 0);
    const feeCents = feeApplies ? Math.round(totalCents * latePercent / 100) : 0;
    const paymentChoice = metadata.paymentChoice || "";
    let refundCents = 0;
    let cancellationChargeCents = 0;

    if (paymentChoice === "pay-now") {
      const paymentIntentId = metadata.paymentIntentId;
      if (!paymentIntentId) throw new Error("The original appointment payment could not be found.");

      refundCents = Math.max(0, totalCents - feeCents);
      if (refundCents > 0) {
        await stripe.refunds.create(
          {
            payment_intent: paymentIntentId,
            amount: refundCents,
            metadata: {
              bookingId: metadata.bookingId || "",
              paymentType: "appointment-cancellation-refund-test"
            }
          },
          { idempotencyKey: `bp-cancel-refund-${session.id}-${refundCents}` }
        );
      }
    } else if (paymentChoice === "pay-at-store" && feeCents > 0) {
      const paymentMethod = await getSetupPaymentMethod(session);
      const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;
      if (!paymentMethod || !customerId) throw new Error("The saved card could not be found for the cancellation fee.");

      const feePayment = await stripe.paymentIntents.create(
        {
          amount: feeCents,
          currency: "usd",
          customer: customerId,
          payment_method: paymentMethod,
          confirm: true,
          off_session: true,
          description: `${metadata.shopName || "Barber Shop"} late cancellation fee`,
          metadata: {
            bookingId: metadata.bookingId || "",
            paymentType: "appointment-cancellation-fee-test",
            setupSessionId: session.id
          }
        },
        { idempotencyKey: `bp-cancel-fee-${session.id}-${feeCents}` }
      );

      cancellationChargeCents = Number(feePayment.amount_received || feeCents);
    }

    const canceledAt = new Date().toISOString();
    await updateAppointmentMetadata(stripe, session, {
      appointmentStatus: "canceled",
      canceledAt,
      cancellationFeeCents: String(feeCents),
      refundCents: String(refundCents),
      cancellationChargeCents: String(cancellationChargeCents)
    });

    if (metadata.smsConsent === "yes") {
      try {
        const date = metadata.appointmentDateDisplay || metadata.appointmentDate || "";
        const time = metadata.appointmentTimeDisplay || formatServerTime12(metadata.appointmentTime || "");
        const message =
          `${metadata.shopName || "Barber Shop"}: Your appointment on ${date} at ${time} has been canceled.` +
          `${feeCents ? ` Cancellation fee: ${moneyFromCents(feeCents)}.` : ""}` +
          `${refundCents ? ` Refund: ${moneyFromCents(refundCents)}.` : ""}` +
          ` Reply STOP to opt out.`;
        await sendTwilioMessage(metadata.phone, message);
      } catch (smsError) {
        console.error("Cancellation confirmation SMS failed:", smsError);
      }
    }

    sendPage(
      res,
      "Appointment Cancelled | Business Pro",
      `
        <h1>Appointment Cancelled</h1>
        <div class="notice">
          <p>${escapeHtml(metadata.serviceName || "Appointment")} with ${escapeHtml(metadata.barberName || "Barber")}</p>
          <p>${escapeHtml(metadata.appointmentDateDisplay || metadata.appointmentDate || "")} at ${escapeHtml(metadata.appointmentTimeDisplay || formatServerTime12(metadata.appointmentTime || ""))}</p>
          <p>Cancellation fee: <strong>${moneyFromCents(feeCents)}</strong></p>
          ${paymentChoice === "pay-now" ? `<p>Refund: <strong>${moneyFromCents(refundCents)}</strong></p>` : `<p>Charged to card now: <strong>${moneyFromCents(cancellationChargeCents)}</strong></p>`}
        </div>
        <p><strong>TEST MODE:</strong> No real money moves.</p>
      `
    );
  } catch (error) {
    console.error("Cancel appointment error:", error);
    sendPage(res, "Cancellation Error | Business Pro", `<h1>Cancellation Could Not Be Completed</h1><p>${escapeHtml(error.message || "The test cancellation failed.")}</p>`);
  }
});


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
