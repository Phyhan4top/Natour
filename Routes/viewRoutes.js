const express = require('express');
const Router =express.Router()
const { Overview, tourView } = require('../Controllers/viewsRoutesHandle');


Router.route('/').get(Overview);

Router.route('/tour/:name').get(tourView);

module.exports=Router
