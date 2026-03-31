/* ══════════════════════════════════════════════════════
   ZagaPrime Sales System — scripts.js
   All sales scripts, hooks, objections, emails, voicemails
   ══════════════════════════════════════════════════════ */

const SCRIPTS = {

  opener: {
    standard: {
      title: 'Standard Cold Call Opener',
      body: `Hey, is this [owner] / the owner of {BIZ}?

Hey [Name] — my name is {ME}, calling from {COMPANY}. We're a digital marketing company out of New Jersey. Super quick — got about 60 seconds?

[YES → go to hook]
[BUSY → "No problem — when's a better time to call back?"]
[WHO IS THIS → "I'm {ME} from {COMPANY} — I came across {BIZ} doing some local research and noticed something I thought you'd want to know about. Two minutes?"]`,
      note: 'Warm, confident, not scripted-sounding. The "60 seconds" gets a micro-commitment and feels respectful of their time.'
    }
  },

  hooks: {
    none: {
      title: 'No Website Hook',
      body: `So I was researching local businesses in {CITY} and came across {BIZ}. You've got great word of mouth in the area — people really speak highly of you.

But when I searched for you online, I couldn't pull up a website. And honestly — that means right now when someone in {COUNTY} types "{CATEGORY} near me" into Google, you're invisible. Those customers are going straight to your competitors.

That's exactly the problem we solve.`,
      note: 'Pause after "straight to your competitors." Let it land.'
    },
    broken: {
      title: 'Wrong / Broken Website Hook',
      body: `I want to flag something you probably don't know about: I Googled "{BIZ}" and the website coming up for your business actually belongs to a completely different company — not you at all. So right now, anyone who searches for {BIZ} gets sent somewhere else entirely.

For a business that's been part of this community for years, that's a real problem — and it's probably been happening for a while without you realizing it.`,
      note: 'PAUSE after this. Let them react. The alarm is your opening. Don\'t rush to the offer.'
    },
    competitor: {
      title: 'Competitor Gap Hook',
      body: `So I actually searched "{CATEGORY} near me" in {CITY} right before calling you — and I want to show you what came up.

[Their competitors' names] showed up at the top. {BIZ} didn't appear anywhere.

That's not a knock on you — it just means those companies are getting calls that should be going to you. And here's the thing — it's a completely fixable problem.`,
      note: 'If you can, do this search live on the call and read the results. Real-time proof is powerful.'
    },
    outdated: {
      title: 'Outdated Website Hook',
      body: `I took a look at your current website before calling. I can see you've built a real business here — but the site is running on older technology that doesn't show up well in Google search, and there's no way for people to find you when they're searching for what you do online.

For a B2B operation like {BIZ}, buyers research online before they ever pick up the phone. What your site signals to them matters.`,
      note: 'Frame as credibility/trust issue for B2B. Not about aesthetics — about what buyers think when they see it.'
    },
    weak_seo: {
      title: 'Weak SEO / Digital Marketing Hook',
      body: `I was looking at {BIZ}'s online presence before reaching out. You've got a site, which is a solid foundation — but it's not generating the inbound leads it should for a company your size.

When I search for {CATEGORY} in New Jersey, you're not showing up on the first page. Your competitors are. For a business doing your volume, that's leaving real revenue on the table every single month.`,
      note: 'For larger companies — emphasize revenue impact, not just visibility.'
    }
  },

  offer: {
    full: {
      title: 'Full Package Offer',
      body: `What we do is a full digital presence package — three things together:

One: a professional website — clean, fast, and built to show up on Google.

Two: Google Ads — so when someone searches for {CATEGORY} in {CITY} right now, {BIZ} shows up at the top instead of your competitors.

Three: local SEO — we optimize everything so you rank in Google Maps and organic search without paying per click every time.

Most of our clients start seeing new inquiries within the first 30 days. We're a local NJ company, we handle everything, and pricing is designed for small businesses.

I'd love to do a free 15-minute call to show you exactly what we'd build for {BIZ}. No pressure. Would [Day] or [Day] work?`,
      note: 'Number the three items. People remember numbered lists. Always end by offering two specific days.'
    }
  },

  close: {
    soft: {
      title: 'Soft Close — Schedule Call',
      body: `I'd love to put together a free look at exactly what we'd build for {BIZ} — no cost, no commitment. Takes about 15 minutes.

Would [DAY] or [DAY] work for a quick call this week?`,
      note: 'Always offer two specific days. "Would Tuesday or Thursday work better for you?" assumes yes and just asks which day.'
    },
    sendInfo: {
      title: 'Send Info Close',
      body: `Absolutely — what's the best email to send it to?

And real quick before I let you go: are you getting any customers from online right now or is it mostly word of mouth?

[Listen] — got it. I'll send you something tailored to your situation. Look for it from {EMAIL} — and I'll follow up in a couple days to make sure you got it.`,
      note: 'Get their email. Ask a discovery question. Follow up same day.'
    },
    hard: {
      title: 'Hard Close — After Proposal',
      body: `Hey {NAME}, {ME} from {COMPANY} — just checking you got the proposal I sent over. Did you get a chance to look at it?

[If yes] — Perfect. What did you think?
[If no] — No worries, I'll forward it again right now. Can you check your email in the next 10 minutes?

The reason I'm following up is that I've already got a slot open to start your site this week — I want to make sure I can hold it for you.`,
      note: '"I have a slot open" creates real urgency without being fake. Only say this if it\'s true.'
    }
  },

  email: {
    standard: {
      title: 'Standard Email — Full Package',
      subject: '{BIZ} — people are searching online and can\'t find you',
      body: `Hi [Name],

My name is {ME} — I run {COMPANY}, a digital marketing company based in New Jersey.

I came across {BIZ} while researching local {CITY} businesses. {PITCH_ANGLE}.

Here's what we'd put together for {BIZ}:

→ A professional website that shows up when people search for {CATEGORY} in {CITY}
→ Google Ads that put you at the top when someone searches right now
→ Local SEO so you rank in Google Maps and start generating leads without paying per click

Most of our clients see new inquiries within the first 30 days.

Would you be open to a free 15-minute call this week? I'd love to show you exactly what we'd build.

— {ME}
{COMPANY} | {EMAIL} | {PHONE}`,
      note: 'Send same day after a call attempt. Personalize the subject line — that\'s what gets opened.'
    },
    broken: {
      title: 'URGENT: Wrong Website Email',
      subject: 'Heads up — your website is sending customers to the wrong business',
      body: `Hi [Name],

My name is {ME} — I'm with {COMPANY}, a digital marketing company based in New Jersey.

I want to flag something important: I searched for {BIZ} in {CITY}, and the website showing up for your business actually belongs to a completely different company — not you. Anyone who Googles you right now gets sent somewhere else entirely.

For a business that's been part of this community for as long as {BIZ} has, that's a real problem — and it's probably been happening without you knowing.

We'd fix this and build on it:
→ A proper website that actually represents {BIZ}
→ Google Ads so customers searching for {CATEGORY} in {CITY} find you at the top
→ Local SEO that gets you correctly ranked in Google Maps

I'd love to get on a quick 15-minute call to show you what we'd do. No cost to talk.

— {ME}
{COMPANY} | {EMAIL} | {PHONE}`,
      note: 'Lead with this one for Made In the Shade. Wrong website is instant urgency — they didn\'t know, and now they need to act.'
    }
  },

  voicemail: {
    standard: {
      title: 'Standard Voicemail',
      body: `Hey [Name], this is {ME} calling from {COMPANY}. I was doing some research on local businesses in {CITY} and came across {BIZ} — I noticed something about your online presence that I thought you'd want to know about. It'll only take a couple minutes to explain.

Give me a call back at {PHONE} — that's {PHONE}. Thanks.`,
      note: 'Under 25 seconds. Don\'t say what you found. Curiosity gaps get callbacks. Say number twice, slowly.'
    },
    urgent: {
      title: 'Urgent Voicemail — Broken Site',
      body: `Hey, this is {ME} from {COMPANY}. I was searching for {BIZ} online and found something that's actively sending your customers to the wrong business — a completely different company. Wanted to let you know about it and show you how to fix it quickly. Call me back at {PHONE}. Again — {PHONE}. Thanks.`,
      note: 'Specific urgency language gets higher callback rates. Use only for broken site leads.'
    },
    followUp: {
      title: 'Follow-Up Voicemail — 2nd Attempt',
      body: `Hey [Name], {ME} again from {COMPANY} — left you a message a few days ago. I know you're busy so I'll make it quick: I looked up {BIZ} on Google and your competitors are showing up when people search {CATEGORY}. I'd love to show you what it would take to change that — free, 15 minutes. Call or text me at {PHONE}. Thanks, [Name].`,
      note: 'Don\'t mention you called before unless they ask. Different time of day than first call.'
    }
  },

  objections: [
    {
      q: 'I don\'t need a website — word of mouth works fine',
      a: `That's great to hear — it means you've built something real. Here's the thing: word of mouth now starts online. When someone hears about you from a friend, the first thing they do is search your name to confirm you're still open and see what you do. If they can't find you, some of them don't show up. A website just makes sure the reputation you've already built actually converts into customers walking through the door.`
    },
    {
      q: 'I already have a Facebook page',
      a: `Facebook is great for the people who already follow you. But when someone Googles "{CATEGORY} near me," Facebook pages almost never show up in those results. A website is what Google actually ranks — it's a completely different audience. People actively searching for what you do right now.`
    },
    {
      q: 'I tried Google Ads before and it didn\'t work',
      a: `I hear that a lot — and honestly, most of the time it's because the campaign wasn't set up correctly. Google Ads done wrong burns money fast. Done right, it's the most targeted advertising that exists. We manage everything — targeting, budget, ad copy, and the page the ad sends people to. What did the setup look like when you tried it before?`
    },
    {
      q: 'What does this cost?',
      a: `I want to be straight with you, not give you a vague answer. Our full package — website, Google Ads management, and local SEO — is $2,400 to set up, plus $800 a month after that. Ad spend is separate and you control it — we recommend starting at $300–$500 a month. Most clients see a return within 30–60 days. Can I show you what that would look like specifically for {BIZ}?`
    },
    {
      q: 'I\'m too busy to deal with this',
      a: `That's exactly why we handle everything. You don't build it, you don't manage it — you just approve it. We do one call to get the info we need, build it, show you, done. Most owners spend less than two hours total from kickoff to going live. Is there a better time in the next couple weeks when things slow down a bit?`
    },
    {
      q: 'I need to think about it',
      a: `Of course — totally fair. Can I ask what the main thing you're weighing? Is it budget, timing, or just not sure it'll work for your type of business? I want to make sure whatever I send you actually answers the right question. And I'll follow up in a week — does [Day] work to reconnect for just 10 minutes?`
    },
    {
      q: 'Can I just do the website for now?',
      a: `Absolutely — we can start there. I'd just want you to know: a website without traffic is like opening a store with no sign out front. The SEO and ads are what drive people to it. But if starting with the site makes sense right now, we build it ready to plug ads and SEO in the moment you're ready — no starting over, no additional cost.`
    },
    {
      q: 'I need to talk to my partner/wife first',
      a: `That makes complete sense — I'd want to make that decision together too. Can I send you something simple that explains what we do and the pricing so you have something concrete to review together? What's the best email? And when should I follow back up?`
    }
  ]
};

// Stage definitions for the sales checklist
const STAGES_DEF = [
  {
    id: 'research', label: 'Research Done',
    options: [{ v: 'done', l: '✓ Done', t: 'success' }],
    note: false
  },
  {
    id: 'first_call', label: 'First Call Attempt',
    options: [
      { v: 'no_answer', l: 'No Answer', t: 'fail' },
      { v: 'voicemail', l: 'Left Voicemail', t: 'neutral' },
      { v: 'not_interested', l: 'Not Interested', t: 'fail' },
      { v: 'interested', l: 'Interested', t: 'success' },
      { v: 'call_scheduled', l: 'Call Scheduled', t: 'success' }
    ],
    note: true
  },
  {
    id: 'email_sent', label: 'Email Sent',
    options: [
      { v: 'sent', l: '✓ Sent', t: 'info' },
      { v: 'no_email', l: 'No Email Found', t: 'fail' }
    ],
    note: false
  },
  {
    id: 'discovery_call', label: 'Discovery Call',
    options: [
      { v: 'scheduled', l: 'Scheduled', t: 'info' },
      { v: 'completed', l: '✓ Completed', t: 'success' },
      { v: 'cancelled', l: 'Cancelled', t: 'fail' },
      { v: 'skipped', l: 'Skip', t: 'neutral' }
    ],
    note: true
  },
  {
    id: 'proposal_sent', label: 'Proposal Sent',
    options: [
      { v: 'sent', l: '✓ Proposal Sent', t: 'success' },
      { v: 'not_ready', l: 'Not Ready Yet', t: 'neutral' }
    ],
    note: false
  },
  {
    id: 'follow_up', label: 'Follow-Up',
    options: [
      { v: 'attempted', l: 'Attempted', t: 'neutral' },
      { v: 'responded', l: 'Responded', t: 'success' },
      { v: 'ghosted', l: 'Ghosted', t: 'fail' }
    ],
    note: true
  },
  {
    id: 'decision', label: 'Final Decision',
    options: [
      { v: 'won', l: '✅ Won', t: 'success' },
      { v: 'lost_price', l: '❌ Lost — Price', t: 'fail' },
      { v: 'lost_timing', l: '❌ Lost — Timing', t: 'fail' },
      { v: 'lost_competitor', l: '❌ Lost — Competitor', t: 'fail' },
      { v: 'nurture', l: '🔁 Nurture Later', t: 'neutral' }
    ],
    note: true
  }
];

if (typeof module !== 'undefined') module.exports = { SCRIPTS, STAGES_DEF };
