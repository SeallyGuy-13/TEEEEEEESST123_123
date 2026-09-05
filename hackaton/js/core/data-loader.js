/**
 * DataLoader — загрузка и кэш игровых данных из data/*.json
 *
 * Слой Data по ТЗ (п. 12.2): содержит сценарные конфиги и не содержит UI-логики.
 * Ошибка загрузки показывается человекочитаемым сообщением, а не пустым экраном
 * (ТЗ, п. 22.2).
 */

'use strict';

(function (global) {

	const cache = new Map();

	const FILES = {
		tasks: 'data/tasks.json',
		quizzes: 'data/quizzes.json',
		facts: 'data/facts.json',
		minigames: 'data/minigames.json'
	};

	function showFatal (message, detail) {
		let box = document.getElementById('data-error');

		if (!box) {
			box = document.createElement('div');
			box.id = 'data-error';
			box.className = 'fatal-error';
			document.body.appendChild(box);
		}

		box.innerHTML = `
			<div class="fatal-error__card">
				<h2>Не удалось загрузить данные игры</h2>
				<p>${message}</p>
				<pre>${detail || ''}</pre>
				<p class="fatal-error__hint">
					Игру нужно открывать через локальный сервер (например <code>npm start</code>),
					а не двойным кликом по index.html — браузер блокирует чтение JSON с file://.
				</p>
			</div>
		`;
	}

	const DataLoader = {

		/** Загружает один файл данных по ключу из FILES. */
		async load (key) {
			if (cache.has(key)) {
				return cache.get(key);
			}

			const path = FILES[key];

			if (!path) {
				throw new Error(`DataLoader: неизвестный набор данных "${key}"`);
			}

			try {
				const response = await fetch(path, { cache: 'no-cache' });

				if (!response.ok) {
					throw new Error(`HTTP ${response.status} при загрузке ${path}`);
				}

				const json = await response.json();
				cache.set(key, json);
				return json;
			} catch (error) {
				showFatal(`Файл <code>${path}</code> не прочитан.`, error.message);
				throw error;
			}
		},

		/** Загружает всё сразу. Вызывается один раз при старте. */
		async loadAll () {
			const keys = Object.keys(FILES);
			const values = await Promise.all(keys.map((key) => this.load(key)));
			const result = {};
			keys.forEach((key, index) => { result[key] = values[index]; });
			return result;
		},

		/** Синхронный доступ после loadAll(). */
		get (key) {
			return cache.get(key);
		},

		/** Карточка задачи по id. */
		task (id) {
			const data = cache.get('tasks');
			return data ? data.tasks.find((task) => task.id === id) : undefined;
		},

		/** Все карточки задач в порядке объявления. */
		allTasks () {
			const data = cache.get('tasks');
			return data ? data.tasks : [];
		},

		quiz (id) {
			const data = cache.get('quizzes');
			return data ? data.quizzes[id] : undefined;
		},

		fact (id) {
			const data = cache.get('facts');
			return data ? data.facts[id] : undefined;
		},

		competency (id) {
			const data = cache.get('tasks');
			return data ? data.competencies[id] : undefined;
		},

		accessLevels () {
			const data = cache.get('tasks');
			return data ? data.accessLevels : [];
		},

		/** Конфиг мини-игры: minigameConfig('drone', 'drone_level_01'). */
		minigameConfig (type, configId) {
			const data = cache.get('minigames');
			return data && data[type] ? data[type][configId] : undefined;
		},

		showFatal
	};

	global.DataLoader = DataLoader;

})(window);
