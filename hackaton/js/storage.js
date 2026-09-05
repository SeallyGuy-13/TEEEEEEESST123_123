/**
 * =======================================
 * Игровое состояние (ТЗ, п. 13.4)
 * -------------------------------------
 * Всё, что лежит здесь, автоматически попадает в сохранение Monogatari
 * и восстанавливается при загрузке слота.
 * =======================================
 */

'use strict';
/* global monogatari */

monogatari.storage({

	version: 1,

	player: {
		name: 'Стажёр',
		reputation: 70,      // Репутация стажёра, 0..100
		xp: 0,
		accessLevel: 'intern', // intern → operator → analyst → coordinator
		facts: [],           // собранные "интересные факты"
		competencies: []     // бейджи/компетенции
	},

	// Статусы задач трекера: locked | available | in_progress | completed | external
	tasks: {
		task_drone_01: 'available',
		task_imagery_01: 'available',
		task_analysis_01: 'available',
		task_cleanup_01: 'available',
		task_real_event_01: 'locked'
	},

	// Инструктажи, которые игрок уже проходил (повторно не запускаются автоматически)
	tutorialsSeen: [],

	// Безопасный чекпоинт: куда вернуть игрока при репутации 0 (ТЗ, п. 10.1)
	checkpoint: {
		label: 'Tracker',
		screen: 'tracker',
		taskId: null
	},

	// Служебное: результат последней мини-игры и выбор в трекере
	runtime: {
		selectedTask: null,
		lastResult: null,
		quizAttempts: 0
	}
});
