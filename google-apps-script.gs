// ══════════════════════════════════════════════════════
// ZagaPrime LeadFunnel — Google Apps Script
// File: google-apps-script.gs
//
// HOW TO DEPLOY:
// 1. Open LeadFunnel Google Sheet
// 2. Extensions → Apps Script
// 3. Delete any existing code, paste ALL of this
// 4. Click Deploy → New deployment → Web app
// 5. Execute as: Me | Who has access: Anyone
// 6. Click Deploy → Copy the web app URL
// 7. Paste URL into ZagaPrime dashboard → Settings → Web App URL
// 8. Click "Sync to Sheets" — done!
// ══════════════════════════════════════════════════════

const SHEET_ID = '1Sb4_mejZZR7UuOwzc3a6CK5gjfF5NeX__g6zN0G_boM';
const LEADS_SHEET_NAME = 'Sheet1';
const ACTIVITY_SHEET_NAME = 'Activity';

// ── ENTRY POINT: receives POST from dashboard ──────────
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.openById(SHEET_ID);

    if (data.type === 'sync_leads') {
      syncLeads(ss, data.leads);
    }
    if (data.type === 'sync_activity') {
      syncActivity(ss, data.activity, data.leads);
    }
    if (data.type === 'full_sync') {
      syncLeads(ss, data.leads);
      syncActivity(ss, data.activity, data.leads);
      formatSheets(ss);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ success: true, timestamp: new Date().toISOString() }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ── GET: health check ──────────────────────────────────
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({
      status: 'ZagaPrime LeadFunnel webhook is live',
      time: new Date().toISOString(),
      sheet: SHEET_ID
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ── SYNC LEADS to Sheet1 ───────────────────────────────
function syncLeads(ss, leads) {
  let sheet = ss.getSheetByName(LEADS_SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(LEADS_SHEET_NAME);

  const headers = [
    'priority', 'business_name', 'owner_name', 'category', 'phone',
    'address', 'city', 'county', 'state', 'zip',
    'website_status', 'online_presence', 'pitch_angle', 'tier',
    'years_in_business', 'notes',
    'stage_research', 'stage_first_call', 'stage_email_sent',
    'stage_discovery_call', 'stage_proposal_sent', 'stage_follow_up',
    'stage_decision', 'stage_notes',
    'deal_value', 'last_contacted', 'next_action',
    'next_action_date', 'assigned_to', 'date_added'
  ];

  sheet.clearContents();
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

  const rows = leads.map(l => headers.map(h => {
    const stages = l._stages || {};
    if (h === 'stage_research')       return stages.research?.value || '';
    if (h === 'stage_first_call')     return stages.first_call?.value || '';
    if (h === 'stage_email_sent')     return stages.email_sent?.value || '';
    if (h === 'stage_discovery_call') return stages.discovery_call?.value || '';
    if (h === 'stage_proposal_sent')  return stages.proposal_sent?.value || '';
    if (h === 'stage_follow_up')      return stages.follow_up?.value || '';
    if (h === 'stage_decision')       return stages.decision?.value || '';
    if (h === 'stage_notes') {
      return Object.values(stages)
        .map(s => s.note)
        .filter(Boolean)
        .join(' | ');
    }
    return l[h] !== undefined ? String(l[h]) : '';
  }));

  if (rows.length > 0) {
    sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
  }

  formatSheets(ss);
}

// ── SYNC ACTIVITY to Activity sheet ───────────────────
function syncActivity(ss, activity, leads) {
  let sheet = ss.getSheetByName(ACTIVITY_SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(ACTIVITY_SHEET_NAME);

  const headers = [
    'business_name', 'category', 'city', 'tier',
    'stage', 'outcome', 'note', 'timestamp'
  ];

  sheet.clearContents();
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

  const rows = [];
  Object.entries(activity || {}).forEach(([leadId, act]) => {
    const lead = (leads || []).find(l => l.id === leadId) || {};
    Object.entries(act.stages || {}).forEach(([stageId, sv]) => {
      rows.push([
        lead.name || '',
        lead.category || '',
        lead.city || '',
        lead.tier || '',
        stageId,
        sv.value || '',
        sv.note || '',
        sv.timestamp || ''
      ]);
    });
  });

  if (rows.length > 0) {
    sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
  }
}

// ── FORMAT SHEETS ──────────────────────────────────────
function formatSheets(ss) {
  const sheet = ss.getSheetByName(LEADS_SHEET_NAME);
  if (!sheet) return;

  const lastCol = sheet.getLastColumn();
  const lastRow = sheet.getLastRow();
  if (lastCol < 1) return;

  // ── Header row: dark background, white bold text ──
  const headerRange = sheet.getRange(1, 1, 1, lastCol);
  headerRange.setBackground('#1e293b');
  headerRange.setFontColor('#ffffff');
  headerRange.setFontWeight('bold');
  headerRange.setFontSize(11);

  // Freeze header row
  sheet.setFrozenRows(1);

  // ── Color-code rows by tier ──
  if (lastRow > 1) {
    for (let i = 2; i <= lastRow; i++) {
      const tierCell = sheet.getRange(i, 14); // col 14 = tier
      const tier = tierCell.getValue();
      const rowRange = sheet.getRange(i, 1, 1, lastCol);

      // Check if won
      const decisionCol = headers_indexOf('stage_decision', sheet);
      const decision = decisionCol > 0 ? sheet.getRange(i, decisionCol).getValue() : '';

      if (decision === 'won') {
        rowRange.setBackground('#f0fdf4'); // light green
      } else if (decision && decision.startsWith('lost')) {
        rowRange.setBackground('#fff1f2'); // light red
      } else if (tier == 1) {
        rowRange.setBackground('#fef2f2'); // light red tint — hot
      } else if (tier == 2) {
        rowRange.setBackground('#fffbeb'); // light amber — warm
      } else if (tier == 3) {
        rowRange.setBackground('#eff6ff'); // light blue — long game
      }
    }
  }

  // ── Auto-resize all columns ──
  sheet.autoResizeColumns(1, lastCol);
}

function headers_indexOf(headerName, sheet) {
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const idx = headers.indexOf(headerName);
  return idx >= 0 ? idx + 1 : -1;
}
