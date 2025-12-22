import * as str_tests from './generator'
import * as algo_tests from './algorithm'
import * as util_tests from './utility'

type ZeroArgFn = () => unknown
function isZeroArgFn(x: unknown): x is ZeroArgFn {
	return typeof x === 'function' && x.length === 0
}

const tests = Object.entries(str_tests).concat(Object.entries(util_tests)).concat(Object.entries(algo_tests))

for (const [name, fn] of tests) {
	if (name.startsWith('test_') && isZeroArgFn(fn)) {
		console.log(`Running test: ${name} ${fn}`)
		test(name, () => {fn(); })
	}
}
