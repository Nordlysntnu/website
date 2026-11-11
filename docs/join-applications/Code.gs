/**
 * Receives applications from nordlysntnu.no/join and adds one row per
 * application to the "Søknader" tab of the spreadsheet this script belongs to.
 *
 * Setup: see README.md in this folder. Deploy as a web app that runs as the
 * spreadsheet owner and that anyone can call. The spreadsheet itself stays
 * private: share it with Board members only.
 */

const SHEET_NAME = 'Søknader';

// Column headers, in order. "Status" and "Notater" are for the Board.
const HEADERS = [
  'Mottatt', 'Fornavn', 'Etternavn', 'E-post', 'Telefon', 'Studieprogram',
  'Årstrinn', '1. valg', '2. valg', '3. valg', 'Om søkeren',
  'Bachelor/master-oppgave', 'Hørte om oss via', 'Status', 'Notater',
];

// Form fields sent by the website, in the same order as the columns after "Mottatt".
const FIELDS = [
  'first', 'last', 'email', 'phone', 'study', 'year', 'group1', 'group2',
  'group3', 'about', 'thesis', 'source',
];

const MAX_LENGTH = 5000;
const KEEP_MONTHS = 6; // The Join page promises applications are kept no longer than six months.

function doPost(e) {
  const data = (e && e.parameter) || {};

  // Hidden "website" field: people never see it, spam bots fill it in.
  if (data.website) return reply({ result: 'success' });

  if (!data.first || !data.last || !data.email || !data.group1) {
    return reply({ result: 'error', error: 'Missing required fields' });
  }

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const row = [new Date()].concat(FIELDS.map(field => clean(data[field])), ['Ny', '']);
    getSheet().appendRow(row);
  } finally {
    lock.releaseLock();
  }
  return reply({ result: 'success' });
}

// Run once from the editor to create the tab and headers.
function setup() {
  getSheet();
}

// Optional: add a daily time-driven trigger for this function to delete
// applications older than KEEP_MONTHS.
function removeOldApplications() {
  const sheet = getSheet();
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - KEEP_MONTHS);
  const dates = sheet.getRange(1, 1, sheet.getLastRow(), 1).getValues();
  for (let row = dates.length; row >= 2; row--) {
    const received = dates[row - 1][0];
    if (received instanceof Date && received < cutoff) sheet.deleteRow(row);
  }
}

function getSheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheetByName(SHEET_NAME) || spreadsheet.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
  }
  return sheet;
}

// Trims and shortens a value, and stops text starting with = + - @ from
// running as a spreadsheet formula.
function clean(value) {
  const text = String(value || '').trim().slice(0, MAX_LENGTH);
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

function reply(body) {
  return ContentService.createTextOutput(JSON.stringify(body))
    .setMimeType(ContentService.MimeType.JSON);
}
