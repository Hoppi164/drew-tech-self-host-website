export function createDebouncedCallback<T extends unknown[]>(
	callback: (...args: T) => void,
	delay: number
) {
	let timer: ReturnType<typeof setTimeout> | undefined;
	let lastArgs: T | undefined;

	function cancel() {
		if (timer) {
			clearTimeout(timer);
			timer = undefined;
		}
	}

	function schedule(...args: T) {
		lastArgs = args;
		cancel();
		timer = setTimeout(() => {
			timer = undefined;
			callback(...args);
		}, delay);
	}

	function flush(...args: T) {
		if (args.length > 0) {
			lastArgs = args;
		}

		cancel();
		if (!lastArgs) return;
		callback(...lastArgs);
	}

	return { schedule, flush, cancel };
}
