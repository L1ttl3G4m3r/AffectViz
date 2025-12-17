<script>
    import { onMount } from 'svelte';

    import ChartWidget from './widgets/ChartWidget.svelte';
    import StatsWidget from './widgets/StatsWidget.svelte';

    let grid;

    onMount(async () => {
        const { GridStack } = await import('gridstack');

        grid = GridStack.init({
            column: 1,
            cellHeight: 80,
            margin: 16,
            float: true,

            resizable: false,
        });
          grid.enableResize(false);
    });
</script>

<div class="grid-stack">
    <div class="grid-stack-item" gs-w="1" gs-h="2">
        <div class="grid-stack-item-content">
            <ChartWidget title="Sample" />
        </div>
    </div>

    <div class="grid-stack-item" gs-w="1" gs-h="2">
        <div class="grid-stack-item-content">
            <StatsWidget />
        </div>
    </div>
</div>