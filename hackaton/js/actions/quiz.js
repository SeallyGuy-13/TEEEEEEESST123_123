/**
 * Действие сценария: `quiz <id>`
 *
 * Проверка знаний по данным из data/quizzes.json (ТЗ, п. 13.3).
 *
 * Поведение при неправильном ответе (ТЗ, п. 9.2):
 *   — короткая реакция NPC;
 *   — объяснение, опирающееся на только что пройденный материал;
 *   — умеренное снижение репутации;
 *   — повторный выбор, без повтора всего диалога.
 *
 * После действия в storage.runtime появляются:
 *   quizPassed   — прошёл ли игрок проверку;
 *   quizAttempts — сколько попыток потребовалось;
 *   rescued      — сработал ли возврат к чекпоинту (репутация упала до 0).
 */

'use strict';
/* global Monogatari, monogatari, DataLoader, Overlay, Progress */

(function () {

	class QuizAction extends Monogatari.Action {

		static matchString ([action]) {
			return action === 'quiz';
		}

		constructor (statement) {
			super();
			this.quizId = statement[1];
		}

		async apply () {
			const quiz = DataLoader.quiz(this.quizId);
			const runtime = monogatari.storage().runtime;

			if (!quiz) {
				console.error(`Проверка знаний "${this.quizId}" не найдена в data/quizzes.json`);
				runtime.quizPassed = true;
				return;
			}

			let attempts = 0;
			let rescued = false;

			const passed = await Overlay.open({
				id: 'quiz',
				className: 'overlay--quiz',
				build (panel, close) {
					panel.innerHTML = `
						<div class="quiz">
							<div class="quiz__speaker">${quiz.speaker}</div>
							${quiz.situation ? `<p class="quiz__situation">${quiz.situation}</p>` : ''}
							<h3 class="quiz__question">${quiz.question}</h3>

							<div class="quiz__answers">
								${quiz.answers.map((answer) => `
									<button class="btn btn--option quiz__answer" type="button" data-answer="${answer.id}">
										${answer.text}
									</button>
								`).join('')}
							</div>

							<div class="quiz__feedback" data-feedback hidden></div>
						</div>
					`;

					const feedback = panel.querySelector('[data-feedback]');

					panel.querySelector('.quiz__answers').addEventListener('click', (event) => {
						const button = event.target.closest('[data-answer]');

						if (!button || button.disabled) {
							return;
						}

						const answer = quiz.answers.find((item) => item.id === button.dataset.answer);
						attempts += 1;

						const change = Progress.reputation(answer.deltaReputation || 0, `Проверка знаний: ${quiz.id}`);
						rescued = rescued || change.rescued;

						feedback.hidden = false;

						if (answer.correct) {
							button.classList.add('is-correct');
							panel.querySelectorAll('[data-answer]').forEach((node) => { node.disabled = true; });

							feedback.className = 'quiz__feedback quiz__feedback--good';
							feedback.innerHTML = `<p>${answer.reaction}</p>`;

							window.setTimeout(() => close(true), 1400);
							return;
						}

						button.classList.add('is-wrong');
						button.disabled = true;

						feedback.className = 'quiz__feedback quiz__feedback--bad';
						feedback.innerHTML = `
							<p class="quiz__reaction">${answer.reaction}</p>
							<p class="quiz__explanation">${quiz.explanationOnWrong}</p>
							${quiz.retry ? '<p class="quiz__retry">Попробуйте ещё раз.</p>' : ''}
						`;

						// Если повторные попытки запрещены — закрываем с провалом.
						if (!quiz.retry) {
							panel.querySelectorAll('[data-answer]').forEach((node) => { node.disabled = true; });
							window.setTimeout(() => close(false), 1800);
						}
					});
				}
			});

			runtime.quizPassed = Boolean(passed);
			runtime.quizAttempts = attempts;
			runtime.rescued = rescued;

			Progress.save();
		}

		didApply () {
			return Promise.resolve({ advance: true });
		}

		willRevert () {
			return Promise.reject();
		}
	}

	QuizAction.id = 'Quiz';

	monogatari.registerAction(QuizAction);

})();
