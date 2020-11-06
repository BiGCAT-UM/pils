# Day 2

## Practical

Today, you should work on:

1. Match Wikidata content to the scientific question. Check out the [example 4](https://github.com/egonw/pils/blob/master/example4.html)
2. List the Wikidata properties you need for your SPARQL
3. Update the Wikidata HTML example to run a query related to your research question

## Using the Wikidata JavaScript code for other SPARQL endpoints

Wikidata is one of many SPARQL end points. An actively maintained list can be found at [YummyData](https://yummydata.org/endpoint).

But the same JavaScript library can be used as for the Wikidata. The code then looks like this:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <title>WikiPathways Example</title>
  <!-- Initialize a global WBK function -->
  <script src="https://cdn.rawgit.com/maxlath/wikidata-sdk/dist/dist/wikibase-sdk.min.js"></script>
  <script>
    const wbk = new WBK({
      instance: 'http://sparql.wikipathways.org/',
      sparqlEndpoint: 'http://sparql.wikipathways.org/sparql'
    });
  </script>
</head>

<body>
  <pre id="output"></pre>
  <script>
    query = "SELECT ?pathway WHERE { ?pathway a wp:Pathway }";
    fetch(
      wbk.sparqlQuery(query)
    ).then( response => response.json()
    ).then( wdk.simplify.sparqlResults
    ).then(
      function (response) {
        document.getElementById('output').innerHTML =
          JSON.stringify(response, undefined, 2);
      }
    )
  </script>
</body>
</html>
```
