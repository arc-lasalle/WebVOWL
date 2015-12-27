module.exports = function () {

	var app = {},
		graph = webvowl.graph(),
		options = graph.graphOptions(),
		languageTools = webvowl.util.languageTools(),
		graphSelector = "#graph",
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
		colorExternalsSwitch = webvowl.modules.colorExternalsSwitch(graph),
		compactNotationSwitch = webvowl.modules.compactNotationSwitch(graph),
		datatypeFilter = webvowl.modules.datatypeFilter(),
		disjointFilter = webvowl.modules.disjointFilter(),
		focuser = webvowl.modules.focuser(),
		nodeDegreeFilter = webvowl.modules.nodeDegreeFilter(),
		nodeScalingSwitch = webvowl.modules.nodeScalingSwitch(graph),
		pickAndPin = webvowl.modules.pickAndPin(),
		selectionDetailDisplayer = webvowl.modules.selectionDetailsDisplayer(sidebar.updateSelectionInformation),
		statistics = webvowl.modules.statistics(),
		setOperatorFilter = webvowl.modules.setOperatorFilter(),
		subclassFilter = webvowl.modules.subclassFilter();

	app.initialize = function () {
		options.graphContainerSelector(graphSelector);
		options.selectionModules().push(focuser);
		options.selectionModules().push(selectionDetailDisplayer);
		options.selectionModules().push(pickAndPin);
		options.filterModules().push(statistics);
		options.filterModules().push(datatypeFilter);
		options.filterModules().push(subclassFilter);
		options.filterModules().push(disjointFilter);
		options.filterModules().push(setOperatorFilter);
		options.filterModules().push(nodeScalingSwitch);
		options.filterModules().push(nodeDegreeFilter);
		options.filterModules().push(compactNotationSwitch);
		options.filterModules().push(colorExternalsSwitch);

		exportMenu = require("./menu/exportMenu")(options.graphContainerSelector());
		gravityMenu = require("./menu/gravityMenu")(graph);
		filterMenu = require("./menu/filterMenu")(graph, datatypeFilter, subclassFilter, disjointFilter, setOperatorFilter, nodeDegreeFilter);
		modeMenu = require("./menu/modeMenu")(graph, pickAndPin, nodeScalingSwitch, compactNotationSwitch, colorExternalsSwitch);
		pauseMenu = require("./menu/pauseMenu")(graph);
		resetMenu = require("./menu/resetMenu")(graph, [gravityMenu, filterMenu, modeMenu,
			focuser, selectionDetailDisplayer, pauseMenu]);
		ontologyMenu = require("./menu/ontologyMenu")(loadOntologyFromText);

		d3.select(window).on("resize", adjustSize);

		// setup all bottom bar modules
		setupableMenues = [exportMenu, gravityMenu, filterMenu, modeMenu, resetMenu, pauseMenu, sidebar, ontologyMenu];
		setupableMenues.forEach(function (menu) {
			menu.setup();
		});

		graph.start();
		adjustSize();
	};

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
		var graphContainer = d3.select(graphSelector),
			svg = graphContainer.select("svg"),
			height = window.innerHeight - 40,
			width = window.innerWidth - (window.innerWidth * 0.22);

		graphContainer.style("height", height + "px");
		svg.attr("width", width)
			.attr("height", height);

		options.width(width)
			.height(height);
		graph.updateStyle();
	}

	return app;
};
