const GOOGLE_PLACES_SEARCH_URL = 'https://places.googleapis.com/v1/places:searchText';
const FIELD_MASK = [
  'places.id',
  'places.displayName',
  'places.formattedAddress',
  'places.nationalPhoneNumber',
  'places.websiteUri',
  'places.googleMapsUri',
  'places.primaryTypeDisplayName',
  'places.addressComponents',
  'places.businessStatus'
].join(',');

function sendJson(res, statusCode, payload) {
  if (typeof res.status === 'function' && typeof res.json === 'function') {
    return res.status(statusCode).json(payload);
  }
  res.statusCode = statusCode;
  if (typeof res.setHeader === 'function') {
    res.setHeader('Content-Type', 'application/json');
  }
  res.end(JSON.stringify(payload));
}

function getQuery(req) {
  if (req.query) return req.query;
  const url = new URL(req.url || '/', 'http://localhost');
  return Object.fromEntries(url.searchParams.entries());
}

function pickAddressComponent(place, type, field = 'longText') {
  const match = (place.addressComponents || []).find((component) => (component.types || []).includes(type));
  if (!match) return '';
  return match[field] || match.longText || match.shortText || '';
}

function buildTextQuery(params) {
  const subject = params.category || 'businesses';
  const location = [params.city, params.county, params.state].filter(Boolean).join(', ');
  return location ? `${subject} in ${location}` : subject;
}

function calculateTier(prospect) {
  if (prospect.phone && prospect.city && prospect.category) return 1;
  if (prospect.phone) return 2;
  return 3;
}

function buildPitchAngle(prospect) {
  const category = (prospect.category || 'business').toLowerCase();
  return `No website found. Pitch a fast mobile site, simple lead capture, and local search cleanup for this ${category}.`;
}

function normalizeResult(place, params) {
  const city = pickAddressComponent(place, 'locality') || params.city || '';
  const county = pickAddressComponent(place, 'administrative_area_level_2') || params.county || '';
  const state = pickAddressComponent(place, 'administrative_area_level_1', 'shortText') || params.state || '';
  const zip = pickAddressComponent(place, 'postal_code') || '';
  const category = (place.primaryTypeDisplayName && place.primaryTypeDisplayName.text) || params.category || 'Business';
  const prospect = {
    externalId: place.id,
    source: 'google_places',
    name: (place.displayName && place.displayName.text) || 'Unknown business',
    category,
    address: place.formattedAddress || '',
    city,
    county,
    state,
    zip,
    phone: place.nationalPhoneNumber || '',
    mapsUrl: place.googleMapsUri || '',
    websiteStatus: place.websiteUri ? 'has_site' : 'none'
  };
  prospect.tier = calculateTier(prospect);
  prospect.pitchAngle = buildPitchAngle(prospect);
  prospect.notes = `Live search match from Google Places. No website listed. ${prospect.mapsUrl ? `Maps URL: ${prospect.mapsUrl}` : ''}`.trim();
  return prospect;
}

function dedupeResults(results) {
  const seen = new Set();
  return results.filter((result) => {
    const key = `${String(result.name).toLowerCase()}|${String(result.address).toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function extractGoogleError(text) {
  try {
    const payload = JSON.parse(text);
    return payload.error && payload.error.message ? payload.error.message : 'Google Places request failed.';
  } catch (err) {
    return text || 'Google Places request failed.';
  }
}

module.exports = async function handler(req, res) {
  if (req.method && req.method !== 'GET') {
    return sendJson(res, 405, { ok: false, error: 'Method not allowed.' });
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    return sendJson(res, 500, {
      ok: false,
      error: 'Live lead search is not configured yet. Set GOOGLE_PLACES_API_KEY in your Vercel environment variables.'
    });
  }

  const query = getQuery(req);
  const params = {
    state: String(query.state || '').trim(),
    county: String(query.county || '').trim(),
    city: String(query.city || '').trim(),
    category: String(query.category || '').trim()
  };

  if (!params.state && !params.county && !params.city && !params.category) {
    return sendJson(res, 400, {
      ok: false,
      error: 'Provide at least a state, county, city, or category to search.'
    });
  }

  const textQuery = buildTextQuery(params);

  try {
    const upstream = await fetch(GOOGLE_PLACES_SEARCH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': FIELD_MASK
      },
      body: JSON.stringify({
        textQuery,
        pageSize: 20,
        regionCode: 'US'
      })
    });

    const rawText = await upstream.text();
    if (!upstream.ok) {
      return sendJson(res, upstream.status, {
        ok: false,
        error: extractGoogleError(rawText)
      });
    }

    const payload = rawText ? JSON.parse(rawText) : {};
    const results = dedupeResults(
      (payload.places || [])
        .filter((place) => place.businessStatus !== 'CLOSED_PERMANENTLY')
        .map((place) => normalizeResult(place, params))
        .filter((result) => result.websiteStatus === 'none')
    );

    return sendJson(res, 200, {
      ok: true,
      query: textQuery,
      searched_at: new Date().toISOString(),
      results
    });
  } catch (err) {
    return sendJson(res, 500, {
      ok: false,
      error: `Live lead search failed: ${err.message}`
    });
  }
};
