
TomsPC, Connected


















Businessstore · JS
// ============================================================
// BUSINESS PRO — SHARED BUSINESS DATA STORE
//
// This is the "backbone" piece that was missing: a single,
// server-side, file-persisted store for every business onboarded
// onto Business Pro (name, owner, subscription status, employees,
// appointments, photos, announcements, services, schedules,
// financials, support notes, and an admin activity log).
//
// Previously, ADMIN_ACODE/admin.html kept this in the browser's
// localStorage, which meant:
//   - data lived only on whichever computer/browser opened admin.html
//   - it did not survive a new browser, a cleared cache, or being
//     opened on a different machine
//   - the owner dashboard and customer site had no way to see it
//
// This module gives every business a real, shared record on disk
// (data/businesses.json), and server.js exposes it over a small
// REST API (see the "BUSINESS PRO ADMIN API" section in server.js)
// so admin.html (and eventually owner.html) can read/write it from
// anywhere instead of trapping it in one browser.
//
// NOTE: a flat JSON file is fine for one dev/demo server. Once
// Business Pro has real paying, concurrent customers, swap this
// module's internals for a real database (Postgres/SQLite/etc.)
// without needing to change the API routes or the admin UI, since
// everything goes through the functions below.
// ============================================================
 
const fs = require("fs");
const path = require("path");
 
const DATA_DIR = path.join(__dirname, "..", "data");
const DATA_FILE = path.join(DATA_DIR, "businesses.json");
 
const RECORD_AREAS = [
  "appointments",
  "employees",
  "photos",
  "announcements",
  "services",
  "schedules",
  "financials"
];
 
const DEFAULT_BUSINESSES = [
  {
    id: "business-001",
    name: "Demo Barbershop",
    owner: "owner@demo.local",
    trial: "Active",
    subscription: "Trial",
    status: "active",
    notes: "",
    records: {},
    activity: []
  },
  {
    id: "business-002",
    name: "Sample Barber Studio",
    owner: "owner@sample.local",
    trial: "Active",
    subscription: "Active",
    status: "active",
    notes: "",
    records: {},
    activity: []
  }
];
 
function defaultRecordsFor(business) {
  return {
    appointments: [{ id: "appointment-1", title: "Test Customer — Barber 1", detail: "Confirmed • Today • 9:00 AM", status: "confirmed" }],
    employees: ["Barber 1", "Barber 2", "Barber 3", "Barber 4"].map((name, index) => ({
      id: `barber-${index + 1}`,
      title: name,
      detail: "Owner-managed barber placeholder",
      status: "active"
    })),
    photos: [{ id: "photo-1", title: "Business profile photo", detail: "Owner-approved photo record", status: "active" }],
    announcements: [{ id: "announcement-1", title: "Welcome promotion", detail: "Shop-wide • Expires in test data", status: "PENDING" }],
    services: [{ id: "service-1", title: "Haircut", detail: "$30 • 30 minutes", status: "active" }],
    schedules: [{ id: "schedule-1", title: "Barber 1 weekly schedule", detail: "Mon–Sat • 9:00 AM–5:00 PM", status: "active" }],
    financials: [{ id: "expense-1", title: "Test operating expense", detail: "$100 • Unpaid", status: "unpaid" }]
  };
}
 
function ensureFile() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) {
    const seeded = DEFAULT_BUSINESSES.map(business => ({
      ...business,
      records: defaultRecordsFor(business)
    }));
    fs.writeFileSync(DATA_FILE, JSON.stringify(seeded, null, 2));
  }
}
 
function readAll() {
  ensureFile();
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("businessStore: failed to read data file, starting empty.", error);
    return [];
  }
}
 
function writeAll(businesses) {
  ensureFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(businesses, null, 2));
}
 
function listBusinesses() {
  return readAll();
}
 
function getBusiness(id) {
  return readAll().find(business => business.id === id) || null;
}
 
function createBusiness({ id, name, owner }) {
  const businesses = readAll();
  if (!id || !name) throw new Error("id and name are required");
  if (businesses.some(business => business.id === id)) {
    throw new Error(`Business id "${id}" already exists`);
  }
  const business = {
    id,
    name,
    owner: owner || "owner@pending.local",
    trial: "Active",
    subscription: "Trial",
    status: "active",
    notes: "",
    records: defaultRecordsFor({ id, name }),
    activity: []
  };
  businesses.push(business);
  writeAll(businesses);
  return business;
}
 
function updateBusinessProfile(id, { owner, trial, subscription }) {
  const businesses = readAll();
  const business = businesses.find(item => item.id === id);
  if (!business) throw new Error(`Business "${id}" not found`);
  if (owner !== undefined) business.owner = owner;
  if (trial !== undefined) business.trial = trial;
  if (subscription !== undefined) business.subscription = subscription;
  writeAll(businesses);
  return business;
}
 
function setBusinessStatus(id, status) {
  const businesses = readAll();
  const business = businesses.find(item => item.id === id);
  if (!business) throw new Error(`Business "${id}" not found`);
  business.status = status;
  writeAll(businesses);
  return business;
}
 
function setNotes(id, notes) {
  const businesses = readAll();
  const business = businesses.find(item => item.id === id);
  if (!business) throw new Error(`Business "${id}" not found`);
  business.notes = notes || "";
  writeAll(businesses);
  return business;
}
 
function logActivity(id, { action, area, protectedAction }) {
  const businesses = readAll();
  const business = businesses.find(item => item.id === id);
  if (!business) throw new Error(`Business "${id}" not found`);
  business.activity = business.activity || [];
  business.activity.unshift({
    at: new Date().toISOString(),
    businessId: id,
    action,
    area,
    protected: protectedAction ? "YES" : "NO"
  });
  business.activity = business.activity.slice(0, 100);
  writeAll(businesses);
  return business.activity;
}
 
function ensureRecords(business) {
  business.records = business.records || {};
  const defaults = defaultRecordsFor(business);
  RECORD_AREAS.forEach(area => {
    if (!Array.isArray(business.records[area])) business.records[area] = defaults[area];
  });
  return business.records;
}
 
function getRecords(id, area) {
  const business = getBusiness(id);
  if (!business) throw new Error(`Business "${id}" not found`);
  if (!RECORD_AREAS.includes(area)) throw new Error(`Unknown record area "${area}"`);
  return ensureRecords(business)[area];
}
 
function addRecord(id, area, record) {
  if (!RECORD_AREAS.includes(area)) throw new Error(`Unknown record area "${area}"`);
  const businesses = readAll();
  const business = businesses.find(item => item.id === id);
  if (!business) throw new Error(`Business "${id}" not found`);
  const records = ensureRecords(business);
  const newRecord = {
    id: record.id || `${area}-${Date.now()}`,
    title: record.title || `New ${area.slice(0, -1)} record`,
    detail: record.detail || "Created in selected business context",
    status: record.status || (area === "announcements" ? "PENDING" : "active")
  };
  records[area].push(newRecord);
  writeAll(businesses);
  return newRecord;
}
 
function updateRecord(id, area, recordId, changes) {
  if (!RECORD_AREAS.includes(area)) throw new Error(`Unknown record area "${area}"`);
  const businesses = readAll();
  const business = businesses.find(item => item.id === id);
  if (!business) throw new Error(`Business "${id}" not found`);
  const records = ensureRecords(business);
  const record = records[area].find(item => item.id === recordId);
  if (!record) throw new Error(`Record "${recordId}" not found in ${area}`);
  Object.assign(record, changes);
  writeAll(businesses);
  return record;
}
 
module.exports = {
  RECORD_AREAS,
  listBusinesses,
  getBusiness,
  createBusiness,
  updateBusinessProfile,
  setBusinessStatus,
  setNotes,
  logActivity,
  getRecords,
  addRecord,
  updateRecord
};
 
