<template>
  <div class="qn-page fade-in">
    <!-- Hero band -->
    <div class="qn-hero">
      <div
        style="
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          position: relative;
          z-index: 1;
        "
      >
        <div>
          <div style="font-size: 13px; opacity: 0.8; font-weight: 400">
            {{ t("dashboard.greeting") }}
          </div>
          <div
            style="
              font-size: 22px;
              font-weight: 700;
              margin-top: 2px;
              letter-spacing: -0.3px;
            "
          >
            {{ displayName }}
          </div>
          <div
            style="
              font-size: 12px;
              opacity: 0.7;
              margin-top: 4px;
              text-transform: capitalize;
            "
          >
            {{ todayLabel }}
          </div>
        </div>
        <div class="streak-badge">
          🔥 {{ tracker.streak.value }} {{ t("dashboard.streak") }}
        </div>
      </div>
    </div>

    <!-- Stat cards -->
    <SkeletonStatCards v-if="showSkeleton" />
    <div v-else class="stat-grid">
      <div class="stat-card">
        <div class="stat-num" style="color: var(--teal)">
          {{ totalRemaining }}
        </div>
        <div class="stat-label">{{ t("dashboard.totalQazo") }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-num" style="color: var(--green)">
          {{ todayDoneCount }}
        </div>
        <div class="stat-label">{{ t("dashboard.completedToday") }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-num" style="color: var(--amber)">
          {{ remainingToday }}
        </div>
        <div class="stat-label">{{ t("dashboard.remaining") }}</div>
      </div>
    </div>

    <!-- Desktop 2-col layout -->
    <div class="desktop-dash-grid">
      <div class="desktop-dash-col">
        <div class="qn-section-label" style="padding-left: 0; padding-right: 0">
          {{ t("dashboard.progress") }}
        </div>
        <div class="qn-card" style="margin: 0">
          <DashboardProgress
            :qazo="prayerStore.qazo"
            :completed-counts="prayerStore.completedCounts"
          />
        </div>
        <div class="qn-section-label" style="padding-left: 0; padding-right: 0">
          {{ t("dashboard.heatmapTitle") }}
        </div>
        <div class="qn-card" style="margin: 0; padding: 16px 0 12px">
          <ActivityHeatmap :history="prayerStore.history" />
        </div>
      </div>

      <div class="desktop-dash-col">
        <div class="qn-section-label" style="padding-left: 0; padding-right: 0">
          {{ t("dashboard.todayPlan") }}
        </div>
        <div class="qn-card" style="margin: 0">
          <SkeletonPrayerRows v-if="showSkeleton" />
          <template v-else>
            <PrayerRow
              v-for="p in PRAYERS"
              :key="p"
              :prayer="p"
              :remaining="prayerStore.qazo[p]"
              :today-count="tracker.todayCount.value[p] || 0"
              :daily-goal="tracker.dailyGoals.value[p] || 0"
              :is-busy="tracker.isLoading.value"
              @complete="handleComplete(p)"
              @undo="handleUndo(p)"
            />
          </template>
        </div>
        <div style="margin-top: 12px">
          <button class="qn-add-btn" @click="showModal = true">
            ＋ {{ t("dashboard.quickAdd") }}
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile-only sections -->
    <div class="mobile-only-dash">
      <div class="qn-section-label">{{ t("dashboard.progress") }}</div>
      <div class="qn-card" style="margin: 0 20px">
        <DashboardProgress
          :qazo="prayerStore.qazo"
          :completed-counts="prayerStore.completedCounts"
        />
      </div>
      <div class="qn-section-label">{{ t("dashboard.todayPlan") }}</div>
      <div class="qn-card" style="margin: 0 20px">
        <SkeletonPrayerRows v-if="showSkeleton" />
        <template v-else>
          <PrayerRow
            v-for="p in PRAYERS"
            :key="p"
            :prayer="p"
            :remaining="prayerStore.qazo[p]"
            :today-count="tracker.todayCount.value[p] || 0"
            :daily-goal="tracker.dailyGoals.value[p] || 0"
            :is-busy="tracker.isLoading.value"
            @complete="handleComplete(p)"
            @undo="handleUndo(p)"
          />
        </template>
      </div>
      <div class="qn-section-label">{{ t("dashboard.heatmapTitle") }}</div>
      <div class="qn-card" style="margin: 0 20px; padding: 16px 0 12px">
        <ActivityHeatmap :history="prayerStore.history" />
      </div>

      <div style="padding: 16px 20px 8px">
        <button class="qn-add-btn" @click="showModal = true">
          ＋ {{ t("dashboard.quickAdd") }}
        </button>
      </div>
    </div>

    <div style="padding-bottom: 12px" />

    <QuickAddModal v-if="showModal" @close="showModal = false" />
    <CongratsModal
      :show="tracker.showCongrats.value"
      @close="tracker.showCongrats.value = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, defineComponent, defineAsyncComponent, h } from "vue";
import { useI18n } from "vue-i18n";
import { showSuccess, showInfo } from "../utils/message.js";
import { useAuthStore } from "../stores/useAuthStore.js";
import { usePrayerStore } from "../stores/usePrayerStore.js";
import { usePrayerTracker } from "../composables/usePrayerTracker.js";
import {
  PRAYERS,
  PRAYER_EMOJIS,
  PRAYER_COLORS,
} from "../utils/prayerConstants.js";
import ActivityHeatmap    from "../components/ActivityHeatmap.vue";
import ProgressRing       from "../components/ProgressRing.vue";
import SkeletonStatCards  from "../components/SkeletonStatCards.vue";
import SkeletonPrayerRows from "../components/SkeletonPrayerRows.vue";
import { useSkeleton }    from "../composables/useSkeleton.js";

// Loaded on first use — not part of the initial page bundle
const QuickAddModal = defineAsyncComponent(() =>
  import("../components/QuickAddModal.vue")
);
const CongratsModal = defineAsyncComponent(() =>
  import("../components/CongratsModal.vue")
);

const { t, locale } = useI18n();
const authStore = useAuthStore();
const prayerStore = usePrayerStore();
const tracker = usePrayerTracker();

const showSkeleton = useSkeleton(tracker.isLoading);

const showModal = ref(false);

const displayName = computed(
  () =>
    authStore.currentUser?.displayName ||
    authStore.currentUser?.email?.split("@")[0] ||
    "User"
);

const todayLabel = computed(() =>
  new Date().toLocaleDateString(
    locale.value === "uz" ? "uz-UZ" : locale.value === "ru" ? "ru-RU" : "en-US",
    { weekday: "long", day: "numeric", month: "long" }
  )
);

const totalRemaining = computed(() =>
  PRAYERS.reduce((s, p) => s + (prayerStore.qazo[p] || 0), 0)
);

// Total prayers completed today across all types
const todayDoneCount = computed(() =>
  PRAYERS.reduce((s, p) => s + (tracker.todayCount.value[p] || 0), 0)
);

// Remaining = sum of unmet goals; falls back to (6 - prayer types done at least once)
const remainingToday = computed(() => {
  const hasGoals = PRAYERS.some((p) => (tracker.dailyGoals.value[p] || 0) > 0);
  if (hasGoals) {
    return PRAYERS.reduce((s, p) => {
      const gap =
        (tracker.dailyGoals.value[p] || 0) - (tracker.todayCount.value[p] || 0);
      return s + Math.max(0, gap);
    }, 0);
  }
  return (
    6 - PRAYERS.filter((p) => (tracker.todayCount.value[p] || 0) > 0).length
  );
});

// ── Actions ──────────────────────────────────────────────────────────────────
async function handleComplete(prayer) {
  const uid = authStore.currentUser?.uid;
  if (!uid || (prayerStore.qazo[prayer] || 0) <= 0) return;

  const added = await tracker.addPrayerDone(uid, prayer);
  if (added) {
    prayerStore.completePrayer(prayer);
    showSuccess(`${t(`prayers.${prayer}`)} ${t('messages.prayerCompleted')}`)
  }
}

async function handleUndo(prayer) {
  const uid = authStore.currentUser?.uid;
  if (!uid) return;

  const undone = await tracker.undoPrayerDone(uid, prayer);
  if (undone) {
    prayerStore.uncompletePrayer(prayer);
    showInfo(t('messages.prayerUndone'))
  }
}

// ── DashboardProgress (inline sub-component) ─────────────────────────────────
const DashboardProgress = defineComponent({
  props: { qazo: Object, completedCounts: Object },
  setup(props) {
    const { t } = useI18n();
    const totalCompleted = computed(() =>
      PRAYERS.reduce((s, p) => s + (props.completedCounts?.[p] || 0), 0)
    );
    const totalRemaining = computed(() =>
      PRAYERS.reduce((s, p) => s + (props.qazo?.[p] || 0), 0)
    );
    const grandTotal = computed(
      () => totalCompleted.value + totalRemaining.value
    );
    const pct = computed(() =>
      grandTotal.value > 0
        ? Math.round((totalCompleted.value / grandTotal.value) * 100)
        : 0
    );

    return () =>
      h("div", [
        h(
          "div",
          {
            style:
              "display:flex;flex-direction:column;align-items:center;padding:24px 20px 16px",
          },
          [
            h(ProgressRing, { pct: pct.value, size: 130, stroke: 12 }),
            h(
              "div",
              { style: "font-size:13px;color:var(--text2);margin-top:10px" },
              `${totalCompleted.value} / ${grandTotal.value} ${t(
                "dashboard.done"
              ).toLowerCase()}`
            ),
          ]
        ),
        h(
          "div",
          {
            style:
              "padding:0 16px 16px;display:flex;flex-direction:column;gap:8px",
          },
          PRAYERS.map((p) => {
            const comp = props.completedCounts?.[p] || 0;
            const total = comp + (props.qazo?.[p] || 0);
            const barPct = total > 0 ? Math.round((comp / total) * 100) : 0;
            return h(
              "div",
              { key: p, style: "display:flex;align-items:center;gap:10px" },
              [
                h(
                  "div",
                  {
                    style:
                      "font-size:13px;font-weight:500;color:var(--text1);width:80px;flex-shrink:0;display:flex;align-items:center;gap:6px",
                  },
                  [
                    h("span", PRAYER_EMOJIS[p]),
                    h(
                      "span",
                      { style: "font-size:12px" },
                      t(`prayers.${p}`).split(" ")[0]
                    ),
                  ]
                ),
                h("div", { class: "qn-progress-bar-track" }, [
                  h("div", {
                    class: "qn-progress-bar-fill",
                    style: `width:${barPct}%;background:${PRAYER_COLORS[p]}`,
                  }),
                ]),
                h(
                  "div",
                  {
                    style:
                      "font-size:12px;color:var(--text2);width:32px;text-align:right;flex-shrink:0",
                  },
                  `${barPct}%`
                ),
              ]
            );
          })
        ),
      ]);
  },
});

// ── PrayerRow (inline sub-component) ─────────────────────────────────────────
const PrayerRow = defineComponent({
  props: {
    prayer: String,
    remaining: { type: Number, default: 0 },
    todayCount: { type: Number, default: 0 }, // completions today
    dailyGoal: { type: Number, default: 0 }, // target for today
    isBusy: { type: Boolean, default: false },
  },
  emits: ["complete", "undo"],
  setup(props, { emit }) {
    const { t } = useI18n();

    const CheckIcon = () =>
      h(
        "svg",
        {
          width: "16",
          height: "16",
          viewBox: "0 0 24 24",
          fill: "none",
          stroke: "white",
          "stroke-width": "2.5",
          "stroke-linecap": "round",
          "stroke-linejoin": "round",
        },
        [h("polyline", { points: "20 6 9 17 4 12" })]
      );

    const PlusIcon = () =>
      h(
        "svg",
        {
          width: "14",
          height: "14",
          viewBox: "0 0 24 24",
          fill: "none",
          stroke: "currentColor",
          "stroke-width": "2.5",
          "stroke-linecap": "round",
        },
        [
          h("line", { x1: "12", y1: "5", x2: "12", y2: "19" }),
          h("line", { x1: "5", y1: "12", x2: "19", y2: "12" }),
        ]
      );

    const MinusIcon = () =>
      h(
        "svg",
        {
          width: "12",
          height: "12",
          viewBox: "0 0 24 24",
          fill: "none",
          stroke: "currentColor",
          "stroke-width": "2.5",
          "stroke-linecap": "round",
        },
        [h("line", { x1: "5", y1: "12", x2: "19", y2: "12" })]
      );

    return () => {
      const exhausted = (props.remaining || 0) <= 0;
      const hasDone = props.todayCount > 0;
      const goalMet =
        props.dailyGoal > 0 && props.todayCount >= props.dailyGoal;

      return h(
        "div",
        {
          class: "qn-prayer-row",
          style: `opacity:${
            exhausted && !hasDone ? 0.45 : 1
          };transition:opacity 0.2s`,
        },
        [
          // Prayer icon
          h(
            "div",
            {
              class: "qn-prayer-icon",
              style: `background:${PRAYER_COLORS[props.prayer]}20`,
            },
            h("span", { style: "font-size:20px" }, PRAYER_EMOJIS[props.prayer])
          ),

          // Text block
          h("div", { style: "flex:1;min-width:0" }, [
            h(
              "div",
              { style: "font-size:15px;font-weight:600;color:var(--text1)" },
              t(`prayers.${props.prayer}`)
            ),
            h(
              "div",
              {
                style:
                  "font-size:12px;color:var(--text2);margin-top:2px;display:flex;align-items:center;gap:6px;flex-wrap:wrap",
              },
              [
                // Remaining qazo count
                h(
                  "span",
                  `${props.remaining} ${t("dashboard.count")} ${t(
                    "dashboard.remaining"
                  ).toLowerCase()}`
                ),
                // Today badge: shows "- 3 bajarildi" or "- ✓ 5/5"
                hasDone
                  ? h(
                      "span",
                      {
                        style: `display:inline-flex;align-items:center;gap:3px;
                      background:${
                        goalMet
                          ? "var(--green-light,#dcfce7)"
                          : "var(--teal-light,#e6f7f4)"
                      };
                      color:${goalMet ? "#166534" : "var(--teal-dark,#1a6b5a)"};
                      border-radius:10px;padding:2px 8px;font-size:11px;font-weight:600`,
                      },
                      [
                        h("span", "−"),
                        h(
                          "span",
                          props.dailyGoal > 0
                            ? `${props.todayCount}/${props.dailyGoal} ${t(
                                "dashboard.done"
                              ).toLowerCase()}`
                            : `${props.todayCount} ${t(
                                "dashboard.done"
                              ).toLowerCase()}`
                        ),
                      ]
                    )
                  : null,
              ]
            ),
          ]),

          // Buttons (right side)
          h(
            "div",
            {
              style:
                "display:flex;align-items:center;gap:6px;flex-shrink:0;position:relative",
            },
            [
              // ── Undo last completion ────────────────────────────────────────
              hasDone
                ? h(
                    "button",
                    {
                      class: "qn-undo-btn",
                      title: "Oxirgi bajarishni bekor qilish",
                      disabled: props.isBusy,
                      onClick: (e) => {
                        e.stopPropagation();
                        emit("undo");
                      },
                    },
                    h(MinusIcon)
                  )
                : null,

              // ── Mark done (+ or ✓ with count badge) ────────────────────────
              h(
                "button",
                {
                  class: `qn-check-btn${hasDone ? " done" : ""}`,
                  disabled: exhausted || props.isBusy,
                  style: "position:relative",
                  onClick: (e) => {
                    e.stopPropagation();
                    if (!exhausted) emit("complete");
                  },
                },
                [
                  hasDone ? h(CheckIcon) : h(PlusIcon),
                  // Badge: show count when > 1
                  props.todayCount > 1
                    ? h(
                        "span",
                        {
                          style: `position:absolute;top:-7px;right:-7px;
                          background:var(--teal);color:white;border-radius:50%;
                          width:17px;height:17px;font-size:10px;font-weight:700;
                          display:flex;align-items:center;justify-content:center;
                          border:2px solid var(--bg2,white)`,
                        },
                        String(props.todayCount)
                      )
                    : null,
                ]
              ),
            ]
          ),
        ]
      );
    };
  },
});
</script>

<style scoped>
.stat-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 10px;
  padding: 16px 20px 0;
}
.stat-card {
  background: var(--bg2);
  border-radius: var(--radius-sm);
  padding: 14px 10px;
  text-align: center;
  box-shadow: var(--shadow);
  border: 1px solid var(--border);
}
.stat-num {
  font-size: 24px;
  font-weight: 700;
  color: var(--text1);
  letter-spacing: -1px;
}
.stat-label {
  font-size: 11px;
  color: var(--text2);
  margin-top: 2px;
  font-weight: 500;
}

.streak-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--amber-light);
  border-radius: 20px;
  padding: 6px 12px;
  font-size: 13px;
  font-weight: 600;
  color: #92400e;
  margin-top: 4px;
  flex-shrink: 0;
}

/* Undo (−) button */
:deep(.qn-undo-btn) {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 8px;
  border: 1.5px solid var(--border);
  background: none;
  color: var(--text2);
  cursor: pointer;
  transition: all 0.15s;
  flex-shrink: 0;
}
:deep(.qn-undo-btn:hover) {
  background: var(--bg2);
  color: var(--text1);
}
:deep(.qn-undo-btn:disabled) {
  opacity: 0.35;
  cursor: not-allowed;
}

.desktop-dash-grid {
  display: none;
}
.mobile-only-dash {
  display: block;
}

@media (min-width: 768px) {
  .stat-grid {
    padding: 24px 32px 0;
    gap: 16px;
  }
  .stat-num {
    font-size: 32px;
  }
  .stat-card {
    padding: 20px 16px;
  }

  .desktop-dash-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0 24px;
    padding: 0 32px;
    margin-top: 24px;
  }
  .desktop-dash-col {
    display: flex;
    flex-direction: column;
  }
  .mobile-only-dash {
    display: none;
  }
}
</style>
