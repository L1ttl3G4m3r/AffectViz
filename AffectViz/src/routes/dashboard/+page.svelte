<script>
  import { onMount } from 'svelte';

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

        // softer, more transparent light
        const intensity = Math.max(0, n) * 0.35;

        if (intensity > 0.04) {
          ctx.fillStyle = `rgba(
            160,
            220,
            245,
            ${Math.min(intensity, 0.08)}
          )`;
          ctx.fillRect(x, y, 2, 2);
        }
      }
    }

    ctx.globalCompositeOperation = 'source-over';
    t += 0.010;
    requestAnimationFrame(draw);
  }

  onMount(() => {
    ctx = canvas.getContext('2d');
    resize();
    window.addEventListener('resize', resize);
    draw();
  });
</script>

<div class="dashboard-page">
  <canvas class="water-canvas" bind:this={canvas}></canvas>

  <!-- future dashboard UI goes here -->
</div>
