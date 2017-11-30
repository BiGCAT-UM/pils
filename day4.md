
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


