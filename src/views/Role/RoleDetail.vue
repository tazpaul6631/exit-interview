<template>
  <ion-page class="role-detail-page">
    <div class="role-detail-page-container role-detail-flex-column">
      <div class="role-detail-panel role-detail-flex-column">
        <div v-if="isLoading" class="role-detail-body">
          <Skeleton width="100%" height="5rem" borderRadius="12px" class="role-detail-skeleton" />
          <div class="role-detail-permissions__grid">
            <Skeleton v-for="n in 4" :key="n" width="100%" height="10rem" borderRadius="12px" />
          </div>
        </div>

        <div v-else-if="!role" class="role-detail-empty">
          <i class="pi pi-inbox role-detail-empty__icon" />
          <p>Không tìm thấy vai trò.</p>
        </div>

        <div v-else class="role-detail-body">
          <section class="role-detail-info">
            <div class="role-detail-info__item">
              <span class="role-detail-info__label">Mã vai trò </span>
              <span class="role-detail-info__value">{{ role.code || '—' }}</span>
            </div>
            <div class="role-detail-info__item">
              <span class="role-detail-info__label">Tên vai trò</span>
              <span class="role-detail-info__value">{{ role.name }}</span>
            </div>
            <div class="role-detail-info__item">
              <span class="role-detail-info__label">Loại tài khoản</span>
              <Tag :value="role.isAdmin ? 'Admin' : 'Thường'" :severity="role.isAdmin ? 'warn' : 'secondary'" />
            </div>
            <div class="role-detail-info__item">
              <span class="role-detail-info__label">Tổng quyền được cấp</span>
              <span class="role-detail-info__value role-detail-info__value--highlight">
                {{ allowedPermissionCount }} / {{ totalPermissionCount }}
              </span>
            </div>
          </section>

          <section class="role-detail-permissions">
            <div class="role-detail-permissions__header">
              <h2 class="role-detail-permissions__title">Phân quyền theo menu</h2>
              <span class="role-detail-permissions__count">{{ role.permissions.length }} menu</span>
            </div>

            <div v-if="role.permissions.length === 0" class="role-detail-permissions__empty">
              Chưa có phân quyền.
            </div>

            <div v-else class="role-detail-permissions__grid">
              <article v-for="menu in role.permissions" :key="menu.id" class="role-detail-menu-card">
                <header class="role-detail-menu-card__header">
                  <h3 class="role-detail-menu-card__title">{{ menu.name }}</h3>
                </header>

                <ul class="role-detail-menu-card__list">
                  <li v-for="perm in menu.permissions" :key="perm.id" class="role-detail-menu-card__item"
                    :class="{ 'role-detail-menu-card__item--allowed': perm.isAllow }">
                    <i class="pi" :class="perm.isAllow ? 'pi-check-circle' : 'pi-times-circle'" />
                    <span class="role-detail-menu-card__perm-name">{{ perm.name }}</span>
                    <Tag :value="perm.isAllow ? 'Cho phép' : 'Không'" :severity="perm.isAllow ? 'success' : 'secondary'"
                      class="role-detail-menu-card__tag" />
                  </li>
                </ul>
              </article>
            </div>
          </section>
        </div>
      </div>
    </div>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { IonPage } from '@ionic/vue';
import { useToast } from 'primevue/usetoast';
import roleApi from '@/api/role';
import { parseRoleOne } from '@/utils/roleResponse';
import type { Role } from '@/types/role';

const route = useRoute();
const router = useRouter();
const toast = useToast();

const role = ref<Role | null>(null);
const isLoading = ref(false);

const totalPermissionCount = computed(() =>
  role.value?.permissions.reduce((sum, menu) => sum + menu.permissions.length, 0) ?? 0,
);

const allowedPermissionCount = computed(() =>
  role.value?.permissions.reduce(
    (sum, menu) => sum + menu.permissions.filter((perm) => perm.isAllow).length,
    0,
  ) ?? 0,
);

const showToast = (message: string) => {
  toast.add({
    severity: 'error',
    summary: 'Lỗi',
    detail: message,
    life: 3000,
  });
};

const loadRole = async () => {
  const rawId = route.params.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  if (!id) return;

  isLoading.value = true;
  try {
    const response = await roleApi.getRoleOne(id);
    role.value = parseRoleOne(response);
  } catch (error) {
    console.error('Lỗi tải chi tiết vai trò:', error);
    role.value = null;
    showToast('Không thể tải chi tiết vai trò.');
  } finally {
    isLoading.value = false;
  }
};

const goBack = () => {
  router.push({ name: 'ListRole' });
};

onMounted(loadRole);

watch(
  () => route.params.id,
  () => {
    loadRole();
  },
);
</script>

<style scoped lang="scss">
.role-detail-page:not(.ion-page-hidden) {
  height: calc(100dvh - 70px - 44px - 50px - 50px) !important;
  min-height: 420px;
  max-height: calc(100dvh - 70px - 44px - 50px - 50px);
  overflow: hidden !important;
}

.role-detail-page.ion-page-hidden {
  display: none !important;
}

.role-detail-page-container {
  height: 100%;
  min-height: 0;
  box-sizing: border-box;
  overflow: hidden;
}

.role-detail-flex-column {
  display: flex;
  flex-direction: column;
  flex: 1;
  height: 100%;
  min-height: 0;
}

.role-detail-panel {
  flex: 1;
  min-height: 0;
  background: #ffffff;
  border-radius: 30px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.role-detail-body {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 1rem 1.25rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.role-detail-skeleton {
  margin-bottom: 0.25rem;
}

.role-detail-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  color: #64748b;

  &__icon {
    font-size: 2rem;
    color: #94a3b8;
  }

  p {
    margin: 0;
  }
}

.role-detail-info {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.75rem;
}

.role-detail-info__item {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  padding: 0.875rem 1rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  min-width: 0;
}

.role-detail-info__label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.role-detail-info__value {
  font-size: 0.9375rem;
  font-weight: 600;
  color: #1e293b;
  word-break: break-word;

  &--highlight {
    color: #4f46e5;
  }
}

.role-detail-permissions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  flex: 1;
  min-height: 0;
}

.role-detail-permissions__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.role-detail-permissions__title {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: #334155;
}

.role-detail-permissions__count {
  font-size: 0.8125rem;
  color: #64748b;
  white-space: nowrap;
}

.role-detail-permissions__empty {
  padding: 2rem;
  text-align: center;
  color: #64748b;
  background: #f8fafc;
  border: 1px dashed #e2e8f0;
  border-radius: 12px;
}

.role-detail-permissions__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 0.75rem;
  align-content: start;
}

.role-detail-menu-card {
  display: flex;
  flex-direction: column;
  min-height: 0;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #ffffff;
  overflow: hidden;
}

.role-detail-menu-card__header {
  padding: 0.75rem 1rem;
  background: #f8fafc;
  border-bottom: 1px solid #f1f5f9;
}

.role-detail-menu-card__title {
  margin: 0;
  font-size: 0.9375rem;
  font-weight: 700;
  color: #1e293b;
}

.role-detail-menu-card__list {
  list-style: none;
  margin: 0;
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.role-detail-menu-card__item {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.625rem;
  border-radius: 8px;
  background: #fafbfc;
  color: #64748b;
  font-size: 0.8125rem;

  .pi {
    font-size: 0.875rem;
    color: #94a3b8;
  }

  &--allowed {
    background: #f0fdf4;
    color: #166534;

    .pi {
      color: #16a34a;
    }
  }
}

.role-detail-menu-card__perm-name {
  min-width: 0;
  word-break: break-word;
}

.role-detail-menu-card__tag {
  flex-shrink: 0;
}

@media (max-width: 1200px) {
  .role-detail-info {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .role-detail-info {
    grid-template-columns: 1fr;
  }

  .role-detail-permissions__grid {
    grid-template-columns: 1fr;
  }
}
</style>
