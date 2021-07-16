import katex from 'katex'

export const latex = (math, displayMode = false, throwOnError = false) =>
		katex.renderToString(math, { displayMode, throwOnError }),
	latexElement =
		elementId =>
		(math, displayMode = false, throwOnError = false) =>
			katex.render(math, document.getElementById(elementId), { displayMode, throwOnError })
