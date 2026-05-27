import mongoose from "mongoose";

const PRIORITIES = ["low", "medium", "high"];
const STATUSES = ["all", "active", "completed"];

export function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id) && String(new mongoose.Types.ObjectId(id)) === id;
}

export function parsePriority(value) {
  if (value == null || value === "") return "medium";
  const normalized = String(value).toLowerCase();
  if (!PRIORITIES.includes(normalized)) {
    return { error: `priority must be one of: ${PRIORITIES.join(", ")}` };
  }
  return normalized;
}

export function parseStatus(value) {
  if (value == null || value === "") return "all";
  const normalized = String(value).toLowerCase();
  if (!STATUSES.includes(normalized)) {
    return { error: `status must be one of: ${STATUSES.join(", ")}` };
  }
  return normalized;
}

export function parseTitle(value) {
  if (typeof value !== "string") {
    return { error: "title is required and must be a string" };
  }
  const title = value.trim();
  if (!title) {
    return { error: "title cannot be empty or whitespace only" };
  }
  if (title.length > 200) {
    return { error: "title must be 200 characters or fewer" };
  }
  return title;
}

export function parseOptionalText(value, fieldName, maxLength = 1000) {
  if (value == null || value === "") return "";
  if (typeof value !== "string") {
    return { error: `${fieldName} must be a string` };
  }
  const text = value.trim();
  if (text.length > maxLength) {
    return { error: `${fieldName} must be ${maxLength} characters or fewer` };
  }
  return text;
}

export function parseDueDate(value) {
  if (value == null || value === "") return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return { error: "dueDate must be a valid ISO date string" };
  }
  return date;
}

export function parseCompleted(value) {
  if (value == null) return undefined;
  if (typeof value !== "boolean") {
    return { error: "completed must be a boolean" };
  }
  return value;
}
