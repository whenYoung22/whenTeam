export function getClientOrigins(): string[] {
  const origins = (
    process.env.CLIENT_ORIGINS ??
    "http://localhost:5173,http://localhost:5174"
  )
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (origins.length === 0) {
    throw new Error("CLIENT_ORIGINS must contain at least one allowed origin");
  }

  return origins;
}
