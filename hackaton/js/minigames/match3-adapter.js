/**
 * Match3Adapter — интеграция готовой игры «три в ряд» (ТЗ, п. 16).
 *
 * Внутренняя логика match-3 не переписывается. Адаптер умеет два способа
 * подключения:
 *
 *   1. iframe + postMessage (по умолчанию) — если игра живёт отдельной
 *      HTML-страницей. Контракт сообщений описан в ТЗ, п. 16.4.
 *
 *   2. Прямой JS-модуль — если игра умеет монтироваться в переданный контейнер.
 *      Для этого достаточно объявить глобальный объект window.Match3Game с
 *      методами mount(container, config, callbacks) и unmount().
 *
 * ЧТОБЫ ПОДКЛЮЧИТЬ СВОЮ ИГРУ:
 *   — вариант iframe: замените MATCH3_URL на путь к вашей странице и добавьте
 *     в неё обработку сообщений (см. docs/INTEGRATION.md);
 *   — вариант JS: подключите свой скрипт в index.html и объявите Match3Game.
 *
 * Результат: { status, score, stars, metrics: { movesUsed, ...collected } }
 */

'use strict';
/* global MinigameHost */

(function (global) {

	// Единственное место, где задаётся путь к готовой игре.
	const MATCH3_URL = 'minigames/match3/standalone.html';

	class Match3Adapter {

		constructor () {
			this.iframe = null;
			this.messageHandler = null;
			this.container = null;
			this.mode = null;
		}

		start ({ container, config, onEvent }) {
			this.container = container;
			this.config = config;
			this.onEvent = onEvent;

			return new Promise((resolve) => {
				this.resolve = resolve;

				if (global.Match3Game && typeof global.Match3Game.mount === 'function') {
					this.startDirect();
				} else {
					this.startIframe();
				}
			});
		}

		/* ------------------------------------------------------------------ */
		/* Вариант 1: прямой JS-модуль в общем DOM                             */
		/* ------------------------------------------------------------------ */

		startDirect () {
			this.mode = 'direct';

			const mount = document.createElement('div');
			mount.className = 'mg mg-match3 mg-match3--direct';
			this.container.appendChild(mount);

			global.Match3Game.mount(mount, this.config, {
				onEvent: (name, value) => this.onEvent(name, value),
				onComplete: (result) => this.finish(Object.assign({ status: 'completed' }, result)),
				onFail: (result) => this.finish(Object.assign({ status: 'failed' }, result)),
				onAbort: () => this.finish({ status: 'aborted' })
			});
		}

		/* ------------------------------------------------------------------ */
		/* Вариант 2: iframe + postMessage (ТЗ, п. 16.4)                       */
		/* ------------------------------------------------------------------ */

		startIframe () {
			this.mode = 'iframe';

			const wrapper = document.createElement('div');
			wrapper.className = 'mg mg-match3';
			wrapper.innerHTML = `
				<iframe class="mg-match3__frame" src="${MATCH3_URL}"
					title="Очистка территории" allow="autoplay"></iframe>
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
					case 'MATCH3_READY':
						this.post('MATCH3_START', {
							levelId: this.config.id,
							config: this.config
						});
						break;

					case 'MATCH3_EVENT':
						this.onEvent(message.payload.name, message.payload.value);
						break;

					case 'MATCH3_COMPLETE':
						this.finish(Object.assign({ status: 'completed' }, message.payload));
						break;

					case 'MATCH3_FAIL':
						this.finish(Object.assign({ status: 'failed' }, message.payload));
						break;

					case 'MATCH3_ABORT':
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

		/* ------------------------------------------------------------------ */

		finish (raw) {
			if (!this.resolve) {
				return;
			}

			const resolve = this.resolve;
			this.resolve = null;

			const collected = raw.collected || {};
			const goalsMet = (this.config.goals || []).every(
				(goal) => (collected[goal.item] || 0) >= goal.count
			);

			resolve({
				status: raw.status === 'completed' && !goalsMet ? 'failed' : (raw.status || 'aborted'),
				score: raw.score || 0,
				metrics: Object.assign({
					stars: raw.stars || 0,
					movesUsed: raw.movesUsed || 0
				}, collected),
				flags: goalsMet ? ['goals_met'] : []
			});
		}

		destroy () {
			if (this.messageHandler) {
				window.removeEventListener('message', this.messageHandler);
				this.messageHandler = null;
			}

			if (this.mode === 'direct' && global.Match3Game && typeof global.Match3Game.unmount === 'function') {
				try {
					global.Match3Game.unmount();
				} catch (error) {
					console.warn('Match3Game.unmount() бросил исключение:', error);
				}
			}

			this.iframe = null;

			if (this.container) {
				this.container.innerHTML = '';
			}
		}
	}

	MinigameHost.register('match3', Match3Adapter);

	global.Match3Adapter = Match3Adapter;

})(window);
