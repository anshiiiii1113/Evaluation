/**
 * Local demo account service used only for a classroom/demo build.
 * It avoids sending credentials to a backend, but browser-local accounts are
 * not production authentication and can be altered by someone with DevTools.
 */
const ACCOUNTS_KEY = 'streamscout_demo_accounts_v1';
const SESSION_KEY = 'streamscout_demo_session_v1';
const PBKDF2_ITERATIONS = 120_000;
const HASH_BITS = 256;

const authError = (message, code) => Object.assign(new Error(message), { code });

const readJson = (key, fallback) => {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const writeJson = (key, value) => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    throw authError('Browser storage is unavailable or full. Enable local storage and try again.', 'local_storage_unavailable');
  }
};

const getAccounts = () => {
  const records = readJson(ACCOUNTS_KEY, []);
  return Array.isArray(records) ? records.filter((record) => record && record.id && record.email) : [];
};

const toPublicUser = (account) => ({
  id: account.id,
  email: account.email,
  user_metadata: { full_name: account.full_name || '' },
});

const requireWebCrypto = () => {
  if (!window.crypto?.subtle || !window.crypto?.getRandomValues) {
    throw authError('This browser does not support the password hashing required by the local demo login. Try a current browser over localhost or HTTPS.', 'crypto_unavailable');
  }
};

const toBase64 = (bytes) => {
  let binary = '';
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return window.btoa(binary);
};

const fromBase64 = (value) => {
  const binary = window.atob(value);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
};

const hashPassword = async (password, salt) => {
  requireWebCrypto();
  const key = await window.crypto.subtle.importKey(
    'raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']
  );
  const bits = await window.crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    key,
    HASH_BITS
  );
  return new Uint8Array(bits);
};

const constantTimeEqual = (first, second) => {
  if (first.length !== second.length) return false;
  let difference = 0;
  for (let index = 0; index < first.length; index += 1) difference |= first[index] ^ second[index];
  return difference === 0;
};

const startSession = (account) => {
  writeJson(SESSION_KEY, { user_id: account.id });
  return toPublicUser(account);
};

export const restoreDemoUser = () => {
  const savedSession = readJson(SESSION_KEY, null);
  const account = savedSession?.user_id
    ? getAccounts().find((candidate) => candidate.id === savedSession.user_id)
    : null;

  if (account) return toPublicUser(account);
  try {
    window.localStorage.removeItem(SESSION_KEY);
  } catch {
    // If storage is blocked, continue as a logged-out visitor.
  }
  return null;
};

export const createDemoAccount = async ({ fullName, email, password }) => {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const normalizedName = String(fullName || '').trim();

  if (!normalizedName) throw authError('Please enter your full name.', 'name_required');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    throw authError('Please enter a valid email address.', 'invalid_email');
  }
  if (typeof password !== 'string' || password.length < 8) {
    throw authError('Password must be at least 8 characters.', 'weak_password');
  }

  const accounts = getAccounts();
  if (accounts.some((account) => account.email.toLowerCase() === normalizedEmail)) {
    throw authError('User already registered', 'user_already_exists');
  }

  requireWebCrypto();
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const passwordHash = await hashPassword(password, salt);
  const account = {
    id: window.crypto.randomUUID
      ? window.crypto.randomUUID()
      : `demo-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    email: normalizedEmail,
    full_name: normalizedName,
    password_salt: toBase64(salt),
    password_hash: toBase64(passwordHash),
    created_at: new Date().toISOString(),
  };

  writeJson(ACCOUNTS_KEY, [...accounts, account]);
  return startSession(account);
};

export const loginDemoAccount = async ({ email, password }) => {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const account = getAccounts().find((candidate) => candidate.email.toLowerCase() === normalizedEmail);
  if (!account) throw authError('Invalid login credentials', 'invalid_credentials');

  let salt;
  let storedHash;
  try {
    salt = fromBase64(account.password_salt);
    storedHash = fromBase64(account.password_hash);
  } catch {
    throw authError('This local demo account is corrupted. Please create it again.', 'account_corrupted');
  }

  const candidateHash = await hashPassword(String(password || ''), salt);
  if (!constantTimeEqual(candidateHash, storedHash)) {
    throw authError('Invalid login credentials', 'invalid_credentials');
  }
  return startSession(account);
};

export const logoutDemoAccount = () => {
  try {
    window.localStorage.removeItem(SESSION_KEY);
  } catch {
    throw authError('Could not clear the local session. Check your browser storage settings.', 'local_storage_unavailable');
  }
};
