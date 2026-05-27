import { connectDB } from "@/lib/mongodb";
import { errorResponse, jsonResponse, parseJsonBody } from "@/lib/api";
import {
  parseDueDate,
  parseOptionalText,
  parsePriority,
  parseStatus,
  parseTitle,
} from "@/lib/validation";
import Todo from "@/models/Todo";

const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = parseStatus(searchParams.get("status"));
    if (status.error) return errorResponse(status.error);

    const priority = searchParams.get("priority");
    const q = searchParams.get("q")?.trim();

    const filter = {};

    if (status === "active") filter.completed = false;
    if (status === "completed") filter.completed = true;

    if (priority) {
      const parsedPriority = parsePriority(priority);
      if (parsedPriority.error) return errorResponse(parsedPriority.error);
      filter.priority = parsedPriority;
    }

    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
      ];
    }

    const todos = await Todo.find(filter).sort({ createdAt: -1 }).lean();

    todos.sort((a, b) => {
      const priorityDiff =
        PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
      if (priorityDiff !== 0) return priorityDiff;

      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate) - new Date(b.dueDate);
    });

    return jsonResponse({ todos });
  } catch (error) {
    console.error("GET /api/todos failed:", error);
    return errorResponse("database connection failed", 503);
  }
}

export async function POST(request) {
  try {
    await connectDB();

    const body = await parseJsonBody(request);
    if (body.error) return errorResponse(body.error);

    const title = parseTitle(body.title);
    if (title.error) return errorResponse(title.error);

    const description = parseOptionalText(body.description, "description");
    if (description.error) return errorResponse(description.error);

    const priority = parsePriority(body.priority);
    if (priority.error) return errorResponse(priority.error);

    const dueDate = parseDueDate(body.dueDate);
    if (dueDate?.error) return errorResponse(dueDate.error);

    const todo = await Todo.create({
      title,
      description,
      priority,
      dueDate,
    });

    return jsonResponse({ todo }, 201);
  } catch (error) {
    console.error("POST /api/todos failed:", error);
    return errorResponse("database connection failed", 503);
  }
}
