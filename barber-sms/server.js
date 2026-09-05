const express = require("express");
const Stripe = require("stripe");

const app = express();


// ============================================================
// BUSINESS PRO LOCAL STRIPE PAYMENT WEBHOOK
// ============================================================

function formatBusinessProMoney(amountInCents) {

  return `$${(
    Number(amountInCents || 0) / 100
  ).toLocaleString(
    "en-US",
    {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }
  )}`;

}


function getStripeObjectId(value) {

  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  return value.id || "";

}


async function sendResendEmail({
  to,
  subject,
  text,
  idempotencyKey
}) {

  const {
    RESEND_API_KEY,
    RESEND_FROM_EMAIL
  } = process.env;


  if (!RESEND_API_KEY) {

    throw new Error(
      "RESEND_API_KEY is not configured."
    );

  }


  const fromAddress =
    RESEND_FROM_EMAIL ||
    "Business Pro Local <onboarding@resend.dev>";


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
            idempotencyKey

        },

        body:
          JSON.stringify({

            from:
              fromAddress,

            to: [
              to
            ],

            subject,

            text

          })

      }
    );


  const resendResult =
    await resendResponse.json();


  if (!resendResponse.ok) {

    console.error(
      "Resend email error:",
      resendResult
    );


    throw new Error(
      resendResult.message ||
      "Resend rejected the email."
    );

  }


  return resendResult;

}


async function saveBusinessProBillingProfile(
  stripe,
  session
) {

  const metadata =
    session.metadata || {};


  const customerId =
    getStripeObjectId(
      session.customer
    );


  if (!customerId) {
    return;
  }


  let paymentMethodId =
    "";


  const paymentIntentId =
    getStripeObjectId(
      session.payment_intent
    );


  if (paymentIntentId) {

    const paymentIntent =
      await stripe.paymentIntents.retrieve(
        paymentIntentId
      );


    paymentMethodId =
      getStripeObjectId(
        paymentIntent.payment_method
      );

  }


  const customerUpdate = {

    metadata: {

      businessProCustomer:
        "yes",

      businessProCheckoutSessionId:
        session.id,

      businessProPlanKey:
        metadata.planKey || "",

      businessProPlan:
        metadata.plan || "",

      businessProBusinessName:
        metadata.businessName || "",

      businessProOwnerName:
        metadata.ownerName || "",

      businessProAdvertising:
        metadata.advertising || "OFF",

      businessProSetupPaid:
        "yes"

    }

  };


  if (paymentMethodId) {

    customerUpdate.invoice_settings = {

      default_payment_method:
        paymentMethodId

    };

  }


  await stripe.customers.update(
    customerId,
    customerUpdate
  );

}


async function sendBusinessProSignupEmails(
  session,
  eventId
) {

  const {
    SIGNUP_NOTIFICATION_EMAIL
  } = process.env;


  if (!SIGNUP_NOTIFICATION_EMAIL) {

    throw new Error(
      "SIGNUP_NOTIFICATION_EMAIL is not configured."
    );

  }


  const metadata =
    session.metadata || {};


  const plan =
    BUSINESS_PRO_PLANS[
      metadata.planKey
    ];


  if (!plan) {

    throw new Error(
      "The completed checkout does not contain a valid Business Pro Local package."
    );

  }


  const setupPrice =
    formatBusinessProMoney(
      plan.setupAmount
    );


  const chargedToday =
    formatBusinessProMoney(
      session.amount_total ||
      plan.setupAmount
    );


  const monthlyPrice =
    `${formatBusinessProMoney(
      plan.monthlyAmount
    )}/month`;


  const advertisingOn =
    metadata.advertising === "ON";


  const adminLines = [

    "New Business Pro Local Signup",
    "",
    "Business: " +
      (metadata.businessName || ""),

    "Package: " +
      plan.name,

    "Setup Fee: " +
      setupPrice,

    "Charged Today: " +
      chargedToday,

    "Monthly Service After Launch: " +
      monthlyPrice,

    "Advertising: " +
      (advertisingOn ? "ON" : "OFF")

  ];


  if (advertisingOn) {

    adminLines.push(
      "Advertising Rate: " +
        plan.advertisingRate
    );

    adminLines.push(
      "Advertising Minimum: " +
        plan.advertisingMinimum
    );

  }


  adminLines.push(
    "",
    "Customer: " +
      (metadata.ownerName || ""),

    "Phone: " +
      (metadata.phone || ""),

    "Email: " +
      (metadata.email || ""),

    "Business Address: " +
      (metadata.businessAddress || ""),
        "Business Notes: " +
      (metadata.businessNotes || ""),

    "",
    "Stripe Customer: " +
      getStripeObjectId(
        session.customer
      ),

    "Checkout Session: " +
      session.id,

    "",
    "The customer's payment method was saved securely in Stripe for future monthly service billing after website launch."
  );


  const featureLines =
    plan.features.map(
      feature =>
        `• ${feature}`
    );


  const customerLines = [

    `Hello ${metadata.ownerName || "there"},`,
    "",
    "Thank you for choosing Business Pro Local. Your setup payment was completed successfully.",
    "",
    `Business: ${metadata.businessName || ""}`,
    `Package: ${plan.name}`,
    "",
    `Your ${plan.name} package includes:`,
    ...featureLines,
    "",
    "Advertising Network: " +
      (advertisingOn ? "ON" : "OFF")

  ];


  if (advertisingOn) {

    customerLines.push(
      `Advertising Rate: ${plan.advertisingRate}`,
      `Advertising Minimum: ${plan.advertisingMinimum}`
    );

  }


  customerLines.push(
    "",
    "PAYMENT",
    `Setup fee charged today: ${chargedToday}`,
    `Monthly service: ${monthlyPrice}`,
    "No monthly service fee is charged during website development.",
    "Monthly service begins on the date your website is approved and launched publicly.",
    "Your first monthly service charge will occur one month after launch and will cover your first completed month of service. Monthly billing will continue each month thereafter.",
    "",
    "WHAT HAPPENS NEXT",
    "Business Pro Local will begin building your website after signup.",
    "Your website and any owner/shop interface included with your package will typically be completed and set up within 7–10 days. If we need additional photos, services, pricing, hours, or other business information, we will contact you during development.",
    "",
    "PRE-LAUNCH CANCELLATION & REFUND",
    "If you decide not to move forward before approving your website for public launch, you may cancel and receive a 50% refund of your website setup fee. The remaining 50% is retained by Business Pro Local for design, development, setup, and other work already completed. Once you approve the website for public launch, the setup fee becomes non-refundable except where required by law.",
    "",
    "Your payment method is stored securely by Stripe for future monthly service billing under the terms of your Business Pro Local service agreement.",
    "",
    "Thank you,",
    "Business Pro Local"
  );


  const adminResult =
    await sendResendEmail({

      to:
        SIGNUP_NOTIFICATION_EMAIL,

      subject:
        "New Business Pro Local Signup",

      text:
        adminLines.join("\n"),

      idempotencyKey:
        `business-pro-admin-${session.id}`

    });


  const customerEmail =
    String(
      metadata.email || ""
    ).trim();


  if (!customerEmail) {

    throw new Error(
      "The completed checkout does not contain a customer email address."
    );

  }


  const customerResult =
    await sendResendEmail({

      to:
        customerEmail,

      subject:
        "Business Pro Local — Order & Payment Confirmation",

      text:
        customerLines.join("\n"),

      idempotencyKey:
        `business-pro-customer-${session.id}`

    });


  console.log(
    "Signup emails sent:",
    {
      adminEmailId:
        adminResult.id,
      customerEmailId:
        customerResult.id,
      stripeEvent:
        eventId
    }
  );

}


app.post(
  "/stripe-webhook",
  express.raw({
    type: "application/json"
  }),
  async (req, res) => {

    const {
      STRIPE_SECRET_KEY,
      STRIPE_WEBHOOK_SECRET
    } = process.env;


    if (
      !STRIPE_SECRET_KEY ||
      !STRIPE_WEBHOOK_SECRET
    ) {

      return res.status(500).send(
        "Stripe webhook configuration is incomplete."
      );

    }


    const stripe =
      new Stripe(
        STRIPE_SECRET_KEY
      );


    let event;


    try {

      const signature =
        req.headers[
          "stripe-signature"
        ];


      event =
        stripe.webhooks.constructEvent(
          req.body,
          signature,
          STRIPE_WEBHOOK_SECRET
        );


    } catch (error) {

      console.error(
        "Stripe webhook signature error:",
        error.message
      );


      return res.status(400).send(
        `Webhook Error: ${error.message}`
      );

    }


    try {

      if (
        event.type ===
          "checkout.session.completed" ||
        event.type ===
          "checkout.session.async_payment_succeeded"
      ) {

        const eventSession =
          event.data.object;


        if (
          event.type ===
            "checkout.session.async_payment_succeeded" ||
          eventSession.payment_status ===
            "paid"
        ) {

          const latestSession =
            await stripe.checkout.sessions.retrieve(
              eventSession.id
            );


          await saveBusinessProBillingProfile(
            stripe,
            latestSession
          );


          if (
            latestSession.metadata
              ?.signupEmailsSent !== "yes"
          ) {

            await sendBusinessProSignupEmails(
              latestSession,
              event.id
            );


            await stripe.checkout.sessions.update(
              latestSession.id,
              {

                metadata: {

                  ...latestSession.metadata,

                  signupEmailsSent:
                    "yes",

                  signupEmailsSentAt:
                    new Date().toISOString()

                }

              }
            );

          }

        }

      }


      return res.json({
        received: true
      });


    } catch (error) {

      console.error(
        "Stripe webhook processing error:",
        error
      );


      return res.status(500).json({

        received: false,

        error:
          "Stripe webhook processing failed."

      });

    }

  }
);


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


      const messageBody =
        `${shopName}: Your appointment${barberName ? ` with ${barberName}` : ""} is confirmed for ${appointmentDate} at ${appointmentTime}. Reply STOP to opt out.`;


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
// BUSINESS PRO LOCAL STRIPE CHECKOUT
// ============================================================

const BASIC_FEATURES = [
  "Mobile-friendly business website",
  "Business information, photos, contact details, address, and hours",
  "Services and pricing",
  "Google Maps and directions",
  "Links to existing social media accounts",
  "Website hosting",
  "Security and backups",
  "Technical support",
  "Website maintenance and reasonable minor updates"
];


const PROFESSIONAL_FEATURES = [
  ...BASIC_FEATURES,
  "Interactive customer features",
  "Appointment booking where appropriate",
  "Service or employee selection",
  "Quote or estimate requests",
  "Customer intake forms",
  "Restaurant takeout or order-ahead options where appropriate",
  "Photo galleries",
  "Owner management interface",
  "Schedule and availability management",
  "Vacation-day or day-off controls",
  "Business photo and information updates"
];


const BUSINESS_PRO_FEATURES = [
  ...PROFESSIONAL_FEATURES,
  "Mobile storefront",
  "Product listings with photos, descriptions, and pricing",
  "Shopping cart and customer ordering",
  "Online purchasing where appropriate",
  "Pickup, delivery, or shipping options where appropriate",
  "Inventory management",
  "Order management",
  "Promotions"
];


const BUSINESS_PRO_PLANS = {

  basic: {
    name: "Basic",
    setupAmount: 99500,
    monthlyAmount: 4900,
    advertisingRate: "$0.75 per click",
    advertisingMinimum: "$25 monthly minimum",
    features: BASIC_FEATURES
  },

  professional: {
    name: "Professional",
    setupAmount: 149500,
    monthlyAmount: 7900,
    advertisingRate: "$1.25 per click",
    advertisingMinimum: "$50 monthly minimum",
    features: PROFESSIONAL_FEATURES
  },

  "business-pro": {
    name: "Business Pro",
    setupAmount: 249500,
    monthlyAmount: 14900,
    advertisingRate: "$2.00 per click",
    advertisingMinimum: "$75 monthly minimum",
    features: BUSINESS_PRO_FEATURES
  }

};


function cleanCheckoutValue(
  value,
  maxLength = 500
) {

  return String(value || "")
    .trim()
    .slice(0, maxLength);

}


function addOneCalendarMonth(
  inputDate
) {

  const date =
    new Date(inputDate);


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {

    throw new Error(
      "Invalid launch date."
    );

  }


  const year =
    date.getUTCFullYear();

  const month =
    date.getUTCMonth();

  const day =
    date.getUTCDate();


  const firstOfTargetMonth =
    new Date(
      Date.UTC(
        year,
        month + 1,
        1,
        date.getUTCHours(),
        date.getUTCMinutes(),
        date.getUTCSeconds()
      )
    );


  const targetYear =
    firstOfTargetMonth.getUTCFullYear();

  const targetMonth =
    firstOfTargetMonth.getUTCMonth();


  const lastDayOfTargetMonth =
    new Date(
      Date.UTC(
        targetYear,
        targetMonth + 1,
        0
      )
    ).getUTCDate();


  firstOfTargetMonth.setUTCDate(
    Math.min(
      day,
      lastDayOfTargetMonth
    )
  );


  return firstOfTargetMonth;

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
        new Stripe(
          stripeSecretKey
        );


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
        businessNotes,
        billingPolicy:
          "Setup fee only at signup. Monthly service begins at launch and first bills one month after launch."
      };


      const session =
        await stripe.checkout.sessions.create({

          mode:
            "payment",

          customer_email:
            email,

          customer_creation:
            "always",

          payment_method_types: [
            "card"
          ],

          payment_intent_data: {
            setup_future_usage:
              "off_session"
          },

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
            }

          ],

          metadata,

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
// START MONTHLY SERVICE AFTER WEBSITE LAUNCH
// ============================================================

app.post(
  "/start-monthly-service",
  async (req, res) => {

    try {

      const {
        STRIPE_SECRET_KEY,
        MONTHLY_BILLING_ADMIN_KEY
      } = process.env;


      if (
        !STRIPE_SECRET_KEY ||
        !MONTHLY_BILLING_ADMIN_KEY
      ) {

        return res.status(500).json({

          success: false,

          error:
            "Monthly billing configuration is incomplete."

        });

      }


      const providedAdminKey =
        String(
          req.headers[
            "x-business-pro-admin-key"
          ] || ""
        );


      if (
        providedAdminKey !==
        MONTHLY_BILLING_ADMIN_KEY
      ) {

        return res.status(403).json({

          success: false,

          error:
            "Not authorized."

        });

      }


      const checkoutSessionId =
        cleanCheckoutValue(
          req.body.checkoutSessionId,
          200
        );


      if (!checkoutSessionId) {

        return res.status(400).json({

          success: false,

          error:
            "checkoutSessionId is required."

        });

      }


      const stripe =
        new Stripe(
          STRIPE_SECRET_KEY
        );


      const session =
        await stripe.checkout.sessions.retrieve(
          checkoutSessionId
        );


      if (
        session.payment_status !==
        "paid"
      ) {

        return res.status(400).json({

          success: false,

          error:
            "The setup payment has not been completed."

        });

      }


      const metadata =
        session.metadata || {};


      const plan =
        BUSINESS_PRO_PLANS[
          metadata.planKey
        ];


      if (!plan) {

        return res.status(400).json({

          success: false,

          error:
            "The checkout session does not contain a valid Business Pro Local package."

        });

      }


      const customerId =
        getStripeObjectId(
          session.customer
        );


      if (!customerId) {

        return res.status(400).json({

          success: false,

          error:
            "The checkout session does not contain a Stripe customer."

        });

      }


      const customer =
        await stripe.customers.retrieve(
          customerId
        );


      if (customer.deleted) {

        return res.status(400).json({

          success: false,

          error:
            "The Stripe customer is no longer available."

        });

      }


      const existingSubscriptionId =
        customer.metadata
          ?.businessProMonthlySubscriptionId;


      if (existingSubscriptionId) {

        try {

          const existingSubscription =
            await stripe.subscriptions.retrieve(
              existingSubscriptionId
            );


          if (
            [
              "active",
              "trialing",
              "past_due",
              "unpaid"
            ].includes(
              existingSubscription.status
            )
          ) {

            return res.json({

              success: true,

              alreadyStarted:
                true,

              subscriptionId:
                existingSubscription.id,

              status:
                existingSubscription.status,

              firstBillingDate:
                customer.metadata
                  ?.businessProFirstBillingDate ||
                ""

            });

          }

        } catch (error) {

          console.warn(
            "Existing subscription lookup failed:",
            error.message
          );

        }

      }


      let paymentMethodId =
        getStripeObjectId(
          customer.invoice_settings
            ?.default_payment_method
        );


      if (!paymentMethodId) {

        const paymentIntentId =
          getStripeObjectId(
            session.payment_intent
          );


        if (paymentIntentId) {

          const paymentIntent =
            await stripe.paymentIntents.retrieve(
              paymentIntentId
            );


          paymentMethodId =
            getStripeObjectId(
              paymentIntent.payment_method
            );

        }

      }


      if (!paymentMethodId) {

        return res.status(400).json({

          success: false,

          error:
            "No saved payment method is available for monthly billing."

        });

      }


      const requestedLaunchDate =
        cleanCheckoutValue(
          req.body.launchDate,
          100
        );


      const launchDate =
        requestedLaunchDate
          ? new Date(
              requestedLaunchDate
            )
          : new Date();


      if (
        Number.isNaN(
          launchDate.getTime()
        )
      ) {

        return res.status(400).json({

          success: false,

          error:
            "launchDate must be a valid date."

        });

      }


      const firstBillingDate =
        addOneCalendarMonth(
          launchDate
        );


      const recurringPrice =
        await stripe.prices.create(
          {

            currency:
              "usd",

            unit_amount:
              plan.monthlyAmount,

            recurring: {
              interval:
                "month"
            },

            product_data: {
              name:
                `Business Pro Local ${plan.name} Monthly Service`
            },

            metadata: {
              planKey:
                metadata.planKey || "",
              checkoutSessionId:
                session.id,
              businessName:
                metadata.businessName || ""
            }

          },
          {
            idempotencyKey:
              `business-pro-monthly-price-${session.id}`
          }
        );


      const subscription =
        await stripe.subscriptions.create(
          {

            customer:
              customerId,

            items: [
              {
                price:
                  recurringPrice.id
              }
            ],

            default_payment_method:
              paymentMethodId,

            collection_method:
              "charge_automatically",

            trial_end:
              Math.floor(
                firstBillingDate.getTime() /
                1000
              ),

            metadata: {
              businessName:
                metadata.businessName || "",
              ownerName:
                metadata.ownerName || "",
              email:
                metadata.email || "",
              plan:
                plan.name,
              planKey:
                metadata.planKey || "",
              advertising:
                metadata.advertising || "OFF",
              checkoutSessionId:
                session.id,
              launchDate:
                launchDate.toISOString(),
              firstBillingDate:
                firstBillingDate.toISOString(),
              billingPolicy:
                "First monthly charge occurs one month after launch and covers the first completed month of service."
            },

            description:
              `Business Pro Local ${plan.name} monthly website service`

          },
          {
            idempotencyKey:
              `business-pro-monthly-subscription-${session.id}`
          }
        );


      await stripe.customers.update(
        customerId,
        {

          metadata: {

            ...customer.metadata,

            businessProMonthlySubscriptionId:
              subscription.id,

            businessProLaunchDate:
              launchDate.toISOString(),

            businessProFirstBillingDate:
              firstBillingDate.toISOString()

          }

        }
      );


      return res.json({

        success: true,

        alreadyStarted:
          false,

        subscriptionId:
          subscription.id,

        status:
          subscription.status,

        launchDate:
          launchDate.toISOString(),

        firstBillingDate:
          firstBillingDate.toISOString(),

        monthlyAmount:
          plan.monthlyAmount

      });


    } catch (error) {

      console.error(
        "Start monthly service error:",
        error
      );


      return res.status(500).json({

        success: false,

        error:
          error.message ||
          "Monthly service could not be started."

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
