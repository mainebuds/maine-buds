// TEST 2 — card first, then PAY NOW or PAY AT STORE, with manage links
document.addEventListener("DOMContentLoaded", () => {

  // ============================================================
  // BUSINESS PRO BARBER TEMPLATE
  // CUSTOMER WEBSITE ENGINE
  // ============================================================

  const config = window.SHOP_CONFIG;

  if (!config) {
    console.error(
      "SHOP_CONFIG was not found. Make sure shop-config.js loads before script.js."
    );
    return;
  }

  const shop = config.shop || {};
  const services = Array.isArray(config.services)
    ? config.services
    : [];
  const profiles = Array.isArray(config.barbers)
    ? config.barbers
    : [];
  const bookingSettings = config.booking || {};
  const smsSettings = config.sms || {};

  const bookableBarbers = profiles.filter(
    profile =>
      profile.profileType !== "business-pro-local" &&
      Array.isArray(profile.serviceIds) &&
      profile.serviceIds.length > 0
  );

  const APPOINTMENT_LENGTH =
    Number(bookingSettings.appointmentLengthMinutes) || 30;

  const DAYS_AVAILABLE =
    Number(bookingSettings.daysAvailableInAdvance) || 365;

  const STORAGE_KEY =
    bookingSettings.storageKey ||
    "businessProProfessionalBarberTemplateBookings";

  // Shared with the Business Pro Professional Owner Interface.
  const TIME_OFF_STORAGE_KEY =
    "businessProProfessionalBarberTemplateTimeOff";
      
  const BUSINESS_STATUS_URL =
    "https://village-barber-sms.onrender.com/business-status";

  let businessIsOpen = true;
  const SMS_SERVER_URL =
    smsSettings.serverUrl || "";

  const APPOINTMENT_CHECKOUT_URL =
    "https://village-barber-sms.onrender.com/create-appointment-checkout-session";

  const APPOINTMENT_STATUS_URL =
    "https://village-barber-sms.onrender.com/appointment-checkout-status";

  const APPOINTMENT_NOTIFICATION_URL =
    "https://village-barber-sms.onrender.com/send-paid-appointment-notifications";

  const PHOTO_DB_NAME =
    "businessProBarberTemplateUploads";

  const PHOTO_STORE_NAME =
    "profilePhotos";


  // ============================================================
  // PAGE ELEMENTS
  // ============================================================

  const shopName =
    document.getElementById("shop-name");

  const hero =
    document.getElementById("home");

  const heroTitle =
    document.getElementById("hero-title");

  const heroSubtitle =
    document.getElementById("hero-subtitle");

  const servicesList =
    document.getElementById("services-list");

  const barberSelector =
    document.getElementById("barber-selector");

  const shopAddressLine1 =
    document.getElementById("shop-address-line1");

  const shopAddressLine2 =
    document.getElementById("shop-address-line2");

  const shopPhoneLink =
    document.getElementById("shop-phone-link");

  const shopHours =
    document.getElementById("shop-hours");

  const footerShopName =
    document.getElementById("footer-shop-name");

  const profileModal =
    document.getElementById("barber-profile-modal");

  const profileContent =
    document.getElementById("barber-profile-content");

  const closeProfileButton =
    document.getElementById("close-barber-profile");

  const bookingModal =
    document.getElementById("booking-modal");

  const closeBookingButton =
    document.getElementById("close-booking");

  const barberSelect =
    document.getElementById("barber-select");

  const barberSelectLabel =
    document.querySelector('label[for="barber-select"]');

  const selectedBarberDisplay =
    document.getElementById("selected-barber");

  const serviceSelect =
    document.getElementById("service");

  const dateInput =
    document.getElementById("appointment-date");

  const bookingDateCalendar =
    document.getElementById("booking-date-calendar");

  const bookingDateGrid =
    document.getElementById("booking-date-grid");

  const bookingDateMonthLabel =
    document.getElementById("booking-date-month-label");

  const bookingDatePrev =
    document.getElementById("booking-date-prev");

  const bookingDateNext =
    document.getElementById("booking-date-next");

  const bookingDateNote =
    document.getElementById("booking-date-note");

  const timeSelect =
    document.getElementById("appointment-time");

  const nameInput =
    document.getElementById("customer-name");

  const phoneInput =
    document.getElementById("customer-phone");

  const smsConsent =
    document.getElementById("sms-consent");

  const confirmButton =
    document.getElementById("confirm-booking");

  const confirmationMessage =
    document.getElementById("confirmation-message");

  const smsPolicyLinks =
    document.getElementById("sms-policy-links");

  const privacyPolicyLink =
    document.getElementById("privacy-policy-link");

  const termsPolicyLink =
    document.getElementById("terms-policy-link");

  const ctaButton =
    document.querySelector(".get-this-website-button");


  let selectedBarberId = "";
  let requestedServiceId = "";
  let bookingCalendarMonth = new Date();
  bookingCalendarMonth.setDate(1);
  bookingCalendarMonth.setHours(0, 0, 0, 0);


  // ============================================================
  // START WEBSITE
  // ============================================================

  buildShopInformation();
  buildServices();
  buildProfileCards();
  buildBarberSelect();
  configureBookingCalendar();
  configurePolicyLinks();
  attachGeneralBookingButtons();
  configureCtaScrollGlow();
  openBookingFromUrl();

  function openBookingFromUrl() {
    const params =
      new URLSearchParams(window.location.search);

    const shouldOpenBooking =
      params.get("booking") === "open" ||
      params.get("reschedule") === "1";

    if (!shouldOpenBooking) {
      return;
    }

    openBookingModal(
      params.get("barber") || "",
      params.get("service") || ""
    );
  }

   // Refresh booking availability from the shared Business Pro server.
  async function loadBusinessStatusFromServer() {
    try {
      const response =
        await fetch(
          BUSINESS_STATUS_URL,
          {
            cache: "no-store"
          }
        );

      const result =
        await response.json();

      if (
        response.ok &&
        result.success &&
        typeof result.isOpen === "boolean"
      ) {
        businessIsOpen =
          result.isOpen;
      }
    } catch (error) {
      console.error(
        "Business status check error:",
        error
      );
    }
  }

  async function refreshBookingAvailability() {
    await loadBusinessStatusFromServer();
    renderBookingDateCalendar();
    updateAvailableTimes();
  }

  window.addEventListener("storage", event => {
    if (
      event.key === STORAGE_KEY ||
      event.key === TIME_OFF_STORAGE_KEY
    ) {
      refreshBookingAvailability();
    }
  });

  window.addEventListener(
    "focus",
    refreshBookingAvailability
  );

  document.addEventListener(
    "visibilitychange",
    () => {
      if (!document.hidden) {
        refreshBookingAvailability();
      }
    }
  );

  refreshBookingAvailability(); 


  // ============================================================
  // SHOP INFORMATION
  // ============================================================

  function buildShopInformation() {

    document.title =
      shop.pageTitle ||
      shop.name ||
      "Business Pro Barber Demo";

    if (shopName) {
      shopName.textContent =
        shop.name || "BARBER SHOP";
    }

    if (heroTitle) {
      heroTitle.textContent =
        shop.heroTitle ||
        "LOOK SHARP. FEEL SHARP.";
    }

    if (heroSubtitle) {
      heroSubtitle.textContent =
        shop.heroSubtitle || "";
    }

    if (hero) {

      if (shop.heroImage) {
        hero.style.backgroundImage = `
          linear-gradient(
            rgba(0, 0, 0, 0.42),
            rgba(0, 0, 0, 0.42)
          ),
          url("${escapeCssUrl(shop.heroImage)}")
        `;
      } else {
        hero.classList.add("hero-no-image");
      }

    }

    if (shopAddressLine1) {
      shopAddressLine1.textContent =
        shop.addressLine1 || "";
    }

    if (shopAddressLine2) {
      shopAddressLine2.textContent =
        shop.addressLine2 || "";
    }

    if (shopPhoneLink) {
      shopPhoneLink.textContent =
        shop.phoneDisplay || "";

      shopPhoneLink.href =
        shop.phoneLink
          ? `tel:${shop.phoneLink}`
          : "#";
    }

    if (footerShopName) {
      footerShopName.textContent =
        shop.name || "Barber Shop";
    }

    buildHours();

  }


  function buildHours() {

    if (!shopHours) {
      return;
    }

    shopHours.innerHTML = "";

    if (
      !Array.isArray(shop.hours) ||
      shop.hours.length === 0
    ) {
      return;
    }

    const heading =
      document.createElement("h3");

    heading.textContent =
      "Hours";

    shopHours.appendChild(heading);

    shop.hours.forEach(item => {

      const row =
        document.createElement("p");

      row.innerHTML = `
        <strong>${escapeHTML(item.days)}</strong>:
        ${escapeHTML(item.hours)}
      `;

      shopHours.appendChild(row);

    });

  }


  // ============================================================
  // CLICKABLE SERVICE CARDS
  // ============================================================

  function buildServices() {

    if (!servicesList) {
      return;
    }

    servicesList.innerHTML = "";

    services.forEach(service => {

      const card =
        document.createElement("button");

      card.type =
        "button";

      card.className =
        "service-card";

      card.setAttribute(
        "aria-label",
        `Book ${service.name} for ${formatPrice(service.price)}`
      );

          card.innerHTML = `
        <div class="service-card-icon" data-service-icon="${escapeAttribute(service.id)}"></div>

        <h3>
          ${escapeHTML(service.name)}
        </h3>

        <p>
          ${formatPrice(service.price)}
        </p>

        <span class="service-card-arrow" aria-hidden="true">
          ›
        </span>
      `;

      card.addEventListener(
        "click",
        () => {
          openBookingModal(
            "",
            service.id
          );
        }
      );

      servicesList.appendChild(card);

    });

  }


  // ============================================================
  // PROFILE CARDS
  // ============================================================

  function buildProfileCards() {

    if (!barberSelector) {
      return;
    }

    barberSelector.innerHTML = "";

    if (profiles.length === 0) {
      barberSelector.innerHTML =
        "<p>No profiles have been added yet.</p>";
      return;
    }

    profiles.forEach(profile => {

      const card =
        document.createElement("button");

      card.type =
        "button";

      card.className =
        "barber-selector-card";

      if (
        profile.profileType ===
        "business-pro-local"
      ) {
        card.classList.add(
          "business-pro-profile-card"
        );
      }

      card.dataset.barberId =
        profile.id;

      const specialty =
        profile.cardSpecialty
          ? `
              <p class="barber-card-specialty">
                ${escapeHTML(profile.cardSpecialty)}
              </p>
            `
          : "";

      card.innerHTML = `
        ${buildProfilePhoto(profile, "small")}

        <h3>
          ${escapeHTML(profile.name)}
        </h3>

        ${specialty}
      `;

      card.addEventListener(
        "click",
        () => {
          openProfile(profile.id);
        }
      );

      barberSelector.appendChild(card);

    });

  }


  // ============================================================
  // OPEN PROFILE
  // ============================================================

  function openProfile(profileId) {

    const profile =
      getProfileById(profileId);

    if (!profile || !profileModal || !profileContent) {
      return;
    }

    if (
      profile.profileType ===
      "business-pro-local"
    ) {
      buildBusinessProProfile(profile);
    } else {
      buildBarberProfile(profile);
    }

    profileModal.classList.add("open");
    document.body.style.overflow = "hidden";

  }


  function buildBarberProfile(barber) {

    const specialties =
      Array.isArray(barber.specialties)
        ? barber.specialties.join(" • ")
        : "";

    profileContent.innerHTML = `
      <div class="barber-popup-profile">

        <div class="barber-popup-header">

          <div class="barber-popup-action">

            ${buildProfilePhoto(barber, "large")}

            <button
              type="button"
              class="book-button barber-popup-book-button"
              id="barber-popup-book-button"
            >
              Schedule Appointment
            </button>

          </div>

          <div class="barber-popup-info">

            <h2>
              ${escapeHTML(barber.name)}
            </h2>

            ${
              barber.cardSpecialty
                ? `
                    <p class="barber-popup-tagline">
                      ${escapeHTML(barber.cardSpecialty)}
                    </p>
                  `
                : ""
            }

            ${
              specialties
                ? `
                    <p class="barber-popup-specialties">
                      ${escapeHTML(specialties)}
                    </p>
                  `
                : ""
            }

            ${
              barber.bio
                ? `
                    <p class="barber-popup-bio">
                      ${escapeHTML(barber.bio)}
                    </p>
                  `
                : ""
            }

          </div>

        </div>


        <div class="barber-popup-work">

          <h3>
            ${escapeHTML(barber.name)}'s Work
          </h3>

          <p class="gallery-help-text">
            Add up to three examples of this barber's work.
          </p>

          <div
            class="barber-gallery"
            id="gallery-${escapeAttribute(barber.id)}"
          >
          </div>

        </div>

      </div>
    `;

    buildBarberGallery(barber);

    const bookButton =
      document.getElementById(
        "barber-popup-book-button"
      );

    if (bookButton) {
      bookButton.addEventListener(
        "click",
        () => {
          closeProfile(false);
          openBookingModal(barber.id);
        }
      );
    }

  }


  function buildBusinessProProfile(profile) {

    const specialties =
      Array.isArray(profile.specialties)
        ? profile.specialties
        : [];

    const action =
      profile.actionButton || {};

    const actionText =
      action.text || "Get This Website";

    const actionHref =
      action.href || "join.html";

    profileContent.innerHTML = `
      <div class="barber-popup-profile business-pro-popup-profile">

        <div class="barber-popup-header">

          <div class="barber-popup-action">
            ${buildProfilePhoto(profile, "large")}
          </div>

          <div class="barber-popup-info">

            <p class="business-pro-popup-eyebrow">
              BUSINESS PRO LOCAL
            </p>

            <h2>
              ${escapeHTML(profile.name)}
            </h2>

            ${
              profile.cardSpecialty
                ? `
                    <p class="barber-popup-tagline">
                      ${escapeHTML(profile.cardSpecialty)}
                    </p>
                  `
                : ""
            }

            ${
              profile.bio
                ? `
                    <p class="barber-popup-bio">
                      ${escapeHTML(profile.bio)}
                    </p>
                  `
                : ""
            }

          </div>

        </div>

        <div class="business-pro-services">

          <h3>
            Business Pro Services
          </h3>

          <ul>
            ${specialties
              .map(
                item => `
                  <li>
                    ${escapeHTML(item)}
                  </li>
                `
              )
              .join("")}
          </ul>

          <a
            class="get-this-website-button business-pro-popup-button"
            href="${escapeAttribute(actionHref)}"
          >
            ${escapeHTML(actionText)}
            <span aria-hidden="true">
              &rarr;
            </span>
          </a>

        </div>

      </div>
    `;

  }


  // ============================================================
  // THREE-SLOT BARBER GALLERY
  // ============================================================

  function buildBarberGallery(barber) {

    const galleryElement =
      document.getElementById(
        `gallery-${barber.id}`
      );

    if (!galleryElement) {
      return;
    }

    galleryElement.innerHTML = "";

    const configuredGallery =
      Array.isArray(barber.gallery)
        ? barber.gallery
        : [];

    const requestedSlots =
      Number(barber.uploadSlots);

    const slotCount =
      Number.isFinite(requestedSlots) &&
      requestedSlots > 0
        ? Math.min(
            3,
            Math.floor(requestedSlots)
          )
        : Math.min(
            3,
            Math.max(configuredGallery.length, 0)
          );

    if (slotCount === 0) {
      galleryElement.innerHTML = `
        <div class="gallery-empty">
          <p>
            Haircut photos will appear here.
          </p>
        </div>
      `;
      return;
    }

    for (
      let slotIndex = 0;
      slotIndex < slotCount;
      slotIndex += 1
    ) {

      const configuredPhoto =
        configuredGallery[slotIndex] || null;

      const uploadSlot =
        createGalleryUploadSlot(
          barber,
          slotIndex,
          configuredPhoto
        );

      galleryElement.appendChild(uploadSlot);

      setupGalleryUpload(
        barber,
        slotIndex,
        uploadSlot,
        configuredPhoto
      );

    }

  }


  function createGalleryUploadSlot(
    barber,
    slotIndex,
    configuredPhoto
  ) {

    const slot =
      document.createElement("div");

    slot.className =
      "gallery-upload-slot";

    const slotNumber =
      slotIndex + 1;

    const configuredCaption =
      configuredPhoto && configuredPhoto.caption
        ? configuredPhoto.caption
        : `Haircut Photo ${slotNumber}`;

    slot.innerHTML = `
      <input
        type="file"
        class="gallery-upload-input"
        accept="image/*"
        hidden
      >

      <div
        class="gallery-upload-empty"
        role="button"
        tabindex="0"
        aria-label="Add haircut photo ${slotNumber} for ${escapeAttribute(barber.name)}"
      >

        <span class="gallery-upload-plus">
          +
        </span>

        <strong>
          Add Haircut Photo ${slotNumber}
        </strong>

        <span>
          Click to choose a photo
        </span>

        <small>
          Or drag and drop here
        </small>

      </div>

      <div
        class="gallery-upload-preview"
        hidden
      >

        <img
          alt="${escapeAttribute(configuredCaption)}"
        >

        <div class="gallery-upload-actions">

          <span class="gallery-upload-caption">
            ${escapeHTML(configuredCaption)}
          </span>

          <button
            type="button"
            class="gallery-replace-photo"
          >
            Replace Photo
          </button>

        </div>

      </div>
    `;

    return slot;

  }


  function setupGalleryUpload(
    barber,
    slotIndex,
    uploadSlot,
    configuredPhoto
  ) {

    const input =
      uploadSlot.querySelector(
        ".gallery-upload-input"
      );

    const emptyState =
      uploadSlot.querySelector(
        ".gallery-upload-empty"
      );

    const replaceButton =
      uploadSlot.querySelector(
        ".gallery-replace-photo"
      );

    if (
      !input ||
      !emptyState ||
      !replaceButton
    ) {
      return;
    }

    const choosePhoto = () => {
      input.click();
    };

    emptyState.addEventListener(
      "click",
      choosePhoto
    );

    emptyState.addEventListener(
      "keydown",
      event => {
        if (
          event.key === "Enter" ||
          event.key === " "
        ) {
          event.preventDefault();
          choosePhoto();
        }
      }
    );

    replaceButton.addEventListener(
      "click",
      choosePhoto
    );

    input.addEventListener(
      "change",
      () => {

        const file =
          input.files &&
          input.files[0];

        if (file) {
          handleGalleryFile(
            barber,
            slotIndex,
            uploadSlot,
            file
          );
        }

        input.value = "";

      }
    );

    [
      "dragenter",
      "dragover"
    ].forEach(eventName => {
      emptyState.addEventListener(
        eventName,
        event => {
          event.preventDefault();
          emptyState.classList.add(
            "drag-over"
          );
        }
      );
    });

    [
      "dragleave",
      "drop"
    ].forEach(eventName => {
      emptyState.addEventListener(
        eventName,
        event => {
          event.preventDefault();
          emptyState.classList.remove(
            "drag-over"
          );
        }
      );
    });

    emptyState.addEventListener(
      "drop",
      event => {

        const file =
          event.dataTransfer &&
          event.dataTransfer.files &&
          event.dataTransfer.files[0];

        if (file) {
          handleGalleryFile(
            barber,
            slotIndex,
            uploadSlot,
            file
          );
        }

      }
    );

    loadSavedGalleryPhoto(
      barber.id,
      slotIndex
    )
      .then(savedPhoto => {

        if (savedPhoto) {
          showGalleryPhoto(
            uploadSlot,
            savedPhoto
          );
          return;
        }

        if (
          configuredPhoto &&
          configuredPhoto.image
        ) {
          showGalleryPhoto(
            uploadSlot,
            configuredPhoto.image
          );
        }

      })
      .catch(error => {
        console.warn(
          "Saved gallery photo could not be loaded:",
          error
        );

        if (
          configuredPhoto &&
          configuredPhoto.image
        ) {
          showGalleryPhoto(
            uploadSlot,
            configuredPhoto.image
          );
        }
      });

  }


  function handleGalleryFile(
    barber,
    slotIndex,
    uploadSlot,
    file
  ) {

    if (
      !file ||
      !file.type ||
      !file.type.startsWith("image/")
    ) {
      window.alert(
        "Please choose an image file."
      );
      return;
    }

    const MAX_IMAGE_SIZE =
      12 * 1024 * 1024;

    if (file.size > MAX_IMAGE_SIZE) {
      window.alert(
        "Please choose an image smaller than 12 MB."
      );
      return;
    }

    showGalleryPhoto(
      uploadSlot,
      file
    );

    saveGalleryPhoto(
      barber.id,
      slotIndex,
      file
    ).catch(error => {
      console.warn(
        "Gallery photo could not be saved:",
        error
      );
    });

  }


  function showGalleryPhoto(
    uploadSlot,
    imageSource
  ) {

    const emptyState =
      uploadSlot.querySelector(
        ".gallery-upload-empty"
      );

    const preview =
      uploadSlot.querySelector(
        ".gallery-upload-preview"
      );

    const previewImage =
      uploadSlot.querySelector(
        ".gallery-upload-preview img"
      );

    if (
      !emptyState ||
      !preview ||
      !previewImage
    ) {
      return;
    }

    if (previewImage.dataset.objectUrl) {
      URL.revokeObjectURL(
        previewImage.dataset.objectUrl
      );
      delete previewImage.dataset.objectUrl;
    }

    if (
      typeof imageSource === "string"
    ) {
      previewImage.src = imageSource;
    } else {
      const objectUrl =
        URL.createObjectURL(imageSource);

      previewImage.src = objectUrl;
      previewImage.dataset.objectUrl =
        objectUrl;
    }

    emptyState.hidden = true;
    preview.hidden = false;

  }


  // ============================================================
  // INDEXEDDB PHOTO STORAGE
  // ============================================================

  function openPhotoDatabase() {

    return new Promise(
      (resolve, reject) => {

        if (!window.indexedDB) {
          reject(
            new Error(
              "IndexedDB is not supported in this browser."
            )
          );
          return;
        }

        const request =
          indexedDB.open(
            PHOTO_DB_NAME,
            1
          );

        request.onupgradeneeded =
          event => {

            const database =
              event.target.result;

            if (
              !database.objectStoreNames.contains(
                PHOTO_STORE_NAME
              )
            ) {
              database.createObjectStore(
                PHOTO_STORE_NAME,
                {
                  keyPath: "id"
                }
              );
            }

          };

        request.onsuccess =
          () => {
            resolve(request.result);
          };

        request.onerror =
          () => {
            reject(
              request.error ||
              new Error(
                "The photo database could not be opened."
              )
            );
          };

      }
    );

  }


  async function saveGalleryPhoto(
    barberId,
    slotIndex,
    imageBlob
  ) {

    const database =
      await openPhotoDatabase();

    return new Promise(
      (resolve, reject) => {

        const transaction =
          database.transaction(
            PHOTO_STORE_NAME,
            "readwrite"
          );

        const store =
          transaction.objectStore(
            PHOTO_STORE_NAME
          );

        store.put({
          id:
            `${barberId}-${slotIndex}`,
          barberId,
          slotIndex,
          imageBlob,
          updatedAt:
            Date.now()
        });

        transaction.oncomplete =
          () => {
            database.close();
            resolve();
          };

        transaction.onerror =
          () => {
            database.close();
            reject(
              transaction.error ||
              new Error(
                "The photo could not be saved."
              )
            );
          };

        transaction.onabort =
          () => {
            database.close();
            reject(
              transaction.error ||
              new Error(
                "Saving the photo was cancelled."
              )
            );
          };

      }
    );

  }


  async function loadSavedGalleryPhoto(
    barberId,
    slotIndex
  ) {

    const database =
      await openPhotoDatabase();

    return new Promise(
      (resolve, reject) => {

        const transaction =
          database.transaction(
            PHOTO_STORE_NAME,
            "readonly"
          );

        const store =
          transaction.objectStore(
            PHOTO_STORE_NAME
          );

        const request =
          store.get(
            `${barberId}-${slotIndex}`
          );

        request.onsuccess =
          () => {

            const record =
              request.result;

            database.close();

            resolve(
              record && record.imageBlob
                ? record.imageBlob
                : null
            );

          };

        request.onerror =
          () => {
            database.close();
            reject(
              request.error ||
              new Error(
                "The saved photo could not be loaded."
              )
            );
          };

      }
    );

  }


  // ============================================================
  // CLOSE PROFILE
  // ============================================================

  if (closeProfileButton) {
    closeProfileButton.addEventListener(
      "click",
      () => {
        closeProfile();
      }
    );
  }

  if (profileModal) {
    profileModal.addEventListener(
      "click",
      event => {
        if (event.target === profileModal) {
          closeProfile();
        }
      }
    );
  }

  function closeProfile(
    restoreScroll = true
  ) {

    if (!profileModal) {
      return;
    }

    profileModal.classList.remove("open");

    if (restoreScroll) {
      document.body.style.overflow = "";
    }

  }


  // ============================================================
  // PROFILE PHOTO OR INITIALS
  // ============================================================

  function buildProfilePhoto(
    profile,
    size
  ) {

    const className =
      size === "small"
        ? "barber-card-photo"
        : "barber-popup-photo";

    if (profile.profilePhoto) {
      return `
        <img
          class="${className}"
          src="${escapeAttribute(profile.profilePhoto)}"
          alt="${escapeAttribute(profile.name)}"
        >
      `;
    }

    return `
      <div
        class="${className} barber-photo-placeholder"
        aria-label="${escapeAttribute(profile.name)}"
      >
        ${escapeHTML(
          getInitials(profile.name)
        )}
      </div>
    `;

  }


  // ============================================================
  // BOOKING DROPDOWN
  // ============================================================

  function buildBarberSelect() {

    if (!barberSelect) {
      return;
    }

    barberSelect.innerHTML = `
      <option value="">
        Select a barber
      </option>
    `;

    bookableBarbers.forEach(barber => {

      const option =
        document.createElement("option");

      option.value =
        barber.id;

      option.textContent =
        barber.name;

      barberSelect.appendChild(option);

    });

  }


  // ============================================================
  // GENERAL BOOKING BUTTONS
  // ============================================================

  function attachGeneralBookingButtons() {

    const buttons =
      document.querySelectorAll(
        ".open-booking"
      );

    buttons.forEach(button => {
      button.addEventListener(
        "click",
        () => {
          openBookingModal(
            button.dataset.barber || ""
          );
        }
      );
    });

  }


  // ============================================================
  // OPEN BOOKING
  // ============================================================

  function openBookingModal(
    requestedBarberId = "",
    requestedService = ""
  ) {

    if (!bookingModal) {
      return;
    }

    requestedServiceId =
      requestedService || "";

    confirmationMessage.innerHTML = "";

    const requestedBarber =
      requestedBarberId
        ? getBookableBarberById(
            requestedBarberId
          )
        : null;

    if (requestedBarber) {

      setBarberChoiceVisibility(false);
      selectBarber(requestedBarber.id);

    } else if (
      bookableBarbers.length === 1
    ) {

      setBarberChoiceVisibility(false);
      selectBarber(
        bookableBarbers[0].id
      );

    } else {

      setBarberChoiceVisibility(true);
      selectBarber("");

    }

    bookingModal.classList.add("open");
    document.body.style.overflow = "hidden";

  }


  function setBarberChoiceVisibility(
    showChoice
  ) {

    if (barberSelectLabel) {
      barberSelectLabel.hidden =
        !showChoice;
    }

    if (barberSelect) {
      barberSelect.hidden =
        !showChoice;
    }

  }


  // ============================================================
  // BARBER SELECTION
  // ============================================================

  if (barberSelect) {
    barberSelect.addEventListener(
      "change",
      () => {
        selectBarber(
          barberSelect.value
        );
      }
    );
  }

  function selectBarber(
    barberId
  ) {

    selectedBarberId =
      barberId;

    if (barberSelect) {
      barberSelect.value =
        barberId;
    }

    const barber =
      getBookableBarberById(
        barberId
      );

    if (!barber) {

      if (selectedBarberDisplay) {
        selectedBarberDisplay.textContent =
          "Select a Barber";
      }

      if (dateInput) {
        dateInput.value = "";
      }

      buildServiceSelect(null);
      resetTimeSelect();
      renderBookingDateCalendar();
      return;

    }

    if (selectedBarberDisplay) {
      selectedBarberDisplay.textContent =
        barber.name;
    }

    if (dateInput) {
      dateInput.value = "";
    }

    bookingCalendarMonth = new Date();
    bookingCalendarMonth.setDate(1);
    bookingCalendarMonth.setHours(0, 0, 0, 0);

    buildServiceSelect(barber);
    resetTimeSelect();
    renderBookingDateCalendar();

    if (
      requestedServiceId &&
      Array.from(serviceSelect.options).some(
        option =>
          option.value ===
          requestedServiceId
      )
    ) {
      serviceSelect.value =
        requestedServiceId;
    }

    updateAvailableTimes();

  }


  // ============================================================
  // BARBER SERVICES
  // ============================================================

  function buildServiceSelect(
    barber
  ) {

    if (!serviceSelect) {
      return;
    }

    serviceSelect.innerHTML = `
      <option value="">
        Select a service
      </option>
    `;

    if (!barber) {
      return;
    }

    const allowedIds =
      Array.isArray(barber.serviceIds)
        ? barber.serviceIds
        : [];

    services.forEach(service => {

      if (
        allowedIds.length > 0 &&
        !allowedIds.includes(service.id)
      ) {
        return;
      }

      const option =
        document.createElement("option");

      option.value =
        service.id;

      option.textContent =
        `${service.name} - ${formatPrice(service.price)}`;

      serviceSelect.appendChild(option);

    });

  }


  // ============================================================
  // CLOSE BOOKING
  // ============================================================

  if (closeBookingButton) {
    closeBookingButton.addEventListener(
      "click",
      closeBookingModal
    );
  }

  if (bookingModal) {
    bookingModal.addEventListener(
      "click",
      event => {
        if (event.target === bookingModal) {
          closeBookingModal();
        }
      }
    );
  }

  function closeBookingModal() {

    if (!bookingModal) {
      return;
    }

    bookingModal.classList.remove("open");
    document.body.style.overflow = "";

  }


  // ============================================================
  // ESCAPE KEY
  // ============================================================

  document.addEventListener(
    "keydown",
    event => {

      if (event.key !== "Escape") {
        return;
      }

      if (
        bookingModal &&
        bookingModal.classList.contains("open")
      ) {
        closeBookingModal();
        return;
      }

      if (
        profileModal &&
        profileModal.classList.contains("open")
      ) {
        closeProfile();
      }

    }
  );


  // ============================================================
  // BOOKING CALENDAR
  // ============================================================

  function configureBookingCalendar() {

    if (!dateInput) {
      return;
    }

    const today =
      new Date();

    today.setHours(
      0,
      0,
      0,
      0
    );

    const maxDate =
      new Date(today);

    maxDate.setDate(
      maxDate.getDate() +
      DAYS_AVAILABLE
    );

    dateInput.min =
      toDateInputValue(today);

    dateInput.max =
      toDateInputValue(maxDate);

    bookingCalendarMonth = new Date(
      today.getFullYear(),
      today.getMonth(),
      1
    );

    if (bookingDatePrev) {
      bookingDatePrev.addEventListener(
        "click",
        () => {
          bookingCalendarMonth.setMonth(
            bookingCalendarMonth.getMonth() - 1
          );
          renderBookingDateCalendar();
        }
      );
    }

    if (bookingDateNext) {
      bookingDateNext.addEventListener(
        "click",
        () => {
          bookingCalendarMonth.setMonth(
            bookingCalendarMonth.getMonth() + 1
          );
          renderBookingDateCalendar();
        }
      );
    }

    renderBookingDateCalendar();

  }


  if (dateInput) {
    dateInput.addEventListener(
      "change",
      () => {
        renderBookingDateCalendar();
        updateAvailableTimes();
      }
    );
  }

  if (serviceSelect) {
    serviceSelect.addEventListener(
      "change",
      () => {
        renderBookingDateCalendar();
        updateAvailableTimes();
      }
    );
  }


  function getDateAvailability(
    barber,
    dateKey
  ) {

    const selectedDate =
      parseDateInput(dateKey);

    if (!barber || !selectedDate) {
      return {
        available: false,
        status: "unavailable",
        label: "OFF",
        times: []
      };
    }


       const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (
      dateKey === toDateInputValue(today) &&
      businessIsOpen === false
    ) {
      return {
        available: false,
        status: "closed",
        label: "CLOSED",
        times: []
      };
    }

    const maxDate = new Date(today);
    maxDate.setDate(maxDate.getDate() + DAYS_AVAILABLE);

    if (
      selectedDate < today ||
      selectedDate > maxDate
    ) {
      return {
        available: false,
        status: "outside-range",
        label: "",
        times: []
      };
    }

    const schedule =
      barber.schedule || {};

    const workingDays =
      Array.isArray(schedule.workingDays)
        ? schedule.workingDays
        : [];

    if (
      !workingDays.includes(
        selectedDate.getDay()
      )
    ) {
      return {
        available: false,
        status: "off",
        label: "OFF",
        times: []
      };
    }

    const approvedRequests =
      getApprovedTimeOff().filter(request =>
        String(request.employee || "").toLowerCase() ===
          String(barber.name || "").toLowerCase() &&
        dateKey >= request.startDate &&
        dateKey <= request.endDate
      );

    if (
      approvedRequests.some(
        request => request.allDay
      )
    ) {
      return {
        available: false,
        status: "off",
        label: "OFF",
        times: []
      };
    }

    const startTime =
      schedule.startTime ||
      "09:00";

    const endTime =
      schedule.endTime ||
      "17:00";

    const breaks =
      Array.isArray(schedule.breaks)
        ? schedule.breaks
        : [];

    const bookings =
      getBookings();

    const times =
      generateTimeSlots(
        startTime,
        endTime,
        APPOINTMENT_LENGTH
      );

    const availableTimes =
      times.filter(time => {

        const duringBreak =
          breaks.some(item =>
            timeFallsWithinRange(
              time,
              item.start,
              item.end
            )
          );

        if (duringBreak) {
          return false;
        }

        const alreadyBooked =
          bookings.some(booking =>
            booking.barberId === barber.id &&
            booking.date === dateKey &&
            booking.time === time &&
            bookingBlocksSlot(booking)
          );

        if (alreadyBooked) {
          return false;
        }

        if (
          isBlockedByApprovedTimeOff(
            barber.name,
            dateKey,
            time
          )
        ) {
          return false;
        }

        if (
          isPastTime(
            dateKey,
            time
          )
        ) {
          return false;
        }

        return true;

      });

    if (availableTimes.length === 0) {
      return {
        available: false,
        status: "full",
        label: "FULL",
        times: []
      };
    }

    return {
      available: true,
      status: "available",
      label: "",
      times: availableTimes
    };

  }


  function renderBookingDateCalendar() {

    if (
      !bookingDateCalendar ||
      !bookingDateGrid ||
      !bookingDateMonthLabel
    ) {
      return;
    }

    const barber =
      getBookableBarberById(
        selectedBarberId
      );

    bookingDateGrid.innerHTML = "";

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const maxDate = new Date(today);
    maxDate.setDate(maxDate.getDate() + DAYS_AVAILABLE);

    const firstAllowedMonth = new Date(
      today.getFullYear(),
      today.getMonth(),
      1
    );

    const lastAllowedMonth = new Date(
      maxDate.getFullYear(),
      maxDate.getMonth(),
      1
    );

    if (bookingCalendarMonth < firstAllowedMonth) {
      bookingCalendarMonth = new Date(firstAllowedMonth);
    }

    if (bookingCalendarMonth > lastAllowedMonth) {
      bookingCalendarMonth = new Date(lastAllowedMonth);
    }

    bookingDateMonthLabel.textContent =
      bookingCalendarMonth.toLocaleDateString(
        "en-US",
        {
          month: "long",
          year: "numeric"
        }
      );

    if (bookingDatePrev) {
      bookingDatePrev.disabled =
        bookingCalendarMonth.getTime() ===
        firstAllowedMonth.getTime();
    }

    if (bookingDateNext) {
      bookingDateNext.disabled =
        bookingCalendarMonth.getTime() ===
        lastAllowedMonth.getTime();
    }

    const firstDay = new Date(
      bookingCalendarMonth.getFullYear(),
      bookingCalendarMonth.getMonth(),
      1
    );

    const daysInMonth = new Date(
      bookingCalendarMonth.getFullYear(),
      bookingCalendarMonth.getMonth() + 1,
      0
    ).getDate();

    const mondayOffset =
      (firstDay.getDay() + 6) % 7;

    for (
      let emptyIndex = 0;
      emptyIndex < mondayOffset;
      emptyIndex += 1
    ) {
      const empty = document.createElement("span");
      empty.className = "booking-date-empty";
      bookingDateGrid.appendChild(empty);
    }

    for (
      let day = 1;
      day <= daysInMonth;
      day += 1
    ) {
      const date = new Date(
        bookingCalendarMonth.getFullYear(),
        bookingCalendarMonth.getMonth(),
        day
      );

      date.setHours(0, 0, 0, 0);

      const dateKey =
        toDateInputValue(date);

      const outsideRange =
        date < today ||
        date > maxDate;

      const state =
        barber && !outsideRange
          ? getDateAvailability(
              barber,
              dateKey
            )
          : {
              available: false,
              status: "outside-range",
              label: "",
              times: []
            };

      const button =
        document.createElement("button");

      button.type = "button";
      button.className = "booking-date-day";
      button.dataset.date = dateKey;

      const number =
        document.createElement("span");
      number.className = "booking-date-number";
      number.textContent = String(day);
      button.appendChild(number);

      if (state.label) {
        const status =
          document.createElement("small");
        status.className = "booking-date-status";
        status.textContent = state.label;
        button.appendChild(status);
      }

      if (
        dateInput &&
        dateInput.value === dateKey
      ) {
        button.classList.add("is-selected");
      }

      if (!state.available) {
        button.disabled = true;
        button.classList.add("is-unavailable");

        if (state.status === "full") {
          button.classList.add("is-full");
        }

        if (state.status === "off") {
          button.classList.add("is-off");
        }
      } else {
        button.title =
          `${state.times.length} appointment time${state.times.length === 1 ? "" : "s"} available`;

        button.addEventListener(
          "click",
          () => {
            if (!dateInput) return;

            dateInput.value = dateKey;
            renderBookingDateCalendar();
            updateAvailableTimes();
          }
        );
      }

      bookingDateGrid.appendChild(button);
    }

    if (bookingDateNote) {
      bookingDateNote.textContent = barber
        ? "Gray OFF and FULL dates cannot be selected."
        : "Choose a barber to see available dates.";
    }

    if (
      barber &&
      dateInput &&
      dateInput.value
    ) {
      const selectedState =
        getDateAvailability(
          barber,
          dateInput.value
        );

      if (!selectedState.available) {
        dateInput.value = "";
        resetTimeSelect();
      }
    }

  }


  // ============================================================
  // AVAILABLE TIMES
  // ============================================================

  function updateAvailableTimes() {

    resetTimeSelect();

    const barber =
      getBookableBarberById(
        selectedBarberId
      );

    if (
      !barber ||
      !dateInput ||
      !dateInput.value
    ) {
      return;
    }

    const availability =
      getDateAvailability(
        barber,
        dateInput.value
      );

    if (!availability.available) {
      addTimeMessage(
        availability.status === "full"
          ? "This date is fully booked."
          : "This barber is not available on that day."
      );
      return;
    }

    availability.times.forEach(time => {

      const option =
        document.createElement("option");

      option.value =
        time;

      option.textContent =
        convertTo12Hour(time);

      timeSelect.appendChild(option);

    });

  }


  function bookingBlocksSlot(booking) {

    if (!booking) return false;

    const status =
      String(booking.ownerStatus || booking.status || "confirmed")
        .toLowerCase();

    if (status !== "canceled") {
      return true;
    }

    // A customer cancellation reopens the slot. An owner/employee
    // cancellation remains blocked until someone reopens it.
    return booking.slotBlocked === true;

  }


  function getApprovedTimeOff() {

    try {
      const requests = JSON.parse(
        localStorage.getItem(TIME_OFF_STORAGE_KEY) || "[]"
      );

      return Array.isArray(requests)
        ? requests.filter(request => request.status === "approved")
        : [];
    } catch {
      return [];
    }

  }


  function flexibleTimeToMinutes(value) {

    const raw = String(value || "").trim();
    const twentyFourHour = raw.match(/^(\d{1,2}):(\d{2})$/);

    if (twentyFourHour) {
      return Number(twentyFourHour[1]) * 60 + Number(twentyFourHour[2]);
    }

    const twelveHour = raw.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!twelveHour) return NaN;

    let hour = Number(twelveHour[1]) % 12;
    const minute = Number(twelveHour[2]);

    if (twelveHour[3].toUpperCase() === "PM") hour += 12;
    return hour * 60 + minute;

  }


  function isBlockedByApprovedTimeOff(barberName, dateKey, time) {

    const slotStart = flexibleTimeToMinutes(time);

    return getApprovedTimeOff().some(request => {
      if (
        String(request.employee || "").toLowerCase() !==
        String(barberName || "").toLowerCase()
      ) return false;

      if (dateKey < request.startDate || dateKey > request.endDate) {
        return false;
      }

      if (request.allDay) return true;

      const blockedStart = flexibleTimeToMinutes(request.startTime);
      const blockedEnd = flexibleTimeToMinutes(request.endTime);

      if (
        Number.isNaN(slotStart) ||
        Number.isNaN(blockedStart) ||
        Number.isNaN(blockedEnd)
      ) return true;

      return slotStart >= blockedStart && slotStart < blockedEnd;
    });

  }


  function resetTimeSelect() {

    if (!timeSelect) {
      return;
    }

    timeSelect.innerHTML = `
      <option value="">
        Select a time
      </option>
    `;

  }


  function addTimeMessage(
    message
  ) {

    if (!timeSelect) {
      return;
    }

    const option =
      document.createElement("option");

    option.value = "";
    option.disabled = true;
    option.textContent = message;

    timeSelect.appendChild(option);

  }


  function generateTimeSlots(
    startTime,
    endTime,
    intervalMinutes
  ) {

    const startMinutes =
      timeToMinutes(startTime);

    const endMinutes =
      timeToMinutes(endTime);

    const slots = [];

    for (
      let minutes = startMinutes;
      minutes + intervalMinutes <= endMinutes;
      minutes += intervalMinutes
    ) {
      slots.push(
        minutesToTime(minutes)
      );
    }

    return slots;

  }


  function timeFallsWithinRange(
    time,
    rangeStart,
    rangeEnd
  ) {

    if (
      !rangeStart ||
      !rangeEnd
    ) {
      return false;
    }

    const value =
      timeToMinutes(time);

    const start =
      timeToMinutes(rangeStart);

    const end =
      timeToMinutes(rangeEnd);

    return (
      value >= start &&
      value < end
    );

  }


  function isPastTime(
    dateValue,
    timeValue
  ) {

    const date =
      parseDateInput(dateValue);

    if (!date) {
      return false;
    }

    const [hours, minutes] =
      timeValue
        .split(":")
        .map(Number);

    date.setHours(
      hours,
      minutes,
      0,
      0
    );

    return (
      date.getTime() <=
      Date.now()
    );

  }


  // ============================================================
  // CONFIRM BOOKING
  // ============================================================

  if (confirmButton) {
    confirmButton.addEventListener(
      "click",
      confirmBooking
    );
  }

  async function confirmBooking() {

    const barber =
      getBookableBarberById(
        selectedBarberId
      );

    const service =
      getServiceById(
        serviceSelect
          ? serviceSelect.value
          : ""
      );

    const date =
      dateInput
        ? dateInput.value
        : "";

    const time =
      timeSelect
        ? timeSelect.value
        : "";

    const customerName =
      nameInput
        ? nameInput.value.trim()
        : "";

    const customerPhone =
      phoneInput
        ? phoneInput.value.trim()
        : "";

    if (!barber) {
      showBookingError(
        "Please choose a barber."
      );
      return;
    }

    if (!service) {
      showBookingError(
        "Please choose a service."
      );
      return;
    }

    if (!date) {
      showBookingError(
        "Please choose a date."
      );
      return;
    }

    if (!time) {
      showBookingError(
        "Please choose an available time."
      );
      return;
    }

    if (!customerName) {
      showBookingError(
        "Please enter your name."
      );
      return;
    }

    const formattedPhone =
      formatUSPhone(customerPhone);

    if (!formattedPhone) {
      showBookingError(
        "Please enter a valid 10-digit mobile phone number."
      );
      return;
    }

    const bookings =
      getBookings();

    const timeWasTaken =
      bookings.some(booking =>
        booking.barberId === barber.id &&
        booking.date === date &&
        booking.time === time &&
        bookingBlocksSlot(booking)
      );

    if (timeWasTaken) {
      showBookingError(
        "That appointment time was just taken. Please choose another time."
      );
      updateAvailableTimes();
      return;
    }

    const booking = {

      id:
        createBookingId(),

      shopName:
        shop.name ||
        "Barber Shop",

      barberId:
        barber.id,

      barberName:
        barber.name,

      serviceId:
        service.id,

      serviceName:
        service.name,

      servicePrice:
        Number(service.price || 0),

      date,
      time,
      customerName,

      phone:
        formattedPhone,

      smsConsent:
        Boolean(
          smsConsent &&
          smsConsent.checked
        ),

      ownerStatus:
        "pending-payment-choice",

      paymentStatus:
        "pending",

      paymentChoice:
        "",

      cancellationSource:
        "",

      slotBlocked:
        false,

      createdAt:
        new Date().toISOString()

    };

    const paymentWindow =
      window.open(
        "about:blank",
        "_blank"
      );

    if (!paymentWindow) {
      showBookingError(
        "Please allow pop-ups for this page so the secure card page can open."
      );
      return;
    }

    if (confirmButton) {
      confirmButton.disabled = true;
      confirmButton.textContent =
        "Opening Secure Card Page...";
    }

    if (confirmationMessage) {
      confirmationMessage.innerHTML = `
        <p class="sms-demo-message">
          Opening secure Stripe test card page...
        </p>
      `;
    }

    try {

      const checkoutResponse =
        await fetch(
          APPOINTMENT_CHECKOUT_URL,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json"
            },
            body:
              JSON.stringify({
                bookingId:
                  booking.id,
                shopName:
                  booking.shopName,
                barberName:
                  booking.barberName,
                serviceName:
                  booking.serviceName,
                servicePrice:
                  booking.servicePrice,
                customerName:
                  booking.customerName,
                phone:
                  booking.phone,
                appointmentDate:
                  booking.date,
                appointmentTime:
                  convertTo12Hour(
                    booking.time
                  ),
                appointmentTime24:
                  booking.time,
                smsConsent:
                  booking.smsConsent
              })
          }
        );

      const checkoutResult =
        await checkoutResponse.json();

      if (
        !checkoutResponse.ok ||
        !checkoutResult.success ||
        !checkoutResult.url ||
        !checkoutResult.sessionId
      ) {
        throw new Error(
          checkoutResult.error ||
          "The secure card page could not be opened."
        );
      }

      booking.paymentReference =
        checkoutResult.sessionId;

      paymentWindow.location.href =
        checkoutResult.url;

      if (confirmationMessage) {
        confirmationMessage.innerHTML = `
          <p class="sms-demo-message">
            Enter the test card in Stripe. After the card is saved,
            choose PAY NOW BY CARD or PAY AT STORE.
          </p>
        `;
      }

      const finalStatus =
        await waitForAppointmentConfirmation(
          checkoutResult.sessionId,
          paymentWindow
        );

      if (!finalStatus.confirmed) {
        throw new Error(
          "The appointment was not confirmed."
        );
      }

      const latestBookings =
        getBookings();

      const slotWasTaken =
        latestBookings.some(item =>
          item.barberId === barber.id &&
          item.date === date &&
          item.time === time &&
          bookingBlocksSlot(item)
        );

      if (slotWasTaken) {
        throw new Error(
          "The appointment was confirmed, but that time was already taken locally. Please contact the shop."
        );
      }

      booking.ownerStatus =
        "confirmed";

      booking.paymentChoice =
        finalStatus.paymentChoice ||
        "";

      booking.paymentStatus =
        finalStatus.paid
          ? "paid"
          : "pay-at-store";

      booking.amountPaid =
        Number(
          finalStatus.amountTotal ||
          0
        ) / 100;

            booking.manageUrl =
        finalStatus.manageUrl ||
        "";

      booking.confirmedAt =
        new Date().toISOString();

      latestBookings.push(booking);
      saveBookings(latestBookings);

      showConfirmation(booking);
      renderBookingDateCalendar();
      updateAvailableTimes();

      await sendPaidAppointmentNotifications(
        booking
      );

    } catch (error) {

      try {
        if (
          paymentWindow &&
          !paymentWindow.closed &&
          paymentWindow.location.href === "about:blank"
        ) {
          paymentWindow.close();
        }
      } catch {
        // Cross-origin Stripe window. Nothing to close here.
      }

      console.error(
        "Appointment confirmation error:",
        error
      );

      showBookingError(
        error.message ||
        "The appointment could not be completed."
      );

    } finally {

      if (confirmButton) {
        confirmButton.disabled = false;
        confirmButton.textContent =
          "Confirm Appointment";
      }

    }

  }


  async function waitForAppointmentConfirmation(
    sessionId,
    paymentWindow
  ) {

    const startedAt =
      Date.now();

    const maximumWaitMs =
      10 * 60 * 1000;

    while (
      Date.now() - startedAt <
      maximumWaitMs
    ) {

      await new Promise(resolve =>
        setTimeout(resolve, 2000)
      );

      try {

        const response =
          await fetch(
            `${APPOINTMENT_STATUS_URL}?session_id=${encodeURIComponent(sessionId)}`
          );

        const result =
          await response.json();

        if (
          response.ok &&
          result.success &&
          result.confirmed
        ) {
          return result;
        }

      } catch (error) {
        console.error(
          "Appointment status check error:",
          error
        );
      }

      if (
        paymentWindow &&
        paymentWindow.closed
      ) {

        try {

          const finalResponse =
            await fetch(
              `${APPOINTMENT_STATUS_URL}?session_id=${encodeURIComponent(sessionId)}`
            );

          const finalResult =
            await finalResponse.json();

          if (
            finalResponse.ok &&
            finalResult.success &&
            finalResult.confirmed
          ) {
            return finalResult;
          }

        } catch {
          // The final status check failed.
        }

        return {
          confirmed: false
        };

      }

    }

    return {
      confirmed: false
    };

  }


  function showBookingError(
    message
  ) {

    if (!confirmationMessage) {
      return;
    }

    confirmationMessage.innerHTML = `
      <p class="booking-error">
        ${escapeHTML(message)}
      </p>
    `;

  }


  // ============================================================
  // CONFIRMATION
  // ============================================================

  function showConfirmation(
    booking
  ) {

    if (!confirmationMessage) {
      return;
    }

    const displayDate =
      formatDisplayDate(
        booking.date
      );

    const displayTime =
      convertTo12Hour(
        booking.time
      );

    const endTime =
      addMinutes(
        booking.time,
        APPOINTMENT_LENGTH
      );

    const paymentText =
      booking.paymentChoice ===
      "pay_at_store"
        ? "Pay at Store"
        : `Paid ${formatPrice(
            Number(
              booking.amountPaid ??
              booking.servicePrice
            )
          )}`;

    const manageLink =
      booking.manageUrl
        ? `
          <p>
            <a
              href="${escapeAttribute(booking.manageUrl)}"
              target="_blank"
              rel="noopener"
            >
              Cancel or Reschedule Appointment
            </a>
          </p>
        `
        : "";

    confirmationMessage.innerHTML = `
      <div class="booking-confirmed">

        <h3>
          Appointment Confirmed ✓
        </h3>

        <p>
          <strong>
            ${escapeHTML(booking.customerName)}
          </strong>,
          you're booked with
          <strong>
            ${escapeHTML(booking.barberName)}
          </strong>.
        </p>

        <p>
          <strong>Service:</strong>
          ${escapeHTML(booking.serviceName)}
          -
          ${formatPrice(booking.servicePrice)}
        </p>

        <p>
          <strong>Date:</strong>
          ${displayDate}
        </p>

        <p>
          <strong>Time:</strong>
          ${displayTime}
          -
          ${convertTo12Hour(endTime)}
        </p>

        <p>
          <strong>Payment:</strong>
          ${escapeHTML(paymentText)}
        </p>

        <p>
          <strong>Confirmation #:</strong>
          ${escapeHTML(booking.id.slice(-6))}
        </p>

        <p
          class="sms-demo-message"
          id="notification-status-${escapeAttribute(booking.id)}"
        >
          Checking appointment notifications...
        </p>

        ${manageLink}

      </div>
    `;

  }


  // ============================================================
  // APPOINTMENT NOTIFICATIONS
  // ============================================================

  async function sendPaidAppointmentNotifications(
    booking
  ) {

    const status =
      document.getElementById(
        `notification-status-${booking.id}`
      );

    try {

      const response =
        await fetch(
          APPOINTMENT_NOTIFICATION_URL,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json"
            },
            body:
              JSON.stringify({
                sessionId:
                  booking.paymentReference
              })
          }
        );

      const result =
        await response.json();

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.error ||
          "Appointment notifications could not be sent."
        );
      }

      if (
        result.manageUrl &&
        !booking.manageUrl
      ) {
        booking.manageUrl =
          result.manageUrl;
      }

      const parts = [];

      if (booking.smsConsent) {
        parts.push(
          result.smsSent
            ? "✓ Confirmation text sent."
            : "Confirmation text could not be sent."
        );
      } else {
        parts.push(
          "SMS notifications were not selected."
        );
      }

      parts.push(
        result.emailSent
          ? "✓ Owner/barber email sent."
          : "Owner/barber email could not be sent."
      );

      if (status) {
        status.textContent =
          parts.join(" ");
      }

    } catch (error) {

      console.error(
        "Appointment notification error:",
        error
      );

      if (status) {
        status.textContent =
          "The appointment is confirmed, but the notification check failed.";
      }

    }

  }


  // ============================================================
  // CANCEL BOOKING
  // ============================================================

  function cancelAppointment(
    bookingId
  ) {

    const bookings =
      getBookings();

    const booking =
      bookings.find(
        item =>
          item.id === bookingId
      );

    if (booking) {
      booking.ownerStatus = "canceled";
      booking.cancellationSource = "Customer Cancellation";
      booking.cancellationReason = "Customer canceled appointment";
      booking.customerMessage = "";
      booking.slotBlocked = false;
      booking.cancelledAt = new Date().toISOString();
      booking.updatedAt = booking.cancelledAt;
    }

    saveBookings(bookings);

    if (
      booking &&
      confirmationMessage
    ) {

      confirmationMessage.innerHTML = `
        <div class="booking-cancelled">

          <h3>
            Appointment Cancelled
          </h3>

          <p>
            Your appointment with
            <strong>
              ${escapeHTML(booking.barberName)}
            </strong>
            has been cancelled.
          </p>

          <p>
            ${formatDisplayDate(booking.date)}
            at
            ${convertTo12Hour(booking.time)}
            is now available again.
          </p>

        </div>
      `;

    }

    updateAvailableTimes();

  }


  // ============================================================
  // STORAGE
  // ============================================================

  function getBookings() {

    try {
      return JSON.parse(
        localStorage.getItem(
          STORAGE_KEY
        )
      ) || [];
    } catch {
      return [];
    }

  }


  function saveBookings(
    bookings
  ) {

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(bookings)
    );

  }


  // ============================================================
  // POLICY LINKS
  // ============================================================

  function configurePolicyLinks() {

    const hasPrivacy =
      Boolean(
        smsSettings.privacyUrl
      );

    const hasTerms =
      Boolean(
        smsSettings.termsUrl
      );

    if (
      privacyPolicyLink &&
      hasPrivacy
    ) {
      privacyPolicyLink.href =
        smsSettings.privacyUrl;
    }

    if (
      termsPolicyLink &&
      hasTerms
    ) {
      termsPolicyLink.href =
        smsSettings.termsUrl;
    }

    if (smsPolicyLinks) {
      smsPolicyLinks.hidden =
        !(hasPrivacy && hasTerms);
    }

  }


  // ============================================================
  // BUSINESS PRO CTA SCROLL GLOW
  // ============================================================

  function configureCtaScrollGlow() {

    if (!ctaButton) {
      return;
    }

    let glowRunning = false;

    const triggerGlow = () => {

      const rect =
        ctaButton.getBoundingClientRect();

      const visible =
        rect.top < window.innerHeight &&
        rect.bottom > 0;

      if (
        !visible ||
        glowRunning
      ) {
        return;
      }

      glowRunning = true;

      ctaButton.classList.add(
        "scroll-glow"
      );

      window.setTimeout(
        () => {
          ctaButton.classList.remove(
            "scroll-glow"
          );
          glowRunning = false;
        },
        900
      );

    };

    window.addEventListener(
      "scroll",
      triggerGlow,
      {
        passive: true
      }
    );

  }


  // ============================================================
  // LOOKUPS
  // ============================================================

  function getProfileById(
    profileId
  ) {

    return profiles.find(
      profile =>
        profile.id === profileId
    ) || null;

  }


  function getBookableBarberById(
    barberId
  ) {

    return bookableBarbers.find(
      barber =>
        barber.id === barberId
    ) || null;

  }


  function getServiceById(
    serviceId
  ) {

    return services.find(
      service =>
        service.id === serviceId
    ) || null;

  }


  // ============================================================
  // HELPERS
  // ============================================================

  function getInitials(
    name
  ) {

    return String(name || "")
      .trim()
      .split(/\s+/)
      .map(
        part =>
          part.charAt(0)
      )
      .join("")
      .slice(0, 2)
      .toUpperCase();

  }


  function formatUSPhone(
    phone
  ) {

    let digits =
      String(phone || "")
        .replace(/\D/g, "");

    if (
      digits.length === 11 &&
      digits.startsWith("1")
    ) {
      digits =
        digits.slice(1);
    }

    if (digits.length !== 10) {
      return "";
    }

    return `+1${digits}`;

  }


  function formatPrice(
    value
  ) {

    const number =
      Number(value);

    if (!Number.isFinite(number)) {
      return "$0";
    }

    return number.toLocaleString(
      "en-US",
      {
        style:
          "currency",
        currency:
          "USD",
        minimumFractionDigits:
          Number.isInteger(number)
            ? 0
            : 2,
        maximumFractionDigits:
          2
      }
    );

  }


  function formatDisplayDate(
    dateValue
  ) {

    const date =
      parseDateInput(dateValue);

    if (!date) {
      return dateValue;
    }

    return date.toLocaleDateString(
      "en-US",
      {
        weekday:
          "long",
        month:
          "long",
        day:
          "numeric",
        year:
          "numeric"
      }
    );

  }


  function parseDateInput(
    value
  ) {

    if (!value) {
      return null;
    }

    const parts =
      value
        .split("-")
        .map(Number);

    if (
      parts.length !== 3 ||
      parts.some(
        part =>
          !Number.isFinite(part)
      )
    ) {
      return null;
    }

    const date =
      new Date(
        parts[0],
        parts[1] - 1,
        parts[2]
      );

    date.setHours(
      0,
      0,
      0,
      0
    );

    return date;

  }


  function toDateInputValue(
    date
  ) {

    const year =
      date.getFullYear();

    const month =
      String(
        date.getMonth() + 1
      ).padStart(2, "0");

    const day =
      String(
        date.getDate()
      ).padStart(2, "0");

    return `${year}-${month}-${day}`;

  }


  function convertTo12Hour(
    time
  ) {

    if (!time) {
      return "";
    }

    const [hourValue, minuteValue] =
      time
        .split(":")
        .map(Number);

    if (
      !Number.isFinite(hourValue) ||
      !Number.isFinite(minuteValue)
    ) {
      return time;
    }

    const period =
      hourValue >= 12
        ? "PM"
        : "AM";

    const hour =
      hourValue % 12 || 12;

    return `${hour}:${String(minuteValue).padStart(2, "0")} ${period}`;

  }


  function timeToMinutes(
    time
  ) {

    const [hours, minutes] =
      String(time || "0:0")
        .split(":")
        .map(Number);

    return (
      (Number(hours) || 0) * 60 +
      (Number(minutes) || 0)
    );

  }


  function minutesToTime(
    totalMinutes
  ) {

    const hours =
      Math.floor(
        totalMinutes / 60
      );

    const minutes =
      totalMinutes % 60;

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;

  }


  function addMinutes(
    time,
    amount
  ) {

    return minutesToTime(
      timeToMinutes(time) +
      amount
    );

  }


  function createBookingId() {

    return `BPL-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)
      .toUpperCase()}`;

  }


  function escapeHTML(
    value
  ) {

    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  }


  function escapeAttribute(
    value
  ) {
    return escapeHTML(value);
  }


  function escapeCssUrl(
    value
  ) {

    return String(value ?? "")
      .replace(/\\/g, "\\\\")
      .replace(/"/g, '\\"')
      .replace(/\n/g, "")
      .replace(/\r/g, "");

  }

});
