# milestone-project-02
Milestone Project 02 Data Visualisation

# Description
This is my second project created in Code Institute Diploma in Full Stack Development. This is reponsive data dashboard displaying data for the Six Natiuons rugby championship for the past 5 seasons. You can select either a season or a team to display the relevant data on screen.
Data for this project i used from the Rugby Six Nations official website (https://www.sixnationsrugby.com) The full database was downloaded as csv file.

## Live Demo
:globe_with_meridians: Click here to check my Macdonald's Dashboard [https://ignas-dashboard.herokuapp.com/](https://ignas-dashboard.herokuapp.com/)

### Framework
Python Flask is used as the framework for this app. Within the static directory, a sub-directory lib contains both a css and js directory. This contains the 3rd party css and js files.

### HTML
The 3rd party css/js is linked within index.html in addition to the graph.js file which creates the graphs and a custom css file for dashboard styling. The links to the static files are written in Jinja as this is a Flask framework. Bootstrap is used for changing the horizontal placing of graphs to vertical on small screen sizes.

### JavaScript
*D3.js renders charts in svg which are then passed into the html divs
*DC.js is used as a wrapper for D3 charts
*Crossfilter.js is what allows the charts to be modified live by drilling down into the dataset.
*queue.js is an asynchronous helper library to ensure data is available from the api before it is processed.
*keen.js is a dashboard template library.
*Bootstrap.js is used in conjunction with keen.js to layout the dashboard
*The graph.js file was created to take the data from macdonals.py, filter it with crossfilter, then chart it with a combination of D3 and DS.
*Crossfilter is used to create dimensions that allow selection of data across charts enabling real time drill down of data.
*intro.js file is used to attach popup boxes to the graphs to provide more detail information.

### CSS3
Custom css file is used to style the navbar, button, div layout and the colour palette, responsive rotating charts depending on screen size. 
A 3rd party introjs.css styles the popup boxes for the charts. DC.css styles the charts and keen-dashboard the dashboard layouts.

> <img src="https://github.com/ignasgri/mcdonalds-d3/blob/master/static/img/GIF.gif" width="300">

### Tests
Tested on different devices and screen sizes.

### Hosting
Heroku is used to host this app. The requirements.txt contains all the packages required to run the app. Procfiles tell Heroku how to run the app. The app was deployed to Heroku over git. The server used for hosting is mLab MongoDB.

