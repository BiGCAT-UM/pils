
Day 1
=====

On day one the practical starts with a 2 hour lecture introducing you the theory. Slides will be available from StudentPortal.

Practical
---------

You will do today:
1. learn how to edit, validate, and view HTML pages
1. using a number of examples
1. learn how use JavaScript in HTML pages and run these in your browser
1. learn how to use the browser console
1. determine the gaps in your knowledge and skills
1. form two teams and discuss a scientific question

Examples
--------

[Example 1](example1.html) is a simple HTML page with a bit of JavaScript
that calls the Open PHACTS API to ask the amount of pharmacological data
available for the compound with the IRI http://www.conceptwiki.org/concept/342a03eb-3311-49ac-8d6e-8bf9b605dab1 .

The HTML itself is pretty minimal, with an empty <div> element to hold
content later added by the JavaScript:

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

The <head> of the HTML also has to load a few libraries. First, we need the Open PHACTS API
JavaScript client library, which depends on jquery.js, and the latter depends on purl.js:

    <script type="text/javascript" src="https://egonw.github.io/pils/lib/purl.js"></script>
    <script type="text/javascript" src="https://egonw.github.io/pils/lib/jquery-1.9.1.min.js"></script>
    <script type="text/javascript" src="https://egonw.github.io/pils/src/combined.js"></script>

Second, since we are going to visualize data at some point anyway, we need to load D3:

    <script type="text/javascript" src="https://egonw.github.io/pils/lib/d3.v3.min.js"></script>

Then ...
