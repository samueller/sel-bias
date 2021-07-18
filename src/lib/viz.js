// import * as d3 from 'd3' //'https://cdn.skypack.dev/d3@7'
// import * as d3 from '../../node_modules/d3/dist/d3.js'
import { get } from 'svelte/store'
import { px, px0, pycx, pycx0, pxy, px0y, px0y0, pyxUB, pyx0UB, bounds } from './store'
import { round2, probabilitySvg, absoluteBounds } from './util'
import { latexElement } from './latex'

const updateHoverPanel = (pyxs, pyx0s, pxy, px0y, pyxUB, pyx0UB) => {
		const pyxBiasLB = pyxs - pyxUB,
			pyxBiasUB = pyxs - pxy,
			pyx0BiasLB = pyx0s - pyx0UB,
			pyx0BiasUB = pyx0s - px0y,
			[pyxAbsBiasLB, pyxAbsBiasUB] = absoluteBounds(pyxBiasLB, pyxBiasUB),
			[pyx0AbsBiasLB, pyx0AbsBiasUB] = absoluteBounds(pyx0BiasLB, pyx0BiasUB),
			acesUB = pxy + get(px0y0) - pyxs + pyx0s,
			[acesAbsLB, acesAbsUB] = absoluteBounds(acesUB - 1, acesUB)
		latexElement('hover-pyx')(`(${round2(pyxs)}, ${round2(pyx0s)})`)
		latexElement('hover-pyx-bias')(
			`${round2(pyxBiasLB)} \\leqslant P(y_x|s)\\!-\\!P(y_x) \\leqslant ${round2(pyxBiasUB)}`
		)
		latexElement('hover-pyx-abs-bias')(
			`${round2(pyxAbsBiasLB)} \\leqslant |P(y_x|s)\\!-\\!P(y_x)| \\leqslant ${round2(
				pyxAbsBiasUB
			)}`
		)
		latexElement('hover-pyx0-bias')(
			`${round2(pyx0BiasLB)} \\leqslant P(y_{x'}|s)\\!-\\!P(y_{x'}) \\leqslant ${round2(
				pyx0BiasUB
			)}`
		)
		latexElement('hover-pyx0-abs-bias')(
			`${round2(pyx0AbsBiasLB)} \\leqslant |P(y_{x'}|s)\\!-\\!P(y_{x'})| \\leqslant ${round2(
				pyx0AbsBiasUB
			)}`
		)
		latexElement('hover-ace-bias')(
			`${round2(acesAbsLB)} \\leqslant |ACE - CACE| \\leqslant ${round2(acesAbsUB)}`
		)
	},
	biasedRegionPoly = (px, px0, pxy, px0y) => {
		const windowRight = pxy + px0
		const windowTop = px0y + px
		return [
			[0, 0],
			[1, 0],
			[1, 1],
			[0, 1],
			[0, 0],
			[pxy, px0y],
			[windowRight, px0y],
			[windowRight, windowTop],
			[pxy, windowTop],
			[pxy, px0y]
		]
	}

class Viz {
	constructor(el, axisMargin = 25, labelMargin = 25) {
		this.svg = d3.select(el)
		this.width = el.clientWidth
		this.height = el.clientHeight
		this.marginLeft = this.marginBottom = axisMargin + labelMargin
		this.marginTop = this.marginRight = axisMargin
		this.plotLeft = this.marginLeft
		this.plotRight = this.width - this.marginRight
		this.plotTop = this.marginTop
		this.plotBottom = this.height - this.marginBottom
		this.plotWidth = this.plotRight - this.plotLeft
		this.plotHeight = this.plotBottom - this.plotTop
		this.scaleX = d3.scaleLinear().range([this.plotLeft, this.plotRight]).domain([0, 1])
		this.scaleY = d3.scaleLinear().range([this.plotBottom, this.plotTop]).domain([0, 1])
		this.leftEdge = this.scaleX(0)
		this.rightEdge = this.scaleX(1)
		this.bottomEdge = this.scaleY(0)
		this.topEdge = this.scaleY(1)
		this.axisLeft = d3.axisLeft(this.scaleY)
		this.axisRight = d3.axisRight(this.scaleY)
		this.axisTop = d3.axisTop(this.scaleX)
		this.axisBottom = d3.axisBottom(this.scaleX)
		this.numContours = 10

		this.drawAxes()
		this.drawGridLines()
		this.drawContours()
		this.drawDiagonal()
		this.setupHoverWindow()
		this.drawBiasedRegion(get(px), get(px0), get(pxy), get(px0y))
		px.subscribe(px => this.updateBiasedRegion(px, get(px0), get(pxy), get(px0y)))
		pycx.subscribe(_ => this.updateBiasedRegion(get(px), get(px0), get(pxy), get(px0y)))
		pycx0.subscribe(_ => this.updateBiasedRegion(get(px), get(px0), get(pxy), get(px0y)))
		pxy.subscribe(pxy => this.updateContours(pxy, get(px0y0), get(bounds)))
		px0y0.subscribe(px0y0 => this.updateContours(get(pxy), px0y0, get(bounds)))
		bounds.subscribe(bounds => this.updateContours(get(pxy), get(px0y0), bounds))
	}
	drawAxes() {
		this.svg
			.append('g')
			.attr('transform', `translate(${[0, this.plotBottom]})`)
			.call(this.axisBottom)
		this.svg
			.append('g')
			.attr('transform', `translate(${[0, this.plotTop]})`)
			.call(this.axisTop)
		this.svg
			.append('g')
			.attr('transform', `translate(${[this.plotLeft, 0]})`)
			.call(this.axisLeft)
		this.svg
			.append('g')
			.attr('transform', `translate(${[this.plotRight, 0]})`)
			.call(this.axisRight)
		this.svg
			.append('text')
			.attr('class', 'axis-label')
			.call(probabilitySvg('y', 'x'))
			.attr('transform', `translate(${[this.plotLeft + this.plotWidth / 2, this.plotBottom + 40]})`)
		this.svg
			.append('text')
			.attr('class', 'axis-label')
			.call(probabilitySvg('y', "x'"))
			.attr(
				'transform',
				`translate(${[this.plotLeft - 40, this.plotTop + this.plotHeight / 2]}) rotate(-90)`
			)
	}
	drawGridLines() {
		this.svg
			.selectAll('line.grid.x')
			.data(d3.range(0.1, 1, 0.1))
			.join('line')
			.attr('class', 'grid x')
			.attr('x1', this.scaleX)
			.attr('x2', this.scaleX)
			.attr('y1', this.bottomEdge)
			.attr('y2', this.topEdge)
		this.svg
			.selectAll('line.grid.y')
			.data(d3.range(0.1, 1, 0.1))
			.join('line')
			.attr('class', 'grid y')
			.attr('x1', this.leftEdge)
			.attr('x2', this.rightEdge)
			.attr('y1', this.scaleY)
			.attr('y2', this.scaleY)
	}
	contoursLB = pxypx0y0 => d => {
		return this.svgStringFromCoords([
			[pxypx0y0 - d / this.numContours, 1],
			[pxypx0y0 - (d + 1) / this.numContours, 1],
			[0, 1 - pxypx0y0 + (d + 1) / this.numContours],
			[0, 1 - pxypx0y0 + d / this.numContours],
			[pxypx0y0 - d / this.numContours, 1],
			[1, 1],
			[1, 1 - pxypx0y0 - d / this.numContours],
			[pxypx0y0 + d / this.numContours, 0],
			[pxypx0y0 + (d + 1) / this.numContours, 0],
			[1, 1 - pxypx0y0 - (d + 1) / this.numContours],
			[1, 1]
		])
	}
	drawContours() {
		this.svg
			.append('clipPath')
			.attr('id', 'plot-clip')
			.append('rect')
			.attr('x', this.scaleX(0))
			.attr('y', this.scaleY(1))
			.attr('width', this.plotRight - this.plotLeft)
			.attr('height', this.plotBottom - this.plotTop)
		const pxypx0y0 = get(pxy) + get(px0y0),
			group = this.svg.append('g').attr('clip-path', 'url(#plot-clip)')
		group
			.selectAll('polygon.contour')
			.data(d3.range(this.numContours))
			.join('polygon')
			.attr('class', 'contour')
			.attr('fill', d => d3.schemeSpectral[this.numContours][d])
			.attr('points', this.contoursLB(pxypx0y0))
		group
			.selectAll('text.contour')
			.data(d3.range(this.numContours))
			.join('text')
			.attr('class', 'contour')
			.attr('opacity', 0.9)
			.attr('fill', d => (d == 0 || d == 8 || d == 9 ? 'white' : 'black'))
			.text(d => `${round2(d / this.numContours)} to ${round2((d + 1) / this.numContours)}`)
	}
	contourHorizTextTransform = pxypx0y0 => d =>
		`translate(${[
			this.scaleX(pxypx0y0 + (d + 0.575) / this.numContours),
			this.scaleY(0.01)
		]}) rotate(-45)`
	contourVertTextTransform = pxypx0y0 => d =>
		`translate(${[
			this.scaleX(0.01),
			this.scaleY(1 - pxypx0y0 + (d + 0.575) / this.numContours)
		]}) rotate(-45)`
	updateContours = (pxy, px0y0, bounds) => {
		const pxypx0y0 = pxy + px0y0
		this.svg
			.selectAll('polygon.contour')
			.join('polygon')
			.transition()
			.duration(1000)
			.attr('points', bounds == 0 ? this.contoursLB(pxypx0y0) : this.contoursUB(pxypx0y0))
		this.svg
			.selectAll('text.contour')
			.join('text')
			.transition()
			.duration(1000)
			// .attr('opacity', this.contourTextOpacity(model))
			.attr(
				'transform',
				pxypx0y0 < 0.5
					? this.contourHorizTextTransform(pxypx0y0)
					: this.contourVertTextTransform(pxypx0y0)
			)
	}
	drawDiagonal() {
		this.svg
			.append('line')
			.attr('x1', this.scaleX(0))
			.attr('y1', this.scaleY(0))
			.attr('x2', this.scaleX(1))
			.attr('y2', this.scaleY(1))
			.attr('stroke', 'black')
			.attr('stroke-width', 2)
			.attr('stroke-linecap', 'round')
			.attr('stroke-dasharray', '3 6')
			.attr('opacity', 0.75)
	}
	svgStringFromCoords(polygon) {
		return polygon.map(([x, y]) => `${this.scaleX(x)},${this.scaleY(y)}`).join(' ')
	}
	drawBiasedRegion = (px, px0, pxy, px0y) => {
		const biasedRegion = biasedRegionPoly(px, px0, pxy, px0y)
		this.svg
			.append('polygon')
			.attr('class', 'biased')
			.attr('points', this.svgStringFromCoords(biasedRegion))
			.attr('fill-rule', 'evenodd')
		this.svg
			.append('rect')
			.attr('class', 'possibly-unbiased')
			.attr('x', this.scaleX(biasedRegion[5][0]))
			.attr('y', this.scaleY(biasedRegion[7][1]))
			.attr('width', this.scaleX(px0) - this.plotLeft)
			.attr('height', this.plotBottom - this.scaleY(px))
		this.svg
			.append('line')
			.attr('class', 'possibly-unbiased-label')
			.attr('x1', this.scaleX(biasedRegion[5][0] / 4 + (biasedRegion[6][0] * 3) / 4))
			.attr('y1', this.scaleY(biasedRegion[6][1] - 0.075))
			.attr('x2', this.scaleX(biasedRegion[5][0] / 3 + (biasedRegion[6][0] * 2) / 3))
			.attr('y2', this.scaleY(biasedRegion[6][1]))
			.attr('stroke', 'white')
			.attr('stroke-width', 2)
			.attr('marker-end', 'url(#arrow)')
			.attr('opacity', 0.75)
		this.svg
			.append('text')
			.attr('class', 'possibly-unbiased-label')
			.text('Possibly unbiased')
			.attr(
				'transform',
				`translate(${[
					this.scaleX(biasedRegion[5][0] / 4 + (biasedRegion[6][0] * 3) / 4),
					this.scaleY(biasedRegion[6][1] - 0.1)
				]})`
			)
	}
	updateBiasedRegion = (px, px0, pxy, px0y) => {
		const biasedRegion = biasedRegionPoly(px, px0, pxy, px0y)
		this.svg
			.select('polygon.biased')
			.attr('points', this.svgStringFromCoords(biasedRegion))
			.transition()
			.duration(1000)
		this.svg
			.select('rect.possibly-unbiased')
			.attr('x', this.scaleX(biasedRegion[5][0]))
			.attr('y', this.scaleY(biasedRegion[7][1]))
			.attr('width', this.scaleX(px0) - this.plotLeft)
			.attr('height', this.plotBottom - this.scaleY(px))
			.transition()
			.duration(1000)
		this.svg
			.select('line.possibly-unbiased-label')
			.attr('x1', this.scaleX(biasedRegion[5][0] / 4 + (biasedRegion[6][0] * 3) / 4))
			.attr('y1', this.scaleY(biasedRegion[6][1] - 0.075))
			.attr('x2', this.scaleX(biasedRegion[5][0] / 3 + (biasedRegion[6][0] * 2) / 3))
			.attr('y2', this.scaleY(biasedRegion[6][1]))
			.transition()
			.duration(1000)
		this.svg
			.select('text.possibly-unbiased-label')
			.attr(
				'transform',
				`translate(${[
					this.scaleX(biasedRegion[5][0] / 4 + (biasedRegion[6][0] * 3) / 4),
					this.scaleY(biasedRegion[6][1] - 0.1)
				]})`
			)
			.transition()
			.duration(1000)
	}
	hover = event => {
		const [x, y] = d3.pointer(event),
			pyxs = this.scaleX.invert(x),
			pyx0s = this.scaleY.invert(y)
		if (pyxs >= 0 && pyxs <= 1 && pyx0s >= 0 && pyx0s <= 1) {
			const pxy_ = get(pxy),
				px0y_ = get(px0y),
				pyxUB_ = get(pyxUB),
				pyx0UB_ = get(pyx0UB),
				biased = pxy_ > pyxs || pyxs > pyxUB_ || px0y_ > pyx0s || pyx0s > pyx0UB_

			d3.select('#hover-panel')
				.classed('biased', biased)
				.style('left', `${x - 125}px`)
				.style('top', `${y - 65}px`)
				.style('background-color', _ =>
					pyx0s > 0.75 ? `rgba(255, 255, 255, ${2.4 * pyx0s - 1.4})` : null
				)
				.style('border', _ => (pyx0s > 0.9 ? '1px solid black' : null))
				.transition()
				.duration(100)
				.style('opacity', 1)
			updateHoverPanel(pyxs, pyx0s, pxy_, px0y_, pyxUB_, pyx0UB_)
		}
	}
	unhover = _ => {
		d3.select('#hover-panel').transition().style('opacity', 0)
	}
	setupHoverWindow() {
		this.svg.on('mouseover mousemove touchmove', this.hover).on('mouseout touchleave', this.unhover)
	}
}

export { Viz }
