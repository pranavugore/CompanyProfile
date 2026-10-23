// Used while SHOW_GP (src/data/flags.js) is off: after the build, remove the GP clinic pages
// and offer PDF from dist so they are not deployed. The source files stay where they are.
import { rm } from "node:fs/promises";
import { fileURLToPath } from "node:url";

export default function hideGp() {
  return {
    name: "hide-gp",
    hooks: {
      "astro:build:done": async ({ dir, logger }) => {
        await rm(new URL("gp-clinics/", dir), { recursive: true, force: true });
        logger.info(`removed ${fileURLToPath(new URL("gp-clinics/", dir))} (SHOW_GP is off)`);
      },
    },
  };
}
