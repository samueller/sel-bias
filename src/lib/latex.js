import katex from 'katex'

export default function latex(math, displayMode = false, throwOnError = false) {
	return katex.renderToString(math, { displayMode, throwOnError })
}
