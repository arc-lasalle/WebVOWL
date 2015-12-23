module.exports = function () {

	var container_selector = "#graph";


	var app = {},
		graph = webvowl.graph(),
		options = graph.graphOptions(),
		languageTools = webvowl.util.languageTools(),
	// Modules for the webvowl app
		ontologyMenu,
		exportMenu,
		gravityMenu,
		filterMenu,
		modeMenu,
		resetMenu,
		pauseMenu,
		sidebar = require("./sidebar")(graph),
		setupableMenues,
	// Graph modules
		statistics = webvowl.modules.statistics(),
		focuser = webvowl.modules.focuser(),
		selectionDetailDisplayer = webvowl.modules.selectionDetailsDisplayer(sidebar.updateSelectionInformation),
		datatypeFilter = webvowl.modules.datatypeFilter(),
		subclassFilter = webvowl.modules.subclassFilter(),
		disjointFilter = webvowl.modules.disjointFilter(),
		nodeDegreeFilter = webvowl.modules.nodeDegreeFilter(),
		setOperatorFilter = webvowl.modules.setOperatorFilter(),
		nodeScalingSwitch = webvowl.modules.nodeScalingSwitch(graph),
		compactNotationSwitch = webvowl.modules.compactNotationSwitch(graph),
		pickAndPin = webvowl.modules.pickAndPin();

	app.initialize = function () {
		options.graphContainerSelector( container_selector );
		options.selectionModules().push( focuser );
		options.selectionModules().push(selectionDetailDisplayer);
		options.selectionModules().push( pickAndPin );
		options.filterModules().push(statistics);
		options.filterModules().push(datatypeFilter);
		options.filterModules().push(subclassFilter);
		options.filterModules().push(disjointFilter);
		options.filterModules().push(setOperatorFilter);
		options.filterModules().push(nodeScalingSwitch);
		options.filterModules().push(nodeDegreeFilter);
		options.filterModules().push(compactNotationSwitch);

		exportMenu = require("./menu/exportMenu")(options.graphContainerSelector());
		gravityMenu = require("./menu/gravityMenu")(graph);
		filterMenu = require("./menu/filterMenu")(graph, datatypeFilter, subclassFilter, disjointFilter, setOperatorFilter, nodeDegreeFilter);
		modeMenu = require("./menu/modeMenu")(graph, pickAndPin, nodeScalingSwitch, compactNotationSwitch);
		pauseMenu = require("./menu/pauseMenu")(graph);
		resetMenu = require("./menu/resetMenu")(graph, [gravityMenu, filterMenu, modeMenu,
			focuser, selectionDetailDisplayer, pauseMenu]);
		//ontologyMenu = require("./menu/ontologyMenu")(loadOntologyFromText);

		//d3.select(window).on("resize", adjustSize);

		// setup all bottom bar modules
		setupableMenues = [exportMenu, gravityMenu, filterMenu, modeMenu, resetMenu, pauseMenu, sidebar];
		setupableMenues.forEach(function (menu) {
			menu.setup();
		});

		pickAndPin.enabled(true);


		graph.start();
		adjustSize();

		// TODO Repner da error de t.pinned is not a function si quitamos el loadOntFromUrl
		//loadOntFromUrl();



	};

	app.loadVowlFile = function ( jsonText ) {
		loadOntologyFromText( jsonText, "test" );
	}

	app.focus = function ( element ) {
		focuser.handle( element );
	}

	app.setClickPositionFunction = function ( callback ) {
		sidebar.setNodeClickedCallback( callback );
	}

	app.move = function ( x, y ) {
		graph.move( x, y );
	}


	function loadOntFromUrl() {
		// slice the "#" character
		var hashParameter = location.hash.slice(1);
		var urlKey = "url=";
		var jsonUrl;

		if (
				hashParameter.substr(0, urlKey.length) != urlKey ||
				(jsonUrl = decodeURIComponent(hashParameter.slice(urlKey.length))) == ""
		) {
			console.log("JSON url not defined.");
			jsonUrl = "http://localhost/mapon/upload/foaf.json";
			//return;
		}

		$.ajax({
			async: false,
			type: "GET",
			url: jsonUrl,
			success: function( data ) {
				loadOntologyFromText( JSON.stringify(data), "test" );
			}
		});
	}

	function loadOntologyFromText(jsonText, filename, alternativeFilename) {
		pauseMenu.reset();

		var data;
		if (jsonText) {
			data = JSON.parse(jsonText);

			if (!filename) {
				// First look if an ontology title exists, otherwise take the alternative filename
				var ontologyNames = data.header ? data.header.title : undefined;
				var ontologyName = languageTools.textInLanguage(ontologyNames);

				if (ontologyName) {
					filename = ontologyName;
				} else {
					filename = alternativeFilename;
				}
			}
		}

		exportMenu.setJsonText(jsonText);

		options.data(data);
		graph.reload();
		sidebar.updateOntologyInformation(data, statistics);

		exportMenu.setFilename(filename);
	}

	function adjustSize() {

		var graphContainer = d3.select( container_selector ),
			svg = graphContainer.select("svg");

		graphContainer.style("height", "100%");
		svg.attr("width", "100%")
		   .attr("height", "100%");
		graph.updateStyle();

		/*
		var height = window.innerHeight - 40,
			width = window.innerWidth - (window.innerWidth * 0.22);

		graphContainer.style("height", height + "px");
		svg.attr("width", width)
			.attr("height", height);

		options.width(width)
			.height(height);
		graph.updateStyle();*/
	}

	return app;
};
