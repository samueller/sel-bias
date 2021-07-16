export const round2 = x => Math.round(x * 100) / 100,
	probabilitySvg = (outcome, treatment) => textNode => {
		textNode.text(`P(${outcome}`)
		textNode.append('tspan').attr('class', 'sub').attr('dy', '0.3em').text(treatment)
		textNode.append('tspan').attr('dy', '-0.21em').text('｜s)')
	},
	absoluteBounds = (l, u) => (l <= 0 && u >= 0 ? [0, Math.max(-l, u)] : l > 0 ? [l, u] : [-u, -l])
