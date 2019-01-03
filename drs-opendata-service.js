(function() {

  'use strict';

  /* eslint-disable angular/no-service-method */

  // Module definition, note the dependency.
  angular.module('facetApp', ['seco.facetedSearch'])

  /*
  * DRS Open Data service
  * Handles SPARQL queries and defines facet configurations.
  */
  .service('drsOpendataService', drsOpendataService);

  /* @ngInject */
  function drsOpendataService(FacetResultHandler) {

    /* Public API */

    // Get the results from DRS Open Data based on the facet selections.
    this.getResults = getResults;
    // Get the facet definitions.
    this.getFacets = getFacets;
    // Get the facet options.
    this.getFacetOptions = getFacetOptions;

    /* Implementation */

    // Facet definitions
    // 'facetId' is a "friendly" identifier for the facet,
    //  and should be unique within the set of facets.
    // 'predicate' is the property that defines the facet (can also be
    //  a property path, for example).
    // 'name' is the title of the facet to show to the user.
    // If 'enabled' is not true, the facet will be disabled by default.
    var facets = {
      // Checkbox facet
      opendatapage: {
        facetId: 'opendatapage',
        choices: [
          {
            id: 'yes',
            pattern: '?id <http://ldf.fi/schema/drs/opendata/openDataPage> [] . ',
            label: 'Yes'
          },
          {
            id: 'no',
            pattern: 'FILTER NOT EXISTS {?id <http://ldf.fi/schema/drs/opendata/openDataPage> [] } ',
            label: 'No'
          }
        ],
        chart: true,
        enabled: true,
        name: 'Open data page'
      },
      // Hierarchical facet
      subject: {
        facetId: 'subject',
        predicate: '<http://purl.org/dc/terms/subject>',
        hierarchy: '<http://www.w3.org/2004/02/skos/core#broader>',
        enabled: true,
        chart: true,
        name: 'Subject'
      },
      // Checkbox facet
      fileformat: {
        facetId: 'fileformat',
        choices: [
          {
            id: '7z',
            pattern: '?id <http://ldf.fi/schema/drs/opendata/availableFileFormat> <http://ldf.fi/drs/opendata/fileformat/7Z> . ',
            label: '7Z'
          },
          {
            id: 'csv',
            pattern: '?id <http://ldf.fi/schema/drs/opendata/availableFileFormat> <http://ldf.fi/drs/opendata/fileformat/CSV> . ',
            label: 'CSV'
          },
          {
            id: 'json',
            pattern: '?id <http://ldf.fi/schema/drs/opendata/availableFileFormat> <http://ldf.fi/drs/opendata/fileformat/JSON> . ',
            label: 'JSON'
          },
          {
            id: 'jsons',
            pattern: '?id <http://ldf.fi/schema/drs/opendata/availableFileFormat> <http://ldf.fi/drs/opendata/fileformat/JSONS> . ',
            label: 'JSONS'
          },
          {
            id: 'pdf',
            pattern: '?id <http://ldf.fi/schema/drs/opendata/availableFileFormat> <http://ldf.fi/drs/opendata/fileformat/PDF> . ',
            label: 'PDF'
          },
          {
            id: 'rdfa',
            pattern: '?id <http://ldf.fi/schema/drs/opendata/availableFileFormat> <http://ldf.fi/drs/opendata/fileformat/RDFA> . ',
            label: 'RDFA'
          },
          {
            id: 'ttl',
            pattern: '?id <http://ldf.fi/schema/drs/opendata/availableFileFormat> <http://ldf.fi/drs/opendata/fileformat/TTL> . ',
            label: 'TTL'
          },
          {
            id: 'xls',
            pattern: '?id <http://ldf.fi/schema/drs/opendata/availableFileFormat> <http://ldf.fi/drs/opendata/fileformat/XLS> . ',
            label: 'XLS'
          },
          {
            id: 'xlsx',
            pattern: '?id <http://ldf.fi/schema/drs/opendata/availableFileFormat> <http://ldf.fi/drs/opendata/fileformat/XLSX> . ',
            label: 'XLSX'
          },
          {
            id: 'xml',
            pattern: '?id <http://ldf.fi/schema/drs/opendata/availableFileFormat> <http://ldf.fi/drs/opendata/fileformat/XML> . ',
            label: 'XML'
          },
          {
            id: 'xsd',
            pattern: '?id <http://ldf.fi/schema/drs/opendata/availableFileFormat> <http://ldf.fi/drs/opendata/fileformat/XSD> . ',
            label: 'XSD'
          },
          {
            id: 'zip',
            pattern: '?id <http://ldf.fi/schema/drs/opendata/availableFileFormat> <http://ldf.fi/drs/opendata/fileformat/ZIP> . ',
            label: 'ZIP'
          }
        ],
        chart: true,
        enabled: true,
        name: 'File format'
      },
      // Hierarchical facet
      organisation: {
        facetId: 'organisation',
        predicate: '<http://www.w3.org/2004/02/skos/core#prefLabel>/^<http://www.w3.org/2004/02/skos/core#prefLabel>', // hack for making a facet of the searched items
        hierarchy: '<http://purl.org/dc/terms/isPartOf>',
        enabled: true,
        name: 'Organisation'
      },
      // Checkbox facet
      type: {
        facetId: 'type',
        choices: [
          {
            id: 'Agencies_and_Services',
            pattern: '?id a <http://ldf.fi/schema/drs/opendata/Agencies_and_Services> . ',
            label: 'Agency or service'
          },
          {
            id: 'Federal_Agencies_and_Services',
            pattern: '?id a <http://ldf.fi/schema/drs/opendata/Federal_Agencies_and_Services> . ',
            label: 'Federal agency or service'
          },
          {
            id: 'Funds',
            pattern: '?id a <http://ldf.fi/schema/drs/opendata/Funds> . ',
            label: 'Fund'
          },
          {
            id: 'Ministries',
            pattern: '?id a <http://ldf.fi/schema/drs/opendata/Ministries> . ',
            label: 'Ministry'
          }
        ],
        chart: true,
        enabled: true,
        name: 'Organisation type'
      },
      // Checkbox facet
      numberofdatasets: {
        facetId: 'numberofdatasets',
        choices: [
          {
            id: 'lessthan11',
            pattern: '?id <http://ldf.fi/schema/drs/opendata/openDataPage>/<http://ldf.fi/schema/drs/opendata/availableNumberOfDatasets> ?number . FILTER(?number < 11) ',
            label: '< 11'
          },
          {
            id: '11to20',
            pattern: '?id <http://ldf.fi/schema/drs/opendata/openDataPage>/<http://ldf.fi/schema/drs/opendata/availableNumberOfDatasets> ?number . FILTER(?number >= 11 && ?number < 20) ',
            label: '11–20'
          },
          {
            id: '21to30',
            pattern: '?id <http://ldf.fi/schema/drs/opendata/openDataPage>/<http://ldf.fi/schema/drs/opendata/availableNumberOfDatasets> ?number . FILTER(?number >= 21 && ?number < 30) ',
            label: '21–30'
          },
          {
            id: '31to40',
            pattern: '?id <http://ldf.fi/schema/drs/opendata/openDataPage>/<http://ldf.fi/schema/drs/opendata/availableNumberOfDatasets> ?number . FILTER(?number >= 31 && ?number < 40) ',
            label: '31–40'
          },
          {
            id: '41to50',
            pattern: '?id <http://ldf.fi/schema/drs/opendata/openDataPage>/<http://ldf.fi/schema/drs/opendata/availableNumberOfDatasets> ?number . FILTER(?number >= 41 && ?number < 50) ',
            label: '41–50'
          },
          {
            id: '51to60',
            pattern: '?id <http://ldf.fi/schema/drs/opendata/openDataPage>/<http://ldf.fi/schema/drs/opendata/availableNumberOfDatasets> ?number . FILTER(?number >= 51 && ?number < 60) ',
            label: '51–60'
          },
          {
            id: '61to70',
            pattern: '?id <http://ldf.fi/schema/drs/opendata/openDataPage>/<http://ldf.fi/schema/drs/opendata/availableNumberOfDatasets> ?number . FILTER(?number >= 61 && ?number < 70) ',
            label: '61–70'
          },
          {
            id: '71to80',
            pattern: '?id <http://ldf.fi/schema/drs/opendata/openDataPage>/<http://ldf.fi/schema/drs/opendata/availableNumberOfDatasets> ?number . FILTER(?number >= 71 && ?number < 80) ',
            label: '71–80'
          },
          {
            id: '81to90',
            pattern: '?id <http://ldf.fi/schema/drs/opendata/openDataPage>/<http://ldf.fi/schema/drs/opendata/availableNumberOfDatasets> ?number . FILTER(?number >= 81 && ?number < 90) ',
            label: '81–90'
          },
          {
            id: 'morethan90',
            pattern: '?id <http://ldf.fi/schema/drs/opendata/openDataPage>/<http://ldf.fi/schema/drs/opendata/availableNumberOfDatasets> ?number . FILTER(?number > 90) ',
            label: '90 <'
          },
        ],
        chart: true,
        enabled: true,
        name: 'Number of datasets'
      }
      // Text search facet for organisation names
      /*name: {
      facetId: 'name',
      predicate:'<http://www.w3.org/2004/02/skos/core#prefLabel>',
      enabled: true,
      name: 'Name'
      },*/
    // Basic facets
  };

  var endpointUrl = '//ldf.fi/drs-govopendata/sparql';
  // use the ontology in local Fuseki for development
  //var endpointUrl = 'http://localhost:3030/ds/sparql';

  // We are building a faceted search for organisations.
  //var rdfClass = '<http://ldf.fi/schema/drs/opendata/Federal_institutions>';

  // The facet configuration also accept a 'constraint' option.
  // The value should be a valid SPARQL pattern.
  // One could restrict the results further, e.g., to writers in the
  // science fiction genre by using the 'constraint' option:
  //
  // var constraint = '?id <http://dbpedia.org/ontology/genre> <http://dbpedia.org/resource/Science_fiction> .';
  //
  // Note that the variable representing a result in the constraint should be "?id".
  //
  // 'rdfClass' is just a shorthand constraint for '?id a <rdfClass> .'
  // Both rdfClass and constraint are optional, but you should define at least
  // one of them, or you might get bad results when there are no facet selections.
  var facetOptions = {
    endpointUrl: endpointUrl, // required
    //rdfClass: rdfClass, // optional, not used as the organizations do not share an upper class explicitly
    usePost: true, // use POST so that facets with long queries don't break other facets
    constraint: '?id a/rdfs:subClassOf* <http://ldf.fi/schema/drs/opendata/Federal_institutions>', // optional
    preferredLang : 'en' // required
  };

  var prefixes =
  ' PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>' +
  ' PREFIX skos: <http://www.w3.org/2004/02/skos/core#>' +
  ' PREFIX dct: <http://purl.org/dc/terms/>' +
  ' PREFIX drs-schema: <http://ldf.fi/schema/drs/opendata/>' +
  ' PREFIX foaf: <http://xmlns.com/foaf/0.1/>';

  // This is the result query, with <RESULT_SET> as a placeholder for
  // the result set subquery that is formed from the facet selections.
  // The variable names used in the query will be the property names of
  // the reusulting mapped objects.
  // Note that ?id is the variable used for the result resource here,
  // as in the constraint option.
  // Variable names with a '__' (double underscore) in them will results in
  // an object. I.e. here ?subject__id and ?subject__label will be
  // combined into an object:
  // org.subject = { id: '[subject id]', label: '[subject label]' }
  var queryTemplate =
  ' SELECT * WHERE {' +
  '  <RESULT_SET> ' +
  '  OPTIONAL { ' +
  '   ?id skos:prefLabel ?name_en . ' +
  '   FILTER(langMatches(lang(?name_en), "en")) ' +
  '  }' +
  '  OPTIONAL { ' +
  '   ?id skos:prefLabel ?name_ru . ' +
  '   FILTER(langMatches(lang(?name_ru), "ru")) ' +
  '  }' +
  '  OPTIONAL { ' +
  '   ?id skos:altLabel ?altName . ' +
  '  }' +
  '  OPTIONAL { ' +
  '   ?id drs-schema:openDataPage ?openDataPage . ' +
  '   ?openDataPage drs-schema:dateOfReference ?openDataPageReferenceDateTime . ' +
  '   BIND (strbefore(str(?openDataPageReferenceDateTime), "T") AS ?openDataPageReferenceDate) ' +
  '   ?openDataPage drs-schema:availableNumberOfDatasets ?numberOfAvailableDatasets . ' +
  '  }' +
  '  OPTIONAL { ' +
  '   ?id drs-schema:mboxForOpenData ?mboxForOpenData . ' +
  '  }' +
  '  OPTIONAL { ' +
  '   ?id dct:subject ?subject__id . ' +
  '   ?subject__id skos:prefLabel ?subject__label . ' +
  '  }' +
  '  OPTIONAL { ' +
  '   ?id drs-schema:availableFileFormat/skos:prefLabel ?fileFormat . ' +
  '  }' +
  '  OPTIONAL { ' +
  '   ?id foaf:homepage ?homepage . ' +
  '   ?homepage drs-schema:dateOfReference ?homepageReferenceDateTime . ' +
  '   BIND (strbefore(str(?homepageReferenceDateTime), "T") AS ?homepageReferenceDate) ' +
  '  }' +
  '  OPTIONAL { ' +
  '   ?id drs-schema:mboxForGeneralQuestions ?mboxForGeneralQuestions . ' +
  '  }' +
  '  OPTIONAL { ' +
  '   ?id drs-schema:pageForRequests ?pageForRequests . ' +
  '   ?pageForRequests drs-schema:dateOfReference ?pageForRequestsReferenceDateTime . ' +
  '   BIND (strbefore(str(?pageForRequestsReferenceDateTime), "T") AS ?pageForRequestsReferenceDate) ' +
  '  }' +
  '  OPTIONAL { ' +
  '   ?id drs-schema:data.gov.ruPage ?pageOnOpenDataPortal . ' +
  '   ?pageOnOpenDataPortal drs-schema:dateOfReference ?pageOnOpenDataPortalReferenceDateTime . ' +
  '   BIND (strbefore(str(?pageOnOpenDataPortalReferenceDateTime), "T") AS ?pageOnOpenDataPortalReferenceDate) ' +
  '  }' +
  '  OPTIONAL { ' +
  '   ?id dct:isPartOf ?superior_id . ' +
  '   ?superior_id skos:prefLabel ?superior_label . ' +
  '   FILTER(langMatches(lang(?superior_label), "en")) ' +
  '  }' +
  '  OPTIONAL { ' +
  '   ?id dct:hasPart ?subsidiary__id . ' +
  '   ?subsidiary__id skos:prefLabel ?subsidiary__label . ' +
  '   FILTER(langMatches(lang(?subsidiary__label), "en")) ' +
  '  }' +
  '  OPTIONAL { ' +
  '   ?id dct:isPartOf/dct:hasPart ?parallel__id . ' +
  '   ?parallel__id skos:prefLabel ?parallel__label . ' +
  '   FILTER(?id != ?parallel__id) ' +
  '   FILTER(langMatches(lang(?parallel__label), "en")) ' +
  '  }' +
  '  OPTIONAL { ' +
  '   ?id a ?type . ' +
  '   FILTER(?type = drs-schema:Ministries || ?type = drs-schema:Federal_Agencies_and_Services || ?type = drs-schema:Funds ) ' +
  '   ?parallel__id a ?type . ' +
  '   FILTER(?id != ?parallel__id) ' +
  '   ?parallel__id skos:prefLabel ?parallel__label . ' +
  '   FILTER(langMatches(lang(?parallel__label), "en")) ' +
  '  }' +
  ' }';

  var resultOptions = {
    prefixes: prefixes, // required if the queryTemplate uses prefixes
    queryTemplate: queryTemplate, // required
    resultsPerPage: 10, // optional (default is 10)
    pagesPerQuery: 1, // optional (default is 1)
    usePost: false,
    paging: true // optional (default is true), if true, enable paging of the results
  };

  // FacetResultHandler is a service that queries the endpoint with
  // the query and maps the results to objects.
  var resultHandler = new FacetResultHandler(endpointUrl, resultOptions);

  // This function receives the facet selections from the controller
  // and gets the results from DBpedia.
  // Returns a promise.
  function getResults(facetSelections) {
    // If there are variables used in the constraint option (see above),
    // you can also give getResults another parameter that is the sort
    // order of the results (as a valid SPARQL ORDER BY sequence, e.g. "?id").
    // The results are sorted by URI (?id) by default.
    return resultHandler.getResults(facetSelections).then(function(pager) {
      // We'll also query for the total number of results, and load the
      // first page of results.
      return pager.getTotalCount().then(function(count) {
        pager.totalCount = count;
        return pager.getPage(0);
      }).then(function() {
        return pager;
      });
    });
  }

  // Getter for the facet definitions.
  function getFacets() {
    return facets;
  }

  // Getter for the facet options.
  function getFacetOptions() {
    return facetOptions;
  }
}
})();
