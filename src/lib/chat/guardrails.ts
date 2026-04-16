type RateLimitBucket = {
  windowStartedAt: number;
  requestCount: number;
};

type SessionBucket = {
  requestCount: number;
  updatedAt: number;
};

const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS_PER_IP_WINDOW = 25;
const MAX_REQUESTS_PER_SESSION = 16;
const SESSION_TTL_MS = 60 * 60 * 1000;

const ipBuckets = new Map<string, RateLimitBucket>();
const sessionBuckets = new Map<string, SessionBucket>();

function sweepExpiredSessions(now: number) {
  for (const [sessionId, bucket] of sessionBuckets.entries()) {
    if (now - bucket.updatedAt > SESSION_TTL_MS) {
      sessionBuckets.delete(sessionId);
    }
  }
}

function normalizeClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  return (
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    "unknown"
  );
}

export function enforceChatGuardrails(request: Request, sessionId?: string) {
  const now = Date.now();
  const clientIp = normalizeClientIp(request);
  const ipBucket = ipBuckets.get(clientIp);

  if (!ipBucket || now - ipBucket.windowStartedAt > WINDOW_MS) {
    ipBuckets.set(clientIp, {
      windowStartedAt: now,
      requestCount: 1,
    });
  } else {
    ipBucket.requestCount += 1;

    if (ipBucket.requestCount > MAX_REQUESTS_PER_IP_WINDOW) {
      return {
        ok: false as const,
        status: 429,
        message:
          "Rate limit reached for this connection. Please wait a few minutes before sending more chat requests.",
      };
    }
  }

  if (sessionId) {
    sweepExpiredSessions(now);

    const sessionBucket = sessionBuckets.get(sessionId);

    if (!sessionBucket) {
      sessionBuckets.set(sessionId, {
        requestCount: 1,
        updatedAt: now,
      });
    } else {
      sessionBucket.requestCount += 1;
      sessionBucket.updatedAt = now;

      if (sessionBucket.requestCount > MAX_REQUESTS_PER_SESSION) {
        return {
          ok: false as const,
          status: 429,
          message:
            "Session cap reached for this public demo. Start a new browser session or come back later for more questions.",
        };
      }
    }
  }

  return { ok: true as const };
}
