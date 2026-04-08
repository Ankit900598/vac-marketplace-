import { ZodError } from "zod";

export function errorMiddleware(err, req, res, next) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      ok: false,
      error: { message: "Validation error", details: err.flatten() },
    });
  }

  const status = Number(err?.statusCode ?? 500);
  const message = status === 500 ? "Internal server error" : String(err?.message ?? "Error");
  if (status === 500) {
    // eslint-disable-next-line no-console
    console.error(err);
  }
  return res.status(status).json({ ok: false, error: { message } });
}

