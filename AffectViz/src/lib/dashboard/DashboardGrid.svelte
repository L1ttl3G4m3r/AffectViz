<script>
  import { onMount } from 'svelte';
  import ProfileWidget from './widgets/ProfileWidget.svelte';
  import LatestExerciseWidget from './widgets/LatestExerciseWidget.svelte';
  import DailyActivityWidget from './widgets/DailyActivityWidget.svelte';
  import SleepWidget from './widgets/SleepWidget.svelte';
  import NightlyRechargeWidget from './widgets/NightlyRechargeWidget.svelte';
  import PhysicalInfoWidget from './widgets/PhysicalInfoWidget.svelte';

  let grid;

  onMount(async () => {
    try {
      const { GridStack } = await import('gridstack');
      await new Promise(r => setTimeout(r, 50)); // give DOM a moment
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
  <div class="grid-stack-item" gs-w="1" gs-h="2">
    <div class="grid-stack-item-content">
      <ProfileWidget />
    </div>
  </div>

  <div class="grid-stack-item" gs-w="1" gs-h="2">
    <div class="grid-stack-item-content">
      <LatestExerciseWidget />
    </div>
  </div>

  <div class="grid-stack-item" gs-w="1" gs-h="2">
    <div class="grid-stack-item-content">
      <DailyActivityWidget />
    </div>
  </div>

  <div class="grid-stack-item" gs-w="1" gs-h="2">
    <div class="grid-stack-item-content">
      <SleepWidget />
    </div>
  </div>

  <div class="grid-stack-item" gs-w="1" gs-h="2">
    <div class="grid-stack-item-content">
      <NightlyRechargeWidget />
    </div>
  </div>

  <div class="grid-stack-item" gs-w="1" gs-h="2">
    <div class="grid-stack-item-content">
      <PhysicalInfoWidget />
    </div>
  </div>
</div>
