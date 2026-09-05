/**
 * Мини-игра «Decision Case» (ТЗ, п. 7.3).
 *
 * Карточки данных + 2–4 решения. Часть кейсов — ложная тревога: игра специально
 * не формирует правило «любое пятно = уборка».
 *
 * Оформление повторяет готовые игры «Эко-Дрон» и «Эко-Радар»: светлая панель,
 * крупные карточки, синие акценты. Разметка своя (Tailwind у нас нет), стили —
 * в style/minigames.css, блок «Аналитика».
 *
 * Результат: { status, score, metrics: { correctChoices, totalCases } }
 */

'use strict';
/* global MinigameHost, Overlay */

(function () {

	// Курс проекта «Чистый берег» — та же ссылка, что в остальных мини-играх.
	const COURSE_URL = 'https://zaprirodu.ispring.ru/signup/LvEGzxy0_owor3LFnvf7L2qVk5I';

	const ICON_CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg>';
	const ICON_CROSS = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 18L18 6M6 6l12 12"/></svg>';
	const ICON_STAR = '<svg viewBox="0 0 20 20" fill="currentColor"><path d="M9.05 2.93c.3-.92 1.6-.92 1.9 0l1.07 3.29a1 1 0 00.95.69h3.46c.97 0 1.37 1.24.59 1.81l-2.8 2.03a1 1 0 00-.37 1.12l1.07 3.29c.3.92-.75 1.69-1.54 1.12l-2.8-2.04a1 1 0 00-1.17 0l-2.8 2.04c-.79.57-1.84-.2-1.54-1.12l1.07-3.29a1 1 0 00-.37-1.12l-2.8-2.03c-.78-.57-.38-1.81.59-1.81h3.46a1 1 0 00.95-.69l1.07-3.29z"/></svg>';

	class DecisionCaseAdapter {

		constructor () {
			this.listeners = [];
			this.container = null;
		}

		on (node, event, handler) {
			node.addEventListener(event, handler);
			this.listeners.push([node, event, handler]);
		}

		start ({ container, config, onEvent }) {
			this.container = container;
			this.config = config;
			this.onEvent = onEvent;

			this.index = 0;
			this.correct = 0;
			this.answers = [];

			this.renderCase();

			return new Promise((resolve) => {
				this.resolve = resolve;
			});
		}

		/* ------------------------------------------------------------------ */
		/* Кейс                                                                */
		/* ------------------------------------------------------------------ */

		renderCase () {
			const card = this.config.cards[this.index];

			if (!card) {
				this.renderSummary();
				return;
			}

			const total = this.config.cards.length;
			const progress = Math.round((this.index / total) * 100);

			this.container.innerHTML = `
				<div class="dc">
					<header class="dc__bar">
						<div class="dc__brand">
							<span class="dc__logo">🔎</span>
							<div>
								<h3 class="dc__name">Аналитика</h3>
								<p class="dc__status"><span class="dc__dot"></span>Центр обработки данных</p>
							</div>
						</div>

						<div class="dc__counter">
							<span class="dc__counter-label">Кейс</span>
							<span class="dc__counter-value">${this.index + 1}<i>/${total}</i></span>
						</div>
					</header>

					<div class="dc__progress"><span style="width:${progress}%"></span></div>

					<article class="dc__case">
						<img class="dc__image" src="${card.image}" alt="${card.title}" loading="lazy">
						<div class="dc__case-body">
							<h4 class="dc__case-title">${card.title}</h4>
							<p class="dc__case-text">${card.text}</p>
						</div>
					</article>

					<div class="dc__options">
						${card.options.map((option) => `
							<button class="dc__option" type="button" data-option="${option.id}">
								<span class="dc__option-mark"></span>
								<span class="dc__option-text">${option.text}</span>
							</button>
						`).join('')}
					</div>

					<div class="dc__feedback" data-feedback hidden></div>

					<button class="dc__next" type="button" data-action="next" hidden>Следующий кейс</button>
				</div>
			`;

			const feedback = this.container.querySelector('[data-feedback]');
			const nextButton = this.container.querySelector('[data-action="next"]');

			this.on(this.container.querySelector('.dc__options'), 'click', (event) => {
				const button = event.target.closest('[data-option]');

				if (!button || button.disabled) {
					return;
				}

				const option = card.options.find((item) => item.id === button.dataset.option);

				this.container.querySelectorAll('[data-option]').forEach((node) => { node.disabled = true; });
				button.classList.add(option.correct ? 'is-correct' : 'is-wrong');
				button.querySelector('.dc__option-mark').innerHTML = option.correct ? ICON_CHECK : ICON_CROSS;

				// Подсвечиваем верный вариант, если игрок ошибся — так виднее,
				// в чём была логика.
				if (!option.correct) {
					const right = card.options.find((item) => item.correct);
					const rightNode = this.container.querySelector(`[data-option="${right.id}"]`);
					if (rightNode) {
						rightNode.classList.add('is-answer');
					}
				} else {
					this.correct += 1;
				}

				this.answers.push({ caseId: card.id, optionId: option.id, correct: option.correct });
				this.onEvent('decision', `${card.id}:${option.id}`);

				feedback.hidden = false;
				feedback.className = `dc__feedback dc__feedback--${option.correct ? 'good' : 'bad'}`;
				feedback.innerHTML = `
					<span class="dc__feedback-icon">${option.correct ? ICON_CHECK : ICON_CROSS}</span>
					<p>${option.feedback}</p>
				`;

				nextButton.hidden = false;
				nextButton.textContent = this.index === total - 1 ? 'Подвести итог' : 'Следующий кейс';
			});

			this.on(nextButton, 'click', () => {
				this.index += 1;
				this.renderCase();
			});
		}

		/* ------------------------------------------------------------------ */
		/* Итог                                                                */
		/* ------------------------------------------------------------------ */

		renderSummary () {
			const total = this.config.cards.length;
			const passed = this.correct >= this.config.success.correctChoices;
			const factId = (this.config.facts || [])[0];

			this.container.innerHTML = `
				<div class="dc dc--result">
					<button class="dc__close" type="button" data-action="leave" aria-label="Вернуться к работе" title="Вернуться к работе">
						${ICON_CROSS}
					</button>

					<div class="dc__seal dc__seal--${passed ? 'good' : 'warn'}">
						${passed ? ICON_CHECK : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 8v5m0 4h.01"/><circle cx="12" cy="12" r="9"/></svg>'}
					</div>

					<h2 class="dc__result-title">${passed ? 'Выводы приняты!' : 'Выводы спорные'}</h2>
					<p class="dc__result-sub">Верных решений: <b>${this.correct} из ${total}</b></p>

					<div class="dc__stars">
						${Array.from({ length: total }, (item, index) => `
							<span class="dc__star${index < this.correct ? '' : ' is-lost'}">${ICON_STAR}</span>
						`).join('')}
					</div>

					<p class="dc__verdict">${passed
						? 'Цепочка «данные → проверка → анализ → решение → действие» выдержана.'
						: 'Часть решений опережала данные. Инструктаж можно пройти ещё раз из трекера.'}</p>

					${factId ? '<button class="dc__fact" type="button" data-fact>Интересный факт по теме</button>' : ''}

					<div class="dc__cta">
						<h4 class="dc__cta-title">Проект «Чистый берег»</h4>
						<p class="dc__cta-text">Разбирать такие кейсы на настоящих данных учат на курсе:
							откуда берутся снимки, как их проверяют и что делают с выводами. Бесплатно.</p>
						<a class="dc__cta-btn" href="${COURSE_URL}" target="_blank" rel="noopener noreferrer">Начать обучение</a>
					</div>

					<div class="dc__warning" data-warning hidden>
						<p><b>Точно уходите?</b> На курсе «Чистый берег» много интересного:
							как читать спутниковые снимки, откуда берутся данные о загрязнениях
							и что с ними делают дальше. Это бесплатно.</p>
						<div class="dc__warning-actions">
							<a class="dc__cta-btn" href="${COURSE_URL}" target="_blank" rel="noopener noreferrer">Посмотреть курс</a>
							<button class="dc__leave dc__leave--confirm" type="button" data-action="confirm-leave">Вернуться к работе</button>
						</div>
					</div>

					<button class="dc__leave dc__leave--initial" type="button" data-action="leave">Вернуться к работе</button>
				</div>
			`;

			if (factId) {
				this.on(this.container.querySelector('[data-fact]'), 'click', () => Overlay.fact(factId));
			}

			const warning = this.container.querySelector('[data-warning]');
			const initialLeave = this.container.querySelector('.dc__leave--initial');
			const confirmLeave = this.container.querySelector('.dc__leave--confirm');

			// Напоминание о курсе перед выходом. По подтверждению — возврат к сюжету.
			const showWarningOrFinish = () => {
				if (warning.hidden) {
					warning.hidden = false;
					if (initialLeave) {
						initialLeave.hidden = true;
					}
					warning.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
					return;
				}

				this.finish(passed ? 'completed' : 'failed');
			};

			if (initialLeave) {
				this.on(initialLeave, 'click', showWarningOrFinish);
			}

			if (confirmLeave) {
				this.on(confirmLeave, 'click', () => {
					confirmLeave.disabled = true;
					this.finish(passed ? 'completed' : 'failed');
				});
			}

			const closeBtn = this.container.querySelector('.dc__close');
			if (closeBtn) {
				this.on(closeBtn, 'click', showWarningOrFinish);
			}
		}

		/* ------------------------------------------------------------------ */

		finish (status) {
			if (!this.resolve) {
				return;
			}

			const resolve = this.resolve;
			this.resolve = null;

			resolve({
				status,
				score: this.correct * 200,
				metrics: {
					correctChoices: this.correct,
					totalCases: this.config.cards.length
				},
				flags: this.answers.filter((item) => item.correct).map((item) => item.caseId)
			});
		}

		destroy () {
			this.listeners.forEach(([node, event, handler]) => node.removeEventListener(event, handler));
			this.listeners = [];

			if (this.container) {
				this.container.innerHTML = '';
			}
		}
	}

	MinigameHost.register('decisionCase', DecisionCaseAdapter);

})();
