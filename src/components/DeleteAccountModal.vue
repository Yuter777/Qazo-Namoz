<template>
  <Teleport to="body">
    <Transition name="da-fade">
      <div v-if="show" class="da-backdrop" @click.self="onBackdropClick">
        <Transition name="da-rise" appear>
          <div class="da-panel">

            <!-- ── Idle: confirm intent ──────────────────────────── -->
            <template v-if="step === 'idle'">
              <div class="da-badge danger">⚠️</div>
              <h2 class="da-title">Hisobni o'chirish</h2>
              <p class="da-body">
                Ushbu amal barcha ma'lumotlaringizni
                <strong>butunlay va qaytarib bo'lmaydigan tarzda o'chiradi.</strong>
              </p>
              <div v-if="userEmail" class="da-email">{{ userEmail }}</div>
              <div class="da-actions">
                <button class="da-btn-cancel" @click="$emit('close')">Bekor qilish</button>
                <button class="da-btn-danger" @click="startCountdown">
                  O'chirishni tasdiqlash
                </button>
              </div>
            </template>

            <!-- ── Countdown: forced 3-second delay ─────────────── -->
            <template v-else-if="step === 'countdown'">
              <div class="da-badge warning">🗑️</div>
              <h2 class="da-title">Hisob o'chiriladi</h2>
              <p class="da-body">O'chirishni bekor qilish uchun quyidagi tugmani bosing</p>
              <div class="da-ring">
                <svg viewBox="0 0 44 44" class="da-ring-svg">
                  <circle cx="22" cy="22" r="18" fill="none" stroke="var(--border)" stroke-width="3"/>
                  <circle
                    cx="22" cy="22" r="18" fill="none"
                    stroke="var(--red)" stroke-width="3"
                    stroke-linecap="round"
                    :stroke-dasharray="`${ringProgress} 113`"
                    transform="rotate(-90 22 22)"
                    style="transition: stroke-dasharray 0.9s linear"
                  />
                </svg>
                <span class="da-ring-num">{{ count }}</span>
              </div>
              <button class="da-btn-cancel" @click="cancelCountdown">
                Bekor qilish
              </button>
            </template>

            <!-- ── Deleting ───────────────────────────────────────── -->
            <template v-else-if="step === 'deleting'">
              <div class="da-badge spin">⏳</div>
              <h2 class="da-title">O'chirilmoqda…</h2>
              <p class="da-body">Barcha ma'lumotlar o'chirilmoqda, iltimos kuting</p>
              <div class="da-progress-bar"><div class="da-progress-fill" /></div>
            </template>

            <!-- ── Success ────────────────────────────────────────── -->
            <template v-else-if="step === 'success'">
              <div class="da-badge success">✓</div>
              <h2 class="da-title">Hisob o'chirildi</h2>
              <p class="da-body">Barcha ma'lumotlaringiz muvaffaqiyatli o'chirildi. Tizimdan chiqilmoqda…</p>
            </template>

            <!-- ── Error ──────────────────────────────────────────── -->
            <template v-else-if="step === 'error'">
              <div class="da-badge danger">✕</div>
              <h2 class="da-title">Xatolik yuz berdi</h2>
              <p class="da-body da-err-msg">{{ errorMsg }}</p>
              <div class="da-actions">
                <button class="da-btn-cancel" @click="$emit('close')">Yopish</button>
                <button class="da-btn-danger" @click="runDelete">Qayta urinish</button>
              </div>
            </template>

          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { deleteAccountData } from '../services/accountService.js'
import { logout } from '../services/authService.js'

const props = defineProps({
  show:      { type: Boolean, required: true },
  userEmail: { type: String,  default: '' },
  uid:       { type: String,  required: true },
})
const emit = defineEmits(['close'])

const router    = useRouter()
const step      = ref('idle')
const count     = ref(3)
const errorMsg  = ref('')
let   ticker    = null

// SVG ring: circumference ≈ 113, fill proportional to remaining seconds
const ringProgress = computed(() => Math.round((count.value / 3) * 113))

function onBackdropClick() {
  if (step.value === 'idle') emit('close')
}

function startCountdown() {
  step.value = 'countdown'
  count.value = 3
  ticker = setInterval(() => {
    count.value--
    if (count.value <= 0) {
      clearInterval(ticker)
      runDelete()
    }
  }, 1000)
}

function cancelCountdown() {
  clearInterval(ticker)
  step.value = 'idle'
}

async function runDelete() {
  step.value = 'deleting'
  try {
    await deleteAccountData(props.uid)
    step.value = 'success'
    setTimeout(async () => {
      try { await logout() } catch {}
      router.push({ name: 'Login' })
    }, 1800)
  } catch (e) {
    console.error('[deleteAccount]', e)
    errorMsg.value = e.code === 'auth/requires-recent-login'
      ? 'Xavfsizlik sababli qayta tizimga kiring, so\'ngra urinib ko\'ring.'
      : 'Ma\'lumotlarni o\'chirishda xatolik. Internet aloqasini tekshiring.'
    step.value = 'error'
  }
}

onUnmounted(() => clearInterval(ticker))
</script>

<style scoped>
/* Backdrop */
.da-backdrop {
  position: fixed; inset: 0; z-index: 1000;
  background: rgba(0,0,0,0.55);
  display: flex; align-items: center; justify-content: center;
  padding: 20px;
}

/* Panel */
.da-panel {
  background: var(--bg2);
  border-radius: 20px;
  padding: 32px 28px 28px;
  width: 100%; max-width: 360px;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0,0,0,0.25);
  border: 1px solid var(--border);
}

/* Badge icon */
.da-badge {
  width: 64px; height: 64px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 28px; margin: 0 auto 16px;
}
.da-badge.danger  { background: #fef2f2; }
.da-badge.warning { background: #fffbeb; }
.da-badge.success { background: #f0fdf4; color: #16a34a; font-size: 26px; font-weight: 700; }
.da-badge.spin    { animation: daSpin 1s linear infinite; }
@keyframes daSpin { to { transform: rotate(360deg); } }

.da-title {
  font-size: 18px; font-weight: 700;
  color: var(--text1); margin: 0 0 10px;
}
.da-body {
  font-size: 14px; color: var(--text2);
  line-height: 1.6; margin: 0 0 16px;
}
.da-body strong { color: var(--text1); }
.da-err-msg { color: #dc2626; }

.da-email {
  font-size: 13px; font-weight: 600; color: var(--text2);
  background: var(--bg); border: 1px solid var(--border);
  border-radius: 8px; padding: 8px 12px;
  margin-bottom: 20px; word-break: break-all;
}

/* Buttons */
.da-actions { display: flex; gap: 10px; margin-top: 4px; }
.da-btn-cancel,
.da-btn-danger {
  flex: 1; padding: 11px 16px;
  border-radius: 10px; font-size: 14px;
  font-weight: 600; cursor: pointer;
  border: none; font-family: inherit;
  transition: opacity 0.15s, transform 0.1s;
}
.da-btn-cancel { background: var(--bg); border: 1.5px solid var(--border); color: var(--text1); }
.da-btn-danger { background: #dc2626; color: white; }
.da-btn-cancel:hover { background: var(--teal-light); }
.da-btn-danger:hover { opacity: 0.88; }
.da-btn-danger:active { transform: scale(0.97); }

/* Countdown ring */
.da-ring {
  position: relative; width: 80px; height: 80px;
  margin: 0 auto 20px;
}
.da-ring-svg { width: 100%; height: 100%; }
.da-ring-num {
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: 26px; font-weight: 800; color: var(--red);
}

/* Deleting progress bar */
.da-progress-bar {
  height: 4px; border-radius: 2px;
  background: var(--border); overflow: hidden;
  margin-top: 4px;
}
.da-progress-fill {
  height: 100%; width: 0%;
  background: linear-gradient(90deg, var(--teal), var(--teal-dark));
  animation: daLoad 2.5s ease-in-out forwards;
  border-radius: 2px;
}
@keyframes daLoad { to { width: 90%; } }

/* Transitions */
.da-fade-enter-active, .da-fade-leave-active { transition: opacity 0.22s; }
.da-fade-enter-from, .da-fade-leave-to { opacity: 0; }

.da-rise-enter-active { transition: opacity 0.22s, transform 0.22s; }
.da-rise-leave-active { transition: opacity 0.18s; }
.da-rise-enter-from  { opacity: 0; transform: translateY(16px) scale(0.97); }
.da-rise-leave-to    { opacity: 0; }
</style>
