/**
 * Действия сценария для работы с прогрессом (ТЗ, п. 10).
 *
 *   rep +5                     — изменить репутацию
 *   xp 100                     — начислить опыт
 *   fact fact_satellite_01     — показать карточку факта и добавить в коллекцию
 *   competency competency_drone_1
 *   task task_drone_01 in_progress   — сменить статус задачи
 *   complete task_drone_01     — завершить задачу: статус + награды + компетенции
 *   tutorial-seen tutorial_drone_basic
 *   checkpoint Tracker         — отметить безопасную точку возврата
 *   return-to-checkpoint       — прыгнуть на сохранённый чекпоинт
 */

'use strict';
/* global Monogatari, monogatari, Progress, Overlay */

(function () {

	/* ---------------------------------------------------------------- */

	class ReputationAction extends Monogatari.Action {

		static matchString ([action]) {
			return action === 'rep';
		}

		constructor (statement) {
			super();
			this.delta = Number(statement[1]);
			this.reason = statement.slice(2).join(' ');
		}

		apply () {
			const change = Progress.reputation(this.delta, this.reason);
			monogatari.storage().runtime.rescued = change.rescued;
			return Promise.resolve();
		}

		didApply () {
			return Promise.resolve({ advance: true });
		}
	}

	ReputationAction.id = 'Reputation';

	/* ---------------------------------------------------------------- */

	class XpAction extends Monogatari.Action {

		static matchString ([action]) {
			return action === 'xp';
		}

		constructor (statement) {
			super();
			this.amount = Number(statement[1]);
		}

		apply () {
			Progress.xp(this.amount);
			return Promise.resolve();
		}

		didApply () {
			return Promise.resolve({ advance: true });
		}
	}

	XpAction.id = 'Xp';

	/* ---------------------------------------------------------------- */

	class FactAction extends Monogatari.Action {

		static matchString ([action]) {
			return action === 'fact';
		}

		constructor (statement) {
			super();
			this.factId = statement[1];
		}

		async apply () {
			await Overlay.fact(this.factId);
		}

		didApply () {
			return Promise.resolve({ advance: true });
		}

		willRevert () {
			return Promise.reject();
		}
	}

	FactAction.id = 'Fact';

	/* ---------------------------------------------------------------- */

	class CompetencyAction extends Monogatari.Action {

		static matchString ([action]) {
			return action === 'competency';
		}

		constructor (statement) {
			super();
			this.competencyId = statement[1];
		}

		apply () {
			Progress.grantCompetency(this.competencyId);
			return Promise.resolve();
		}

		didApply () {
			return Promise.resolve({ advance: true });
		}
	}

	CompetencyAction.id = 'Competency';

	/* ---------------------------------------------------------------- */

	class TaskStatusAction extends Monogatari.Action {

		static matchString ([action]) {
			return action === 'task';
		}

		constructor (statement) {
			super();
			this.taskId = statement[1];
			this.status = statement[2];
		}

		apply () {
			Progress.setTaskStatus(this.taskId, this.status);
			return Promise.resolve();
		}

		didApply () {
			return Promise.resolve({ advance: true });
		}
	}

	TaskStatusAction.id = 'TaskStatus';

	/* ---------------------------------------------------------------- */

	class CompleteTaskAction extends Monogatari.Action {

		static matchString ([action]) {
			return action === 'complete';
		}

		constructor (statement) {
			super();
			this.taskId = statement[1];
		}

		apply () {
			// Награда начисляется один раз (ТЗ, п. 22.1).
			Progress.completeTask(this.taskId);
			return Promise.resolve();
		}

		didApply () {
			return Promise.resolve({ advance: true });
		}
	}

	CompleteTaskAction.id = 'CompleteTask';

	/* ---------------------------------------------------------------- */

	class TutorialSeenAction extends Monogatari.Action {

		static matchString ([action]) {
			return action === 'tutorial-seen';
		}

		constructor (statement) {
			super();
			this.tutorialId = statement[1];
		}

		apply () {
			Progress.markTutorialSeen(this.tutorialId);
			return Promise.resolve();
		}

		didApply () {
			return Promise.resolve({ advance: true });
		}
	}

	TutorialSeenAction.id = 'TutorialSeen';

	/* ---------------------------------------------------------------- */

	class CheckpointAction extends Monogatari.Action {

		static matchString ([action]) {
			return action === 'checkpoint';
		}

		constructor (statement) {
			super();
			this.label = statement[1];
			this.taskId = statement[2] || null;
		}

		apply () {
			Progress.setCheckpoint(this.label, this.taskId);
			return Promise.resolve();
		}

		didApply () {
			return Promise.resolve({ advance: true });
		}
	}

	CheckpointAction.id = 'Checkpoint';

	/* ---------------------------------------------------------------- */

	/**
	 * Возврат к последнему безопасному чекпоинту. Метка вычисляется во время
	 * выполнения, поэтому обычный `jump` здесь не подходит.
	 */
	class ReturnToCheckpointAction extends Monogatari.Action {

		static matchString ([action]) {
			return action === 'return-to-checkpoint';
		}

		async apply () {
			const runtime = monogatari.storage().runtime;
			runtime.rescued = false;

			const label = Progress.checkpoint().label || 'Tracker';
			await monogatari.run(`jump ${label}`);
		}

		didApply () {
			return Promise.resolve({ advance: false });
		}

		willRevert () {
			return Promise.reject();
		}
	}

	ReturnToCheckpointAction.id = 'ReturnToCheckpoint';

	/* ---------------------------------------------------------------- */

	[
		ReputationAction,
		XpAction,
		FactAction,
		CompetencyAction,
		TaskStatusAction,
		CompleteTaskAction,
		TutorialSeenAction,
		CheckpointAction,
		ReturnToCheckpointAction
	].forEach((action) => monogatari.registerAction(action));

})();
