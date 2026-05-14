<template>
  <div class="qn-page fade-in">
    <!-- Hero -->
    <div class="qn-hero pt-hero">
      <div class="pt-date">{{ todayStr }}</div>
      <div class="pt-title">{{ t('prayerTimes.title') }}</div>
      <button
        class="pt-loc-btn"
        :class="{ 'pt-loc-btn--loading': locating }"
        @click="requestLocation"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="3"/>
          <path d="M12 1v4M12 19v4M1 12h4M19 12h4"/>
        </svg>
        {{ locating ? t('prayerTimes.detecting') : locationLabel }}
      </button>
    </div>

    <!-- Loading skeletons -->
    <div v-if="loading" class="pt-body">
      <div v-for="i in 6" :key="i" class="qn-card pt-skeleton-row">
        <el-skeleton :rows="1" animated />
      </div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="pt-body">
      <div class="qn-card pt-error-card">
        <div class="pt-error-icon">⚠️</div>
        <p class="pt-error-msg">{{ error }}</p>
        <el-button type="primary" round @click="loadTimes">{{ t('prayerTimes.retry') }}</el-button>
      </div>
    </div>

    <!-- Content -->
    <template v-else-if="timings">
      <div class="pt-body">
        <!-- Next prayer countdown -->
        <div v-if="nextPrayerInfo" class="pt-next-card">
          <div class="pt-next-top">
            <span class="pt-next-label">{{ t('prayerTimes.nextPrayer') }}</span>
            <span class="pt-next-clock">{{ nextPrayerInfo.time }}</span>
          </div>
          <div class="pt-next-body">
            <span class="pt-next-emoji">{{ nextPrayerInfo.emoji }}</span>
            <span class="pt-next-name">{{ nextPrayerInfo.label }}</span>
          </div>
          <div class="pt-countdown">{{ countdown }}</div>
          <div class="pt-countdown-sub">{{ t('prayerTimes.remaining') }}</div>
        </div>

        <!-- Prayer rows -->
        <div class="qn-card pt-list-card">
          <div
            v-for="p in prayerRows"
            :key="p.key"
            class="pt-row"
            :class="{
              'pt-row--active': p.isActive,
              'pt-row--passed': p.isPassed && !p.isActive,
            }"
          >
            <div class="pt-row-left">
              <span class="pt-row-emoji">{{ p.emoji }}</span>
              <div class="pt-row-info">
                <span class="pt-row-name">{{ p.label }}</span>
                <span v-if="p.isActive" class="pt-now-badge">{{ t('prayerTimes.now') }}</span>
              </div>
            </div>
            <span class="pt-row-time" :class="{ 'pt-row-time--active': p.isActive }">{{ p.time }}</span>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const PRAYERS_META = [
  { key: 'Fajr',    emoji: '🌅', labelKey: 'prayerTimes.fajr',    isPrayer: true  },
  { key: 'Sunrise', emoji: '☀️', labelKey: 'prayerTimes.sunrise',  isPrayer: false },
  { key: 'Dhuhr',   emoji: '🌤️', labelKey: 'prayerTimes.dhuhr',   isPrayer: true  },
  { key: 'Asr',     emoji: '🌥️', labelKey: 'prayerTimes.asr',     isPrayer: true  },
  { key: 'Maghrib', emoji: '🌇', labelKey: 'prayerTimes.maghrib',  isPrayer: true  },
  { key: 'Isha',    emoji: '🌙', labelKey: 'prayerTimes.isha',     isPrayer: true  },
]

const loading  = ref(true)
const locating = ref(false)
const error    = ref(null)
const timings  = ref(null)
const now      = ref(new Date())
const lat      = ref(41.2995)
const lng      = ref(69.2401)
const cityName = ref('Toshkent')

let ticker       = null
let initialized  = false
let lastActiveKey = null

const todayStr = computed(() =>
  now.value.toLocaleDateString('uz-UZ', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })
)

const locationLabel = computed(() => cityName.value)

function nowMinutes() {
  return now.value.getHours() * 60 + now.value.getMinutes()
}

function parseTime(timeStr) {
  const [h, m] = timeStr.split(':').map(Number)
  return h * 60 + m
}

const prayerRows = computed(() => {
  if (!timings.value) return []
  const nm = nowMinutes()

  const rows = PRAYERS_META.map(meta => ({
    ...meta,
    label: t(meta.labelKey),
    time:  timings.value[meta.key],
    mins:  parseTime(timings.value[meta.key]),
  }))

  let activeIdx = -1
  for (let i = rows.length - 1; i >= 0; i--) {
    if (rows[i].isPrayer && rows[i].mins <= nm) {
      activeIdx = i
      break
    }
  }

  return rows.map((row, i) => ({
    ...row,
    isActive: i === activeIdx,
    isPassed: row.mins < nm,
  }))
})

const nextPrayerInfo = computed(() =>
  prayerRows.value.find(r => r.isPrayer && !r.isPassed && !r.isActive) || null
)

const countdown = computed(() => {
  if (!nextPrayerInfo.value) return '--:--'
  const [h, m] = nextPrayerInfo.value.time.split(':').map(Number)
  const target = new Date(now.value)
  target.setHours(h, m, 0, 0)
  if (target <= now.value) target.setDate(target.getDate() + 1)
  const totalSecs = Math.floor(Math.max(0, target - now.value) / 1000)
  const hh = Math.floor(totalSecs / 3600)
  const mm = Math.floor((totalSecs % 3600) / 60)
  const ss = totalSecs % 60
  if (hh > 0) return `${hh}:${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`
  return `${mm}:${String(ss).padStart(2, '0')}`
})

// ── Prayer time alert sound ───────────────────────────────────────
function playPrayerAlert() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const notes = [440, 554.37, 659.25, 880]  // A4 C#5 E5 A5

    notes.forEach((freq, i) => {
      const osc  = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = 'sine'
      osc.frequency.value = freq

      const t0 = ctx.currentTime + i * 0.45
      gain.gain.setValueAtTime(0, t0)
      gain.gain.linearRampToValueAtTime(0.28, t0 + 0.06)
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + 2.2)
      osc.start(t0)
      osc.stop(t0 + 2.2)
    })
  } catch {
    // AudioContext unavailable
  }
}

watch(prayerRows, rows => {
  const active    = rows.find(r => r.isActive)
  const activeKey = active?.key ?? null

  if (initialized && activeKey !== null && activeKey !== lastActiveKey) {
    playPrayerAlert()
  }

  lastActiveKey = activeKey
  initialized   = true
})

// ── Data fetching ─────────────────────────────────────────────────
async function loadTimes() {
  loading.value = true
  error.value   = null
  try {
    const ts  = Math.floor(Date.now() / 1000)
    const url = `https://api.aladhan.com/v1/timings/${ts}?latitude=${lat.value}&longitude=${lng.value}&method=3`
    const res = await fetch(url)
    if (!res.ok) throw new Error()
    const data = await res.json()
    if (data.code === 200) {
      timings.value = data.data.timings
    } else {
      error.value = t('prayerTimes.fetchError')
    }
  } catch {
    error.value = t('prayerTimes.fetchError')
  } finally {
    loading.value = false
  }
}

async function getCityName(la, lo) {
  try {
    const res  = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${la}&lon=${lo}&format=json`,
      { headers: { 'Accept-Language': 'uz' } }
    )
    const data = await res.json()
    const city =
      data.address?.city  ||
      data.address?.town  ||
      data.address?.village ||
      data.address?.county
    if (city) {
      cityName.value = city
      localStorage.setItem('pt_city', city)
    }
  } catch { /* silent */ }
}

function requestLocation() {
  if (!navigator.geolocation || locating.value) return
  locating.value = true
  navigator.geolocation.getCurrentPosition(
    async pos => {
      lat.value = pos.coords.latitude
      lng.value = pos.coords.longitude
      localStorage.setItem('pt_lat', lat.value)
      localStorage.setItem('pt_lng', lng.value)
      locating.value = false
      await Promise.all([loadTimes(), getCityName(lat.value, lng.value)])
    },
    () => { locating.value = false },
    { timeout: 10000 }
  )
}

onMounted(() => {
  const cachedLat  = localStorage.getItem('pt_lat')
  const cachedLng  = localStorage.getItem('pt_lng')
  const cachedCity = localStorage.getItem('pt_city')
  if (cachedLat && cachedLng) {
    lat.value = Number(cachedLat)
    lng.value = Number(cachedLng)
    if (cachedCity) cityName.value = cachedCity
  }
  loadTimes()
  ticker = setInterval(() => { now.value = new Date() }, 1000)
})

onUnmounted(() => clearInterval(ticker))
</script>

<style scoped>
/* ── Hero overrides ─────────────────────────────────────────────── */
.pt-hero {
  text-align: center;
  padding: 28px 20px 22px;
}
.pt-date {
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.75);
  margin-bottom: 4px;
  text-transform: capitalize;
  letter-spacing: 0.02em;
}
.pt-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 14px;
}
.pt-loc-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 20px;
  padding: 7px 16px;
  font-size: 0.82rem;
  color: rgba(255, 255, 255, 0.9);
  cursor: pointer;
  transition: background 0.2s;
  backdrop-filter: blur(4px);
}
.pt-loc-btn:hover,
.pt-loc-btn--loading {
  background: rgba(255, 255, 255, 0.28);
}

/* ── Body wrapper (adds horizontal padding for cards) ─────────── */
.pt-body {
  padding: 12px 16px 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* ── Skeleton ───────────────────────────────────────────────────── */
.pt-skeleton-row {
  padding: 16px;
}

/* ── Error ──────────────────────────────────────────────────────── */
.pt-error-card {
  text-align: center;
  padding: 40px 16px;
}
.pt-error-icon { font-size: 2.2rem; margin-bottom: 10px; }
.pt-error-msg  { color: var(--text2); font-size: 0.9rem; margin-bottom: 16px; }

/* ── Next prayer card ───────────────────────────────────────────── */
.pt-next-card {
  background: linear-gradient(135deg, var(--teal) 0%, var(--teal-dark) 100%);
  border-radius: var(--radius);
  padding: 18px 20px 16px;
  color: #fff;
}
.pt-next-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}
.pt-next-label {
  font-size: 0.7rem;
  opacity: 0.8;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 600;
}
.pt-next-clock {
  font-size: 0.95rem;
  font-weight: 700;
  opacity: 0.9;
}
.pt-next-body {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}
.pt-next-emoji { font-size: 1.5rem; }
.pt-next-name  { font-size: 1.3rem; font-weight: 700; }
.pt-countdown {
  font-size: 2.5rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  font-variant-numeric: tabular-nums;
  line-height: 1;
}
.pt-countdown-sub {
  font-size: 0.7rem;
  opacity: 0.65;
  margin-top: 4px;
}

/* ── Prayer list ────────────────────────────────────────────────── */
.pt-list-card {
  padding: 0;
  overflow: hidden;
}
.pt-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 13px 16px;
  border-bottom: 1px solid var(--border);
  transition: background 0.15s;
}
.pt-row:last-child  { border-bottom: none; }
.pt-row--active     { background: var(--teal-light); }
.pt-row--passed     { opacity: 0.4; }

.pt-row-left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.pt-row-emoji { font-size: 1.2rem; line-height: 1; }
.pt-row-info  { display: flex; flex-direction: column; gap: 2px; }
.pt-row-name  { font-size: 0.95rem; font-weight: 500; color: var(--text1); }

.pt-now-badge {
  display: inline-block;
  font-size: 0.6rem;
  background: var(--teal);
  color: #fff;
  padding: 1px 7px;
  border-radius: 10px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  width: fit-content;
}
.pt-row-time {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text1);
  font-variant-numeric: tabular-nums;
}
.pt-row-time--active { color: var(--teal-dark); font-weight: 700; }
</style>
