/**
 * Действие сценария: `minigame <type> <configId>`
 *
 * Запускает мини-игру через MinigameHost и кладёт результат в
 * storage.runtime.lastResult. Награды здесь не начисляются — этим занимается
 * действие `complete <taskId>` (ТЗ, п. 12.2: хост не решает, сколько дать
 * репутации).
 *
 * Пример:
 *   'minigame drone drone_level_01',
 *   { 'Conditional': {
 *       'Condition': () => monogatari.storage('runtime').lastResult.status,
 *       'completed': 'jump DroneSuccess',
 *       'failed':    'jump DroneRetry',
 *       'aborted':   'jump Tracker'
 *   }}
 */

'use strict';
/* global Monogatari, monogatari, MinigameHost, Progress */

(function () {

	class MinigameAction extends Monogatari.Action {

		static matchString ([action]) {
			return action === 'minigame';
		}

		constructor (statement) {
			super();
			this.type = statement[1];
			this.configId = statement[2];
		}

		async apply () {
			const result = await MinigameHost.start(this.type, this.configId);

			monogatari.storage().runtime.lastResult = result;
			Progress.save();
		}

		didApply () {
			return Promise.resolve({ advance: true });
		}

		willRevert () {
			// Мини-игру не отматываем: её перезапускают из трекера.
			return Promise.reject();
		}
	}

	MinigameAction.id = 'Minigame';

	monogatari.registerAction(MinigameAction);

})();
