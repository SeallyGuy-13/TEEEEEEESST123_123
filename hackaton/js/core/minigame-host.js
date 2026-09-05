/**
 * MinigameHost — единая точка запуска мини-игр (ТЗ, п. 16.1 и 17).
 *
 * Хост монтирует адаптер в контейнер, ждёт результат и гарантированно вызывает
 * destroy(). Хост не решает, сколько дать репутации — это делает слой задач.
 *
 * Контракт адаптера:
 *   class SomeAdapter {
 *     async start ({ container, config, onEvent }) -> MinigameResult
 *     destroy ()
 *   }
 *
 * MinigameResult:
 *   { status: 'completed' | 'failed' | 'aborted', score?, metrics?, flags? }
 */

'use strict';
/* global DataLoader, Overlay */

(function (global) {

	const adapters = new Map();
	let active = null;
	let musicSession = null;

	function stopMusic () {
		const session = musicSession;
		if (!session) return;
		musicSession = null;
		session.cancelled = true;
		global.monogatari.removeMediaPlayer('music', 'minigame');

		// Оставляем только один фоновый плеер, чтобы исключить наложение
		const playerToResume = session.paused && session.paused.length > 0
			? session.paused[session.paused.length - 1]
			: null;

		for (const player of (session.paused || [])) {
			if (player !== playerToResume && player.dataset?.key) {
				global.monogatari.removeMediaPlayer('music', player.dataset.key);
			}
		}

		if (playerToResume && global.monogatari.mediaPlayers('music').includes(playerToResume)) {
			Promise.resolve(playerToResume.play()).catch(console.warn);
		} else {
			// Если фонового плеера не осталось, безопасно возобновляем office
			const activeMusic = global.monogatari.mediaPlayers('music').filter(p => !p.paused && !p.ended);
			if (activeMusic.length === 0) {
				try {
					const action = global.monogatari.prepareAction('play music office loop fade 2', { cycle: 'Application' });
					action.willApply().then(() => action.apply());
				} catch (e) {}
			}
		}
	}

	async function startMusic () {
		const engine = global.monogatari;
		if (!engine) return; // Отдельный стенд может работать без движка новеллы.
		stopMusic();
		const session = { paused: engine.mediaPlayers('music').filter(player => !player.paused && !player.ended), cancelled: false };
		musicSession = session;
		for (const player of session.paused) player.pause();
		try {
			const action = engine.prepareAction('play music minigame loop', { cycle: 'Application' });
			await action.willApply();
			await action.apply();
			// Временный трек не попадает в историю и сохранения новеллы.
			if (session.cancelled) engine.removeMediaPlayer('music', 'minigame');
		} catch (error) {
			console.warn('Не удалось включить музыку мини-игры:', error);
			if (musicSession === session) stopMusic();
		}
	}

	const MinigameHost = {

		/** Регистрирует адаптер мини-игры. */
		register (type, AdapterClass) {
			adapters.set(type, AdapterClass);
		},

		registered () {
			return Array.from(adapters.keys());
		},

		/**
		 * Запускает мини-игру и возвращает её результат.
		 *
		 * @param {string} type      — 'drone' | 'imageAnalysis' | 'decisionCase' | 'match3'
		 * @param {string} configId  — id конфига из data/minigames.json
		 * @param {object} overrides — точечные правки конфига (например, для стенда)
		 * @returns {Promise<MinigameResult>}
		 */
		async start (type, configId, overrides = {}) {
			const AdapterClass = adapters.get(type);

			if (!AdapterClass) {
				const message = `Мини-игра типа "${type}" не зарегистрирована.`;
				console.error(message);
				await Overlay.notice({ title: 'Мини-игра недоступна', text: message });
				return { status: 'aborted', metrics: {}, flags: ['adapter_missing'] };
			}

			const baseConfig = DataLoader.minigameConfig(type, configId);

			if (!baseConfig) {
				const message = `Конфиг "${configId}" для мини-игры "${type}" не найден в data/minigames.json.`;
				console.error(message);
				await Overlay.notice({ title: 'Конфиг не найден', text: message });
				return { status: 'aborted', metrics: {}, flags: ['config_missing'] };
			}

			const config = Object.assign({}, baseConfig, overrides);

			return Overlay.open({
				id: 'minigame',
				className: `overlay--minigame overlay--minigame-${type}`,
				build: async (panel, close) => {
					const container = document.createElement('div');
					container.className = 'minigame';
					panel.appendChild(container);

					const adapter = new AdapterClass();
					active = adapter;

					const events = [];
					const onEvent = (name, value) => events.push({ name, value });

					let result;

					try {
						await startMusic();
						if (active !== adapter) return;
						result = await adapter.start({ container, config, onEvent });
					} catch (error) {
						console.error('Мини-игра завершилась с ошибкой:', error);
						result = { status: 'aborted', metrics: {}, flags: ['runtime_error'] };
					} finally {
						try {
							adapter.destroy();
						} catch (error) {
							console.warn('destroy() адаптера бросил исключение:', error);
						}
						stopMusic();
						active = null;
					}

					const normalized = Object.assign(
						{ status: 'aborted', score: 0, metrics: {}, flags: [] },
						result || {}
					);

					normalized.events = events;
					normalized.type = type;
					normalized.configId = configId;

					close(normalized);
				}
			});
		},

		/** Аварийное закрытие: используется при загрузке сохранения. */
		stop () {
			stopMusic();
			if (active) {
				try {
					active.destroy();
				} catch (error) {
					console.warn(error);
				}
				active = null;
			}
		}
	};

	global.MinigameHost = MinigameHost;

})(window);
