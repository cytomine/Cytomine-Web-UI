module.exports = {
  configureWebpack: {
    resolve: {
      alias: {
        // alias defined because we fetch cytomine-client from a private
        // package repository but want to keep the same import lines as 
        // in the Community Editon frontend:
        // import {Component} from 'cytomine-client';
        // instead of 
        // import {Component} from '@cm/cytomine-client';
        'cytomine-client': '@cm/cytomine-client'
      }
    }
  }
}