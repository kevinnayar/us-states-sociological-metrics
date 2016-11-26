const express = require('express');
const path = require('path');
const request = require('request');
const _ = require('underscore');
const fs = require('fs');
const less = require('less');

const app = express();
app.use('/public', express.static('public'));


const config = {
	education: {
		url: 'http://localhost:3000/public/data/data_education.json',
		source: 'https://en.wikipedia.org/wiki/List_of_U.S._states_by_educational_attainment'
	},
	peace: {
		url: 'http://localhost:3000/public/data/data_peace.json',
		source: 'http://www.visionofhumanity.org/#/page/indexes/us-peace-index'
	},
	poverty: {
		url: 'http://localhost:3000/public/data/data_poverty.json',
		source: 'https://en.wikipedia.org/wiki/List_of_U.S._states_by_poverty_rate'
	},
	religion: {
		url: 'http://localhost:3000/public/data/data_religion.json',
		source: 'http://www.pewresearch.org/fact-tank/2016/02/29/how-religious-is-your-state/'
	}
};


app.get('/old-data', (req, res) => {
	let data = {};

	// education
	request.get({
		uri: config.education.url
	}, (error, response, body) => {
		if (error) return console.log('Error:', error);
		let education = JSON.parse(body);
		
		// peace
		request.get({
			uri: config.peace.url
		}, (error, response, body) => {
			if (error) return console.log('Error:', error);
			let peace = JSON.parse(body);

			peace.data.forEach((d) => {
				d.percent_peace_index = parseFloat( ((5 - d.score_peace_index) * 20).toFixed(2) );
				delete d.score_peace_index;
			});

			// poverty
			request.get({
				uri: config.poverty.url
			}, (error, response, body) => {
				if (error) return console.log('Error:', error);
				let poverty = JSON.parse(body);

				poverty.data.forEach((d) => {
					d.percent_above_poverty_rate = 100 - d.percent_poverty_rate;
					delete d.percent_poverty_rate;
				});

				// religion
				request.get({
					uri: config.religion.url
				}, (error, response, body) => {
					if (error) return console.log('Error:', error);
					let religion = JSON.parse(body);

					religion.data.forEach((d) => {
						d.percent_non_religious = 100 - d.percent_religious;
						delete d.percent_religious;
					});

					data.education = education.data;
					data.peace = peace.data;
					data.poverty = poverty.data;
					data.religion = religion.data;

					res.send(data);
				});
			});
		});
	});
});


app.get('/new-data', (req, res) => {
	request.get({
		url: 'http://localhost:3000/old-data'
	}, (error, response, body) => {
		if (error) return console.log('Error:', error);
		let output = {};
		const data = JSON.parse(body);

		const mergedEducationPeace = _.map(data.education, (item) => {
			return _.extend(item, _.findWhere(data.peace, { state: item.state }));
		});

		const mergedEducationPeacePoverty = _.map(mergedEducationPeace, (item) => {
			return _.extend(item, _.findWhere(data.poverty, { state: item.state }));
		});

		const mergedEducationPeacePovertyReligion = _.map(mergedEducationPeacePoverty, (item) => {
			return _.extend(item, _.findWhere(data.religion, { state: item.state }));
		});

		output.data = mergedEducationPeacePovertyReligion;
		output.sources = config;

		[
			output.sources.education, 
			output.sources.peace, 
			output.sources.poverty, 
			output.sources.religion
		].forEach((item) => {
			delete item.url;
		});

		res.send(output);
	});
});


app.get('/', (req, res) => {
	var fileInput = 'public/css/style.less';
	var fileOutput = 'public/css/style.css';

	less.render(fs.readFileSync(fileInput).toString(), {
	  compress: true
	}).then(function(output) {
	  fs.writeFile(fileOutput, output.css);
	});

	res.sendFile(__dirname + '/index.html');
});


app.listen(3000);
console.log('Express server started on port 3000');