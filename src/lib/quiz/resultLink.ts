export const QUIZ_RESULT_PAYLOAD_PARAM = "payload";
export const ANONYMOUS_QUIZ_RESULT_ID = "anonymous";
const QUIZ_RESULT_PAYLOAD_VERSION = 1;

export interface QuizResultPayload {
  version: number;
  role: string;
  platform: string;
  goal: string;
  recommended_skill_ids: string[];
  created_at?: string;
}

export interface QuizResultSearchParams {
  [key: string]: string | string[] | undefined;
}

export function buildQuizResultPayload(data: {
  role: string;
  platform: string;
  goal: string;
  recommended_skill_ids: string[];
  created_at?: string;
}): QuizResultPayload {
  return {
    version: QUIZ_RESULT_PAYLOAD_VERSION,
    role: data.role,
    platform: data.platform,
    goal: data.goal,
    recommended_skill_ids: data.recommended_skill_ids,
    created_at: data.created_at,
  };
}

export function encodeQuizResultPayload(payload: QuizResultPayload): string {
  return JSON.stringify(payload);
}

export function decodeQuizResultPayload(
  raw?: string | null
): QuizResultPayload | null {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as QuizResultPayload;

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;
    if (parsed.version !== QUIZ_RESULT_PAYLOAD_VERSION) return null;
    if (typeof parsed.role !== "string") return null;
    if (typeof parsed.platform !== "string") return null;
    if (typeof parsed.goal !== "string") return null;
    if (!Array.isArray(parsed.recommended_skill_ids)) return null;
    if (parsed.recommended_skill_ids.some((id) => typeof id !== "string")) return null;

    return {
      ...parsed,
      version: QUIZ_RESULT_PAYLOAD_VERSION,
      recommended_skill_ids: parsed.recommended_skill_ids,
      created_at: parsed.created_at,
    };
  } catch {
    return null;
  }
}

export function readQuizResultPayloadFromSearchParams(
  searchParams?: QuizResultSearchParams | null
): QuizResultPayload | null {
  if (!searchParams) return null;

  const rawValue = searchParams[QUIZ_RESULT_PAYLOAD_PARAM];
  if (!rawValue) return null;

  const payload = Array.isArray(rawValue) ? rawValue[0] : rawValue;
  return decodeQuizResultPayload(payload);
}

export function buildQuizResultSharePath(
  id: string,
  payload: QuizResultPayload | null
): string {
  const routeId = id || ANONYMOUS_QUIZ_RESULT_ID;
  const params = new URLSearchParams();

  if (payload) {
    params.set(QUIZ_RESULT_PAYLOAD_PARAM, encodeQuizResultPayload(payload));
  }

  const query = params.toString();
  return `/quiz/result/${routeId}${query ? `?${query}` : ""}`;
}
