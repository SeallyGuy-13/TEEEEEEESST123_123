/**
 * Progress — правила прогресса: репутация, XP, факты, компетенции,
 * статусы задач и чекпоинты (ТЗ, п. 10).
 *
 * Этот слой не рисует интерфейс: он меняет состояние и уведомляет подписчиков
 * (HUD подписан на 'change').
 */

'use strict';
/* global monogatari, DataLoader */

(function (global) {

	const REPUTATION_MIN = 0;
	const REPUTATION_MAX = 100;

	// Значение, на которое восстанавливается репутация после возврата к чекпоинту.
	const REPUTATION_AFTER_RESCUE = 30;

	const listeners = new Set();

	function state () {
		return monogatari.storage();
	}

	function emit (event, payload) {
		listeners.forEach((listener) => {
			try {
				listener(event, payload);
			} catch (error) {
				console.error('Progress listener error:', error);
			}
		});
	}

	const Progress = {

		REPUTATION_MIN,
		REPUTATION_MAX,

		on (listener) {
			listeners.add(listener);
			return () => listeners.delete(listener);
		},

		player () {
			return state().player;
		},

		/**
		 * Меняет репутацию. Возвращает { value, rescued }.
		 * При падении до 0 игра не заканчивается: сработает возврат к чекпоинту
		 * (ТЗ, п. 10.1).
		 */
		reputation (delta = 0, reason = '') {
			const player = state().player;

			if (delta === 0) {
				return { value: player.reputation, rescued: false };
			}

			const before = player.reputation;
			player.reputation = Math.max(REPUTATION_MIN, Math.min(REPUTATION_MAX, before + delta));

			emit('change', { type: 'reputation', delta, value: player.reputation, reason });
			emit('flash', { type: 'reputation', delta, reason });

			const rescued = player.reputation <= REPUTATION_MIN;

			if (rescued) {
				player.reputation = REPUTATION_AFTER_RESCUE;
				emit('change', { type: 'reputation', delta: 0, value: player.reputation, reason: 'rescue' });
			}

			this.save();
			return { value: player.reputation, rescued };
		},

		xp (amount = 0) {
			if (amount === 0) {
				return state().player.xp;
			}

			const player = state().player;
			player.xp += amount;

			this.refreshAccessLevel();
			emit('change', { type: 'xp', delta: amount, value: player.xp });
			emit('flash', { type: 'xp', delta: amount });
			this.save();

			return player.xp;
		},

		refreshAccessLevel () {
			const player = state().player;
			const levels = DataLoader.accessLevels();
			let current = player.accessLevel;

			levels.forEach((level) => {
				if (player.xp >= level.minXp) {
					current = level.id;
				}
			});

			if (current !== player.accessLevel) {
				player.accessLevel = current;
				emit('change', { type: 'accessLevel', value: current });
				emit('flash', { type: 'accessLevel', title: this.accessLevelTitle() });
			}
		},

		accessLevelTitle () {
			const player = state().player;
			const level = DataLoader.accessLevels().find((item) => item.id === player.accessLevel);
			return level ? level.title : 'Стажёр';
		},

		/** Добавляет факт в коллекцию. Повторный сбор ничего не начисляет. */
		collectFact (factId) {
			const player = state().player;

			if (player.facts.includes(factId)) {
				return false;
			}

			player.facts.push(factId);
			emit('change', { type: 'fact', value: factId });
			emit('flash', { type: 'fact', title: (DataLoader.fact(factId) || {}).title });
			this.save();
			return true;
		},

		hasFact (factId) {
			return state().player.facts.includes(factId);
		},

		grantCompetency (competencyId) {
			const player = state().player;

			if (player.competencies.includes(competencyId)) {
				return false;
			}

			player.competencies.push(competencyId);
			emit('change', { type: 'competency', value: competencyId });
			emit('flash', { type: 'competency', title: (DataLoader.competency(competencyId) || {}).title });
			this.save();
			return true;
		},

		/* ------------------------------------------------------------------ */
		/* Задачи                                                              */
		/* ------------------------------------------------------------------ */

		taskStatus (taskId) {
			return state().tasks[taskId] || 'locked';
		},

		setTaskStatus (taskId, status) {
			state().tasks[taskId] = status;
			emit('change', { type: 'task', value: taskId, status });
			this.save();
		},

		/**
		 * Завершает задачу: статус, награды, компетенции, разблокировка следующих.
		 * Награда начисляется один раз (ТЗ, п. 22.1).
		 */
		completeTask (taskId) {
			if (this.taskStatus(taskId) === 'completed') {
				return false;
			}

			const task = DataLoader.task(taskId);
			this.setTaskStatus(taskId, 'completed');

			if (task) {
				if (task.rewards) {
					if (task.rewards.reputation) {
						this.reputation(task.rewards.reputation, `Задача «${task.title}»`);
					}
					if (task.rewards.xp) {
						this.xp(task.rewards.xp);
					}
				}

				(task.unlockOnComplete || []).forEach((id) => this.grantCompetency(id));
			}

			this.refreshRealEventAvailability();
			return true;
		},

		/** Все базовые учебные задачи пройдены? (ТЗ, п. 10 «финал обучения») */
		baseTasksCompleted () {
			return DataLoader.allTasks()
				.filter((task) => task.id !== 'task_real_event_01')
				.every((task) => this.taskStatus(task.id) === 'completed');
		},

		/** Открывает карточку реальной активности, когда учебная часть закончена. */
		refreshRealEventAvailability () {
			if (this.baseTasksCompleted() && this.taskStatus('task_real_event_01') === 'locked') {
				this.setTaskStatus('task_real_event_01', 'external');
				emit('flash', { type: 'newTask', title: 'Новая задача: реальная активность' });
				return true;
			}
			return false;
		},

		tutorialSeen (tutorialId) {
			return state().tutorialsSeen.includes(tutorialId);
		},

		markTutorialSeen (tutorialId) {
			if (!tutorialId || this.tutorialSeen(tutorialId)) {
				return false;
			}
			state().tutorialsSeen.push(tutorialId);
			this.save();
			return true;
		},

		/* ------------------------------------------------------------------ */
		/* Чекпоинты                                                           */
		/* ------------------------------------------------------------------ */

		setCheckpoint (label, taskId = null) {
			state().checkpoint = { label, screen: 'game', taskId };
			this.save();
		},

		checkpoint () {
			return state().checkpoint || { label: 'Tracker', taskId: null };
		},

		/* ------------------------------------------------------------------ */

		/** Сохранение после каждого значимого шага (ТЗ, п. 18). */
		save () {
			// В стендовом режиме постоянный прогресс не пишем (ТЗ, п. 19).
			if (monogatari.global('_stand_mode')) {
				return;
			}

			// До старта игры сохранять нечего.
			if (!monogatari.global('playing')) {
				return;
			}

			try {
				const slot = monogatari.global('current_auto_save_slot') || 1;
				monogatari.saveTo('AutoSaveLabel', slot);
			} catch (error) {
				console.warn('Не удалось сохранить прогресс:', error);
			}
		}
	};

	global.Progress = Progress;

})(window);
