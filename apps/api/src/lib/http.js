export function ok(res, data) {
  return res.status(200).json({ ok: true, data });
}

export function created(res, data) {
  return res.status(201).json({ ok: true, data });
}

export function badRequest(res, message, details) {
  return res.status(400).json({ ok: false, error: { message, details } });
}

export function unauthorized(res, message = "Unauthorized") {
  return res.status(401).json({ ok: false, error: { message } });
}

export function forbidden(res, message = "Forbidden") {
  return res.status(403).json({ ok: false, error: { message } });
}

export function notFound(res, message = "Not found") {
  return res.status(404).json({ ok: false, error: { message } });
}

