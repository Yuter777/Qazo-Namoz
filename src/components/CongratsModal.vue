<template>
  <Teleport to="body">
    <Transition name="cs-fade">
      <div v-if="show" class="cs-backdrop" @click.self="emit('close')">
        <Transition name="cs-rise">
          <div v-if="show" class="cs-card">
            <div class="cs-crescent">☽</div>
            <div class="cs-title">Alhamdulillah</div>
            <div class="cs-divider" />
            <p class="cs-body">
              Bugungi barcha namozlaringiz<br>ado etildi.
            </p>
            <p class="cs-dua">Alloh qabul qilsin.</p>
            <button class="cs-btn" @click="emit('close')">Omin</button>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
defineProps({ show: { type: Boolean, required: true } })
const emit = defineEmits(['close'])
</script>

<style scoped>
.cs-backdrop {
  position: fixed; inset: 0; z-index: 9999;
  background: rgba(0, 0, 0, 0.45);
  display: flex; align-items: center; justify-content: center;
  padding: 24px;
  backdrop-filter: blur(4px);
}

.cs-card {
  background: var(--bg2, #fff);
  border-radius: 24px;
  padding: 40px 32px 32px;
  max-width: 320px; width: 100%;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0,0,0,0.15);
  border: 1px solid var(--border, #e5e7eb);
}

.cs-crescent {
  font-size: 44px;
  line-height: 1;
  margin-bottom: 16px;
  display: block;
  opacity: 0.85;
}

.cs-title {
  font-size: 22px;
  font-weight: 700;
  color: var(--text1, #111827);
  letter-spacing: -0.3px;
  margin-bottom: 12px;
}

.cs-divider {
  width: 40px; height: 2px;
  background: var(--teal, #2d9e8a);
  border-radius: 2px;
  margin: 0 auto 20px;
}

.cs-body {
  font-size: 15px;
  line-height: 1.7;
  color: var(--text1, #111827);
  margin: 0 0 6px;
}

.cs-dua {
  font-size: 14px;
  color: var(--text2, #6b7280);
  margin: 0 0 28px;
  font-style: italic;
}

.cs-btn {
  background: var(--teal, #2d9e8a);
  color: #fff;
  border: none;
  border-radius: 12px;
  padding: 12px 40px;
  font-size: 15px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: opacity 0.15s;
}
.cs-btn:hover { opacity: 0.88; }

/* Backdrop fade */
.cs-fade-enter-active,
.cs-fade-leave-active { transition: opacity 0.25s ease; }
.cs-fade-enter-from,
.cs-fade-leave-to   { opacity: 0; }

/* Card rise */
.cs-rise-enter-active { transition: opacity 0.3s ease, transform 0.3s ease; }
.cs-rise-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.cs-rise-enter-from  { opacity: 0; transform: translateY(20px) scale(0.97); }
.cs-rise-leave-to    { opacity: 0; transform: translateY(10px) scale(0.97); }
</style>
