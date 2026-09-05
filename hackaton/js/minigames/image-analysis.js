/**
 * ImageAnalysisAdapter — интеграция мини-игры «Восстановление снимка / Пазл» (ТЗ, п. 7.2).
 *
 * Игра живёт отдельной страницей в minigames/puzzle/standalone.html, а хост
 * общается с ней через postMessage — так же, как с «дроном» и «три в ряд».
 */

'use strict';
/* global MinigameHost */

(function (global) {

	const PUZZLE_URL = 'minigames/puzzle/standalone.html';

	class ImageAnalysisAdapter {

		constructor () {
			this.iframe = null;
			this.messageHandler = null;
			this.container = null;
		}

		start ({ container, config, onEvent }) {
			this.container = container;
			this.config = config;
			this.onEvent = onEvent;

			return new Promise((resolve) => {
				this.resolve = resolve;
				this.mount();
			});
		}

		mount () {
			const wrapper = document.createElement('div');
			wrapper.className = 'mg mg-puzzle';
			wrapper.innerHTML = `
				<iframe class="mg-puzzle__frame" src="${PUZZLE_URL}"
					title="Работа со снимками (Пазл)" allow="autoplay"></iframe>
			`;
			this.container.appendChild(wrapper);

			this.iframe = wrapper.querySelector('iframe');

			this.messageHandler = (event) => {
				if (!this.iframe || event.source !== this.iframe.contentWindow) {
					return;
				}

				if (event.origin !== window.location.origin && event.origin !== 'null') {
					return;
				}

				const message = event.data || {};

				switch (message.type) {
					case 'PUZZLE_READY':
					case 'IMAGERY_READY':
						this.post('PUZZLE_START', {
							levelId: this.config && this.config.id,
							config: this.config
						});
						break;

					case 'PUZZLE_EVENT':
					case 'IMAGERY_EVENT':
						if (message.payload) {
							this.onEvent(message.payload.name, message.payload.value);
						}
						break;

					case 'PUZZLE_COMPLETE':
					case 'IMAGERY_COMPLETE':
						this.finish(Object.assign({ status: 'completed' }, message.payload));
						break;

					case 'PUZZLE_ABORT':
					case 'IMAGERY_ABORT':
						this.finish({ status: 'aborted' });
						break;

					default:
						break;
				}
			};

			window.addEventListener('message', this.messageHandler);
		}

		post (type, payload) {
			if (this.iframe && this.iframe.contentWindow) {
				this.iframe.contentWindow.postMessage({ type, payload }, '*');
			}
		}

		finish (raw) {
			if (!this.resolve) {
				return;
			}

			const resolve = this.resolve;
			this.resolve = null;

			resolve({
				status: (raw && raw.status) || 'completed',
				score: (raw && raw.score) || 1000,
				metrics: {
					levelsCompleted: (raw && raw.metrics && raw.metrics.levelsCompleted) || 2
				},
				flags: ['mission_complete', 'imagery_complete']
			});
		}

		destroy () {
			if (this.messageHandler) {
				window.removeEventListener('message', this.messageHandler);
				this.messageHandler = null;
			}

			this.iframe = null;

			if (this.container) {
				this.container.innerHTML = '';
			}
		}
	}

	MinigameHost.register('imageAnalysis', ImageAnalysisAdapter);

	global.ImageAnalysisAdapter = ImageAnalysisAdapter;

})(window);
