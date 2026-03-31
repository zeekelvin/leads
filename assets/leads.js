/* ══════════════════════════════════════════════════════
   ZagaPrime Sales System — leads.js
   All verified NJ leads — no website confirmed
   ══════════════════════════════════════════════════════ */

const INITIAL_LEADS = [
  {
    id: 'L001', priority: 1,
    name: 'Made In the Shade', owner: null,
    category: 'Antique / Lamp Shop',
    address: '125 Main St', city: 'Andover', county: 'Sussex County', state: 'NJ', zip: '07821',
    phone: '(973) 786-7501', email: null,
    websiteStatus: 'broken',
    onlinePresence: 'Wrong website listed — goes to an unrelated jewelry maker',
    pitchAngle: 'Wrong website is actively sending your customers to a different company — urgent and fixable',
    hookType: 'broken', tier: 1, yearsInBusiness: '25+', googleRating: null,
    notes: 'PRIORITY LEAD. 25+ years on Main Street. Anyone who Googles "Made In the Shade Andover" gets sent to a completely different company. They almost certainly don\'t know this. Open with the broken website revelation.'
  },
  {
    id: 'L002', priority: 2,
    name: 'Country Classic Haircutters', owner: null,
    category: 'Hair Salon',
    address: '189 Main St', city: 'Andover', county: 'Sussex County', state: 'NJ', zip: '07821',
    phone: '(973) 786-5179', email: null,
    websiteStatus: 'none',
    onlinePresence: 'Directory listings only — no website, no social found',
    pitchAngle: 'Online booking system = new clients on autopilot, fewer no-shows, appointments booked 24/7',
    hookType: 'none', tier: 1, yearsInBusiness: null, googleRating: null,
    notes: 'No website, no booking system. Walk-in only. Best pitch: booking system pays for itself in first month through reduced no-shows and after-hours bookings.'
  },
  {
    id: 'L003', priority: 3,
    name: 'F&J Auto & Truck Repairs', owner: 'Frank',
    category: 'Auto Repair',
    address: 'Andover area', city: 'Andover', county: 'Sussex County', state: 'NJ', zip: '07821',
    phone: null, email: null,
    websiteStatus: 'none',
    onlinePresence: 'YellowPages + Nextdoor only — no website',
    pitchAngle: 'Mechanic searches on Google are high-intent — people call whoever shows up first when their car breaks',
    hookType: 'none', tier: 1, yearsInBusiness: null, googleRating: null,
    notes: 'Owner is Frank. Great local rep — "hidden jewel in Sussex County" per a YP reviewer. Auto repair is one of the best Google Ads niches — high urgency, high local intent. Zero digital presence.'
  },
  {
    id: 'L004', priority: 4,
    name: 'Green Visions Landscaping', owner: null,
    category: 'Landscaping',
    address: '3A Smith St', city: 'Andover', county: 'Sussex County', state: 'NJ', zip: '07821',
    phone: '(973) 786-7982', email: null,
    websiteStatus: 'none',
    onlinePresence: 'D&B and Manta listings — unclaimed, no website',
    pitchAngle: 'Competitors showing up on Google for "landscaper near me" — you\'re invisible, they\'re getting your leads',
    hookType: 'competitor', tier: 1, yearsInBusiness: '24+', googleRating: null,
    notes: 'In business since 2001. Zero web presence. Landscaping is one of the highest-converting Google Ads niches — homeowners searching = ready to hire. Show them a live Google search on the call.'
  },
  {
    id: 'L005', priority: 5,
    name: 'Fancy Pants Kids Consignment', owner: null,
    category: 'Kids Consignment',
    address: '127 Main St', city: 'Andover', county: 'Sussex County', state: 'NJ', zip: '07821',
    phone: '(973) 786-5278', email: null,
    websiteStatus: 'none',
    onlinePresence: 'Nextdoor listing only — no website, no Instagram',
    pitchAngle: 'Parents search before they drive — boutique site + Google Ads = shoppers planning trips to Andover find you first',
    hookType: 'none', tier: 1, yearsInBusiness: null, googleRating: null,
    notes: 'Described in press as "feels like an upscale boutique, not a consignment shop." Strong positioning, zero digital return on it. Parents absolutely research consignment shops before making the drive.'
  },
  {
    id: 'L006', priority: 6,
    name: "Cahill's Farm", owner: null,
    category: 'Farm / Garden Center',
    address: '311 Pequest Rd', city: 'Andover', county: 'Sussex County', state: 'NJ', zip: '07821',
    phone: '(973) 786-5429', email: null,
    websiteStatus: 'none',
    onlinePresence: 'Facebook only — no website',
    pitchAngle: '47 years of community trust with zero Google visibility — seasonal Google Ads = consistent farm market traffic',
    hookType: 'none', tier: 1, yearsInBusiness: '47+', googleRating: null,
    notes: 'Family farm since 1977. Facebook is their only online presence. Strong angle: "You\'ve been here 47 years — people who don\'t already know you can\'t find you online."'
  },
  {
    id: 'L007', priority: 7,
    name: 'ReStyle ReSale Boutique', owner: 'Carolyn',
    category: 'Vintage / Resale',
    address: '127 Main St', city: 'Andover', county: 'Sussex County', state: 'NJ', zip: '07821',
    phone: null, email: null,
    websiteStatus: 'none',
    onlinePresence: 'Google Maps + Nextdoor only — no website, phone unlisted',
    pitchAngle: 'Vintage market is booming — boutique site + Google Ads reaches shoppers who search before they drive',
    hookType: 'none', tier: 1, yearsInBusiness: '15+', googleRating: null,
    notes: 'Owner is Carolyn. 15+ years in business. No phone listed publicly. Match her curation aesthetic in the pitch — this shop has personality, your site pitch should reflect that.'
  },
  {
    id: 'L008', priority: 8,
    name: 'Great Andover Antique Village', owner: null,
    category: 'Antique Mall',
    address: '122 Main St', city: 'Andover', county: 'Sussex County', state: 'NJ', zip: '07821',
    phone: '(973) 786-6384', email: null,
    websiteStatus: 'none',
    onlinePresence: 'Facebook + directory listings only',
    pitchAngle: 'Antique shoppers plan trips online — photo-forward site + Google Ads = destination buyers finding you before they drive out',
    hookType: 'none', tier: 1, yearsInBusiness: null, googleRating: null,
    notes: '5-building antique complex on Main St. High foot traffic already. Best angle: destination shopping behavior — people Google and look at photos before committing to a drive.'
  },
  {
    id: 'L009', priority: 9,
    name: 'APC Thrift Store', owner: null,
    category: 'Thrift Retail',
    address: '15 Lenape Rd', city: 'Andover', county: 'Sussex County', state: 'NJ', zip: '07821',
    phone: null, email: null,
    websiteStatus: 'none',
    onlinePresence: 'Google Maps pin only — no reviews, no phone, no rating',
    pitchAngle: 'Thrift is booming — getting found on Google = consistent foot traffic without spending on ads',
    hookType: 'none', tier: 1, yearsInBusiness: null, googleRating: null,
    notes: 'Extremely limited presence. No phone listed, no reviews. Very limited hours (Wed & Sat only). Harder cold call — may need walk-in approach. Lowest phone contact probability.'
  },
  {
    id: 'L010', priority: 10,
    name: 'Blind Brook Farm', owner: null,
    category: 'Farm',
    address: '70 Goodale Rd', city: 'Newton', county: 'Sussex County', state: 'NJ', zip: '07860',
    phone: '(973) 699-0489', email: null,
    websiteStatus: 'none',
    onlinePresence: 'County farm directory only — no web presence',
    pitchAngle: 'Seasonal Google Ads: firewood buyers in fall, lambs in spring, boarding year-round = direct sales without phone tag',
    hookType: 'none', tier: 1, yearsInBusiness: null, googleRating: null,
    notes: 'Horse boarding, lambs, firewood. Phone-only business. Frame Google Ads as a seasonal faucet — turn it on when demand peaks.'
  },
  {
    id: 'L011', priority: 11,
    name: 'Brickyard Farm', owner: null,
    category: 'Farm',
    address: '50 Greendale Rd', city: 'Newton', county: 'Sussex County', state: 'NJ', zip: '07860',
    phone: '(973) 919-0309', email: null,
    websiteStatus: 'none',
    onlinePresence: 'County farm directory only — zero digital footprint',
    pitchAngle: 'Local food demand is up — zero competition online in this niche means first-mover Google advantage',
    hookType: 'none', tier: 1, yearsInBusiness: null, googleRating: null,
    notes: 'Free range eggs, raw fleece, wool. Zero digital presence. Local food buyers are habitual online searchers. First-mover advantage since there are few competitors online in this specific niche.'
  },
  {
    id: 'L012', priority: 12,
    name: 'Advantage EDM', owner: 'Alex Gilsenan',
    category: 'B2B / Wire EDM Manufacturing',
    address: '38 Route 206', city: 'Andover', county: 'Sussex County', state: 'NJ', zip: '07821',
    phone: '(973) 786-0177', email: null,
    websiteStatus: 'outdated',
    onlinePresence: 'advantageedm.com — live but built on 2000s-era .asp tech, no SEO, no Google Ads',
    pitchAngle: 'B2B buyers research online before calling — an outdated site signals the wrong thing to procurement teams doing due diligence',
    hookType: 'outdated', tier: 2, yearsInBusiness: null, googleRating: null,
    notes: 'President: Alex Gilsenan. Address him directly. Old ASP website = immediate credibility problem for B2B buyers. Each new B2B machining client is worth thousands. Email first, then call. This is your highest-value potential deal.'
  },
  {
    id: 'L013', priority: 13,
    name: 'Sutherland Packaging', owner: null,
    category: 'B2B Packaging Manufacturing',
    address: '254 Brighton Rd', city: 'Andover', county: 'Sussex County', state: 'NJ', zip: '07821',
    phone: '(973) 786-5141', email: null,
    websiteStatus: 'outdated',
    onlinePresence: 'sutherlandpackaging.com — exists but weak SEO and low inbound performance',
    pitchAngle: '$15M company leaving B2B leads on the table through weak digital marketing — LinkedIn + Google = more inbound',
    hookType: 'weak_seo', tier: 3, yearsInBusiness: '60+', googleRating: null,
    notes: '51-200 employees, ~$15M revenue. They have marketing resources — pitch is digital marketing strategy, not a basic website build. Likely need to reach sales/marketing dept, not just the owner.'
  }
];

// Export for use in main app
if (typeof module !== 'undefined') module.exports = { INITIAL_LEADS };
