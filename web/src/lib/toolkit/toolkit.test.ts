import { describe, expect, it } from "vitest";
import { EMAIL_TEMPLATES } from "./email";
import { renderIncident, type IncidentInput } from "./incident";
import { renderStandup } from "./standup";
import { clean, joinList, orPlaceholder } from "./text";

describe("text helpers", () => {
  it("joins lists the English way", () => {
    expect(joinList([])).toBe("");
    expect(joinList(["a"])).toBe("a");
    expect(joinList(["a", "b"])).toBe("a and b");
    expect(joinList(["a", " b ", "", "c"])).toBe("a, b and c");
  });
  it("cleans trailing full stops and shows placeholders", () => {
    expect(clean("  the login bug. ")).toBe("the login bug");
    expect(orPlaceholder("", "date")).toBe("[date]");
    expect(orPlaceholder(" Friday. ", "date")).toBe("Friday");
  });
});

describe("renderStandup", () => {
  it("uses the past simple for yesterday and 'will + base' for today", () => {
    const text = renderStandup({
      yesterday: [{ verb: "fix", object: "the login bug." }, { verb: "review", object: "two pull requests" }],
      today: [{ verb: "write", object: "tests" }, { verb: "start", object: "the payment page" }],
      blockers: ["access to the staging server"],
      noBlockers: false,
    });
    expect(text).toBe(
      "Yesterday I fixed the login bug and reviewed two pull requests.\nToday I will write tests and start the payment page.\nI am blocked by access to the staging server.",
    );
  });

  it("handles irregular and phrasal verbs", () => {
    const text = renderStandup({ yesterday: [{ verb: "write", object: "docs" }, { verb: "meet with", object: "the client" }], today: [], blockers: [], noBlockers: true });
    expect(text).toBe("Yesterday I wrote docs and met with the client.\nI have no blockers.");
  });

  it("says there are no blockers when none are given, and ignores incomplete rows", () => {
    expect(renderStandup({ yesterday: [{ verb: "", object: "x" }], today: [{ verb: "test", object: "the API" }], blockers: [" "], noBlockers: false })).toBe(
      "Today I will test the API.\nI have no blockers.",
    );
    expect(renderStandup({ yesterday: [], today: [], blockers: [], noBlockers: false })).toBe("");
  });
});

describe("renderIncident", () => {
  const base: IncidentInput = { status: "investigating", service: "the payment service", scope: "some", impact: "check out", cause: "", eta: "", next: "at 10:00" };

  it("writes each stage of an incident", () => {
    expect(renderIncident(base)).toBe("We are investigating an issue with the payment service. Some customers cannot check out. We will send the next update at 10:00.");
    expect(renderIncident({ ...base, status: "identified", cause: "the database server ran out of storage.", eta: "within 30 minutes" })).toBe(
      "We have identified the cause of the issue with the payment service: the database server ran out of storage. We are working on a fix. We expect to restore the service within 30 minutes. We will send the next update at 10:00.",
    );
    expect(renderIncident({ ...base, status: "monitoring", next: "in 30 minutes" })).toBe(
      "A fix has been applied for the issue with the payment service. We are monitoring the results. We will send the next update in 30 minutes.",
    );
    expect(renderIncident({ ...base, status: "resolved", cause: "a full disk" })).toBe(
      "The issue with the payment service has been resolved. The cause was a full disk. We apologize for the inconvenience.",
    );
  });

  it("uses 'All customers' and keeps placeholders for missing fields", () => {
    expect(renderIncident({ ...base, scope: "all", service: "", next: "" })).toBe("We are investigating an issue with [service]. All customers cannot check out.");
  });
});

describe("email templates", () => {
  it("renders a subject and body, with [placeholders] for empty fields", () => {
    const schedule = EMAIL_TEMPLATES.find((t) => t.key === "schedule")!;
    const out = schedule.render({ name: "Anna", topic: "the release", day1: "Tuesday at 2 pm", day2: "", sender: "Minh" });
    expect(out.subject).toBe("Meeting request: the release");
    expect(out.body).toContain("Hi Anna,");
    expect(out.body).toContain("I am available on Tuesday at 2 pm or [second option].");
    expect(out.body.endsWith("Best regards,\nMinh")).toBe(true);
  });

  it("turns follow-up points into bullets", () => {
    const followup = EMAIL_TEMPLATES.find((t) => t.key === "followup")!;
    const out = followup.render({ name: "Anna", topic: "x", points: "We release Friday.\n\nI update the ticket", sender: "M" });
    expect(out.body).toContain("- We release Friday\n- I update the ticket");
  });

  it("has six templates and every field is named", () => {
    expect(EMAIL_TEMPLATES.map((t) => t.key)).toEqual(["schedule", "followup", "reminder", "info", "delay", "access"]);
    for (const t of EMAIL_TEMPLATES) for (const field of t.fields) expect(field.name).toBeTruthy();
  });
});
