// import * as d3 from 'd3' //'https://cdn.skypack.dev/d3@7'
// import * as d3 from '../../node_modules/d3/dist/d3.js'
import { get } from 'svelte/store'
import { px, px0, pxy, pxy0, px0y, px0y0, pyxUB, pyx0UB } from './store'
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
	// console.log(pxy, px0y0)
	latexElement('stats-pyx')(`(${round2(pyxs)}, ${round2(pyx0s)})`)
	latexElement('stats-pyx-bias')(
		`${round2(pyxBiasLB)} \\leqslant P(y_x|s)\\!-\\!P(y_x) \\leqslant ${round2(pyxBiasUB)}`
	)
	latexElement('stats-pyx-abs-bias')(
		`${round2(pyxAbsBiasLB)} \\leqslant |P(y_x|s)\\!-\\!P(y_x)| \\leqslant ${round2(pyxAbsBiasUB)}`
	)
	latexElement('stats-pyx0-bias')(
		`${round2(pyx0BiasLB)} \\leqslant P(y_{x'}|s)\\!-\\!P(y_{x'}) \\leqslant ${round2(pyx0BiasUB)}`
	)
	latexElement('stats-pyx0-abs-bias')(
		`${round2(pyx0AbsBiasLB)} \\leqslant |P(y_{x'}|s)\\!-\\!P(y_{x'})| \\leqslant ${round2(
			pyx0AbsBiasUB
		)}`
	)
	latexElement('stats-ace-bias')(
		`${round2(acesAbsLB)} \\leqslant |ACE - CACE| \\leqslant ${round2(acesAbsUB)}`
	)
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
	contoursCoordsLB(d) {
		return [
			[(d + 1) / numContours, 0],
			[d / numContours, 0],
			[d / numContours, 0],
			[1, 1 - d / numContours],
			[1, 1 - d / numContours],
			[1, 1 - (d + 1) / numContours],
			[1, 1 - (d + 1) / numContours],
			[(d + 1) / numContours, 0],
			[(d + 1) / numContours, 0]
		]
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

			d3.select('#stats-window')
				.classed('biased', biased)
				.style('left', `${x - 125}px`)
				.style('top', `${y - 75}px`)
				.style('background-color', _ =>
					pyx0s > 0.75 ? `rgba(255, 255, 255, ${2.4 * pyx0s - 1.4})` : null
				)
				.style('border', _ => (pyx0s > 0.9 ? '1px solid black' : null))
				.transition()
				.duration(100)
				.style('opacity', 1)
			updateHoverPanel(pyxs, pyx0s, pxy_, px0y_, pyxUB_, pyx0UB_)
			// latexElement('stats-pyx-bounds')(
			// 	`${round2(pxy_)} \\leqslant P(y_x|s) \\leqslant ${round2(pyxUB_)}`
			// )
			// latexElement('stats-pyx0-bounds')(
			// 	`${round2(px0y_)} \\leqslant P(y_{x'}|s) \\leqslant ${round2(pyx0UB_)}`
			// )
			// latexElement('stats-range')(`${round2(upperBound_ - lowerBound_)}`)
		}
	}
	unhover = _ => {
		d3.select('#stats-window').transition().style('opacity', 0)
	}
	setupHoverWindow() {
		this.svg.on('mouseover mousemove touchmove', this.hover).on('mouseout touchleave', this.unhover)
	}
}

export { Viz }
