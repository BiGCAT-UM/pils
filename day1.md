
Day 1
=====

On day one the practical starts with a 2 hour lecture introducing you the theory. Slides will be available from StudentPortal.
This lecture covers the core language of algorithmics and programming.

Theory
------



Practical
---------

You will do today:
1. Learn how to edit [https://www.codecademy.com/learn/learn-html], validate [https://validator.w3.org/], and view HTML pages
1. Learn how to use the browser console
1. Create a Github Account
1. Determine the gaps in your knowledge and skills
1. [get an Open PHACTS API account](getaccount.md)
1. Go through some of the examples on the Wikidata SPARQL Endpoint [http://sparql.wikipathways.org/]
1. form teams of 2/3 people and discuss a scientific question

Additional topics which can be covered:
1. Learn how use JavaScript in HTML pages and run these in your browser

Examples
--------

[Example 1](example1.html) is a simple HTML page with a bit of JavaScript
that calls the Open PHACTS API to ask the amount of pharmacological data
available for the compound with the IRI http://www.conceptwiki.org/concept/342a03eb-3311-49ac-8d6e-8bf9b605dab1 .

The HTML itself is pretty minimal, with an empty <div> element to hold
content later added by the JavaScript:

```html
<!DOCTYPE html>
<html>
  <head>
    <title>JSON</title>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  </head>
    
  <body>
    <h3>OpenPHACTS</h3>
    <h4>JSON 1</h4>
    <div class="json" id="json1">Pending...</div>
  </body>
</html>
```

The <head> of the HTML also has to load a few libraries. First, we need the Open PHACTS API
JavaScript client library, which depends on jquery.js, and the latter depends on purl.js:

```html
<script type="text/javascript" src="https://egonw.github.io/pils/lib/purl.js"></script>
<script type="text/javascript" src="https://egonw.github.io/pils/lib/jquery-1.9.1.min.js"></script>
<script type="text/javascript" src="https://egonw.github.io/pils/src/combined.js"></script>
```

Second, since we are going to visualize data at some point anyway, we need to load D3:

```html
<script type="text/javascript" src="https://egonw.github.io/pils/lib/d3.v3.min.js"></script>
```

Then we need to add the code, which we add with a <script> element, but then just after the <div>
element.

```html
<script type="text/javascript">
</script>
```

Because we need to define which Open PHACTS server we want to use, and what API identifier
en secret key gives us access, we first instantiate a client object (inside the <script> element):

```javascript
var sources = new CompoundSearch("https://beta.openphacts.org/2.1", "91f5d4d0", "1af5086da757e57c553bfa1351708d5f");
```

This object does not actually make a search. It just specifies where the search will be made.
The search is done with one of the methods of this client object:

```javascript
sources.compoundPharmacologyCount(
  "http://www.conceptwiki.org/concept/342a03eb-3311-49ac-8d6e-8bf9b605dab1",
  null, null, null, null, null, null, null, null, null, null, null,
  null, null, null, null, null, null, callback
);
```

The method actually has a lot of parameters, all but two set to null. The only two parameters set
are the first and last parameters. The first parameters, for the .compoundPharmacologyCount method
is the compound we mentioned earlier. The last method is the callback function (not defined yet).
This function is called as soon as, but not before(!), the Open PHACTS server returned results. That is,
that is at some future point in time.

Now, the callback function (which has the function name 'callback' too in this case, but the function
can have better names), will receive information from the server: the success (true or false), HTTP status
code, and (if succeeded) a JSON string with the response from the server. The function can then
process this data, and take the next step. The next step in this case is to report various variable
values to the browser console and insert content in the HTML document with the d3.select().html()
methods:

```javascript
var callback = function(success, status, response){
  console.log(success)
  console.log(status)
  if (success && status == 200) {
    d3.select("#json").html("<pre>" + JSON.stringify(response, undefined, 2) + "</pre>");
  } else {
    d3.select("#json").html("No success: " + status);
  }
};
```

The see the full source code, open [example1.html in your browser as source code](https://raw.githubusercontent.com/egonw/pils/master/example1.html).
