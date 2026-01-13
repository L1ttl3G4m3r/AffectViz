<script>
  import { onMount } from 'svelte';

  /* ================= Water animation ================= */

  let canvas;
  let ctx;
  let t = 0;
  let dpr = window.devicePixelRatio || 1;

  function resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;

    canvas.width = w * dpr;
    canvas.height = h * dpr;

    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function noise(x, y, t) {
    return (
      Math.sin(x * 0.014 + t) +
      Math.sin(y * 0.018 + t * 1.2) +
      Math.sin((x + y) * 0.009 + t * 0.6)
    );
  }

  function draw() {
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;

    ctx.clearRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'lighter';

    for (let y = 0; y < h; y += 2) {
      for (let x = 0; x < w; x += 2) {
        const n = noise(x, y, t);
        const intensity = Math.max(0, n) * 0.35;

        if (intensity > 0.04) {
          ctx.fillStyle = `rgba(160,220,245,${Math.min(intensity, 0.08)})`;
          ctx.fillRect(x, y, 2, 2);
        }
      }
    }

    ctx.globalCompositeOperation = 'source-over';
    t += 0.01;
    requestAnimationFrame(draw);
  }

  /* ================= State ================= */

  let overallScore = null;

  let movementState = 0;
  const MOVEMENT_STATES = 14;

  let sleepState = 0;
  const SLEEP_STATES = 14;

  let workoutPlumes = Array(7).fill(false);

  /* ================= Mount ================= */

  onMount(async () => {
    ctx = canvas.getContext('2d');
    resize();
    window.addEventListener('resize', resize);
    draw();

    const scoreRes = await fetch('/api/overall-score', { credentials: 'include' });
    overallScore = (await scoreRes.json())?.overallScore ?? null;

    const movementRes = await fetch('/api/movement-coral', { credentials: 'include' });
    const movementGrowth = (await movementRes.json())?.growth ?? 0;
    movementState = Math.min(MOVEMENT_STATES - 1, Math.floor(movementGrowth * MOVEMENT_STATES));

    const sleepRes = await fetch('/api/sleep-coral', { credentials: 'include' });
    const sleepGrowth = (await sleepRes.json())?.growth ?? 0;
    sleepState = Math.min(SLEEP_STATES - 1, Math.floor(sleepGrowth * SLEEP_STATES));

    const workoutRes = await fetch('/api/workout-coral', { credentials: 'include' });
    workoutPlumes = (await workoutRes.json())?.plumes ?? workoutPlumes;
  });

  /* SVG math */
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  $: dashOffset =
    overallScore !== null
      ? circumference * (1 - overallScore / 100)
      : circumference;
</script>

<div class="dashboard-page">
  <canvas class="water-canvas" bind:this={canvas}></canvas>

  <!-- Top navigation bubbles -->
  <div class="top-nav">
    <button class="bubble-button" aria-label="History">
      <img src="/icons/clock.png" alt="" class="icon static" />
      <img src="/icons/clock.gif" alt="" class="icon animated" />
    </button>

    <button class="bubble-button" aria-label="Settings">
      <img src="/icons/settings.png" alt="" class="icon static" />
      <img src="/icons/settings.gif" alt="" class="icon animated" />
    </button>
  </div>

  <!-- Overall score -->
  {#if overallScore !== null}
    <div class="overall-score-container">
      <div class="overall-score-label">Daily score</div>
      <div class="overall-score-bubble">
        <svg viewBox="0 0 80 80">
          <circle cx="40" cy="40" r={radius} stroke="rgba(255,255,255,0.25)" stroke-width="3" fill="none" />
          <circle
            cx="40"
            cy="40"
            r={radius}
            stroke="rgba(255,255,255,0.95)"
            stroke-width="3"
            fill="none"
            stroke-linecap="round"
            stroke-dasharray={circumference}
            stroke-dashoffset={dashOffset}
            transform="rotate(-90 40 40)"
          />
        </svg>
        <div class="score-text">{overallScore}%</div>
      </div>
    </div>
  {/if}

  <!-- Background layers -->
  <img src="/background/rock.png" alt="" class="rock-layer" />

  <div class="movement-anchor">
    <div class="movement-coral">
      <img
        src={`/coralMovement/movement-${movementState}.png`}
        alt=""
        class="movement-coral-image"
      />
    </div>
  </div>

  <div class="sleep-anchor">
    <div class="sleep-coral">
      <img
        src={`/coralSleep/sleep-${sleepState}.png`}
        alt=""
        class="sleep-coral-image"
      />
    </div>
  </div>

  <!-- Sport coral + workout plumes -->
  <div class="sport-anchor">
    <div class="sport-coral">
      <img src="/background/sportCoral.png" alt="" class="sport-coral-image" />

      {#each workoutPlumes as plume, i}
        {#if plume.visible}
          <img
            src={`/coralWorkout/plume-${i}.png`}
            alt="Workout plume"
            class={`workout-plume plume-${i}`}
          />
        {/if}
      {/each}
    </div>
  </div>
</div>
