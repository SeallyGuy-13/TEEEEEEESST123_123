/**
 * Сценарий визуальной новеллы «ЭкоМониторинг: Стажёр».
 *
 * Здесь живёт только контент: персонажи, ассеты и реплики. Правила прогресса —
 * в js/core/progress.js, интерфейсы — в js/core/*, мини-игры — в js/minigames/*.
 *
 * Структура каждой задачи (ТЗ, п. 6):
 *   выбор в трекере → сцена → инструктаж → проверка знаний → мини-игра →
 *   результат → награда → возврат в трекер.
 *
 * Персонажи пока болванки: спрайты в assets/characters/* — SVG-заглушки,
 * которые заменяются на финальную графику без правок сценария.
 */

'use strict';
/* global monogatari, Progress */

/* ------------------------------------------------------------------------ */
/* Информационные окна                                                       */
/* ------------------------------------------------------------------------ */

monogatari.action('message').messages({
	'Chain': {
		title: 'Как устроена работа',
		subtitle: 'Цепочка от данных к действию',
		body: `
			<p class="chain">
				<span>СБОР</span> → <span>ОБРАБОТКА</span> → <span>АНАЛИЗ</span> →
				<span>РЕШЕНИЕ</span> → <span>ДЕЙСТВИЕ</span>
			</p>
			<p>Ни один шаг нельзя пропустить. Найденное пятно на снимке — это ещё не подтверждённая проблема,
			а подтверждённая проблема — это ещё не обязательно массовая уборка.</p>
		`
	},
	'RealEvent': {
		title: 'Массовая уборка территории',
		subtitle: 'Реальная активность',
		body: `
			<p><strong>Место:</strong> береговая линия, участок 4</p>
			<p><strong>Дата:</strong> ближайшая суббота, 10:00</p>
			<p><strong>Участников заявлено:</strong> 38</p>
			<p>Заявка сформирована по данным, которые вы собрали: облёт дрона, снимки, разбор кейсов
			и подтверждённый состав отходов.</p>
		`
	}
});

monogatari.action('notification').notifications({
	'NewTask': {
		title: 'Новая задача',
		body: 'В трекере появилась карточка со статусом «Реальная активность».',
		icon: ''
	}
});

monogatari.configuration('credits', {
	'Игра': {
		'Название': 'ЭкоМониторинг: Стажёр',
		'Движок': 'Monogatari'
	},
	'Ассеты': {
		'Статус': 'Персонажи и фоны — временные болванки'
	}
});

/* ------------------------------------------------------------------------ */
/* Ассеты                                                                    */
/* ------------------------------------------------------------------------ */

// Основная музыка; прежние ключи сохранены для совместимости сохранений.
monogatari.assets('music', {
	'menu': 'main.mp3',
	'office': 'main.mp3',
	'field': 'main.mp3',
	'tension': 'main.mp3',
	'minigame': 'mini_game.mp3'
});

// Звуки интерфейса и событий.
monogatari.assets('sounds', {
	'click': 'click.wav',
	'success': 'success.wav',
	'error': 'error.wav',
	'notify': 'notify.wav',
	'drone': 'drone.wav'
});

monogatari.assets('voices', {});
monogatari.assets('videos', {});

monogatari.assets('images', {
	'chain': 'chain.svg'
});

// Фоны сцен.
monogatari.assets('scenes', {
	'office': 'office.jpg',
	'workstation': 'workstation.jpg',
	'shore': 'shore.jpg',
	'analytics': 'analytics.jpg',
	'event': 'event.jpg'
});

/* ------------------------------------------------------------------------ */
/* Персонажи (болванки)                                                      */
/* ------------------------------------------------------------------------ */

monogatari.characters({
	'm': {
		name: 'Наставник',
		color: '#43c59e',
		directory: 'mentor',
		sprites: {
			normal: 'normal.png',
			happy: 'normal.png',
			serious: 'normal.png'
		}
	},
	'o': {
		name: 'Оператор БПЛА',
		color: '#5bc0f8',
		directory: 'operator',
		sprites: {
			normal: 'normal.png'
		}
	},
	'a': {
		name: 'Аналитик',
		color: '#f0a44b',
		directory: 'analyst',
		sprites: {
			normal: 'normal.png'
		}
	},
	'c': {
		name: 'Координатор',
		color: '#c88bf0',
		directory: 'coordinator',
		sprites: {
			normal: 'normal.png'
		}
	},
	'y': {
		name: 'Стажёр',
		color: '#eaf3ee',
		directory: 'hero',
		sprites: {
			normal: 'normal.png'
		}
	}
});

/* ------------------------------------------------------------------------ */
/* Сценарий                                                                  */
/* ------------------------------------------------------------------------ */

monogatari.script({

	/* -------------------------------------------------------------------- */
	/* Пролог (документ диалогов, п. 1)                                      */
	/* -------------------------------------------------------------------- */

	'Start': [
		'checkpoint Start',
		'show scene office with fadeIn',
		'play music office loop fade 3',

		'show character y normal at left with fadeIn',
		'show character m normal at right with fadeIn',

		{
			'Choice': {
				'Dialog': 'm Здравствуй! Ты ведь наш новый стажёр?',
				'first_day': {
					'Text': 'Да. Сегодня мой первый день.',
					'Do': 'jump PrologueAnswerFirstDay'
				},
				'no_experience': {
					'Text': 'Если вы ждали специалиста с десятилетним опытом — у меня плохие новости.',
					'Do': 'jump PrologueAnswerNoExperience'
				},
				'coffee': {
					'Text': 'А можно сначала узнать, где здесь кофе?',
					'Do': 'jump PrologueAnswerCoffee'
				}
			}
		}
	],

	'PrologueAnswerFirstDay': [
		'y Да. Сегодня мой первый день.',
		'm Хорошо. Тогда начнём с начала.',
		'jump PrologueIntro'
	],

	'PrologueAnswerNoExperience': [
		'y Если вы ждали специалиста с десятилетним опытом — у меня плохие новости.',
		'm Десятилетний опыт у нас есть. Не хватает как раз тех, кто задаёт вопросы.',
		'jump PrologueIntro'
	],

	'PrologueAnswerCoffee': [
		'y А можно сначала узнать, где здесь кофе?',
		'm Кофе на кухне. Приоритеты у тебя расставлены, это уже что-то.',
		'jump PrologueIntro'
	],

	'PrologueIntro': [
		'm В любом случае добро пожаловать. Сегодня без сложных задач. Сначала покажу, чем мы вообще здесь занимаемся.',
		'm Не переживай, сразу отправлять тебя одного на задание никто не собирается.',
		'y Уже звучит обнадёживающе.',
		'm Для начала проведу небольшой инструктаж и покажу, как здесь всё устроено.',

		'show scene workstation with fadeIn',
		'm Большая часть работы начинается здесь.',
		'm Не на берегу и не с мешка для мусора, а с данных. Нужно понять, что произошло, где это произошло и какие действия действительно нужны.',
		'm Каждый день в систему поступают разные задачи. Где-то нужно получить новые данные, где-то проверить уже полученные снимки, а где-то перейти от наблюдений к конкретным действиям.',
		'm Поэтому у каждого сотрудника есть трекер задач.',

		'm Перед тобой список текущих задач.',
		'm Сегодня я разрешу тебе выбрать, с какой начать.',
		'y В первый день мне уже дают выбирать?',
		'm Пока только из тех, где последствия твоих ошибок можно исправить.',
		'y А вот теперь я снова переживаю.',
		'm Не волнуйся. Перед каждой новой задачей я объясню, с чем тебе предстоит работать.',

		'jump Tracker'
	],

	/* -------------------------------------------------------------------- */
	/* Трекер задач — главный хаб (ТЗ, п. 5)                                 */
	/* -------------------------------------------------------------------- */

	'Tracker': [
		'checkpoint Tracker',
		'hide character m',

		'tracker Выберите задачу — порядок выбираете вы.',

		{
			'Conditional': {
				'Condition': function () {
					const runtime = monogatari.storage('runtime');
					return runtime.selectedTask || 'task_drone_01';
				},
				'task_drone_01': 'jump TaskDrone',
				'task_imagery_01': 'jump TaskImagery',
				'task_analysis_01': 'jump TaskAnalysis',
				'task_cleanup_01': 'jump TaskCleanup',
				'task_real_event_01': 'jump TaskRealEvent'
			}
		}
	],

	/* -------------------------------------------------------------------- */
	/* Ветка: БПЛА (документ диалогов, п. 3)                                 */
	/* -------------------------------------------------------------------- */

	'TaskDrone': [
		'checkpoint TaskDrone',
		'task task_drone_01 in_progress',
		'show scene workstation with fadeIn',
		'show character y normal at left with fadeIn',
		'show character m normal at right with fadeIn',

		{
			'Conditional': {
				'Condition': function () {
					// Инструктаж не запускается автоматически второй раз (ТЗ, п. 6),
					// но его можно открыть кнопкой «Повторить инструктаж».
					const runtime = monogatari.storage('runtime');

					if (runtime.repeatTutorial) {
						return 'tutorial';
					}

					return Progress.tutorialSeen('tutorial_drone_basic') ? 'skip' : 'tutorial';
				},
				'tutorial': 'jump DroneTutorial',
				'skip': 'jump DroneQuiz'
			}
		}
	],

	'DroneTutorial': [
		'm Решил начать с беспилотников? Хороший выбор.',
		'm Для начала разберёмся, зачем они вообще нам нужны.',
		'm Иногда нам необходимо получить свежие и достаточно подробные изображения конкретного участка.',
		'm Спутниковые данные позволяют наблюдать большие территории, но для локального обследования нужна более детальная съёмка.',
		'm Здесь и используются беспилотные летательные аппараты.',
		'm Перед полётом сначала определяют область и маршрут. Просто поднять дрон и лететь куда получится — плохой план.',

		{
			'Choice': {
				'Dialog': 'm Учебное действие: с чего начинается подготовка полёта?',
				'area': {
					'Text': 'Определить область обследования',
					'Do': 'jump DroneTutorialRoute'
				},
				'launch': {
					'Text': 'Проверить заряд и сразу взлететь',
					'Do': 'jump DroneTutorialWrongStep'
				}
			}
		}
	],

	'DroneTutorialWrongStep': [
		'm Заряд проверить нужно, но это не первый шаг. Сначала мы понимаем, что именно снимаем.',
		'jump DroneTutorialRoute'
	],

	'DroneTutorialRoute': [
		'm Верно. Область определили — теперь маршрут.',
		'm Маршрут строят так, чтобы соседние кадры перекрывались. Иначе из снимков не собрать общую картину участка.',
		'fact fact_drone_01',
		'tutorial-seen tutorial_drone_basic',

		{
			'Conditional': {
				'Condition': function () {
					// Если инструктаж открыли повторно из трекера — возвращаемся туда.
					return monogatari.storage('runtime').repeatTutorial ? 'back' : 'continue';
				},
				'back': 'jump TutorialRepeatDone',
				'continue': 'jump DroneQuiz'
			}
		}
	],

	'DroneQuiz': [
		'show character o normal at right with fadeIn',
		'o Раз уж у нас новый специалист по беспилотникам, можно его ненадолго одолжить?',
		'm Он ещё пять минут назад не знал, чем здесь занимается.',
		'o Значит, самое время проверить, насколько внимательно он тебя слушал.',
		'o У нас новая отметка на небольшом участке берега. Нужно получить подробные актуальные изображения.',

		'quiz quiz_drone_01',

		{
			'Conditional': {
				'Condition': function () {
					return monogatari.storage('runtime').rescued ? 'rescue' : 'continue';
				},
				'rescue': 'jump Rescue',
				'continue': 'jump DroneGame'
			}
		}
	],

	'DroneGame': [
		'o Тогда учебная часть закончилась. Данные настоящей задачи уже у тебя в трекере.',
		'hide character o',
		'hide character m',
		'show scene shore with fadeIn',
		'play sound drone',

		// Тема мини-игр. Снимаем её сразу после выхода, чтобы она не тянулась
		// в следующую сюжетную сцену.
		'play music minigame loop fade 2',
		'minigame drone drone_level_01',
		'stop music with fade 2',
		'play music office loop fade 2',

		{
			'Conditional': {
				'Condition': function () {
					const result = monogatari.storage('runtime').lastResult || {};
					return result.status === 'completed' ? 'ok' : 'retry';
				},
				'ok': 'jump DroneResult',
				'retry': 'jump DroneRetry'
			}
		}
	],

	'DroneRetry': [
		'show scene workstation with fadeIn',
		'show character y normal at left with fadeIn',
		'show character o normal at right with fadeIn',
		'o Материала не хватило. Ничего страшного — участок можно пролететь ещё раз.',
		'm Ошибка на учебной задаче стоит дешевле, чем ошибка на настоящей.',
		'jump DroneGame'
	],

	'DroneResult': [
		'show scene workstation with fadeIn',
		'show character y normal at left with fadeIn',
		'show character o normal at right with fadeIn',
		'play sound success',

		'o Данные получил. Неплохо.',
		'show character m normal at right with fadeIn',
		'm Для первого раза даже очень.',
		'y Это считается официальной похвалой?',
		'm Не привыкай.',

		'complete task_drone_01',

		'm Выбирай следующую задачу.',
		'jump Tracker'
	],

	/* -------------------------------------------------------------------- */
	/* Ветка: работа со снимками (документ диалогов, п. 4–5)                 */
	/* -------------------------------------------------------------------- */

	'TaskImagery': [
		'checkpoint TaskImagery',
		'task task_imagery_01 in_progress',
		'show scene analytics with fadeIn',
		'show character y normal at left with fadeIn',
		'show character m normal at right with fadeIn',
		'm Снимки? Тогда пойдём знакомиться с нашими аналитиками.',
		'show character a normal at right with fadeIn',
		'a Новый стажёр?',
		'show character m normal at right with fadeIn',
		'm Да. И почему-то добровольно выбрал работу с данными.',
		'show character a normal at right with fadeIn',
		'a Значит, ещё не знает, во что ввязался.',

		// Вариативная реплика в зависимости от порядка задач (документ, п. 9).
		{
			'Conditional': {
				'Condition': function () {
					return Progress.taskStatus('task_drone_01') === 'completed' ? 'knows' : 'new';
				},
				'knows': 'jump ImageryGreetingKnows',
				'new': 'jump ImageryGreetingNew'
			}
		}
	],

	'ImageryGreetingKnows': [
		'a Вижу, с беспилотниками ты уже познакомился.',
		'y Даже ничего не разбил.',
		'a Отлично. Тогда ты уже знаешь, откуда берётся часть материалов, с которыми мы работаем.',
		'jump ImageryTutorialGate'
	],

	'ImageryGreetingNew': [
		'a Часть таких снимков мы получаем с беспилотников. С ними тебя ещё познакомят отдельно.',
		'jump ImageryTutorialGate'
	],

	'ImageryTutorialGate': [
		{
			'Conditional': {
				'Condition': function () {
					const runtime = monogatari.storage('runtime');

					if (runtime.repeatTutorial) {
						return 'tutorial';
					}

					return Progress.tutorialSeen('tutorial_imagery_basic') ? 'skip' : 'tutorial';
				},
				'tutorial': 'jump ImageryTutorial',
				'skip': 'jump ImageryQuiz'
			}
		}
	],

	'ImageryTutorial': [
		'm Чтобы следить за большой территорией, нам нужны актуальные изображения.',
		'm Получать их можно разными способами. И у каждого есть свои преимущества и ограничения.',
		'm Спутниковые данные позволяют наблюдать большие площади и сравнивать состояние территории в разные периоды.',
		'fact fact_satellite_01',
		'm Если нужно рассмотреть небольшой участок подробнее, можно использовать беспилотник.',
		'm А иногда никакой снимок не заменит проверку непосредственно на месте.',
		'a И ещё одно: не каждый визуальный признак означает подтверждённую проблему.',
		'tutorial-seen tutorial_imagery_basic',

		{
			'Conditional': {
				'Condition': function () {
					return monogatari.storage('runtime').repeatTutorial ? 'back' : 'continue';
				},
				'back': 'jump TutorialRepeatDone',
				'continue': 'jump ImageryQuiz'
			}
		}
	],

	'ImageryQuiz': [
		'a Можно вас на минуту? У нас новая отметка.',
		'a Поступило сообщение о возможном загрязнении возле берега. Территория небольшая, но нужно рассмотреть её подробнее.',

		'quiz quiz_imagery_01',

		{
			'Conditional': {
				'Condition': function () {
					return monogatari.storage('runtime').rescued ? 'rescue' : 'continue';
				},
				'rescue': 'jump Rescue',
				'continue': 'jump ImageryGame'
			}
		}
	],

	'ImageryGame': [
		'a Тогда посмотрим на материалы.',
		'hide character a',
		'hide character m',

		'play music minigame loop fade 2',
		'minigame imageAnalysis imagery_level_01',
		'stop music with fade 2',
		'play music office loop fade 2',

		{
			'Conditional': {
				'Condition': function () {
					const result = monogatari.storage('runtime').lastResult || {};
					return result.status === 'completed' ? 'ok' : 'retry';
				},
				'ok': 'jump ImageryResult',
				'retry': 'jump ImageryRetry'
			}
		}
	],

	'ImageryRetry': [
		'show scene analytics with fadeIn',
		'show character y normal at left with fadeIn',
		'show character a normal at right with fadeIn',
		'a Материала маловато. Посмотрим ещё раз — снимок никуда не денется.',
		'jump ImageryGame'
	],

	'ImageryResult': [
		'show scene analytics with fadeIn',
		'show character y normal at left with fadeIn',
		'show character a normal at right with fadeIn',
		'play sound success',

		{
			'Choice': {
				'Dialog': 'a Так это ты снимал берег?',
				'found': {
					'Text': 'Да. Нашёл два подозрительных участка.',
					'Do': 'jump ImageryAnswerFound'
				},
				'drone': {
					'Text': 'Это был дрон. Я просто старался ему не мешать.',
					'Do': 'jump ImageryAnswerDrone'
				},
				'worry': {
					'Text': 'Мне уже начинать переживать?',
					'Do': 'jump ImageryAnswerWorry'
				}
			}
		}
	],

	'ImageryAnswerFound': [
		'y Да. Нашёл два подозрительных участка.',
		'a Подозрительных — правильное слово. Не «загрязнённых».',
		'jump ImageryChain'
	],

	'ImageryAnswerDrone': [
		'y Это был дрон. Я просто старался ему не мешать.',
		'a Разумная стратегия для первого дня.',
		'jump ImageryChain'
	],

	'ImageryAnswerWorry': [
		'y Мне уже начинать переживать?',
		'a Пока нет. Переживать начнём, когда будут данные.',
		'jump ImageryChain'
	],

	'ImageryChain': [
		'a Теперь у нас есть снимок. Но одного изображения не всегда достаточно.',
		'y То есть задача ещё не закончена?',
		'a Наоборот. Теперь у нас появились данные, на основании которых можно принять решение.',
		'show message Chain',

		'complete task_imagery_01',

		'show character m normal at right with fadeIn',
		'm Возвращайся в трекер, там ещё есть работа.',
		'jump Tracker'
	],

	/* -------------------------------------------------------------------- */
	/* Ветка: анализ данных (ТЗ, п. 7.3)                                     */
	/* -------------------------------------------------------------------- */

	'TaskAnalysis': [
		'checkpoint TaskAnalysis',
		'task task_analysis_01 in_progress',
		'show scene analytics with fadeIn',
		'show character y normal at left with fadeIn',
		'show character c normal at right with fadeIn',
		'c Разбор данных и принятие решений? Как раз по моей части.',

		{
			'Conditional': {
				'Condition': function () {
					const runtime = monogatari.storage('runtime');

					if (runtime.repeatTutorial) {
						return 'tutorial';
					}

					return Progress.tutorialSeen('tutorial_analysis_basic') ? 'skip' : 'tutorial';
				},
				'tutorial': 'jump AnalysisTutorial',
				'skip': 'jump AnalysisQuiz'
			}
		}
	],

	'AnalysisTutorial': [
		'c Смотри. Мы собираем данные, обрабатываем их, анализируем, принимаем решение и только потом действуем.',
		'c Между «на снимке что-то тёмное» и «зовём сто человек с мешками» есть несколько шагов.',
		'c Половина отметок оказывается ложной тревогой. Это нормально и это тоже результат.',
		'fact fact_analysis_01',
		'tutorial-seen tutorial_analysis_basic',

		{
			'Conditional': {
				'Condition': function () {
					return monogatari.storage('runtime').repeatTutorial ? 'back' : 'continue';
				},
				'back': 'jump TutorialRepeatDone',
				'continue': 'jump AnalysisQuiz'
			}
		}
	],

	'AnalysisQuiz': [
		'quiz quiz_analysis_01',

		{
			'Conditional': {
				'Condition': function () {
					return monogatari.storage('runtime').rescued ? 'rescue' : 'continue';
				},
				'rescue': 'jump Rescue',
				'continue': 'jump AnalysisGame'
			}
		}
	],

	'AnalysisGame': [
		'c Тогда разбирай кейсы. Три штуки, все настоящие.',
		'hide character c',

		'play music minigame loop fade 2',
		'minigame decisionCase decision_level_01',
		'stop music with fade 2',
		'play music office loop fade 2',

		{
			'Conditional': {
				'Condition': function () {
					const result = monogatari.storage('runtime').lastResult || {};
					return result.status === 'completed' ? 'ok' : 'retry';
				},
				'ok': 'jump AnalysisResult',
				'retry': 'jump AnalysisRetry'
			}
		}
	],

	'AnalysisRetry': [
		'show scene analytics with fadeIn',
		'show character y normal at left with fadeIn',
		'show character c normal at right with fadeIn',
		'c Часть решений опередила данные. Разберём кейсы ещё раз — так это и учится.',
		'jump AnalysisGame'
	],

	'AnalysisResult': [
		'show scene analytics with fadeIn',
		'show character y normal at left with fadeIn',
		'show character c normal at right with fadeIn',
		'play sound success',

		'c Вот теперь у нас есть обоснованное решение, а не догадка.',
		'y И только после этого можно что-то делать на месте?',
		'c Именно. Иначе мы просто перекладываем мусор ради красивого отчёта.',

		'complete task_analysis_01',

		'show character m normal at right with fadeIn',
		'm Отличная работа. Теперь ты понимаешь, как данные превращаются в действие.',
		'jump Tracker'
	],

	/* -------------------------------------------------------------------- */
	/* Ветка: очистка территории / три в ряд (документ диалогов, п. 7)       */
	/* -------------------------------------------------------------------- */

	'TaskCleanup': [
		'checkpoint TaskCleanup',
		'task task_cleanup_01 in_progress',
		'show scene shore with fadeIn',
		'show character y normal at left with fadeIn',
		'show character c normal at right with fadeIn',

		'c Я координатор экологических активностей. Сегодня вместе подготовим уборку берега.',
		'c Сразу решил перейти к самому заметному результату?',
		'y Увидел слово «уборка». Решил, что здесь хотя бы понятно, что делать.',
		'c Вот как раз не всегда.',

		{
			'Conditional': {
				'Condition': function () {
					const runtime = monogatari.storage('runtime');

					if (runtime.repeatTutorial) {
						return 'tutorial';
					}

					return Progress.tutorialSeen('tutorial_cleanup_basic') ? 'skip' : 'tutorial';
				},
				'tutorial': 'jump CleanupTutorial',
				'skip': 'jump CleanupQuiz'
			}
		}
	],

	'CleanupTutorial': [
		'c Сначала мы знаем, что обнаружено. Потом — где именно. Потом — какой это масштаб.',
		'c И только после этого решаем, какие действия нужны и как организовать мероприятие.',
		'c А ещё есть то, о чём забывают: что делать с собранными отходами дальше.',
		'c Если всё свалить в один мешок, переработки не будет. Поэтому разделяем на месте.',
		'fact fact_cleanup_01',
		'tutorial-seen tutorial_cleanup_basic',

		{
			'Conditional': {
				'Condition': function () {
					return monogatari.storage('runtime').repeatTutorial ? 'back' : 'continue';
				},
				'back': 'jump TutorialRepeatDone',
				'continue': 'jump CleanupQuiz'
			}
		}
	],

	'CleanupQuiz': [
		'quiz quiz_cleanup_01',

		{
			'Conditional': {
				'Condition': function () {
					return monogatari.storage('runtime').rescued ? 'rescue' : 'continue';
				},
				'rescue': 'jump Rescue',
				'continue': 'jump CleanupGame'
			}
		}
	],

	'CleanupGame': [
		'c Практическое задание: очистите территорию и правильно распределите отходы.',
		'hide character c',

		'play music minigame loop fade 2',
		'minigame match3 cleanup_level_01',
		'stop music with fade 2',
		'play music office loop fade 2',

		{
			'Conditional': {
				'Condition': function () {
					const result = monogatari.storage('runtime').lastResult || {};
					return result.status === 'completed' ? 'ok' : 'retry';
				},
				'ok': 'jump CleanupResult',
				'retry': 'jump CleanupRetry'
			}
		}
	],

	'CleanupRetry': [
		'show scene shore with fadeIn',
		'show character y normal at left with fadeIn',
		'show character c normal at right with fadeIn',
		'c Не всё собрали. Территорию всё равно придётся доубирать — так что заходим ещё раз.',
		'jump CleanupGame'
	],

	'CleanupResult': [
		'show scene shore with fadeIn',
		'show character y normal at left with fadeIn',
		'show character c normal at right with fadeIn',
		'play sound success',

		'c Территория очищена. И, что важнее, отходы разделены по типам.',
		'fact fact_cleanup_02',
		'y Мы записываем, что именно собрали?',
		'c Обязательно. По составу отходов понятно, откуда они приходят и что менять дальше.',

		'complete task_cleanup_01',

		'show character m normal at right with fadeIn',
		'm Отличная работа на берегу. Возвращайся в штаб.',
		'jump Tracker'
	],

	/* -------------------------------------------------------------------- */
	/* Финал базового обучения (документ диалогов, п. 10)                    */
	/* -------------------------------------------------------------------- */

	'TaskRealEvent': [
		'checkpoint TaskRealEvent',
		'show scene event with fadeIn',
		'show character y normal at left with fadeIn',
		'show character m normal at right with fadeIn',
		'play sound notify',
		'show notification NewTask',

		'm Ну что, с учебной частью закончили.',
		'm Теперь посмотрим, как всё это работает за пределами экрана.',
		'show message RealEvent',
		'm Заявка собрана не из ощущений, а из твоих данных: облёт, снимки, разбор кейсов и состав отходов.',
		'y То есть трекер теперь ведёт не к следующей мини-игре, а на настоящий берег.',
		'm Именно так это и работает.',

		'jump Finale'
	],

	'Finale': [
		'show character c normal at right with fadeIn',
		'c Координатор активностей. Дальше — по моей части.',
		'c В трекере будут появляться реальные события: уборки, небольшие задания, курсы, гражданская наука.',
		'show character m normal at right with fadeIn',
		'm А ты, кажется, уже не совсем стажёр.',
		'y Это считается официальной похвалой?',
		'm Не привыкай.',
		'end'
	],

	/* -------------------------------------------------------------------- */
	/* Служебные метки                                                       */
	/* -------------------------------------------------------------------- */

	// Повторный просмотр инструктажа из трекера (ТЗ, п. 6).
	'TutorialRepeatDone': [
		{
			'Function': {
				'Apply': function () {
					monogatari.storage().runtime.repeatTutorial = false;
					return true;
				},
				'Revert': function () {
					return true;
				}
			}
		},
		'm Повторили. Возвращаемся к списку задач.',
		'jump Tracker'
	],

	// Репутация упала до нуля: не Game Over, а возврат к чекпоинту (ТЗ, п. 10.1).
	'Rescue': [
		'show character m normal at right with fadeIn',
		'play sound error',
		'm Кажется, мы слишком быстро двигаемся.',
		'm Давай вернёмся к последнему этапу и разберём его ещё раз.',
		'm Репутация — не наказание, а обратная связь. Она восстановится.',
		'return-to-checkpoint'
	]
});
