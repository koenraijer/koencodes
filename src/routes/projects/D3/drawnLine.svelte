<!--
    from: https://www.youtube.com/watch?v=GYXuOvX_fns&t=1440s 
-->
<script>
	import Line from '$lib/D3/Line.svelte'
	
    let data = [
        {age: 24, temp: 37.2},
        {age: 24.1, temp: 37.1},
        {age: 24.2, temp: 36.8},
        {age: 24.3, temp: 37.6},
        {age: 24.4, temp: 36.7},
        {age: 24.5, temp: 37.2},
        {age: 24.6, temp: 36.5},
        {age: 24.7, temp: 36.9},
    ];

    let show;

</script>

<div class="container">
    <label for="show" style="display: inline;">show curve:</label>
    <input id="show" type="checkbox" bind:checked={show} />
    
    <Line {data} {show} />
        
</div>

<style lang="scss">
    .container {
      max-width: 1300px;
      @media screen and (max-width: 600px) {
          max-width: 100vw;
      }
      margin: var(--spacing-unit) auto var(--spacing-unit);
    }
</style>