/**
 * TrackerUI — трекер задач, главный хаб игры (ТЗ, п. 5).
 *
 * Заменяет карту: игрок сам выбирает, с какой задачи начать.
 * Возвращает Promise с выбором: { taskId, repeatTutorial }.
 */

'use strict';
/* global DataLoader, Progress, Overlay */

(function (global) {

	const STATUS_TEXT = {
		locked: 'Недоступно',
		available: 'Доступно',
		in_progress: 'В работе',
		completed: 'Выполнено',
		external: 'Реальная активность'
	};

	const STATUS_MARK = {
		completed: '✓',
		in_progress: '…',
		locked: '🔒',
		external: '★',
		available: ''
	};

	function renderIcon (icon) {
		if (typeof icon === 'string' && (icon.startsWith('assets/') || icon.endsWith('.jpg') || icon.endsWith('.png') || icon.endsWith('.svg'))) {
			return `<img src="${icon}" alt="" class="task-card__icon-img">`;
		}
		return icon || '';
	}

	function cardMarkup (task, status) {
		const locked = status === 'locked';
		const external = status === 'external';

		const title = external && task.revealedTitle ? task.revealedTitle : task.title;
		const description = external && task.revealedDescription ? task.revealedDescription : task.description;
		const icon = external && task.revealedIcon ? task.revealedIcon : task.icon;

		const tutorialSeen = task.tutorialId && Progress.tutorialSeen(task.tutorialId);

		return `
			<article class="task-card task-card--${status}" data-task="${task.id}" data-status="${status}">
				<div class="task-card__icon" aria-hidden="true">${renderIcon(icon)}</div>

				<div class="task-card__body">
					<h3 class="task-card__title">${title}</h3>
					<p class="task-card__description">${description}</p>
					<span class="task-card__status">${STATUS_TEXT[status] || status}</span>
				</div>

				<div class="task-card__actions">
					<span class="task-card__mark" aria-hidden="true">${STATUS_MARK[status] || ''}</span>
					${locked
						? '<span class="task-card__hint">Откроется позже</span>'
						: `<button class="btn btn--primary task-card__start" type="button" data-start="${task.id}">
								${status === 'completed' ? 'Пройти снова' : (external ? 'Подробнее' : 'Приступить')}
							</button>`}
					${(!locked && tutorialSeen)
						? `<button class="btn btn--ghost task-card__repeat" type="button" data-repeat="${task.id}">Повторить инструктаж</button>`
						: ''}
				</div>
			</article>
		`;
	}

	const TrackerUI = {

		/**
		 * Показывает трекер и ждёт выбор игрока.
		 * @param {object} options
		 * @param {string} options.hint — подсказка над списком
		 * @returns {Promise<{taskId: string, repeatTutorial: boolean}>}
		 */
		open ({ hint = '' } = {}) {
			// Карточка реальной активности могла открыться после прошлой задачи.
			Progress.refreshRealEventAvailability();

			return Overlay.open({
				id: 'tracker',
				className: 'overlay--tracker',
				build (panel, close) {
					const tasks = DataLoader.allTasks();
					const player = Progress.player();

					panel.innerHTML = `
						<div class="tracker">
							<header class="tracker__header">
								<div>
									<h2 class="tracker__title">Трекер задач</h2>
									<p class="tracker__subtitle">${Progress.accessLevelTitle()} · ${player.xp} XP · Репутация ${player.reputation}</p>
								</div>
								<button class="btn btn--ghost tracker__collection" type="button" data-collection>Личное дело</button>
							</header>

							${hint ? `<p class="tracker__hint">${hint}</p>` : ''}

							<div class="tracker__list">
								${tasks.map((task) => cardMarkup(task, Progress.taskStatus(task.id))).join('')}
							</div>

							<footer class="tracker__footer">
								<span class="tracker__legend">✓ выполнено · … в работе · 🔒 недоступно</span>
							</footer>
						</div>
					`;

					panel.querySelector('[data-collection]').addEventListener('click', () => {
						Overlay.collection();
					});

					panel.addEventListener('click', (event) => {
						const startButton = event.target.closest('[data-start]');

						if (startButton) {
							close({ taskId: startButton.dataset.start, repeatTutorial: false });
							return;
						}

						const repeatButton = event.target.closest('[data-repeat]');

						if (repeatButton) {
							close({ taskId: repeatButton.dataset.repeat, repeatTutorial: true });
						}
					});
				}
			});
		}
	};

	global.TrackerUI = TrackerUI;

})(window);
