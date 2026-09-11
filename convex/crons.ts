import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Catches enquiries whose send attempt died before it could reschedule itself,
// and drains the backlog once a sending domain is finally verified.
crons.interval("retry unnotified contact enquiries", { hours: 1 }, internal.notify.sweepUnnotified, {});

export default crons;
