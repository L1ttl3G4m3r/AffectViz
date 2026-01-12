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

  /* ================= Overall score ================= */

  let overallScore = null;
  let scoreError = null;

  onMount(async () => {
    ctx = canvas.getContext('2d');
    resize();
    window.addEventListener('resize', resize);
    draw();

    try {
      const res = await fetch('/api/overall-score', {
        credentials: 'include'
      });

      if (!res.ok) throw new Error('Failed to load score');

      const data = await res.json();
      if (data?.error) throw new Error(data.error);

      overallScore = data.overallScore;

    } catch (err) {
      scoreError = err.message;
    }
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

  <!-- Top navigation -->
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

  <!-- Overall score bubble -->
  {#if overallScore !== null}
    <div class="overall-score-container">
      <div class="overall-score-label">
        Daily score
      </div>

      <div class="overall-score-bubble">
        <svg viewBox="0 0 80 80">
          <circle
            cx="40"
            cy="40"
            r={radius}
            stroke="rgba(255,255,255,0.25)"
            stroke-width="3"
            fill="none"
          />
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
            style="transition: stroke-dashoffset 0.6s ease"
          />
        </svg>

        <div class="score-text">
          {overallScore}%
        </div>
      </div>
    </div>
  {/if}

  <!-- Midground -->
  <img src="/background/rock.png" alt="" class="rock-layer" />
  <img src="/background/sportCoral.png" alt="" class="sport-coral" />
</div>
