
Day 1
=====

On day one, the practical starts with a short introduction to the course and includes later
in the day a 2 hour lecture introducing you the theory of scientific programming.
Slides will be available from StudentPortal. This lecture covers the core language of algorithmics and programming.


Practical
---------

You will do today:
1. Create a GitHub Account. See [this book](https://jwiegley.github.io/git-from-the-bottom-up/) for a brief explanation on the advantages of using Git
1. Determine the gaps in your knowledge and skills
1. Go through some of the examples on the [Wikidata SPARQL Endpoint](https://query.wikidata.org/)
1. Form teams of 2/3 people and discuss a scientific question
1. Set up a team repository
1. Learn how to edit (see [this course](https://www.codecademy.com/learn/learn-html)), validate ([W3 validator](https://validator.w3.org/)), and view HTML pages
1. Learn how to use the browser console

Additional topics which can be covered:
1. Learn how use JavaScript in HTML pages and run these in your browser

Example
-------

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <title>Example</title>
  <!-- Initialize a global WBK function -->
  <script src="https://cdn.rawgit.com/maxlath/wikidata-sdk/dist/dist/wikibase-sdk.min.js"></script>
  <!-- Initialize a global wdk object using the WBK object -->
  <script src="https://cdn.rawgit.com/maxlath/wikidata-sdk/dist/dist/wikidata-sdk.min.js"></script>
</head>

<body>
  <pre id="output"></pre>
  <script>
    query = "SELECT ?compound ?cas WHERE { ?compound wdt:P231 ?cas } LIMIT 10"
    const url = wdk.sparqlQuery(query)
    async function main () {
      const response = await fetch(url)
      const results = await response.json()
      const simpleResults = wdk.simplify.sparqlResults(results)
      document.getElementById('output').innerHTML =
        JSON.stringify(simpleResults, undefined, 2);
    }
    main()
  </script>
</body>
</html>
```
