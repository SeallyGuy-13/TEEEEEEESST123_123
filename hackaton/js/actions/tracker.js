/**
 * Действие сценария: `tracker`
 *
 * Открывает трекер задач и ждёт выбор игрока. Выбор сохраняется в
 * storage.runtime, дальше сценарий разводит ветки через Conditional
 * (см. js/script.js, метка Tracker).
 *
 * Синтаксис:
 *   'tracker'
 *   'tracker Выберите следующую задачу'   — с подсказкой над списком
 */

'use strict';
/* global Monogatari, monogatari, TrackerUI, Progress, Overlay */

(function () {

	class TrackerAction extends Monogatari.Action {

		static setup () {
			return Promise.resolve();
		}

		/**
		 * Общий предохранитель для всей игры.
		 *
		 * Движок спрашивает shouldProceed() у каждого действия перед тем, как
		 * продвинуть сценарий. Пока открыт наш оверлей — трекер, проверка знаний
		 * или мини-игра — двигаться нельзя: иначе клик, клавиша или автопрокрутка
		 * уведут сценарий вперёд, пока игрок ещё играет, и следующий Conditional
		 * прочитает результат предыдущей попытки.
		 */
		static shouldProceed () {
			return Overlay.isOpen()
				? Promise.reject(new Error('Открыт игровой оверлей'))
				: Promise.resolve();
		}

		static shouldRollback () {
			return Overlay.isOpen()
				? Promise.reject(new Error('Открыт игровой оверлей'))
				: Promise.resolve();
		}

		static matchString ([action]) {
			return action === 'tracker';
		}

		constructor (statement) {
			super();
			this.hint = statement.slice(1).join(' ');
		}

		async apply () {
			// Трекер — безопасная точка возврата (ТЗ, п. 10.1).
			Progress.setCheckpoint('Tracker');

			const choice = await TrackerUI.open({ hint: this.hint });
			const runtime = monogatari.storage().runtime;

			runtime.selectedTask = choice ? choice.taskId : null;
			runtime.repeatTutorial = Boolean(choice && choice.repeatTutorial);

			Progress.save();
		}

		didApply () {
			return Promise.resolve({ advance: true });
		}

		willRevert () {
			// Откат внутрь трекера смысла не имеет: он открывается заново.
			return Promise.reject();
		}
	}

	TrackerAction.id = 'Tracker';

	monogatari.registerAction(TrackerAction);

})();
