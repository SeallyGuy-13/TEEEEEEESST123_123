/**
 * Точка входа.
 *
 * Порядок важен: сначала загружаются данные (задачи, проверки, факты, конфиги
 * мини-игр), затем инициализируется движок, затем монтируется HUD.
 */

'use strict';
/* global Monogatari, monogatari, DataLoader, Progress, HUD, Overlay, MinigameHost */

const { $_ready } = Monogatari;

// Уровень логов движка: 0 — тихо, 5 — подробно.
monogatari.debug.level(1);

$_ready(() => {

	DataLoader.loadAll()
		.then(() => monogatari.init('#monogatari'))
		.then(() => {
			// Движок назначает .focus говорящему. На реплике героя оставляем
			// справа последнего собеседника. Если говорит другой NPC — гарантированно
			// показываем говорящего NPC справа, скрывая остальных.
			const screen = document.querySelector('game-screen');
			const whoEl  = document.querySelector('[data-ui="who"]');
			let interlocutor = null;

			const nameToKey = {
				'наставник': 'm',
				'оператор': 'o',
				'оператор бпла': 'o',
				'аналитик': 'a',
				'координатор': 'c',
				'стажёр': 'y'
			};

			function syncInterlocutor () {
				if (!screen) return;

				// Определяем кто говорит сейчас по имени в плашке
				const speakerName = whoEl ? whoEl.textContent.trim().toLowerCase() : '';
				const activeSpeakerKey = speakerName ? (nameToKey[speakerName] || null) : null;

				if (activeSpeakerKey) {
					screen.setAttribute('data-speaking', activeSpeakerKey);
					if (activeSpeakerKey !== 'y') {
						interlocutor = activeSpeakerKey;
					}
				} else {
					screen.removeAttribute('data-speaking');
				}

				const sprites = Array.from(screen.querySelectorAll('[data-character]'))
					.filter(node => node.dataset.character !== 'y');

				// Если говорит NPC, которого ещё нет среди спрайтов в DOM, подменяем правый спрайт
				if (interlocutor && sprites.length > 0) {
					const hasTargetSprite = sprites.some(node => node.dataset.character === interlocutor);
					if (!hasTargetSprite) {
						const candidate = sprites[sprites.length - 1];
						const dir = { m: 'mentor', o: 'operator', a: 'analyst', c: 'coordinator' }[interlocutor];
						if (dir) {
							candidate.dataset.character = interlocutor;
							candidate.src = `assets/characters/${dir}/normal.png`;
						}
					}
				}

				if (!sprites.some(node => node.dataset.character === interlocutor)) {
					interlocutor = sprites.length ? sprites[sprites.length - 1].dataset.character : null;
				}

				for (const node of sprites) {
					const hidden = node.dataset.character !== interlocutor;
					if (node.classList.contains('interlocutor-hidden') !== hidden) {
						node.classList.toggle('interlocutor-hidden', hidden);
					}
				}
			}

			if (screen) {
				new MutationObserver(syncInterlocutor).observe(screen, {
					subtree: true, childList: true, attributes: true,
					attributeFilter: ['class', 'data-character']
				});
				if (whoEl) {
					new MutationObserver(syncInterlocutor).observe(whoEl, {
						childList: true, characterData: true, subtree: true
					});
				}
				monogatari.on('didLoadGame', syncInterlocutor);
				syncInterlocutor();
			}

			HUD.mount();
			Progress.refreshAccessLevel();
			HUD.refresh();

			// При загрузке сохранения закрываем всё, что осталось на экране от
			// прошлой сессии: трекер, мини-игру, карточку факта (ТЗ, п. 22.2 —
			// мини-игры перезапускаются без перезагрузки страницы).
			monogatari.on('willLoadGame', () => {
				MinigameHost.stop();
				Overlay.closeAll();
			});

			monogatari.on('didLoadGame', () => {
				Progress.refreshAccessLevel();
				HUD.refresh();
			});

			// Глушение ambientPlayer меню при старте игры
			function silenceAmbientPlayer () {
				const player = monogatari.ambientPlayer;
				if (player) {
					try { player.pause(); } catch (e) {}
					try { player.currentTime = 0; } catch (e) {}
					player.removeAttribute('src');
					player.src = '';
					try { player.load(); } catch (e) {}
				}
			}

			// Блокировка ambientPlayer во время активной игры
			if (monogatari.ambientPlayer) {
				const origAmbientPlay = monogatari.ambientPlayer.play.bind(monogatari.ambientPlayer);
				monogatari.ambientPlayer.play = function (...args) {
					if (monogatari.global('playing')) {
						silenceAmbientPlayer();
						return Promise.resolve();
					}
					return origAmbientPlay(...args);
				};
			}

			// Перехват playAmbient и stopAmbient
			const origPlayAmbient = typeof monogatari.playAmbient === 'function' ? monogatari.playAmbient.bind(monogatari) : null;
			monogatari.playAmbient = function (...args) {
				if (monogatari.global('playing')) {
					silenceAmbientPlayer();
					return;
				}
				if (origPlayAmbient) return origPlayAmbient(...args);
			};

			const origStopAmbient = typeof monogatari.stopAmbient === 'function' ? monogatari.stopAmbient.bind(monogatari) : null;
			monogatari.stopAmbient = function (...args) {
				silenceAmbientPlayer();
				if (origStopAmbient) return origStopAmbient(...args);
			};

			// Снятие эмбиента меню по клику на старт/загрузку
			document.addEventListener('click', (event) => {
				const target = event.target.closest('[data-action="start"], [data-action="open-screen"][data-open="game"], [data-action="load-slot"]');
				if (target) {
					silenceAmbientPlayer();
				}
			}, true);

			monogatari.on('willLoadGame', silenceAmbientPlayer);
			monogatari.on('didLoadGame', silenceAmbientPlayer);

			// Защита от одновременного воспроизведения нескольких музыкальных треков:
			// В любой момент времени может звучать только один музыкальный трек.
			const origMediaPlayer = monogatari.mediaPlayer.bind(monogatari);
			monogatari.mediaPlayer = function (type, key, player) {
				const res = origMediaPlayer(type, key, player);
				if (type === 'music' && player && typeof player.play === 'function') {
					const origPlay = player.play.bind(player);
					player.play = async function (...args) {
						silenceAmbientPlayer();
						// При старте трека глушим все остальные треки категории music
						const allMusic = monogatari.mediaPlayers('music', true) || {};
						for (const [k, p] of Object.entries(allMusic)) {
							if (p && p !== player && !p.paused && !p.ended) {
								try {
									p.pause();
								} catch (e) {}
							}
						}
						return origPlay(...args);
					};
				}
				return res;
			};

			const origPrepareAction = monogatari.prepareAction.bind(monogatari);
			monogatari.prepareAction = function (statement, options) {
				if (typeof statement === 'string' && statement.trim().startsWith('play music ')) {
					const parts = statement.trim().split(/\s+/);
					const targetKey = parts[2];

					if (targetKey !== 'minigame') {
						silenceAmbientPlayer();
						// Удаляем другие фоновые плееры (кроме временного minigame)
						const players = monogatari.mediaPlayers('music', true) || {};
						for (const key of Object.keys(players)) {
							if (key !== targetKey && key !== 'minigame') {
								monogatari.removeMediaPlayer('music', key);
							}
						}
					}
				}
				return origPrepareAction(statement, options);
			};

			// Диагностика в консоли для отладки сценария.
			window.game = { monogatari, Progress, DataLoader, MinigameHost, Overlay };


		})
		.catch((error) => {
			console.error('Не удалось запустить игру:', error);
		});
});
