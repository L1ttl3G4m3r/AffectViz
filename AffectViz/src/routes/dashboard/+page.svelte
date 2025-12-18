<script>
  import { onMount } from 'svelte';

  // Import all widgets
  import ProfileWidget from '$lib/dashboard/widgets/ProfileWidget.svelte';
  import LatestExerciseWidget from '$lib/dashboard/widgets/LatestExerciseWidget.svelte';
  import DailyActivityWidget from '$lib/dashboard/widgets/DailyActivityWidget.svelte';
  import SleepWidget from '$lib/dashboard/widgets/SleepWidget.svelte';
  import NightlyRechargeWidget from '$lib/dashboard/widgets/NightlyRechargeWidget.svelte';
  import PhysicalInfoWidget from '$lib/dashboard/widgets/PhysicalInfoWidget.svelte';
  let grid;

  onMount(async () => {
    try {
      const { GridStack } = await import('gridstack');
      await new Promise(r => setTimeout(r, 50)); // wait for DOM
      grid = GridStack.init({ 
        column: 1,
        cellHeight: 120,
        margin: 16,
        float: true,
        resizable: false
      }, document.querySelector('.grid-stack'));
      grid.enableResize(false);
    } catch (err) {
      console.error('[Dashboard] GridStack init failed', err);
    }
  });
</script>

<h1>Polar Dashboard</h1>

<div class="grid-stack">
  <!-- Profile Widget -->
  <div class="grid-stack-item" gs-w="1" gs-h="2">
    <div class="grid-stack-item-content">
      <ProfileWidget />
    </div>
  </div>

  <!-- Latest Exercise Widget -->
  <div class="grid-stack-item" gs-w="1" gs-h="2">
    <div class="grid-stack-item-content">
      <LatestExerciseWidget />
    </div>
  </div>

  <!-- Daily Activity Widget -->
  <div class="grid-stack-item" gs-w="1" gs-h="2">
    <div class="grid-stack-item-content">
      <DailyActivityWidget />
    </div>
  </div>

  <!-- Sleep Widget -->
  <div class="grid-stack-item" gs-w="1" gs-h="2">
    <div class="grid-stack-item-content">
      <SleepWidget />
    </div>
  </div>

  <!-- Nightly Recharge Widget -->
  <div class="grid-stack-item" gs-w="1" gs-h="2">
    <div class="grid-stack-item-content">
      <NightlyRechargeWidget />
    </div>
  </div>

  <!-- Physical Info Widget -->
  <div class="grid-stack-item" gs-w="1" gs-h="2">
    <div class="grid-stack-item-content">
      <PhysicalInfoWidget />
    </div>
  </div>
</div>
