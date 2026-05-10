import { describe, expect, it, vi } from 'vitest';
import { createDebouncedCallback } from '$lib/utils/debounce';

describe('createDebouncedCallback', () => {
	it('debounces repeated calls', () => {
		vi.useFakeTimers();
		const callback = vi.fn();
		const debounced = createDebouncedCallback(callback, 850);

		debounced.schedule('about');
		debounced.schedule('about-us');

		vi.advanceTimersByTime(849);
		expect(callback).not.toHaveBeenCalled();

		vi.advanceTimersByTime(1);
		expect(callback).toHaveBeenCalledTimes(1);
		expect(callback).toHaveBeenCalledWith('about-us');

		vi.useRealTimers();
	});

	it('flushes immediately with the latest arguments', () => {
		vi.useFakeTimers();
		const callback = vi.fn();
		const debounced = createDebouncedCallback(callback, 850);

		debounced.schedule('about-us');
		debounced.flush();

		expect(callback).toHaveBeenCalledTimes(1);
		expect(callback).toHaveBeenCalledWith('about-us');

		vi.useRealTimers();
	});
});
