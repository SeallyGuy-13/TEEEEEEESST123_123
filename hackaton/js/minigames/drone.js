/**
 * DroneAdapter — интеграция готовой игры «Эко-Дрон: Чистый Берег» (ТЗ, п. 7.1).
 *
 * Игровая логика не переписывается: игра живёт отдельной страницей в
 * minigames/drone/, а хост общается с ней через postMessage — так же, как с
 * «три в ряд».
 *
 * Контракт сообщений:
 *   игра → хост:  DRONE_READY, DRONE_EVENT {name, value}, DRONE_COMPLETE, DRONE_ABORT
 *   хост → игра:  DRONE_START { levelId, config }
 *
 * Конфиг (data/minigames.json → drone):
 *   { "levels": 3 }  — сколько участков нужно облететь, чтобы задача засчиталась.
 *
 * Результат:
 *   { status, score, metrics: { levelsCompleted, stars, totalStars, maxStars } }
 */

'use strict';
/* global MinigameHost */

(function (global) {

	// Единственное место, где задаётся путь к готовой игре.
	const DRONE_URL = 'minigames/drone/standalone.html';

	class DroneAdapter {

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
			wrapper.className = 'mg mg-drone';
			wrapper.innerHTML = `
				<iframe class="mg-drone__frame" src="${DRONE_URL}"
					title="Обследование территории с помощью БПЛА" allow="autoplay"></iframe>
			`;
			this.container.appendChild(wrapper);

			this.iframe = wrapper.querySelector('iframe');

			this.messageHandler = (event) => {
				// Принимаем сообщения только от своего фрейма и только со своего origin.
				if (!this.iframe || event.source !== this.iframe.contentWindow) {
					return;
				}

				if (event.origin !== window.location.origin && event.origin !== 'null') {
					return;
				}

				const message = event.data || {};

				switch (message.type) {
					case 'DRONE_READY':
						this.post('DRONE_START', {
							levelId: this.config.id,
							config: this.config
						});
						break;

					case 'DRONE_EVENT':
						this.onEvent(message.payload.name, message.payload.value);
						break;

					case 'DRONE_COMPLETE':
						this.finish(Object.assign({ status: 'completed' }, message.payload));
						break;

					case 'DRONE_ABORT':
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

			const required = Number(this.config.levels) || 0;
			const completed = raw.levelsCompleted || 0;
			const enough = required === 0 || completed >= required;

			resolve({
				status: raw.status === 'completed' && !enough ? 'failed' : (raw.status || 'aborted'),
				score: raw.score || 0,
				metrics: {
					levelsCompleted: completed,
					stars: raw.stars || 0,
					totalStars: raw.totalStars || 0,
					maxStars: raw.maxStars || 0
				},
				flags: enough ? ['mission_complete'] : []
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

	MinigameHost.register('drone', DroneAdapter);

	global.DroneAdapter = DroneAdapter;

})(window);
