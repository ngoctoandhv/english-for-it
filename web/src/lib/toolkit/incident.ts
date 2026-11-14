import { clean, orPlaceholder } from "./text";

export type IncidentStatus = "investigating" | "identified" | "monitoring" | "resolved";
export type IncidentInput = {
  status: IncidentStatus;
  service: string;
  scope: "some" | "all";
  impact: string; // a verb phrase, for example "check out"
  cause: string;
  eta: string; // for example "within 30 minutes" or "by 10:00"
  next: string; // for example "at 10:00" or "in 30 minutes"
};

/** Builds a status message. Fields the learner has not filled stay visible as [placeholders]. */
export function renderIncident(i: IncidentInput): string {
  const service = orPlaceholder(i.service, "service");
  const impact = clean(i.impact);
  const cause = clean(i.cause);
  const eta = clean(i.eta);
  const next = clean(i.next);
  const who = i.scope === "all" ? "All customers" : "Some customers";
  const nextLine = next ? ` We will send the next update ${next}.` : "";

  switch (i.status) {
    case "investigating":
      return `We are investigating an issue with ${service}.${impact ? ` ${who} cannot ${impact}.` : ""}${nextLine}`;
    case "identified":
      return `We have identified the cause of the issue with ${service}${cause ? `: ${cause}` : ""}. We are working on a fix.${eta ? ` We expect to restore the service ${eta}.` : ""}${nextLine}`;
    case "monitoring":
      return `A fix has been applied for the issue with ${service}. We are monitoring the results.${nextLine}`;
    default:
      return `The issue with ${service} has been resolved.${cause ? ` The cause was ${cause}.` : ""} We apologize for the inconvenience.`;
  }
}
