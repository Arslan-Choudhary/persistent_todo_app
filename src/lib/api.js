export function jsonResponse(data, status = 200) {
  return Response.json(data, { status });
}

export function errorResponse(message, status = 400) {
  return Response.json({ error: message }, { status });
}

export async function parseJsonBody(request) {
  try {
    return await request.json();
  } catch {
    return { error: "request body must be valid JSON" };
  }
}
