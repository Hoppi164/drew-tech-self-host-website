if (typeof Element !== 'undefined' && !Element.prototype.animate) {
	Element.prototype.animate = function () {
		return {
			cancel() {},
			finish() {},
			play() {},
			pause() {},
			reverse() {},
			addEventListener() {},
			removeEventListener() {},
			dispatchEvent() {
				return true;
			},
			commitStyles() {},
			persist() {},
			playState: 'finished',
			finished: Promise.resolve(),
			onfinish: null,
			oncancel: null,
			currentTime: 0,
			effect: null,
			id: '',
			pending: false,
			playbackRate: 1,
			ready: Promise.resolve(),
			replaceState: 'active',
			startTime: 0,
			timeline: null
		} as unknown as Animation;
	};
}
