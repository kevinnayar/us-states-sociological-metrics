
/* ------------- Doc Ready ------------- */
$(document).ready(function() {
  app.init();
});


/* ------------- App ------------- */
var app = {
	init: function() {
		app.generateChart();
		app.updateLinks();
  },

	generateChart:() => {
		$.ajax({ url: '/public/data/data.json' }).done((data) => {
			let config = {
				state: [],
				data_education: ['Educational Attainment'],
				data_peace: ['Peace Index'],
				data_poverty: ['Above Poverty Rate'],
				data_religion: ['Non Religious'],
				colors: ['#D45254', '#D2D259', '#60D352', '#507CD3']
			};
			const typeTrigger = $('#chart-type-selector ul li a');
			const sortTrigger = $('#chart-sort-selector ul li a');

			typeTrigger.parent().parent().find(':first').find('a').addClass('active');
			sortTrigger.parent().parent().find(':first').find('a').addClass('active');

			data.data.sort((a, b) => {
				if (a.state < b.state) return -1;
				if (a.state > b.state) return 1;
				return 0;
			});

			data.data.forEach((d) => {
				config.state.push(d.state);
				config.data_education.push(d.percent_educational_attainment);
				config.data_peace.push(d.percent_peace_index);
				config.data_poverty.push(d.percent_above_poverty_rate);
				config.data_religion.push(d.percent_non_religious);
			});

			let chart = app.updatChartConfigs(config);
			chart.transform('scatter');

			setTimeout(function () {
				chart.transform('spline', 'Educational Attainment');
			}, 500);

			setTimeout(function () {
				chart.transform('spline', 'Peace Index');
			}, 1000);

			setTimeout(function () {
				chart.transform('spline', 'Above Poverty Rate');
			}, 1500);

			setTimeout(function () {
				chart.transform('spline', 'Non Religious');
			}, 2000);

			setTimeout(function () {
				chart.transform('area-spline');
			}, 2500);

			function toggle(id) {
				chart.toggle(id);
			};

			d3.select('#content').insert('div', '#chart').attr('id', 'chart-legend').selectAll('span')
				.data(['Educational Attainment', 'Peace Index', 'Above Poverty Rate', 'Non Religious'])
					.enter().append('span')
				.attr('data-id', function (id) { return id; })
					.html(function (id) { return id; })
					.each(function (id) {
						d3.select(this).style('background-color', chart.color(id));
					})
					.on('mouseover', function (id) {
						chart.focus(id);
					})
					.on('mouseout', function (id) {
						chart.revert();
					})
					.on('click', function (id) {
						chart.toggle(id);
					});


			typeTrigger.click(function(evt) {
				evt.preventDefault();

				typeTrigger.removeClass('active');
				$(this).addClass('active');

				let activeSortTrigger = $('#chart-sort-selector ul li a.active');
				activeSortTrigger.trigger('click');
			});

			sortTrigger.click(function(evt) {
				evt.preventDefault();

				sortTrigger.removeClass('active');
				$(this).addClass('active');

				let chartSort = $(this).data('chart-sort');
				let chartType = $('#chart-type-selector ul li a.active').data('chart-type');
	
				data.data.sort((a, b) => {
					if (a[chartSort] < b[chartSort]) return -1;
					if (a[chartSort] > b[chartSort]) return 1;
					return 0;
				});
				
				config.state.length = 0;
				config.data_education = ['Educational Attainment'];
				config.data_peace = ['Peace Index'];
				config.data_poverty = ['Above Poverty Rate'];
				config.data_religion = ['Non Religious'];

				data.data.forEach((d) => {
					config.state.push(d.state);
					config.data_education.push(d.percent_educational_attainment);
					config.data_peace.push(d.percent_peace_index);
					config.data_poverty.push(d.percent_above_poverty_rate);
					config.data_religion.push(d.percent_non_religious);
				});

				chart = app.updatChartConfigs(config);
				chart.transform(chartType);
			});
		});
	},

	updatChartConfigs:(config) => {
		return c3.generate({
			bindto: '#chart',
			data: {
				columns: [
					config.data_education,
					config.data_peace,
					config.data_poverty,
					config.data_religion
				]
			},
			legend: {
				show: false
			},
			axis: {
				x: {
					type: 'category',
					tick: {
						rotate: 90,
						fit: true,
						count: 50,
						multiline: false
					},
					categories: config.state
				}
			},
			grid: {
				y: {
					show: true
				}
			},
			color: {
				pattern: config.colors
			}
		});
	},

	updateLinks:() => {
		$('a.outbound-link').attr('target', '_blank');
	}
};