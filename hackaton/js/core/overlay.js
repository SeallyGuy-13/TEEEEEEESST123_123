/**
 * Overlay — единый слой поверх новеллы: трекер, мини-игры, карточки фактов.
 *
 * Живёт в #game-layer, вне разметки Monogatari, поэтому движок его не трогает.
 * Каждый оверлей возвращает Promise, который резолвится значением закрытия —
 * так действия сценария могут «подождать» результат.
 */

'use strict';
/* global DataLoader, Progress */

(function (global) {

	function layer () {
		let node = document.getElementById('game-layer');

		if (!node) {
			node = document.createElement('div');
			node.id = 'game-layer';
			document.body.appendChild(node);
		}

		return node;
	}

	const openHandles = new Set();

	function syncLayerState () {
		const open = openHandles.size > 0;
		layer().classList.toggle('has-overlay', open);
		// Тем же классом на body прячем элементы движка под оверлеем.
		document.body.classList.toggle('has-overlay', open);
	}

	/* ---------------------------------------------------------------------- */
	/* Клавиатура                                                              */
	/* ---------------------------------------------------------------------- */

	/**
	 * Пока открыт оверлей, движок новеллы не должен видеть клавиатуру: иначе
	 * пробел или стрелка во время мини-игры прокрутят сценарий, и он уйдёт
	 * вперёд, пока игрок ещё играет.
	 *
	 * Ловим события на window в фазе перехвата — это раньше, чем слушатели
	 * Monogatari на document, — и раздаём их своим подписчикам (Overlay.onKey).
	 */
	const keyListeners = new Set();

	['keydown', 'keyup', 'keypress'].forEach((type) => {
		window.addEventListener(type, (event) => {
			if (openHandles.size === 0) {
				return;
			}

			// Ввод в текстовые поля оверлея не трогаем.
			const tag = event.target && event.target.tagName;
			const isInput = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT'
				|| (event.target && event.target.isContentEditable);

			if (!isInput) {
				event.stopPropagation();
			}

			if (type !== 'keydown') {
				return;
			}

			// Esc закрывает верхний оверлей, который это разрешает.
			if (event.key === 'Escape') {
				const handles = Array.from(openHandles);

				for (let index = handles.length - 1; index >= 0; index -= 1) {
					if (handles[index].dismissable) {
						handles[index].close(null);
						return;
					}
				}
			}

			keyListeners.forEach((listener) => {
				try {
					listener(event);
				} catch (error) {
					console.error('Обработчик клавиш оверлея упал:', error);
				}
			});
		}, true);
	});

	const Overlay = {

		/**
		 * Открывает оверлей.
		 *
		 * @param {object}   options
		 * @param {string}   options.id         — уникальный id узла
		 * @param {string}   options.className  — дополнительный класс панели
		 * @param {function} options.build      — (panel, resolve, handle) => void
		 * @param {boolean}  options.dismissable — можно ли закрыть по фону/Esc
		 * @returns {Promise<*>}
		 */
		open ({ id, className = '', build, dismissable = false }) {
			return new Promise((resolve) => {
				const root = document.createElement('div');
				root.className = `overlay ${className}`;
				root.id = id || `overlay-${Date.now()}`;

				const panel = document.createElement('div');
				panel.className = 'overlay__panel';
				root.appendChild(panel);

				let settled = false;

				const handle = {
					root,
					panel,
					dismissable,
					close (value) {
						if (settled) {
							return;
						}
						settled = true;
						openHandles.delete(handle);
						syncLayerState();
						root.classList.add('overlay--closing');
						window.setTimeout(() => root.remove(), 180);
						resolve(value);
					}
				};

				// Esc обрабатывается централизованно в перехватчике клавиатуры выше.
				if (dismissable) {
					root.addEventListener('click', (event) => {
						if (event.target === root) {
							handle.close(null);
						}
					});
				}

				openHandles.add(handle);
				syncLayerState();
				layer().appendChild(root);

				// Кадр на применение стартовых стилей — иначе анимация не проигрывается.
				window.requestAnimationFrame(() => root.classList.add('overlay--visible'));

				build(panel, handle.close, handle);
			});
		},

		/** Открыт ли хоть один оверлей (трекер, мини-игра, квиз, факт). */
		isOpen () {
			return openHandles.size > 0;
		},

		/** Закрывает все открытые оверлеи (используется при загрузке сохранения). */
		closeAll () {
			Array.from(openHandles).forEach((handle) => handle.close(null));
		},

		/**
		 * Подписка на клавиатуру для мини-игр: пока открыт оверлей, события
		 * приходят сюда и не доходят до движка новеллы.
		 * Возвращает функцию отписки — вызывайте её в destroy().
		 */
		onKey (listener) {
			keyListeners.add(listener);
			return () => keyListeners.delete(listener);
		},

		/** Карточка «интересного факта» (ТЗ, п. 11). */
		fact (factId) {
			const fact = DataLoader.fact(factId);

			if (!fact) {
				console.warn(`Факт "${factId}" не найден`);
				return Promise.resolve(false);
			}

			const isNew = Progress.collectFact(factId);

			return this.open({
				className: 'overlay--fact',
				dismissable: true,
				build (panel, close) {
					panel.innerHTML = `
						<div class="fact-card">
							<div class="fact-card__badge">${isNew ? 'Новый факт' : 'Уже в коллекции'}</div>
							<h3 class="fact-card__title">${fact.title}</h3>
							<p class="fact-card__text">${fact.text}</p>
							<button class="btn btn--primary" type="button" data-close>Понятно</button>
						</div>
					`;
					panel.querySelector('[data-close]').addEventListener('click', () => close(isNew));
				}
			});
		},

		/** Коллекция собранных фактов и компетенций. */
		collection () {
			const player = Progress.player();

			return this.open({
				className: 'overlay--collection',
				dismissable: true,
				build (panel, close) {
					const facts = player.facts.map((id) => DataLoader.fact(id)).filter(Boolean);
					const competencies = player.competencies.map((id) => DataLoader.competency(id)).filter(Boolean);

					function formatIcon (icon) {
						if (typeof icon === 'string' && (icon.startsWith('assets/') || icon.endsWith('.jpg') || icon.endsWith('.png') || icon.endsWith('.svg'))) {
							return `<img src="${icon}" alt="" class="collection__icon-img">`;
						}
						return icon || '';
					}

					panel.innerHTML = `
						<div class="collection">
							<header class="collection__header">
								<h3>Личное дело</h3>
								<button class="btn btn--ghost" type="button" data-close aria-label="Закрыть">✕</button>
							</header>

							<section class="collection__section">
								<h4>Уровень доступа</h4>
								<p class="collection__level">${Progress.accessLevelTitle()} · ${player.xp} XP</p>
							</section>

							<section class="collection__section">
								<h4>Компетенции (${competencies.length})</h4>
								${competencies.length
									? `<ul class="collection__badges">${competencies.map((item) => `<li><span>${formatIcon(item.icon)}</span> ${item.title}</li>`).join('')}</ul>`
									: '<p class="collection__empty">Пока пусто. Компетенции выдают за пройденные задачи.</p>'}
							</section>

							<section class="collection__section">
								<h4>Интересные факты (${facts.length})</h4>
								${facts.length
									? `<ul class="collection__facts">${facts.map((item) => `<li><strong>${item.title}</strong><span>${item.text}</span></li>`).join('')}</ul>`
									: '<p class="collection__empty">Факты спрятаны в сценах и мини-играх. Ищите знак «?».</p>'}
							</section>
						</div>
					`;
					panel.querySelector('[data-close]').addEventListener('click', () => close(null));
				}
			});
		},

		/** Простое информационное окно с кнопкой. */
		notice ({ title, text, button = 'Продолжить', className = '' }) {
			return this.open({
				className: `overlay--notice ${className}`,
				build (panel, close) {
					panel.innerHTML = `
						<div class="notice">
							<h3 class="notice__title">${title}</h3>
							<div class="notice__text">${text}</div>
							<button class="btn btn--primary" type="button" data-close>${button}</button>
						</div>
					`;
					panel.querySelector('[data-close]').addEventListener('click', () => close(true));
				}
			});
		}
	};

	global.Overlay = Overlay;

})(window);
