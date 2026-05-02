<template>
  <main class="profile-page">
    <section class="card">
      <div class="header">
        <h1>Profile</h1>
        <router-link class="ghost-btn" to="/">Home</router-link>
      </div>

      <p class="muted">Foydalanuvchi ma'lumotlari va saqlangan qazo reja holati.</p>

      <div class="grid">
        <div class="item">
          <span class="label">Ism</span>
          <strong>{{ userInfo.name }}</strong>
        </div>
        <div class="item">
          <span class="label">Email</span>
          <strong>{{ userInfo.email }}</strong>
        </div>
        <div class="item">
          <span class="label">User ID</span>
          <code>{{ userInfo.uid }}</code>
        </div>
        <div class="item">
          <span class="label">Auth turi</span>
          <strong>{{ userInfo.provider }}</strong>
        </div>
      </div>
    </section>

    <section class="card">
      <h2>Qazo plan statistikasi</h2>
      <p v-if="isLoading" class="muted">Yuklanmoqda...</p>
      <p v-else-if="!planExists" class="muted">Hozircha cloud'da saqlangan reja yo'q.</p>
      <div v-else class="grid stats">
        <div class="item">
          <span class="label">Boshlanish</span>
          <strong>{{ plan.startDate || '-' }}</strong>
        </div>
        <div class="item">
          <span class="label">Tugash</span>
          <strong>{{ plan.endDate || '-' }}</strong>
        </div>
        <div class="item">
          <span class="label">Jami kunlar</span>
          <strong>{{ totalDays }}</strong>
        </div>
        <div class="item">
          <span class="label">Bajarilgan</span>
          <strong>{{ completedDays }}</strong>
        </div>
        <div class="item">
          <span class="label">Qolgan</span>
          <strong>{{ remainingDays }}</strong>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup>
import { computed, ref } from 'vue';
import { getCurrentUser, onAuthChange } from '../services/authService';
import { loadPrayerPlan } from '../services/prayerPlanService';

const isLoading = ref(true);
const planExists = ref(false);
const plan = ref({
  startDate: '',
  endDate: '',
  planDates: [],
  completedDates: [],
});

const userInfo = computed(() => {
  const user = getCurrentUser();
  return {
    name: user?.displayName || 'Noma`lum',
    email: user?.email || '-',
    uid: user?.uid || '-',
    provider: user?.providerData?.[0]?.providerId || 'password',
  };
});

const totalDays = computed(() => plan.value.planDates?.length || 0);
const completedDays = computed(() => plan.value.completedDates?.length || 0);
const remainingDays = computed(() => Math.max(totalDays.value - completedDays.value, 0));

onAuthChange(async (user) => {
  if (!user?.uid) {
    isLoading.value = false;
    return;
  }

  isLoading.value = true;
  try {
    const cloudPlan = await loadPrayerPlan(user.uid);
    if (cloudPlan) {
      plan.value = {
        startDate: cloudPlan.startDate || '',
        endDate: cloudPlan.endDate || '',
        planDates: cloudPlan.planDates || [],
        completedDates: cloudPlan.completedDates || [],
      };
      planExists.value = true;
      return;
    }
    planExists.value = false;
  } finally {
    isLoading.value = false;
  }
});
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  padding: 24px;
  background: #f8fafc;
  display: grid;
  gap: 16px;
}

.card {
  width: min(900px, 100%);
  margin: 0 auto;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

h1, h2 {
  margin: 0;
}

.ghost-btn {
  text-decoration: none;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  padding: 8px 12px;
  color: #0f172a;
}

.muted {
  color: #64748b;
}

.grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-top: 14px;
}

.item {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 12px;
  display: grid;
  gap: 4px;
}

.label {
  color: #64748b;
  font-size: 13px;
}

@media (max-width: 700px) {
  .profile-page {
    padding: 14px;
  }

  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
