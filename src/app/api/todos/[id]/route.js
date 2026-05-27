import { connectDB } from "@/lib/mongodb";
import { errorResponse, jsonResponse, parseJsonBody } from "@/lib/api";
import {
  isValidObjectId,
  parseCompleted,
  parseDueDate,
  parseOptionalText,
  parsePriority,
  parseTitle,
} from "@/lib/validation";
import Todo from "@/models/Todo";

export async function GET(_request, { params }) {
  const { id } = await params;

  if (!isValidObjectId(id)) {
    return errorResponse("invalid todo id", 400);
  }

  try {
    await connectDB();
    const todo = await Todo.findById(id).lean();
    if (!todo) return errorResponse("todo not found", 404);
    return jsonResponse({ todo });
  } catch (error) {
    console.error(`GET /api/todos/${id} failed:`, error);
    return errorResponse("database connection failed", 503);
  }
}

export async function PATCH(request, { params }) {
  const { id } = await params;

  if (!isValidObjectId(id)) {
    return errorResponse("invalid todo id", 400);
  }

  try {
    await connectDB();

    const body = await parseJsonBody(request);
    if (body.error) return errorResponse(body.error);

    const updates = {};

    if (body.title !== undefined) {
      const title = parseTitle(body.title);
      if (title.error) return errorResponse(title.error);
      updates.title = title;
    }

    if (body.description !== undefined) {
      const description = parseOptionalText(body.description, "description");
      if (description.error) return errorResponse(description.error);
      updates.description = description;
    }

    if (body.priority !== undefined) {
      const priority = parsePriority(body.priority);
      if (priority.error) return errorResponse(priority.error);
      updates.priority = priority;
    }

    if (body.dueDate !== undefined) {
      const dueDate = parseDueDate(body.dueDate);
      if (dueDate?.error) return errorResponse(dueDate.error);
      updates.dueDate = dueDate;
    }

    if (body.completed !== undefined) {
      const completed = parseCompleted(body.completed);
      if (completed?.error) return errorResponse(completed.error);
      updates.completed = completed;
    }

    if (Object.keys(updates).length === 0) {
      return errorResponse("no valid fields to update");
    }

    const todo = await Todo.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).lean();

    if (!todo) return errorResponse("todo not found", 404);
    return jsonResponse({ todo });
  } catch (error) {
    console.error(`PATCH /api/todos/${id} failed:`, error);
    return errorResponse("database connection failed", 503);
  }
}

export async function DELETE(_request, { params }) {
  const { id } = await params;

  if (!isValidObjectId(id)) {
    return errorResponse("invalid todo id", 400);
  }

  try {
    await connectDB();
    const todo = await Todo.findByIdAndDelete(id).lean();
    if (!todo) return errorResponse("todo not found", 404);
    return jsonResponse({ todo });
  } catch (error) {
    console.error(`DELETE /api/todos/${id} failed:`, error);
    return errorResponse("database connection failed", 503);
  }
}
