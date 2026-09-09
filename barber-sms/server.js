// TEST 2 — card first, then PAY NOW or PAY AT STORE, with manage links
const express = require("express");
const Stripe = require("stripe");
const crypto = require("crypto");

const app = express();


// ============================================================
// TABLET / MOBILE CHECKOUT LAUNCH HANDOFF
// ============================================================

const appointmentCheckoutLaunches =
  new Map();

function rememberAppointmentCheckoutLaunch(
  bookingId,
  session
) {

  appointmentCheckoutLaunches.set(
    bookingId,
    {
      sessionId: session.id,
      url: session.url,
      expiresAt:
        Date.now() +
        (5 * 60 * 1000)
    }
  );

}

function getAppointmentCheckoutLaunch(
  bookingId
) {

  const launch =
    appointmentCheckoutLaunches.get(
      bookingId
    );

  if (!launch) {
    return null;
  }

  if (
    !launch.expiresAt ||
    launch.expiresAt < Date.now()
  ) {
    appointmentCheckoutLaunches.delete(
      bookingId
    );
    return null;
  }

  return launch;

}


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
// BUSINESS OPEN / CLOSED STATUS
// ============================================================

let businessStatus = {
  isOpen: true,
  changedAt: "",
  changedBy: "Owner"
};

app.get("/business-status", (req, res) => {
  res.json({
    success: true,
    ...businessStatus
  });
});

app.post("/business-status", (req, res) => {
  const isOpen = req.body?.isOpen;

  if (typeof isOpen !== "boolean") {
    return res.status(400).json({
      success: false,
      error: "isOpen must be true or false."
    });
  }

  businessStatus = {
    isOpen,
    changedAt: new Date().toISOString(),
    changedBy: "Owner"
  };

  res.json({
    success: true,
    ...businessStatus
  });
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
// APPOINTMENT PAYMENT + NOTIFICATIONS
// ============================================================

function normalizePhone(phone) {

  let digits =
    String(phone || "")
      .replace(/\D/g, "");

  if (digits.length === 10) {
    digits = "1" + digits;
  }

  return digits;

}


function cleanAppointmentValue(
  value,
  maxLength = 300
) {

  return String(value || "")
    .trim()
    .slice(0, maxLength);

}


function getStripeTestClient() {

  const key =
    process.env.STRIPE_TEST_SECRET_KEY ||
    process.env.STRIPE_SECRET_KEY ||
    "";

  if (
    !key ||
    !key.startsWith("sk_test_")
  ) {

    throw new Error(
      "Stripe appointment testing requires a Stripe test secret key."
    );

  }

  return new Stripe(key);

}


function getRequestBaseUrl(req) {

  const configured =
    String(
      process.env.PUBLIC_BASE_URL ||
      ""
    ).trim();

  if (configured) {
    return configured.replace(/\/$/, "");
  }

  const forwardedProto =
    String(
      req.headers["x-forwarded-proto"] ||
      ""
    )
      .split(",")[0]
      .trim();

  const protocol =
    forwardedProto ||
    req.protocol ||
    "https";

  return `${protocol}://${req.get("host")}`;

}


async function sendTwilioMessage(
  phone,
  messageBody
) {

  const {
    TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN,
    TWILIO_MESSAGING_SERVICE_SID,
    TWILIO_PHONE_NUMBER,
    TWILIO_FROM_NUMBER
  } = process.env;

  if (
    !TWILIO_ACCOUNT_SID ||
    !TWILIO_AUTH_TOKEN
  ) {
    throw new Error(
      "Twilio SMS configuration is incomplete."
    );
  }

  const requestedPhone =
    normalizePhone(phone);

  if (!requestedPhone) {
    throw new Error(
      "A valid customer phone number is required."
    );
  }

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
    `+${requestedPhone}`
  );

  formData.append(
    "Body",
    messageBody
  );

  if (TWILIO_MESSAGING_SERVICE_SID) {

    formData.append(
      "MessagingServiceSid",
      TWILIO_MESSAGING_SERVICE_SID
    );

  } else {

    const senderNumber =
      TWILIO_PHONE_NUMBER ||
      TWILIO_FROM_NUMBER;

    if (!senderNumber) {
      throw new Error(
        "A Twilio sender number or Messaging Service SID has not been configured."
      );
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

    throw new Error(
      result.message ||
      "Twilio rejected the SMS request."
    );

  }

  return result;

}


async function sendAppointmentEmail(
  appointment,
  sessionId,
  manageUrl
) {

  const {
    RESEND_API_KEY,
    APPOINTMENT_NOTIFICATION_EMAIL,
    OWNER_NOTIFICATION_EMAIL,
    BARBER_NOTIFICATION_EMAIL,
    BUSINESS_PRO_NOTIFICATION_EMAIL,
    SIGNUP_NOTIFICATION_EMAIL,
    RESEND_TO_EMAIL,
    RESEND_FROM_EMAIL
  } = process.env;

  const destination =
    APPOINTMENT_NOTIFICATION_EMAIL ||
    OWNER_NOTIFICATION_EMAIL ||
    BARBER_NOTIFICATION_EMAIL ||
    BUSINESS_PRO_NOTIFICATION_EMAIL ||
    SIGNUP_NOTIFICATION_EMAIL ||
    RESEND_TO_EMAIL ||
    "";

  if (
    !RESEND_API_KEY ||
    !destination
  ) {
    throw new Error(
      "Appointment email configuration is incomplete."
    );
  }

  const paymentLine =
    appointment.paymentChoice === "pay_at_store"
      ? "Payment: Pay at store"
      : `Payment received: $${(
          Number(appointment.amountPaidCents || 0) /
          100
        ).toFixed(2)}`;

  const lines = [
    `Shop: ${appointment.shopName}`,
    `Customer: ${appointment.customerName}`,
    `Phone: ${appointment.phone}`,
    `Barber: ${appointment.barberName}`,
    `Service: ${appointment.serviceName}`,
    `Date: ${appointment.appointmentDate}`,
    `Time: ${appointment.appointmentTime}`,
    paymentLine,
    `Manage appointment: ${manageUrl}`,
    `Stripe test session: ${sessionId}`
  ];

  const resendResponse =
    await fetch(
      "https://api.resend.com/emails",
      {
        method: "POST",
        headers: {
          Authorization:
            `Bearer ${RESEND_API_KEY}`,
          "Content-Type":
            "application/json",
          "Idempotency-Key":
            `appointment-email/${sessionId}`
        },
        body:
          JSON.stringify({
            from:
              RESEND_FROM_EMAIL ||
              "Business Pro Local <onboarding@resend.dev>",
            to: [destination],
            subject:
              `Appointment — ${appointment.customerName} with ${appointment.barberName}`,
            text:
              lines.join("\n")
          })
      }
    );

  const result =
    await resendResponse.json();

  if (!resendResponse.ok) {

    console.error(
      "Resend appointment email error:",
      result
    );

    throw new Error(
      result.message ||
      "Resend rejected the appointment email."
    );

  }

  return result;

}


async function sendAppointmentCancellationEmail(
  appointment,
  sessionId,
  reason
) {

  const {
    RESEND_API_KEY,
    APPOINTMENT_NOTIFICATION_EMAIL,
    OWNER_NOTIFICATION_EMAIL,
    BARBER_NOTIFICATION_EMAIL,
    BUSINESS_PRO_NOTIFICATION_EMAIL,
    SIGNUP_NOTIFICATION_EMAIL,
    RESEND_TO_EMAIL,
    RESEND_FROM_EMAIL
  } = process.env;

  const destination =
    APPOINTMENT_NOTIFICATION_EMAIL ||
    OWNER_NOTIFICATION_EMAIL ||
    BARBER_NOTIFICATION_EMAIL ||
    BUSINESS_PRO_NOTIFICATION_EMAIL ||
    SIGNUP_NOTIFICATION_EMAIL ||
    RESEND_TO_EMAIL ||
    "";

  if (!RESEND_API_KEY || !destination) {
    throw new Error(
      "Appointment email configuration is incomplete."
    );
  }

  const lines = [
    `Shop: ${appointment.shopName}`,
    `Customer: ${appointment.customerName}`,
    `Phone: ${appointment.phone}`,
    `Barber: ${appointment.barberName}`,
    `Service: ${appointment.serviceName}`,
    `Date: ${appointment.appointmentDate}`,
    `Time: ${appointment.appointmentTime}`,
    `Status: ${reason}`,
    `Stripe test session: ${sessionId}`
  ];

  const resendResponse = await fetch(
    "https://api.resend.com/emails",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `appointment-cancel/${sessionId}/${reason.replace(/\s+/g, "-").toLowerCase()}`
      },
      body: JSON.stringify({
        from:
          RESEND_FROM_EMAIL ||
          "Business Pro Local <onboarding@resend.dev>",
        to: [destination],
        subject:
          `${reason} — ${appointment.customerName} with ${appointment.barberName}`,
        text: lines.join("\n")
      })
    }
  );

  const result = await resendResponse.json();

  if (!resendResponse.ok) {
    console.error(
      "Resend cancellation email error:",
      result
    );
    throw new Error(
      result.message ||
      "Resend rejected the cancellation email."
    );
  }

  return result;

}


function appointmentFromSession(session) {

  const metadata =
    session.metadata || {};

  return {
    shopName:
      metadata.shopName ||
      "Barber Shop",
    barberName:
      metadata.barberName ||
      "Barber",
    serviceName:
      metadata.serviceName ||
      "Appointment",
    customerName:
      metadata.customerName ||
      "Customer",
    phone:
      metadata.phone ||
      "",
    appointmentDate:
      metadata.appointmentDate ||
      "",
    appointmentTime:
      metadata.appointmentTime ||
      "",
    appointmentTime24:
      metadata.appointmentTime24 ||
      "",
    smsConsent:
      metadata.smsConsent === "yes",
    paymentChoice:
      metadata.paymentChoice || "",
    amountCents:
      Number(metadata.amountCents || 0),
    amountPaidCents:
      Number(metadata.amountPaidCents || 0)
  };

}


function getAppointmentManageSecret() {

  return String(
    process.env.APPOINTMENT_MANAGE_SECRET ||
    process.env.STRIPE_TEST_SECRET_KEY ||
    process.env.STRIPE_SECRET_KEY ||
    ""
  );

}


function createAppointmentManageToken(
  sessionId
) {

  const secret =
    getAppointmentManageSecret();

  if (!secret) {
    throw new Error(
      "Appointment management secret is not configured."
    );
  }

  return crypto
    .createHmac("sha256", secret)
    .update(String(sessionId || ""))
    .digest("hex");

}


function appointmentManageTokenIsValid(
  sessionId,
  token
) {

  try {

    const expected =
      Buffer.from(
        createAppointmentManageToken(
          sessionId
        ),
        "utf8"
      );

    const actual =
      Buffer.from(
        String(token || ""),
        "utf8"
      );

    return (
      expected.length === actual.length &&
      crypto.timingSafeEqual(
        expected,
        actual
      )
    );

  } catch {
    return false;
  }

}


function getAppointmentManageUrl(
  req,
  sessionId
) {

  const baseUrl =
    getRequestBaseUrl(req);

  const token =
    createAppointmentManageToken(
      sessionId
    );

  return (
    `${baseUrl}/manage-appointment` +
    `?session_id=${encodeURIComponent(sessionId)}` +
    `&token=${encodeURIComponent(token)}`
  );

}


async function getCompletedSetupSession(
  stripe,
  sessionId
) {

  if (
    !sessionId ||
    !String(sessionId).startsWith("cs_test_")
  ) {
    throw new Error(
      "Invalid test checkout session."
    );
  }

  const session =
    await stripe.checkout.sessions.retrieve(
      sessionId,
      {
        expand: [
          "setup_intent"
        ]
      }
    );

  if (
    session.mode !== "setup" ||
    session.status !== "complete"
  ) {
    throw new Error(
      "Card setup is not complete yet."
    );
  }

  const setupIntent =
    session.setup_intent;

  if (
    !setupIntent ||
    setupIntent.status !== "succeeded" ||
    !setupIntent.payment_method
  ) {
    throw new Error(
      "The saved card is not ready yet."
    );
  }

  return session;

}


async function sendFinalizedAppointmentNotifications(
  req,
  stripe,
  session
) {

  const metadata =
    session.metadata || {};

  if (
    metadata.appointmentStatus !==
    "confirmed"
  ) {
    return {
      smsRequested: false,
      smsSent: false,
      emailSent: false,
      smsError: "",
      emailError: ""
    };
  }

  const appointment =
    appointmentFromSession(session);

  const manageUrl =
    getAppointmentManageUrl(
      req,
      session.id
    );

  let smsSent =
    metadata.appointmentSmsSent ===
    "yes";

  let emailSent =
    metadata.appointmentEmailSent ===
    "yes";

  let smsError = "";
  let emailError = "";

  if (
    appointment.smsConsent &&
    !smsSent
  ) {

    try {

      const paymentText =
        appointment.paymentChoice ===
        "pay_at_store"
          ? "Pay at store."
          : "Payment received.";

      const messageBody =
        `${appointment.shopName}: Your appointment with ${appointment.barberName} is confirmed for ${appointment.appointmentDate} at ${appointment.appointmentTime}. ${paymentText} Cancel or reschedule: ${manageUrl} Reply STOP to opt out.`;

      await sendTwilioMessage(
        appointment.phone,
        messageBody
      );

      smsSent = true;

    } catch (error) {

      smsError =
        error.message ||
        "The confirmation text could not be sent.";

      console.error(
        "Appointment SMS error:",
        error
      );

    }

  }

  if (!emailSent) {

    try {

      await sendAppointmentEmail(
        appointment,
        session.id,
        manageUrl
      );

      emailSent = true;

    } catch (error) {

      emailError =
        error.message ||
        "The owner/barber email could not be sent.";

      console.error(
        "Appointment email error:",
        error
      );

    }

  }

  await stripe.checkout.sessions.update(
    session.id,
    {
      metadata: {
        ...metadata,
        appointmentSmsSent:
          smsSent ? "yes" : "no",
        appointmentEmailSent:
          emailSent ? "yes" : "no",
        appointmentNotificationsCheckedAt:
          new Date().toISOString()
      }
    }
  );

  return {
    smsRequested:
      appointment.smsConsent,
    smsSent,
    emailSent,
    smsError,
    emailError,
    manageUrl
  };

}


app.post(
  "/send-confirmation",
  async (req, res) => {

    try {

      const appointmentDate =
        cleanAppointmentValue(
          req.body.date ||
          req.body.appointmentDate ||
          "[date]",
          60
        );

      const appointmentTime =
        cleanAppointmentValue(
          req.body.time ||
          req.body.appointmentTime ||
          "[time]",
          60
        );

      const shopName =
        cleanAppointmentValue(
          req.body.shopName ||
          "The Village Barber",
          160
        ) ||
        "The Village Barber";

      const barberName =
        cleanAppointmentValue(
          req.body.barber ||
          req.body.barberName ||
          "",
          160
        );

      const phone =
        cleanAppointmentValue(
          req.body.phone,
          50
        );

      const messageBody =
        `${shopName}: Your appointment${barberName ? ` with ${barberName}` : ""} is confirmed for ${appointmentDate} at ${appointmentTime}. Reply STOP to opt out.`;

      const result =
        await sendTwilioMessage(
          phone,
          messageBody
        );

      return res.json({
        success: true,
        messageSid: result.sid
      });

    } catch (error) {

      console.error(
        "SMS confirmation error:",
        error
      );

      return res.status(500).json({
        success: false,
        error:
          error.message ||
          "The confirmation text could not be sent."
      });

    }

  }
);


app.get(
  "/appointment-launch",
  (req, res) => {

    const bookingId =
      cleanAppointmentValue(
        req.query.booking_id,
        120
      );

    if (!bookingId) {
      return sendPage(
        res,
        "Payment Unavailable | Business Pro",
        `
          <h1>Payment Could Not Be Opened</h1>
          <p>The appointment reference is missing.</p>
        `
      );
    }

    const safeBookingId =
      JSON.stringify(bookingId);

    sendPage(
      res,
      "Opening Secure Payment | Business Pro",
      `
        <style>
          body {
            max-width: none;
            min-height: 100vh;
            margin: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            background: #f8fafc;
          }

          .launch-card {
            width: min(90vw, 430px);
            padding: 34px 26px;
            background: #ffffff;
            border-radius: 20px;
            box-shadow: 0 18px 45px rgba(15, 23, 42, 0.14);
          }

          .launch-card h1 {
            margin: 0 0 12px;
            font-size: 24px;
          }

          .launch-card p {
            margin: 0;
            color: #475569;
          }
        </style>

        <div class="launch-card">
          <h1>Opening Secure Payment</h1>
          <p id="launch-message">Please wait a moment...</p>
        </div>

        <script>
          (() => {

            const bookingId =
              ${safeBookingId};

            const message =
              document.getElementById(
                "launch-message"
              );

            const startedAt =
              Date.now();

            async function checkLaunch() {

              try {

                const response =
                  await fetch(
                    "/appointment-launch-status?booking_id=" +
                    encodeURIComponent(bookingId),
                    { cache: "no-store" }
                  );

                const result =
                  await response.json();

                if (
                  response.ok &&
                  result.success &&
                  result.ready &&
                  result.url
                ) {
                  window.location.replace(
                    result.url
                  );
                  return;
                }

              } catch (error) {
                console.error(
                  "Appointment launch check error:",
                  error
                );
              }

              if (
                Date.now() - startedAt >
                30000
              ) {
                message.textContent =
                  "The secure payment page did not open. Return to the appointment page and try again.";
                return;
              }

              setTimeout(
                checkLaunch,
                400
              );

            }

            checkLaunch();

          })();
        </script>
      `
    );

  }
);


app.get(
  "/appointment-launch-status",
  (req, res) => {

    const bookingId =
      cleanAppointmentValue(
        req.query.booking_id,
        120
      );

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        ready: false,
        error:
          "The appointment reference is missing."
      });
    }

    const launch =
      getAppointmentCheckoutLaunch(
        bookingId
      );

    return res.json({
      success: true,
      ready: Boolean(launch),
      sessionId:
        launch?.sessionId || "",
      url:
        launch?.url || ""
    });

  }
);


app.post(
  "/create-appointment-checkout-session",
  async (req, res) => {

    try {

      const stripe =
        getStripeTestClient();

      const bookingId =
        cleanAppointmentValue(
          req.body.bookingId,
          120
        );

      const shopName =
        cleanAppointmentValue(
          req.body.shopName,
          160
        ) || "Barber Shop";

      const barberName =
        cleanAppointmentValue(
          req.body.barberName,
          160
        ) || "Barber";

      const serviceName =
        cleanAppointmentValue(
          req.body.serviceName,
          160
        ) || "Appointment";

      const customerName =
        cleanAppointmentValue(
          req.body.customerName,
          160
        ) || "Customer";

      const phone =
        cleanAppointmentValue(
          req.body.phone,
          50
        );

      const appointmentDate =
        cleanAppointmentValue(
          req.body.appointmentDate,
          60
        );

      const appointmentTime =
        cleanAppointmentValue(
          req.body.appointmentTime,
          60
        );

      const appointmentTime24 =
        cleanAppointmentValue(
          req.body.appointmentTime24,
          30
        );

      const smsConsent =
        req.body.smsConsent
          ? "yes"
          : "no";

      const servicePrice =
        Number(
          req.body.servicePrice ||
          0
        );

      const amountCents =
        Math.round(
          servicePrice * 100
        );

      if (
        !bookingId ||
        !phone ||
        !appointmentDate ||
        !appointmentTime
      ) {
        return res.status(400).json({
          success: false,
          error:
            "Appointment checkout is missing required booking information."
        });
      }

      if (
        !Number.isFinite(amountCents) ||
        amountCents < 50 ||
        amountCents > 100000
      ) {
        return res.status(400).json({
          success: false,
          error:
            "The appointment price is not valid for test checkout."
        });
      }

      const baseUrl =
        getRequestBaseUrl(req);

      const metadata = {
        paymentType:
          "appointment-card-choice-test",
        bookingId,
        shopName,
        barberName,
        serviceName,
        customerName,
        phone,
        appointmentDate,
        appointmentTime,
        appointmentTime24,
        smsConsent,
        amountCents:
          String(amountCents),
        appointmentStatus:
          "awaiting-payment-choice",
        paymentChoice:
          ""
      };

      const customer =
        await stripe.customers.create({
          name: customerName,
          phone,
          metadata: {
            bookingId,
            appointmentType:
              "Business Pro barber appointment test"
          }
        });

      const session =
        await stripe.checkout.sessions.create({
          mode: "setup",
          payment_method_types: [
            "card"
          ],
          customer:
            customer.id,
          client_reference_id:
            bookingId,
          metadata,
          setup_intent_data: {
            metadata
          },
          success_url:
            `${baseUrl}/appointment-payment-choice?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url:
            `${baseUrl}/appointment-payment-cancelled`
        });

      rememberAppointmentCheckoutLaunch(
        bookingId,
        session
      );

      return res.json({
        success: true,
        url: session.url,
        sessionId: session.id
      });

    } catch (error) {

      console.error(
        "Appointment Stripe card setup error:",
        error
      );

      return res.status(500).json({
        success: false,
        error:
          error.message ||
          "The secure card page could not be created."
      });

    }

  }
);


app.get(
  "/appointment-checkout-status",
  async (req, res) => {

    try {

      const stripe =
        getStripeTestClient();

      const sessionId =
        cleanAppointmentValue(
          req.query.session_id,
          200
        );

      if (
        !sessionId ||
        !sessionId.startsWith("cs_test_")
      ) {
        return res.status(400).json({
          success: false,
          error:
            "Invalid test checkout session."
        });
      }

      const session =
        await stripe.checkout.sessions.retrieve(
          sessionId
        );

      const metadata =
        session.metadata || {};

      const confirmed =
        metadata.appointmentStatus ===
        "confirmed";

      return res.json({
        success: true,
        status:
          session.status,
        confirmed,
        paid:
          confirmed &&
          metadata.paymentChoice ===
          "pay_now",
        paymentChoice:
          metadata.paymentChoice || "",
        amountTotal:
          Number(
            metadata.amountPaidCents ||
            0
          ),
        manageUrl:
          confirmed
            ? getAppointmentManageUrl(
                req,
                session.id
              )
            : ""
      });

    } catch (error) {

      console.error(
        "Appointment status error:",
        error
      );

      return res.status(500).json({
        success: false,
        error:
          error.message ||
          "The appointment status could not be checked."
      });

    }

  }
);


app.post(
  "/send-paid-appointment-notifications",
  async (req, res) => {

    try {

      const stripe =
        getStripeTestClient();

      const sessionId =
        cleanAppointmentValue(
          req.body.sessionId,
          200
        );

      if (
        !sessionId ||
        !sessionId.startsWith("cs_test_")
      ) {
        return res.status(400).json({
          success: false,
          error:
            "Invalid test checkout session."
        });
      }

      const session =
        await stripe.checkout.sessions.retrieve(
          sessionId
        );

      if (
        session.metadata?.appointmentStatus !==
        "confirmed"
      ) {
        return res.status(409).json({
          success: false,
          error:
            "The appointment has not been confirmed yet."
        });
      }

      const result =
        await sendFinalizedAppointmentNotifications(
          req,
          stripe,
          session
        );

      return res.json({
        success: true,
        ...result
      });

    } catch (error) {

      console.error(
        "Appointment notification error:",
        error
      );

      return res.status(500).json({
        success: false,
        error:
          error.message ||
          "Appointment notifications could not be processed."
      });

    }

  }
);


app.get(
  "/appointment-payment-choice",
  async (req, res) => {

    const sessionId =
      cleanAppointmentValue(
        req.query.session_id,
        200
      );

    try {

      const stripe =
        getStripeTestClient();

      const session =
        await getCompletedSetupSession(
          stripe,
          sessionId
        );

      const appointment =
        appointmentFromSession(session);

      if (
        session.metadata?.appointmentStatus ===
        "confirmed"
      ) {

        const manageUrl =
          getAppointmentManageUrl(
            req,
            session.id
          );

        return sendPage(
          res,
          "Appointment Confirmed | Business Pro",
          `
            <h1>Appointment Confirmed ✓</h1>
            <p>Your appointment is already confirmed.</p>
            <p><a href="${manageUrl}">Cancel or reschedule appointment</a></p>
            <p>Return to the appointment window.</p>
          `
        );

      }

      const amount =
        `$${(
          Number(appointment.amountCents || 0) /
          100
        ).toFixed(2)}`;

      sendPage(
        res,
        "Choose Payment | Business Pro",
        `
          <style>
            body {
              max-width: none;
              min-height: 100vh;
              margin: 0;
              padding: 20px;
              display: flex;
              align-items: center;
              justify-content: center;
              background: rgba(15, 23, 42, 0.72);
            }

            .payment-choice-card {
              width: min(92vw, 420px);
              padding: 34px 28px 30px;
              background: #ffffff;
              border-radius: 22px;
              box-shadow: 0 22px 60px rgba(0, 0, 0, 0.28);
              text-align: center;
            }

            .payment-choice-card h1 {
              margin: 0 0 26px;
              font-size: 26px;
              line-height: 1.15;
              font-weight: 700;
              color: #111827;
            }

            .payment-choice-card form {
              margin: 0;
            }

            .payment-choice-card form + form {
              margin-top: 14px;
            }

            .payment-choice-card button {
              width: 100%;
              min-height: 54px;
              margin: 0;
              padding: 14px 18px;
              border: 0;
              border-radius: 14px;
              font-size: 17px;
              font-weight: 700;
              letter-spacing: 0.01em;
              cursor: pointer;
              transition: transform 0.15s ease, box-shadow 0.15s ease;
            }

            .payment-choice-card button:hover {
              transform: translateY(-1px);
            }

            .payment-choice-card .pay-now {
              background: #111827;
              color: #ffffff;
              box-shadow: 0 8px 18px rgba(17, 24, 39, 0.18);
            }

            .payment-choice-card .pay-store {
              background: #f3f4f6;
              color: #111827;
              border: 1px solid #d1d5db;
            }

            @media (max-width: 480px) {
              body {
                padding: 16px;
              }

              .payment-choice-card {
                width: 100%;
                padding: 30px 20px 24px;
                border-radius: 20px;
              }

              .payment-choice-card h1 {
                font-size: 24px;
              }
            }
          </style>

          <div class="payment-choice-card">
            <h1>Choose Payment</h1>

            <form method="POST" action="/appointment-choice/pay-now">
              <input type="hidden" name="sessionId" value="${session.id}">
              <button class="pay-now" type="submit">PAY NOW</button>
            </form>

            <form method="POST" action="/appointment-choice/pay-at-store">
              <input type="hidden" name="sessionId" value="${session.id}">
              <button class="pay-store" type="submit">PAY AT STORE</button>
            </form>
          </div>
        `
      );

    } catch (error) {

      console.error(
        "Payment choice page error:",
        error
      );

      sendPage(
        res,
        "Payment Choice Unavailable | Business Pro",
        `
          <h1>Payment Choice Unavailable</h1>
          <p>${cleanAppointmentValue(error.message, 300)}</p>
        `
      );

    }

  }
);


app.post(
  "/appointment-choice/pay-now",
  async (req, res) => {

    const sessionId =
      cleanAppointmentValue(
        req.body.sessionId,
        200
      );

    try {

      const stripe =
        getStripeTestClient();

      let session =
        await getCompletedSetupSession(
          stripe,
          sessionId
        );

      const metadata =
        session.metadata || {};

      if (
        metadata.appointmentStatus ===
        "confirmed"
      ) {
        return res.redirect(
          `/appointment-payment-choice?session_id=${encodeURIComponent(session.id)}`
        );
      }

      const setupIntent =
        session.setup_intent;

      const amountCents =
        Number(
          metadata.amountCents ||
          0
        );

      if (
        !Number.isFinite(amountCents) ||
        amountCents < 50
      ) {
        throw new Error(
          "The appointment amount is invalid."
        );
      }

      const paymentIntent =
        await stripe.paymentIntents.create(
          {
            amount:
              amountCents,
            currency:
              "usd",
            customer:
              session.customer,
            payment_method:
              setupIntent.payment_method,
            confirm:
              true,
            off_session:
              true,
            description:
              `${metadata.shopName || "Barber Shop"} — ${metadata.serviceName || "Appointment"}`,
            metadata: {
              ...metadata,
              checkoutSessionId:
                session.id,
              paymentChoice:
                "pay_now"
            }
          },
          {
            idempotencyKey:
              `appointment-pay-now-${session.id}`
          }
        );

      if (
        paymentIntent.status !==
        "succeeded"
      ) {
        throw new Error(
          `Payment did not complete. Stripe status: ${paymentIntent.status}`
        );
      }

      const finalMetadata = {
        ...metadata,
        appointmentStatus:
          "confirmed",
        paymentChoice:
          "pay_now",
        paymentIntentId:
          paymentIntent.id,
        amountPaidCents:
          String(
            paymentIntent.amount_received ||
            amountCents
          ),
        confirmedAt:
          new Date().toISOString()
      };

      const notifications =
        await sendFinalizedAppointmentNotifications(
          req,
          stripe,
          {
            ...session,
            metadata:
              finalMetadata
          }
        );

            sendPage(
        res,
        "Appointment Confirmed | Business Pro",
        `
          <style>
            body {
              max-width: none;
              min-height: 100vh;
              margin: 0;
              padding: 20px;
              display: flex;
              align-items: center;
              justify-content: center;
              background: rgba(0, 0, 0, 0.88);
            }

            .business-pro-confirmed-card {
              width: min(92vw, 430px);
              padding: 36px 28px 30px;
              background: #0b0b0b;
              border: 2px solid #d4af37;
              border-radius: 22px;
              box-shadow: 0 22px 60px rgba(0, 0, 0, 0.5);
              text-align: center;
              color: #ffffff;
            }

            .success-check {
              width: 62px;
              height: 62px;
              margin: 0 auto 18px;
              display: flex;
              align-items: center;
              justify-content: center;
              border-radius: 50%;
              background: #22c55e;
              color: #ffffff;
              font-size: 34px;
              font-weight: 700;
            }

            .business-pro-confirmed-card h1 {
              margin: 0 0 12px;
              color: #d4af37;
              font-size: 28px;
            }

            .payment-label {
              margin: 0;
              font-size: 18px;
              color: #ffffff;
            }

            .confirmation-actions {
              display: grid;
              gap: 12px;
              margin-top: 28px;
            }

            .confirmation-actions a,
            .confirmation-actions button {
              width: 100%;
              min-height: 52px;
              margin: 0;
              padding: 14px 18px;
              border-radius: 13px;
              font-size: 16px;
              font-weight: 700;
              cursor: pointer;
            }

            .manage-appointment-button {
              display: flex;
              align-items: center;
              justify-content: center;
              background: #d4af37;
              color: #0b0b0b;
              text-decoration: none;
              border: 1px solid #d4af37;
            }

            .close-confirmation-button {
              background: #111111;
              color: #d4af37;
              border: 1px solid #d4af37;
            }
          </style>

          <div class="business-pro-confirmed-card">

            <div class="success-check">
              ✓
            </div>

            <h1>
              Appointment Confirmed
            </h1>

            <p class="payment-label">
              Paid Online
            </p>

            <div class="confirmation-actions">

              <a
                class="manage-appointment-button"
                href="${notifications.manageUrl}"
              >
                Cancel or Reschedule
              </a>

              <button
                class="close-confirmation-button"
                type="button"
                onclick="window.close()"
              >
                Close
              </button>

            </div>

          </div>
        `
      );

    } catch (error) {

      console.error(
        "Pay-now appointment error:",
        error
      );

      sendPage(
        res,
        "Payment Failed | Business Pro",
        `
          <h1>Payment Could Not Be Completed</h1>
          <p>${cleanAppointmentValue(error.message, 300)}</p>
          <p>Return to the appointment window and try again.</p>
        `
      );

    }

  }
);


app.post(
  "/appointment-choice/pay-at-store",
  async (req, res) => {

    const sessionId =
      cleanAppointmentValue(
        req.body.sessionId,
        200
      );

    try {

      const stripe =
        getStripeTestClient();

      let session =
        await getCompletedSetupSession(
          stripe,
          sessionId
        );

      const metadata =
        session.metadata || {};

      const finalMetadata = {
        ...metadata,
        appointmentStatus:
          "confirmed",
        paymentChoice:
          "pay_at_store",
        amountPaidCents:
          "0",
        confirmedAt:
          metadata.confirmedAt ||
          new Date().toISOString()
      };

      const notifications =
        await sendFinalizedAppointmentNotifications(
          req,
          stripe,
          {
            ...session,
            metadata:
              finalMetadata
          }
        );

           sendPage(
        res,
        "Appointment Confirmed | Business Pro",
        `
          <style>
            body {
              max-width: none;
              min-height: 100vh;
              margin: 0;
              padding: 20px;
              display: flex;
              align-items: center;
              justify-content: center;
              background: rgba(0, 0, 0, 0.88);
            }

            .business-pro-confirmed-card {
              width: min(92vw, 430px);
              padding: 36px 28px 30px;
              background: #0b0b0b;
              border: 2px solid #d4af37;
              border-radius: 22px;
              box-shadow: 0 22px 60px rgba(0, 0, 0, 0.5);
              text-align: center;
              color: #ffffff;
            }

            .success-check {
              width: 62px;
              height: 62px;
              margin: 0 auto 18px;
              display: flex;
              align-items: center;
              justify-content: center;
              border-radius: 50%;
              background: #22c55e;
              color: #ffffff;
              font-size: 34px;
              font-weight: 700;
            }

            .business-pro-confirmed-card h1 {
              margin: 0 0 12px;
              color: #d4af37;
              font-size: 28px;
            }

            .payment-label {
              margin: 0;
              font-size: 18px;
              color: #ffffff;
            }

            .confirmation-actions {
              display: grid;
              gap: 12px;
              margin-top: 28px;
            }

            .confirmation-actions a,
            .confirmation-actions button {
              width: 100%;
              min-height: 52px;
              margin: 0;
              padding: 14px 18px;
              border-radius: 13px;
              font-size: 16px;
              font-weight: 700;
              cursor: pointer;
            }

            .manage-appointment-button {
              display: flex;
              align-items: center;
              justify-content: center;
              background: #d4af37;
              color: #0b0b0b;
              text-decoration: none;
              border: 1px solid #d4af37;
            }

            .close-confirmation-button {
              background: #111111;
              color: #d4af37;
              border: 1px solid #d4af37;
            }
          </style>

          <div class="business-pro-confirmed-card">

            <div class="success-check">✓</div>

            <h1>Appointment Confirmed</h1>

            <p class="payment-label">
              Pay at Store
            </p>

            <div class="confirmation-actions">

              <a
                class="manage-appointment-button"
                href="${notifications.manageUrl}"
              >
                Cancel or Reschedule
              </a>

              <button
                class="close-confirmation-button"
                type="button"
                onclick="window.close()"
              >
                Close
              </button>

            </div>

          </div>
        `
      );

    } catch (error) {

      console.error(
        "Pay-at-store appointment error:",
        error
      );

      sendPage(
        res,
        "Appointment Could Not Be Confirmed | Business Pro",
        `
          <h1>Appointment Could Not Be Confirmed</h1>
          <p>${cleanAppointmentValue(error.message, 300)}</p>
          <p>Return to the appointment window and try again.</p>
        `
      );

    }

  }
);


app.get(
  "/manage-appointment",
  async (req, res) => {

    const sessionId =
      cleanAppointmentValue(
        req.query.session_id,
        200
      );

    const token =
      cleanAppointmentValue(
        req.query.token,
        200
      );

    if (
      !appointmentManageTokenIsValid(
        sessionId,
        token
      )
    ) {
      return res.status(403).send(
        "Invalid appointment management link."
      );
    }

    try {

      const stripe =
        getStripeTestClient();

      const session =
        await stripe.checkout.sessions.retrieve(
          sessionId
        );

      const appointment =
        appointmentFromSession(session);

      const status =
        session.metadata?.appointmentStatus ||
        "";

      if (status === "canceled") {
        return sendPage(
          res,
          "Appointment Cancelled | Business Pro",
          `
            <h1>Appointment Cancelled</h1>
            <p>This appointment has already been cancelled.</p>
          `
        );
      }

      sendPage(
        res,
        "Manage Appointment | Business Pro",
        `
          <h1>Manage Appointment</h1>
          <div class="notice">
            <p><strong>${appointment.customerName}</strong></p>
            <p>${appointment.serviceName} with ${appointment.barberName}</p>
            <p>${appointment.appointmentDate} at ${appointment.appointmentTime}</p>
          </div>

          <form method="POST" action="/appointment-manage/cancel">
            <input type="hidden" name="sessionId" value="${session.id}">
            <input type="hidden" name="token" value="${token}">
            <button type="submit">CANCEL APPOINTMENT</button>
          </form>

          <form method="POST" action="/appointment-manage/reschedule">
            <input type="hidden" name="sessionId" value="${session.id}">
            <input type="hidden" name="token" value="${token}">
            <button type="submit">RESCHEDULE APPOINTMENT</button>
          </form>

          <p class="small">This is the current test flow. Cancellation-fee/refund rules will be added separately.</p>
        `
      );

    } catch (error) {

      console.error(
        "Manage appointment page error:",
        error
      );

      res.status(500).send(
        "The appointment could not be loaded."
      );

    }

  }
);


app.post(
  "/appointment-manage/cancel",
  async (req, res) => {

    const sessionId =
      cleanAppointmentValue(
        req.body.sessionId,
        200
      );

    const token =
      cleanAppointmentValue(
        req.body.token,
        200
      );

    if (
      !appointmentManageTokenIsValid(
        sessionId,
        token
      )
    ) {
      return res.status(403).send(
        "Invalid appointment management link."
      );
    }

    try {

      const stripe =
        getStripeTestClient();

      let session =
        await stripe.checkout.sessions.retrieve(
          sessionId
        );

      const metadata =
        session.metadata || {};

      if (
        metadata.appointmentStatus ===
        "canceled"
      ) {
        return sendPage(
          res,
          "Appointment Cancelled | Business Pro",
          `
            <h1>Appointment Cancelled</h1>
            <p>This appointment has already been cancelled.</p>
          `
        );
      }

      await stripe.checkout.sessions.update(
        session.id,
        {
          metadata: {
            ...metadata,
            appointmentStatus:
              "canceled",
            cancellationSource:
              "Customer Cancellation",
            canceledAt:
              new Date().toISOString()
          }
        }
      );

      session =
        await stripe.checkout.sessions.retrieve(
          session.id
        );

      const appointment =
        appointmentFromSession(session);

      try {
        if (appointment.smsConsent) {
          await sendTwilioMessage(
            appointment.phone,
            `${appointment.shopName}: Your appointment with ${appointment.barberName} on ${appointment.appointmentDate} at ${appointment.appointmentTime} has been cancelled.`
          );
        }
      } catch (error) {
        console.error(
          "Cancellation SMS error:",
          error
        );
      }

      try {
        await sendAppointmentCancellationEmail(
          appointment,
          session.id,
          "Customer Cancellation"
        );
      } catch (error) {
        console.error(
          "Cancellation email error:",
          error
        );
      }

      sendPage(
        res,
        "Appointment Cancelled | Business Pro",
        `
          <h1>Appointment Cancelled ✓</h1>
          <p>Your appointment has been cancelled.</p>
          <p class="small">This test does not apply the final cancellation-fee/refund policy yet.</p>
        `
      );

    } catch (error) {

      console.error(
        "Customer cancellation error:",
        error
      );

      res.status(500).send(
        "The appointment could not be cancelled."
      );

    }

  }
);


app.post(
  "/appointment-manage/reschedule",
  async (req, res) => {

    const sessionId =
      cleanAppointmentValue(
        req.body.sessionId,
        200
      );

    const token =
      cleanAppointmentValue(
        req.body.token,
        200
      );

    if (
      !appointmentManageTokenIsValid(
        sessionId,
        token
      )
    ) {
      return res.status(403).send(
        "Invalid appointment management link."
      );
    }

    try {

      const stripe =
        getStripeTestClient();

      let session =
        await stripe.checkout.sessions.retrieve(
          sessionId
        );

      const metadata =
        session.metadata || {};

      await stripe.checkout.sessions.update(
        session.id,
        {
          metadata: {
            ...metadata,
            appointmentStatus:
              "reschedule-requested",
            rescheduleRequestedAt:
              new Date().toISOString()
          }
        }
      );

      session =
        await stripe.checkout.sessions.retrieve(
          session.id
        );

      const appointment =
        appointmentFromSession(session);

      try {
        await sendAppointmentCancellationEmail(
          appointment,
          session.id,
          "Customer Reschedule Request"
        );
      } catch (error) {
        console.error(
          "Reschedule email error:",
          error
        );
      }

      const bookingBaseUrl =
        String(
          process.env.CUSTOMER_BOOKING_URL ||
          ""
        ).trim();

      if (bookingBaseUrl) {

        const bookingUrl =
          new URL(bookingBaseUrl);

        bookingUrl.searchParams.set(
          "booking",
          "open"
        );

        bookingUrl.searchParams.set(
          "reschedule",
          "1"
        );

        return res.redirect(
          303,
          bookingUrl.toString()
        );

      }

      return sendPage(
        res,
        "Reschedule Appointment | Business Pro",
        `
          <style>
            body {
              max-width: none;
              min-height: 100vh;
              margin: 0;
              padding: 20px;
              display: flex;
              align-items: center;
              justify-content: center;
              text-align: center;
              background: #f8fafc;
            }

            .reschedule-card {
              width: min(92vw, 430px);
              padding: 38px 28px;
              background: #ffffff;
              border-radius: 22px;
              box-shadow: 0 22px 60px rgba(15, 23, 42, 0.16);
            }

            .reschedule-card h1 {
              margin: 0 0 12px;
              font-size: 28px;
              color: #111827;
            }

            .reschedule-card p {
              margin: 0;
              color: #4b5563;
            }
          </style>

          <div class="reschedule-card">
            <h1>Reschedule Appointment</h1>
            <p>Open the Barber Shop Customer Interface and choose your new appointment.</p>
          </div>
        `
      );

    } catch (error) {

      console.error(
        "Reschedule request error:",
        error
      );

      res.status(500).send(
        "The reschedule request could not be processed."
      );

    }

  }
);


app.get(
  "/appointment-payment-cancelled",
  (req, res) => {

    sendPage(
      res,
      "Card Setup Cancelled | Business Pro",
      `
        <h1>Appointment Not Confirmed</h1>
        <p>The secure card step was cancelled. No appointment was confirmed.</p>
        <p><strong>TEST MODE:</strong> No real money was charged.</p>
      `
    );

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
