// GP clinic offer: one source for the /gp-clinics/ page, its structured data, the Rule 21 self-check and llms.txt.
// Prices are ex GST. Keep wording to "help you meet" Rule 21; never promise compliance.

export const GP = {
  href: "/gp-clinics/",
  guideHref: "/gp-clinics/rule-21-guide/",
  pdf: "/gp-clinics/studio-narrm-gp-clinic-offer.pdf",
  checkSubject: "Free Rule 21 check",
  regions: ["Gippsland", "Western Victoria", "the Murray region", "the rest of regional and rural Victoria"],
  reviewed: "2026-10-22",
};

export const SOURCES = [
  ["My Health Records Rules 2026 (Federal Register of Legislation)", "https://www.legislation.gov.au/F2026L00392/asmade/text"],
  ["Participation obligations (Australian Digital Health Agency)", "https://www.digitalhealth.gov.au/healthcare-providers/initiatives-and-programs/my-health-record/register-and-set-up-access/participation-obligations"],
  ["My Health Record security and access policy update (Gippsland PHN)", "https://gphn.org.au/latest-news/mhr-security-access/"],
  ["General practice digital health maturity (Western Victoria PHN)", "https://westvicphn.com.au/?p=18467"],
];

// What Rule 21 asks for, as described in the sources above.
export const RULE21 = [
  ["A written Security and Access Policy", "Tailored to your practice and covering everything the rule requires. It applies to every practice that uses My Health Record, whatever its size."],
  ["Managed user access", "How accounts are created, changed, suspended and removed, how often access is reviewed, and making sure every user can be identified."],
  ["Staff training", "Training on My Health Record privacy and security. Annual refreshers and keeping training records are recommended."],
  ["Handling data breaches", "How the practice identifies, manages and responds to My Health Record-related data breaches."],
];

// The fixed-fee package, in three parts.
export const PACKAGE = [
  ["Rule 21 policy and access", "We write your Security and Access Policy for you to review and adopt, set up individual logins and access logs, and start a staff training register."],
  ["Basic security, fixed", "Two-step login on email and remote access, backups that are checked, and software updates that actually happen."],
  ["One fax-free automation", "Referrals and results that now arrive by fax or email move to secure messaging inside the practice software you already use."],
];

export const PLANS = [
  {
    name: "Rule 21 and fax-free package",
    price: 3500,
    unit: "fixed fee",
    note: "For practices with up to about 10 staff. Larger practices are quoted after the free check.",
    items: [
      "Security and Access Policy written for your practice",
      "Individual logins, access logs and a training register",
      "Two-step login, backups and software updates",
      "One automation replacing fax or emailed referrals and results",
      "Handover, documentation and a staff walkthrough",
    ],
  },
  {
    name: "Monthly care plan",
    price: 390,
    unit: "per month, 12-month term",
    note: "Starts after the package, so the work stays done.",
    items: [
      "Yearly staff training session, with the training register kept",
      "Compliance records and access reviews kept up to date",
      "Automated patient recall reminders, set up and monitored",
      "Small fixes and questions answered",
    ],
  },
];

export const FOUNDING = { price: 2900, places: 3 };

export const STEPS = [
  ["Free 20-minute check", "A call to see where your practice stands on Rule 21, security and fax. No obligation."],
  ["Fixed quote", "A short written plan with the fixed price and dates, before any work starts."],
  ["Set up", "Usually two to four weeks, done remotely and around your clinic hours."],
  ["Hand over and keep current", "Documents, a staff walkthrough, then the monthly plan if you want it."],
];

export const TRUST = [
  ["No patient records needed to start", "We work on policies, accounts and settings. We don't need to see clinical records to do it."],
  ["Inside the software you already use", "Secure messaging and access controls are set up in your existing practice software and providers, not a new system to learn."],
  ["Privacy first", "We work to the Australian Privacy Principles, and anything we set up keeps data in Australia."],
  ["You stay in control", "We write the policy for you to review and adopt. We help you meet Rule 21; we don't give legal advice or certify compliance."],
];

export const GP_FAQ = [
  ["What is Rule 21?", "Rule 21 of the My Health Records Rules 2026 says that, from 1 October 2026, every healthcare provider organisation that uses My Health Record must have a written Security and Access Policy. It covers managing user access, staff training and handling My Health Record data breaches, and the Australian Digital Health Agency may check that it is in place."],
  ["Does a small practice need one?", "Yes. The rule applies to every organisation that participates in My Health Record, regardless of size."],
  ["What does the package cost?", "The Rule 21 and fax-free package is a fixed $3,500 plus GST for practices with up to about 10 staff. The optional monthly care plan is $390 plus GST a month on a 12-month term. Larger practices are quoted after the free check."],
  ["How long does it take?", "Usually two to four weeks from the go-ahead, depending on staff availability. Most of the work is done remotely."],
  ["Can a GP clinic stop using fax?", "Usually, yes. Most referrals and results can move to secure messaging that works inside your practice software. On the free check we confirm what's possible with your software and the services you exchange documents with."],
  ["Do you need access to patient records?", "No. The work is about policies, user accounts, security settings and message routing. We don't need to see clinical records."],
  ["Do you work outside Melbourne?", "Yes. We focus on regional and rural clinics across Victoria, including Gippsland, Western Victoria and the Murray region. Set-up is remote, so distance isn't a problem."],
];

// Rule 21 readiness self-check: [question, what to do if the answer isn't yes]
export const CHECK = [
  ["Does your practice have a written Security and Access Policy that covers My Health Record?", "Write a Security and Access Policy tailored to your practice."],
  ["Has the policy been updated for the Rule 21 changes from 1 October 2026?", "Update the policy for Rule 21, including data breach handling."],
  ["Does every staff member log in with their own account, with no shared logins?", "Give every user their own login so access can be traced to a person."],
  ["Do you have a written process for adding, changing, suspending and removing user access?", "Document how access is granted, changed and removed when staff join or leave."],
  ["Do you review who has access at least every few months?", "Set a regular access review and record when it's done."],
  ["Can you see who accessed what in your clinical software and My Health Record?", "Turn on and check access logs."],
  ["Have all staff had My Health Record privacy and security training in the last 12 months, with records kept?", "Run refresher training and keep a training register."],
  ["Do you have a written plan for responding to a data breach, including My Health Record breaches?", "Write a breach response plan and make sure staff know it."],
  ["Is two-step login on for email and remote access, and are backups tested?", "Turn on two-step login and test a backup restore."],
  ["Do you send and receive referrals and results without fax?", "Move referrals and results to secure messaging."],
];

export const money = (n) => "$" + n.toLocaleString("en-AU");
