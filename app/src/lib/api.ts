export const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? '/api';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

type ApiFetchOptions = RequestInit & {
  /** When true, a 401 clears session and redirects to login. */
  requireSession?: boolean;
};

export async function apiFetch<T>(
  path: string,
  options?: ApiFetchOptions,
): Promise<T> {
  const { requireSession, ...init } = options ?? {};

  const res = await fetch(`${apiUrl}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...init.headers,
    },
  });

  if (res.status === 401) {
    if (requireSession && typeof window !== 'undefined') {
      const { useAuthStore } = await import('@/stores/auth-store');
      await useAuthStore.getState().handleSessionExpired();
    }
    throw new ApiError('Session expired', 401);
  }

  if (!res.ok) {
    let message = 'Something went wrong';
    try {
      const body = await res.json();
      if (typeof body.message === 'string') {
        message = body.message;
      } else if (Array.isArray(body.message)) {
        message = body.message.join(', ');
      }
    } catch {
      // use default message
    }
    throw new ApiError(message, res.status);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}
