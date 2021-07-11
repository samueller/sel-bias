<script lang="ts">
	import { onMount } from 'svelte'
	import * as d3 from '../../node_modules/d3/dist/d3.js'
	// import * as d3 from 'd3'

	import { px, px0, pycx, pycx0, pxy, pxy0, px0y, px0y0 } from '../lib/store'
	import latex from '../lib/latex'
	import { round2 } from '../lib/util'
	import { Viz } from '../lib/viz'

	let vizEl: SVGSVGElement, viz: Viz

	onMount(() => {
		viz = new Viz(vizEl)
		viz.drawAxes()
		viz.drawGridLines()
	})
</script>

<svelte:head>
	<link
		rel="stylesheet"
		href="https://cdn.jsdelivr.net/npm/katex@0.13.11/dist/katex.min.css"
		integrity="sha384-Um5gpz1odJg5Z4HAmzPtgZKdTBHZdw8S29IecapCSB31ligYPhHQZMIlWLYQGVoc"
		crossorigin="anonymous"
	/>
	<link rel="stylesheet" href="/css/viz.css" />
</svelte:head>

<h1 class="title">Exposing Selection Bias</h1>
<svg bind:this={vizEl} width="575" height="575" />
<div id="stats-window" />
<form id="plot-controls">
	<div class="field">
		<div class="control">
			<input id="px-slider" name="px" min="0" max="1" bind:value={$px} step="0.01" type="range" />
			<output id="px-output" for="px-slider"
				>{@html latex(`P(x) = ${round2($px)}, P(x') = ${round2($px0)}`)}</output
			>
		</div>
	</div>
	<div class="field">
		<div class="control">
			<input
				id="pycx-slider"
				name="pycx"
				min="0"
				max="1"
				bind:value={$pycx}
				step="0.01"
				type="range"
			/>
			<output id="pycx-output" for="pycx-slider">{@html latex(`P(y|x) = ${round2($pycx)}`)}</output>
		</div>
	</div>
	<div class="field">
		<div class="control">
			<input
				id="pycxp-slider"
				name="pycxp"
				min="0"
				max="1"
				bind:value={$pycx0}
				step="0.01"
				type="range"
			/>
			<output id="pycxp-output" for="pycxp-slider"
				>{@html latex(`P(y|x') = ${round2($pycx0)}`)}</output
			>
		</div>
	</div>
	<div>
		<output id="pxy-output"
			>{@html latex(
				`P(x,y) = ${round2($pxy)}, P(x,y') = ${round2($pxy0)}, P(x',y) = ${round2(
					$px0y
				)}, P(x',y') = ${round2($px0y0)}`
			)}</output
		>
	</div>
</form>
