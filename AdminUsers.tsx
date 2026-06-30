import { supabase } from './supabase';

// Calls the secure `admin-users` Edge Function. The function verifies the
// caller is an admin (via their JWT) before performing privileged actions
// with the service role key, which never reaches the browser.
async function callAdminFn(action: string, payload: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke('admin-users', {
    body: { action, ...payload },
  });
  if (error) {
    // Supabase wraps non-2xx responses; surface a useful message.
    let message = error.message;
    // Attempt to read the function's JSON error body if present.
    try {
      const ctx = (error as { context?: { body?: unknown } }).context;
      if (ctx?.body && typeof ctx.body === 'string') {
        const parsed = JSON.parse(ctx.body);
        if (parsed?.error) message = parsed.error;
      }
    } catch {
      /* ignore parse issues, keep default message */
    }
    throw new Error(message);
  }
  return data;
}

export function createConsultant(params: {
  fullName: string;
  email: string;
  password: string;
}) {
  return callAdminFn('create', {
    full_name: params.fullName,
    email: params.email,
    password: params.password,
  });
}

export function setConsultantPassword(params: { userId: string; password: string }) {
  return callAdminFn('set_password', {
    user_id: params.userId,
    password: params.password,
  });
}

export function deleteConsultant(params: { userId: string }) {
  return callAdminFn('delete', { user_id: params.userId });
}
