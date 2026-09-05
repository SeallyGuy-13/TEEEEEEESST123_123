/**
 * =======================================
 * Настройки движка Monogatari
 * =======================================
 */

'use strict';
/* global monogatari */

monogatari.settings({

	'Name': 'ЭкоМониторинг: Стажёр',
	'Version': '0.1.0',

	// Стартовая метка сценария
	'Label': 'Start',

	'Slots': 10,

	'MultiLanguage': false,
	'LanguageSelectionScreen': false,

	// Музыка главного меню отключена намеренно.
	//
	// Браузер запрещает автовоспроизведение до первого клика, движок ловит отказ
	// и выводит поверх экрана плашку «Включить звуковое сопровождение». Музыка
	// сцен запускается уже после клика по меню, поэтому плашка не нужна.
	'MainScreenMusic': '',

	'SaveLabel': 'Save',
	'AutoSaveLabel': 'AutoSave',

	'ShowMainScreen': true,

	// Предзагрузка ассетов (JPG-персонажи и фоны).
	'Preload': true,

	// Автосохранение раз в минуту (ТЗ п.18: сохраняем часто).
	'AutoSave': 1,

	// Service worker выключен: мешает разработке (кэширует старые файлы).
	'ServiceWorkers': false,

	'AspectRatio': '16:9',
	'ForceAspectRatio': 'None',

	'TypeAnimation': true,
	'InstantText': true,
	'NVLTypeAnimation': true,
	'NarratorTypeAnimation': true,
	'CenteredTypeAnimation': true,

	// ВАЖНО: игра должна работать на телефоне в портретной ориентации,
	// поэтому ориентация не форсируется.
	'Orientation': 'any',

	'Skip': 0,

	'AssetsPath': {
		'root': 'assets',
		'characters': 'characters',
		'icons': 'icons',
		'images': 'images',
		'music': '../music',
		'scenes': 'scenes',
		'sounds': 'audio/sound',
		'ui': 'ui',
		'videos': 'videos',
		'voices': 'audio/voice',
		'gallery': 'gallery'
	},

	'SplashScreenLabel': '_SplashScreen',

	// ТЗ п.18: для MVP достаточно localStorage.
	'Storage': {
		'Adapter': 'LocalStorage',
		'Store': 'ecoNovelSave_v1',
		'Endpoint': ''
	},

	'AllowRollback': true,
	'ExperimentalFeatures': false,

	// Скриншоты слотов выключены: мини-игры рисуют canvas, снимок тяжёлый.
	'Screenshots': false
});

monogatari.preferences({
	'Language': 'Русский',
	'Volume': {
		'Music': 0.6,
		'Voice': 1,
		'Sound': 0.8,
		'Video': 1
	},
	'Resolution': '1280x720',
	'TextSpeed': 25,
	'AutoPlaySpeed': 5
});
