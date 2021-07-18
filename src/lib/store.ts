import { writable, derived } from 'svelte/store'

export const px = writable(0.5),
	pycx = writable(0.5),
	pycx0 = writable(0.5),
	px0 = derived(px, $px => 1 - $px),
	py0cx = derived(pycx, $pycx => 1 - $pycx),
	py0cx0 = derived(pycx0, $pycx0 => 1 - $pycx0),
	pxy = derived([px, pycx], ([$px, $pycx]) => $px * $pycx),
	pxy0 = derived([px, py0cx], ([$px, $py0cx]) => $px * $py0cx),
	px0y = derived([px0, pycx0], ([$px0, $pycx0]) => $px0 * $pycx0),
	px0y0 = derived([px0, py0cx0], ([$px0, $py0cx0]) => $px0 * $py0cx0),
	pyxUB = derived([pxy, px0], ([$pxy, $px0]) => $pxy + $px0),
	pyx0UB = derived([px0y, px], ([$px0y, $px]) => $px0y + $px),
	bounds = writable(0)
