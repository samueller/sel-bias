<script lang="ts">
	import { onMount } from 'svelte'

	import { px, px0, pycx, pycx0, pxy, pxy0, px0y, px0y0, pyxUB, pyx0UB, bounds } from '../lib/store'
	import { latex } from '../lib/latex'
	import { round2 } from '../lib/util'

	import 'katex/dist/katex.css'

	let vizEl: SVGSVGElement
	let viz: import('../lib/viz').default

	onMount(async () => {
		viz = new (await import('../lib/viz')).default(vizEl)
	})
</script>

<h1 class="title">Exposing Selection Bias</h1>
<p>
	{@html latex(`\\text{ACE} - \\text{CACE} = [P(y_x) - P(y_{x'})] - [P(y_x|s) - P(y_{x'}|s)]`)}<br
	/>
	Colors visualize
	<label class="radio" for="lower-bounds"
		><input id="lower-bounds" name="bounds" bind:group={$bounds} value={0} type="radio" /> Lower bounds</label
	>
	<label class="radio" for="upper-bounds"
		><input id="upper-bounds" name="bounds" bind:group={$bounds} value={1} type="radio" /> Upper bounds</label
	>
</p>
<svg bind:this={vizEl} width="575" height="575"
	><defs
		><marker
			id="arrow"
			viewBox="0 0 10 10"
			refX="5"
			refY="5"
			markerWidth="6"
			markerHeight="6"
			orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" /></marker
		></defs
	></svg
>
<div id="hover-panel">
	<h3 class="title is-4">Selection Biased</h3>
	<ul>
		<li>
			{@html latex(`P(y_x|s), P(y_{x'}|s)`)}:
			<span id="hover-pyx">{@html latex(`(0.99, 0.99)`)}</span>
		</li>
		<!-- <li id="hover-pyx-bounds">{@html latex(`0.99 \\leqslant P(y_x|s) \\leqslant 0.99`)}</li>
		<li id="hover-pyx0-bounds">{@html latex(`0.99 \\leqslant P(y_x'|s) \\leqslant 0.99`)}</li> -->
		<li id="hover-pyx-bias">
			{@html latex(`0.99 \\leqslant P(y_x|s)\\!-\\!P(y_x) \\leqslant 0.99`)}
		</li>
		<li id="hover-pyx0-bias">
			{@html latex(`0.99 \\leqslant P(y_{x'}|s)\\!-\\!P(y_{x'}) \\leqslant 0.99`)}
		</li>
		<li id="hover-pyx-abs-bias">
			{@html latex(`0.99 \\leqslant |P(y_x|s)\\!-\\!P(y_x)| \\leqslant 0.99`)}
		</li>
		<li id="hover-pyx0-abs-bias">
			{@html latex(`0.99 \\leqslant |P(y_{x'}|s)\\!-\\!P(y_{x'})| \\leqslant 0.99`)}
		</li>
		<li id="hover-ace-bias">{@html latex(`0.99 \\leqslant |ACE - CACE| \\leqslant 0.99`)}</li>
		<!-- <li>Range: <span id="hover-range">{@html latex(`0`)}</span></li> -->
	</ul>
</div>
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
	<div>
		<output>
			{@html latex(`${round2($pxy)} \\leqslant P(y_x|s) \\leqslant ${round2($pyxUB)}`)}
		</output>
	</div>
	<div>
		<output>
			{@html latex(`${round2($px0y)} \\leqslant P(y_{x'}|s) \\leqslant ${round2($pyx0UB)}`)}
		</output>
	</div>
</form>

<style lang="scss" global>
	svg :not(rect.background) {
		pointer-events: none;
	}
	tspan.sub {
		font-size: 70%;
	}
	.axis-label {
		font-size: 9pt;
		text-anchor: middle;
	}
	text {
		font-family: 'Open Sans', sans-serif;
		font-size: 7pt;
	}
	text.contour {
		font-size: 9pt;
		font-weight: bold;
		dominant-baseline: middle;
	}
	line.grid {
		stroke: black;
		opacity: 0.1;
	}
	#hover-panel {
		/* display: none; */
		opacity: 0;
		pointer-events: none;
		position: absolute;
		left: 0;
		top: 0;
		width: 290px;
		border-radius: 5px;
		/* border: 1px solid black; */
		background-color: rgba(255, 255, 255, 0.4);
		color: black;
		line-height: 1.1;
		padding: 4px 7px;
	}
	#hover-panel.biased {
		color: rgb(108, 0, 0);
	}
	#hover-panel:not(.biased) h3 {
		display: none;
	}
	#hover-panel ul {
		margin: 0;
		padding: 0;
		list-style-type: none;
	}
	.biased {
		fill: black;
		fill-opacity: 0.3;
	}
	.biased h3 {
		margin-top: 0;
		margin-bottom: 2px !important;
		color: darkred;
		text-transform: uppercase;
	}
	.possibly-unbiased {
		stroke: green;
		stroke-width: 2;
		fill: transparent;
	}
	#arrow {
		fill: white;
	}
	text.possibly-unbiased-label {
		text-anchor: middle;
		font-size: 16px;
		font-weight: bold;
		fill: white;
		text-shadow: 1px 1px 1px black, 0 0 10px black;
		dominant-baseline: hanging;
	}
</style>
