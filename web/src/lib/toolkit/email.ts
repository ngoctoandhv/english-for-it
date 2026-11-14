import { clean, orPlaceholder } from "./text";

export type EmailField = { name: string; label: string; textarea?: boolean; placeholder: string };
export type EmailTemplate = { key: string; fields: EmailField[]; render: (v: Record<string, string>) => { subject: string; body: string } };

const f = (name: string, placeholder: string, textarea = false): EmailField => ({ name, label: name, textarea, placeholder });
const NAME = f("name", "Anna");
const SENDER = f("sender", "Minh");

const sign = (v: Record<string, string>) => `\n\nBest regards,\n${orPlaceholder(v.sender, "your name")}`;
const hi = (v: Record<string, string>) => `Hi ${orPlaceholder(v.name, "name")},\n\n`;
const bullets = (text: string) => {
  const lines = (text ?? "").split("\n").map(clean).filter(Boolean);
  return (lines.length ? lines : ["[point]"]).map((l) => `- ${l}`).join("\n");
};

export const EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    key: "schedule",
    fields: [NAME, f("topic", "the new login feature"), f("day1", "Tuesday at 2 pm"), f("day2", "Wednesday at 10 am"), SENDER],
    render: (v) => ({
      subject: `Meeting request: ${orPlaceholder(v.topic, "topic")}`,
      body: `${hi(v)}Could we schedule a meeting to discuss ${orPlaceholder(v.topic, "topic")}? I am available on ${orPlaceholder(v.day1, "first option")} or ${orPlaceholder(v.day2, "second option")}. Please let me know what works for you.${sign(v)}`,
    }),
  },
  {
    key: "followup",
    fields: [NAME, f("topic", "the release plan"), f("points", "We will release on Friday.\nI will update the ticket.", true), SENDER],
    render: (v) => ({
      subject: `Follow-up: ${orPlaceholder(v.topic, "topic")}`,
      body: `${hi(v)}Thank you for your time today. To summarize what we agreed:\n${bullets(v.points)}\nPlease let me know if I missed anything.${sign(v)}`,
    }),
  },
  {
    key: "reminder",
    fields: [NAME, f("topic", "the code review"), f("date", "Friday"), SENDER],
    render: (v) => ({
      subject: `Friendly reminder: ${orPlaceholder(v.topic, "topic")}`,
      body: `${hi(v)}This is a friendly reminder about ${orPlaceholder(v.topic, "topic")}. The deadline is ${orPlaceholder(v.date, "date")}. Please let me know if you need any help.${sign(v)}`,
    }),
  },
  {
    key: "info",
    fields: [NAME, f("topic", "the payment API"), f("context", "the checkout page"), f("request", "send me the API documentation"), SENDER],
    render: (v) => ({
      subject: `Question about ${orPlaceholder(v.topic, "topic")}`,
      body: `${hi(v)}I am working on ${orPlaceholder(v.context, "what you are working on")} and I need some information about ${orPlaceholder(v.topic, "topic")}. Could you please ${orPlaceholder(v.request, "request")}?\n\nThank you in advance.${sign(v)}`,
    }),
  },
  {
    key: "delay",
    fields: [NAME, f("topic", "the report"), f("date", "next Monday"), f("reason", "we need more time to test"), SENDER],
    render: (v) => ({
      subject: `Update on ${orPlaceholder(v.topic, "topic")}`,
      body: `${hi(v)}I am writing to let you know that ${orPlaceholder(v.topic, "topic")} will be delayed. The new date is ${orPlaceholder(v.date, "date")} because ${orPlaceholder(v.reason, "reason")}. I apologize for the inconvenience and I will keep you updated.${sign(v)}`,
    }),
  },
  {
    key: "access",
    fields: [NAME, f("system", "the staging server"), f("reason", "test my changes"), f("username", "minh.nguyen"), SENDER],
    render: (v) => ({
      subject: `Access request: ${orPlaceholder(v.system, "system")}`,
      body: `${hi(v)}Could you please give me access to ${orPlaceholder(v.system, "system")}? I need it to ${orPlaceholder(v.reason, "reason")}. My username is ${orPlaceholder(v.username, "username")}. Thank you for your help.${sign(v)}`,
    }),
  },
];
