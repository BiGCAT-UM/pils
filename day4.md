
Day 4
=====

Practical
---------

You will do today:
1. learn how to combine two or more Open PHACTS calls
1. work on your answering your research question with the API

Examples
--------

One of the tricky parts of dealing with asynchronous web services, is that you never know when you data has arrived.
As such, you have to depends on a signal that it did arrive. So-called callback functions are a common approach
in JavaScript for this purpose. Use of such dependencies is essential in this course, and a key topic.

For example, consider the following pharmacological task: give me all compounds that bind to all targets in pathways
with genes related to a disease. This integrated query consists of multiple smaller queries. First, we need to know
which genes relate to a disease. Then we need to query for all pathways that involve those genes. BTW, note the use
of "all" here, which means that somewhere we will have to use a for-loop. Then, for all those pathways, we need to
get all the (protein) targets, and for each of them, finally, we need to ask for all compounds binding to that target.

So, the larger tasks as several smaller tasks, each of which have matching methods in ops.js:
1. all genes for a disease ➜ ....
2. all pathways for a gene ➜ ....
3. all proteins in a pathway ➜ ....
4. all compounds binding to a protein ➜ ....

In pseudo code, this would look like:

````
genes = returnGenesForDisease(someDisease)
for aGene in genes:
  pathways = returnPathwaysForGene(aGene)
  for aPathway in pathways:
    proteins = returnProteinsForPathway(aPathway)
    for aProtein in proteins:
      compounds = returnCompoundsForProtein(aProtein)
````

Notice the nesting. And, mind the synchronous nature of this code! When dealing with asynchronous webservices,
a call like returnGenesForDisease(someDisease) will fire the search, but JavaScript will not wait for the answer,
and the next lines (the first fore loop) will start immediately, when no data is available yet.

Therefore, JavaScript solves this by introducing callback functions. This will cause JavaScript to continue
after it initiated the web service call, and then just continue with the next line. And the callback function
is used to handle the data when it had arrived. Think of it that you leave a message with the webservice and
that at some later point the webservice calls you back.

So, as used in [example 1](example1.md), we have this basic structure, for a single (unnested) call:

```JavaScript
var compoundService = new CompoundSearch(
  "https://beta.openphacts.org/2.1", appID, appKey
);

var handlePharmacoData = function(success, status, response) {
  console.log(success)
  console.log(status)
};

compoundService.compoundPharmacologyCount(
  "http://www.conceptwiki.org/concept/342a03eb-3311-49ac-8d6e-8bf9b605dab1",
  null, null, null, null, null, null, null, null, null, null, null,
  null, null, null, null, null, null,
  handlePharmacoData
);

console.log("OK, make the call... now I have to wait for the results.")
```

Of course, this function does not do much. The first part defines which Open PHACTS service and version to use,
and the creditials (application ID and access key). The third part actually makes the request, and asks the
web service to return pharmacology data for the given compound. Immediately after that it will report on
the JavaScript console that it's waiting for results.

The second part is the callback function, named handlePharmacoData. When the web browser received the
results back from the webservice, it will execute this callback function. Not earlier, not later. The
returned results are passed as content to the callback function, along with a boolean indicating if
the webservice call succeeded at all, and the HTTP code that was returned.

Nested web service calls
------------------------

So, returning to the pseudocode, we note that we can only iterate over the genes linked to a disease
when we received a list of genes from the webservice. Therefore, the first iteration in the
pseudocode has to happen in the callback function for the web service call to return all genes
for a disease (mind you, the services does not necessarily only return genes, but generally
associations):

```JavaScript
var diseaseService = new DiseaseSearch(
  "https://beta.openphacts.org/2.1", appID, appKey
);

var handleAssociations = function(success, status, response) {
  // where we will process the genes
};

diseaseService.associationsByDisease(
  'http://linkedlifedata.com/resource/umls/id/C0004238', null, null, null, null,
  handleAssociations
);
```

This code does not actually do recursion yet, but let's see how that works. First, we need to iterate
over all genes, so we update the handleAssociations method:

```JavaScript
var handleAssociations = function(success, status, response) {
   var itemCount = jsonData.items.length;
   for (var i = 0; i < itemCount; i++) {
      item = jsonData.items[i]
      if (item.gene) {
        var node = document.createElement("li");
        var textnode = document.createTextNode(item.gene._about);
        node.appendChild(textnode);
        document.getElementById("list").appendChild(node);
      }
   }
}
```

All this method does now is create a list of gene IRIs. The full code is available as [example 2](example2.md).

Because we now have one place in our code when we have one gene IRI, that's the place where to
initiate the next call. So, we update the handle method to not create a list, but to call the
next method: get the pathways in which each gene is found.

TO CONTINUE
