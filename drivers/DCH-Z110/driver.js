'use strict';

const path = require('path');
const ZwaveDriver = require('homey-zwavedriver');

module.exports = new ZwaveDriver(path.basename(__dirname), {
	capabilities: {
		alarm_contact: [{
			command_class: 'COMMAND_CLASS_SENSOR_BINARY',
			command_get: 'SENSOR_BINARY_GET',
			command_report: 'SENSOR_BINARY_REPORT',
			command_report_parser: report => {
				if (report && report.hasOwnProperty('Sensor Value')){
					return report['Sensor Value'] === 'detected an event';
				}
				return null;
			},
		},{
			command_class: 'COMMAND_CLASS_BASIC',
			command_report: 'BASIC_SET',
			command_report_parser: report => {
				if (report && report.hasOwnProperty('Value')) {
					return report.Value === 255;
				}
				return null;
			},
		}],
		alarm_tamper: {
			getOnWakeUp: true,
			command_class: 'COMMAND_CLASS_SENSOR_BINARY',
			command_get: 'SENSOR_BINARY_GET',
			command_get_parser: () => ({
				'Sensor Type': 'Tamper',
			}),
			command_report: 'SENSOR_BINARY_REPORT',
			command_report_parser: report => {
				if (!report || report['Sensor Type'] !== 'Tamper') return null;
				return report['Sensor Value'] === 'detected an event';
			},
		},
		measure_luminance: {
			command_class: 'COMMAND_CLASS_SENSOR_MULTILEVEL',
			command_report: 'SENSOR_MULTILEVEL_REPORT',
			command_report_parser: report => {
				if (report.hasOwnProperty('Sensor Type') && report.hasOwnProperty('Sensor Value (Parsed)')) {
					if (report['Sensor Type'] === 'Luminance (version 1)') return report['Sensor Value (Parsed)'];
				}
				return null;
			},
		},
		measure_temperature: {
			command_class: 'COMMAND_CLASS_SENSOR_MULTILEVEL',
			command_report: 'SENSOR_MULTILEVEL_REPORT',
			command_report_parser: report => {
				if (report.hasOwnProperty('Sensor Type') && report.hasOwnProperty('Sensor Value (Parsed)') &&
					report.hasOwnProperty('Level') && report.Level.hasOwnProperty('Scale')) {
					if (report['Sensor Type'] === 'Temperature (version 1)') {
						if (report.Level.Scale === 1) {
							return (report['Sensor Value (Parsed)'] - 32) / 1.8;
						} else if (report.Level.Scale === 0) {
							return report['Sensor Value (Parsed)'];
						}
					}
				}
				return null;
			},

		},
		measure_battery: {
			getOnWakeUp: true,
			command_class: 'COMMAND_CLASS_BATTERY',
			command_get: 'BATTERY_GET',
			command_report: 'BATTERY_REPORT',
			command_report_parser: report => {
				if (report['Battery Level'] === 'battery low warning') {
					return 1;
				}
				if (report.hasOwnProperty('Battery Level (Raw)')) {
					return report['Battery Level (Raw)'][0];
				}
				return null;
			},
		},
	},
	settings: {
		basic_set_level: {
			index: 2,
			size: 1,
			signed: false,
			parser: input => {
				if (input >= 100 && input < 255) { input = 255; }
				return new Buffer([input]);
			},
		},
		light_sensitivity: {
			index: 4,
			size: 1,
		},
		battery_report_time: {
			index: 10,
			size: 1,
		},
		contact_report_time: {
			index: 11,
			size: 1,
		},
		illumination_report_time: {
			index: 12,
			size: 1,
		},
		temperature_report_time: {
			index: 13,
			size: 1,
		},
	},
});
