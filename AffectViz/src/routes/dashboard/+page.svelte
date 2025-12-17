<script>
    import { onMount } from 'svelte';
    let activity = [];

    onMount(async () => {
        const res = await fetch('/api/activity');
        activity = await res.json();
    });
</script>

<h1>Dashboard</h1>
<div class="gridstack">
    {#each activity as activity}
        <div class="grid-item">
            <pre>{JSON.stringify(activity, null, 2)}</pre>
        </div>
    {/each}
</div>
