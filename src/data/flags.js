// Site-wide switches. Flip one and rebuild; nothing is deleted while a switch is off.
//
// SHOW_GP: the GP clinics offer (Rule 21 and fax-free package). When false:
// - /gp-clinics/, the Rule 21 guide and the offer PDF are removed from the build output
//   (they still build and show in `npm run dev`), and kept out of the sitemap,
//   the Markdown copies and llms-full.txt
// - the menu and footer links, home banner, hero slide, contact-form clinic fields,
//   home FAQ answer, Automation page items, llms.txt lines and structured data are left out
// Set to true to bring it all back.
export const SHOW_GP = false;
