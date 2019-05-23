# Cytomine front-end

When using our software, we kindly ask you to cite our website URL and related publications in all your work (publications, studies, oral presentations,...). In particular, we recommend to cite (Marée et al., Bioinformatics 2016) paper, and to use our logo when appropriate. See our license files for additional details.

- URL: http://www.cytomine.org/
- Logo: [Available here](https://cytomine.be/sites/default/files/inline-images/logo-300-org.png)
- Scientific paper: Raphaël Marée, Loïc Rollus, Benjamin Stévens, Renaud Hoyoux, Gilles Louppe, Rémy Vandaele, Jean-Michel Begon, Philipp Kainz, Pierre Geurts and Louis Wehenkel. Collaborative analysis of multi-gigapixel imaging data using Cytomine, Bioinformatics, DOI: 10.1093/bioinformatics/btw013, 2016. http://dx.doi.org/10.1093/bioinformatics/btw013

## Presentation
Front-end for Cytomine in VueJS. For more information about Cytomine, go to https://www.cytomine.org.

## Installation
This section assumes that you have access to an instance of Cytomine. The following steps will allow you to run locally a front-end interacting with this instance:

* Execute `npm install` to install the dependencies ;
* Change the value of constants `CYTOMINE_CORE_HOST` and `CYTOMINE_UPLOAD_HOST` in src/utils/constants.js ; you may also update other constants according to your Cytomine instance or your preferences;
* Execute `npm run serve` to start a web server serving the front end (by default on `localhost:8080`).

### Remarks:

* If the front-end is not expected to run on the same host/port as the core, NGINX should be configured to allow CORS addressed to the core
