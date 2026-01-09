const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface LoginResponse {
  message: string;
  user: User;
}

export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  const url = `${API_URL}/auth/login`;
  console.log('🔐 Intentando login a:', url);
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Importante: para recibir cookies
    body: JSON.stringify(credentials),
  });

  console.log('📡 Respuesta del servidor:', {
    status: response.status,
    statusText: response.statusText,
    ok: response.ok,
    headers: Object.fromEntries(response.headers.entries()),
  });

  if (!response.ok) {
    let errorMessage = 'Error al iniciar sesión';
    try {
      const error = await response.json();
      errorMessage = error.message || errorMessage;
      console.error('❌ Error del servidor:', error);
    } catch (e) {
      console.error('❌ No se pudo parsear el error:', e);
      errorMessage = `Error ${response.status}: ${response.statusText}`;
    }
    throw new Error(errorMessage);
  }

  const data = await response.json();
  console.log('✅ Login exitoso, datos recibidos:', data);
  
  // Verificar cookies en la respuesta
  const setCookieHeader = response.headers.get('set-cookie');
  console.log('🍪 Set-Cookie header:', setCookieHeader);
  
  return data;
}

export async function logout(): Promise<void> {
  const response = await fetch(`${API_URL}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Error al cerrar sesión');
  }
}

export async function refreshToken(): Promise<void> {
  const response = await fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Error al renovar token');
  }
}

export async function getProfile(): Promise<User> {
  const response = await fetch(`${API_URL}/auth/me`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('No autenticado');
  }

  return response.json();
}

export async function checkAuth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/auth/check`, {
      credentials: 'include',
    });
    const data = await response.json();
    return data.authenticated;
  } catch {
    return false;
  }
}
