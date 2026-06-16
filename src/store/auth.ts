import { defineStore } from 'pinia';
import storageService from '@/services/storage.service';
import router from '@/router';
import type { AuthUser } from '@/types/user';
import type { Role } from '@/types/role';
import { normalizeAuthUser } from '@/utils/loginUser';

const ROLE_LABELS: Record<number, string> = {
  0: 'HR Management',
  1: 'Administrator',
  2: 'Manager',
};

const AUTH_STORAGE_KEY = 'patrol_auth_storage';
const USER_BACKUP_KEY = 'web_user_backup';
const TOKEN_BACKUP_KEY = 'web_token_backup';
const ROLE_NAME_BACKUP_KEY = 'web_role_name';

/** Đọc user/token đồng bộ từ localStorage — F5 vẫn hiện đúng profile ngay. */
function readAuthFromLocalStorage(): { user: AuthUser | null; token: string } {
  let user: AuthUser | null = null;
  let token = localStorage.getItem(TOKEN_BACKUP_KEY) || '';

  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (raw) {
      const data = JSON.parse(raw) as { token?: string; user?: unknown };
      token = data.token || token;
      user = normalizeAuthUser(data.user);
    }
  } catch {
    /* ignore corrupt storage */
  }

  if (!user) {
    try {
      const raw = localStorage.getItem(USER_BACKUP_KEY);
      if (raw) user = normalizeAuthUser(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }

  return { user, token };
}

const initialAuth =
  typeof localStorage !== 'undefined'
    ? readAuthFromLocalStorage()
    : { user: null as AuthUser | null, token: '' };

function readRoleNameBackup(): string {
  return localStorage.getItem(ROLE_NAME_BACKUP_KEY) || '';
}

function persistUserBackup(user: AuthUser | null, token: string) {
  if (token) {
    localStorage.setItem(TOKEN_BACKUP_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_BACKUP_KEY);
  }

  if (user) {
    localStorage.setItem(USER_BACKUP_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(USER_BACKUP_KEY);
  }
}

function persistRoleNameBackup(roleName: string) {
  if (roleName) {
    localStorage.setItem(ROLE_NAME_BACKUP_KEY, roleName);
  } else {
    localStorage.removeItem(ROLE_NAME_BACKUP_KEY);
  }
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: initialAuth.user,
    token: initialAuth.token,
    roleName: readRoleNameBackup(),
    role: null as Role | null,
    isOnline: true,
    lastSync: null as string | null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    getUserName: (state) => state.user?.name || 'Guest',
    getUserCode: (state) => state.user?.code || '',
    getUserId: (state) => state.user?.id ?? null,
    getUserRoleLabel: (state) => {
      if (state.roleName) return state.roleName;
      if (state.role?.name) return state.role.name;
      return ROLE_LABELS[state.user?.roleId ?? -1] ?? 'HR Management';
    },
    isAdmin: (state) => state.role?.isAdmin ?? state.user?.isAdmin ?? false,
  },

  actions: {
    loginSession(user: AuthUser, sessionToken: string) {
      const normalized = normalizeAuthUser(user) ?? user;
      this.user = normalized;
      this.token = sessionToken;
      persistUserBackup(normalized, sessionToken);
    },
    setRole(role: Role | null) {
      this.role = role;
      this.roleName = role?.name ?? '';
      persistRoleNameBackup(this.roleName);
    },
    setRoleName(roleName: string) {
      this.roleName = roleName;
      persistRoleNameBackup(roleName);
    },
    clearRoleName() {
      this.role = null;
      this.roleName = '';
      persistRoleNameBackup('');
    },
    setToken(token: string) {
      this.token = token;
      persistUserBackup(this.user, token);
    },
    setUser(user: AuthUser | null) {
      this.user = user ? normalizeAuthUser(user) ?? user : null;
      persistUserBackup(this.user, this.token);
    },
    setNetworkStatus(status: boolean) {
      this.isOnline = status;
    },
    async logout() {
      this.token = '';
      this.user = null;
      this.role = null;
      this.roleName = '';

      localStorage.removeItem(TOKEN_BACKUP_KEY);
      localStorage.removeItem(USER_BACKUP_KEY);
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem(ROLE_NAME_BACKUP_KEY);

      await storageService.clear();

      router.push('/login');
    },
  },

  persist: {
    key: AUTH_STORAGE_KEY,
    storage: localStorage,
    pick: ['token', 'user', 'role', 'roleName', 'lastSync'],
    afterHydrate: (ctx) => {
      const store = ctx.store as ReturnType<typeof useAuthStore>;
      if (store.user) {
        const normalized = normalizeAuthUser(store.user);
        if (normalized) store.user = normalized;
      }
      if (store.token || store.user) {
        persistUserBackup(store.user, store.token);
      }
      if (store.roleName) {
        persistRoleNameBackup(store.roleName);
      }
    },
  },
});
