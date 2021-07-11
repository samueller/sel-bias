// import * as d3 from 'd3' //'https://cdn.skypack.dev/d3@7'
// import * as d3 from '../../node_modules/d3/dist/d3.js'
import { px, px0, pxy, pxy0, px0y, px0y0 } from './store'
import { round2 } from './util'

const probabilitySvg = (outcome, treatment) => textNode => {
	textNode.text(`P(${outcome}`)
	textNode.append('tspan').attr('class', 'sub').attr('dy', '0.3em').text(treatment)
	textNode.append('tspan').attr('dy', '-0.21em').text('｜s)')
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
}

export { Viz }
