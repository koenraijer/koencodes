---
title: "Please, no more dinosaur software in stats education..."
tags: 
    - SvelteKit
    - ChartJS
    - Data analysis
date: 2021-12-23
snippet: "A plea for interactive graphs in medical research"
layout: blog
---

<script>
    import Pie from '$lib/ChartJS/Pie.svelte'
    import Line from '$lib/ChartJS/Line.svelte'
    import Bar from '$lib/ChartJS/Bar.svelte'

    let labels = ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'];
    const colors = ["#003330","#184E4A","#316865", "#49837F", "#629D9A", "#7AB8B4", "#93D2CF", "#ABEDE9"];
    let data = [0, 1, 2, 3, 4, 5];

    let lineData = [4042, 5598, 8152, 13197, 17222, 25684, 43818, 68662, 64304, 70537, 93626, 84263, 88186, 101839, 98392, 104956, 152836];
    let lineLabels = [2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021];

    let barData = [95, 88, 88, 86, 85, 85, 84, 84, 82, 83];
    let barLabels = ["Elizabeth II", "Paul Biya", "Michel Aoun", "Mahmoud Abbas", "Salman bin Abdulaziz Al Saud", "Francis", "Harald V", "Cornelius A. Smith"];
    let barInfo = ["Queen of the United Kingdom", "President of Cameroon", "President of Lebanon", "President of the Palestinian National Authority, President of the State of Palestine", "King of Saudi Arabia, Prime Minister of Saudi Arabia", "Pope of the Holy See, Sovereign of the Vatican City State", "King of Norway", "Governor-General of the Bahamas"];

</script>

Everytime I was taught statistics during my bachelor, I was taught SPSS and it was really boring. With its non-nostalgic Windows XP aesthetic, SPSS feels aged and unintuitive. At a whopping €95,53 per month<sup>1</sup>, that's a bad deal. Even my teachers seemed reluctant to teach it. It didn't exactly inspire a raging passion for data science.

Apparently, it is also undermaintained and lacking standard statistical methods<sup>2</sup>, but I won't talk about that because I am not a statistician and so far, I've been pretty succesful at <i>not</i> using SPSS. 

Regardless, I do feel qualified to talk about user experience. As a consumer, I want pretty and interactive graphs. They capture my attention and make graphs almost... <i>fun</i>. Good thing there are several free, open-source options available (I'm looking at you: Python and R). Why aren't we using them?

## How graphs and documents came to be

Graphs are pretty useful. They turn data into information where text is unable to, and allow us to find hidden patterns in numbers. 
Needless to say, they've existed in times where paper was the dominant technology. As early as 1765, someone thought of a bar chart <sup>3</sup>, though Wikipedia says it might've been accidental.

<figure>
    <img src="/220101_earlyBarChart.jpg" aria-label="18th century bar chart.">
    <figcaption>Nicole Oresme's 1765 bar chart.</figcaption>
</figure>


Fast-forward to the '80s, parts of academia were sending digital documents of several incompatible formats by e-mail through internet-like networks<sup>4</sup>. That changed in the early '90s with the onset of the PDF:  everybody could finally share files with everyone else without hassle. 

## Skeuomorphism

At the same time, any digital document is just that: a digital copy of real paper. It inherits its functionalities, <i>and</i> its limitations. Digital documents are a (sort of) new technology, but they look and work like an old technology. This happens quite often --- Steve Jobs even coined a word for it: <i>skeuomorphism</i> ('skeuo' is pronounced like <i>skew</i>). 

I'll give you a couple of real-world examples.

- Early films used to look like plays. The camera would stay in one spot for 10 minutes and not move. Now, we do a close-up and film the surrounding for just a second, because we know our brain can figure out the rest. 
- Cars used to look very similar to horse carts. 
- iPhones used to have wood grain bookshelves to display apps.
- Computers have folders and a trashcan to manage files.

Skeuomorphic design are easier to conceptualize and easier to use because people are already familiar with the physical thing, but it can also constrain our imagination. PDF is also skeuomorphic, and because of that, it also functions like a sheet of paper: there's no interaction. But it doesn't need to be this way.

## Moving forward

With browsers becoming ever more powerful, I think moving research to the web, is the way to go. But how should that look and what should we take into consideration? 

Let's at least make sure we're keeping PDF's good properties. 

<div class="indented">

**Easy to distribute**. Whatever new technology we will use, it has to allow anyone, on any device, anywhere, to view our pretty data visualizations. This means we don't want any dependence on <i>closed-source</i>, paid technologies. Out goes SPSS again, farewell to Excel and to paid charting services like Highcharts. 


**Fully contained**. All the code necessary for displaying all of the information should be inside of the new format. That means no dependence on cloud services or the internet (after necessary files have been downloaded). This would take on the form of a <i>Progressive Web App</i> of sorts.

</div>

Unrestrained by the PDF format and inspired by the possibilities of web-based research, we can also get creative:

<div class="indented">

**Mobile-first**. No more zooming in on PDF files on tiny screens, full mobile compatibility.

**Interactive**. We can display extra information for each data point on hover or on click, and we can link data inside a data point presented in a table, a chart and in the text.  

**Accessible**. People with visual impairments currently rely on other people to explain to them what a graph says. There's plenty of room for improvement here, and ditching PDF is a big leap forward. a11y.
</div>

There's one last thing I'd like to add, and it serves me as much as my fellow students.

<div class="indented">

**Easy to learn**. Learning should be smooth and fun, unlike SPSS' point-and-click interface, which is mostly remembering rather than understanding. Learning a programming language may sound daunting, but they're structured in ways that allow for real understanding of what's happening under the hood. 
</div>

## Into practice

As this piece took shape, I became even more convinced of the benefits moving away from PDF and towards web-based research has. During my science internship, starting in April, I will do my absolute best to ditch SPSS and use Python (or R, for that matter). Hopefully, my supervisor will also see the merits I see. 

As to web publishing of data visualizations, I'll go with Python's Plotly for now, or ChartJS for quick and simple online charting. I find D3's learning curve to be rather steep, and I would rather prioritize learning a method of data analysis that translates to medical research. 


1. https://www.ibm.com/nl-en/products/spss-statistics/pricing
2. https://lindeloev.net/spss-is-dying/ 
3. http://www.jpowered.com/graphs-and-charts/bar-chart-history.html 
4. https://www.internetsociety.org/internet/history-internet/brief-history-internet/ 

<div class="pie chartWrapper">
    <h2>Reactive pie chart</h2>
    <p>A regular pie chart with reactive data</p>

<input bind:value={data[0]} type="text" inputmode="numeric" class="numeric" min=0 name="volatile" id="field-volatile" required="" aria-required="true" autocomplete="volatile" autocorrect="off" autocapitalize="off" oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">
<input bind:value={data[1]} type="text" inputmode="numeric" class="numeric" min=0 name="volatile" id="field-volatile" required="" aria-required="true" autocomplete="volatile" autocorrect="off" autocapitalize="off" oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">
<input bind:value={data[2]} type="text" inputmode="numeric" class="numeric" min=0 name="volatile" id="field-volatile" required="" aria-required="true" autocomplete="volatile" autocorrect="off" autocapitalize="off" oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">
<input bind:value={data[3]} type="text" inputmode="numeric" class="numeric" min=0 name="volatile" id="field-volatile" required="" aria-required="true" autocomplete="volatile" autocorrect="off" autocapitalize="off" oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">
<input bind:value={data[4]} type="text" inputmode="numeric" class="numeric" min=0 name="volatile" id="field-volatile" required="" aria-required="true" autocomplete="volatile" autocorrect="off" autocapitalize="off" oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">
<input bind:value={data[5]} type="text" inputmode="numeric" class="numeric" min=0 name="volatile" id="field-volatile" required="" aria-required="true" autocomplete="volatile" autocorrect="off" autocapitalize="off" oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">

<Pie {data}/>
</div>
<div class="chartWrapper">
    <h2>Line chart with animation</h2>
    <p>Retrigger the animation by clicking on the legend twice</p>
    <Line {lineData}{lineLabels}{colors}/>

</div>
<div class="chartWrapper">
    <h2>Bar chart with custom tooltip</h2>
    <p>The oldest reigning state leaders</p>

    <Bar {barData}{barLabels}{colors}{barInfo}/>
</div>

<style lang="scss">
      .chartWrapper {
        box-shadow: var(--shadow-elevation-mediumhigh);
        background: white;
        padding: var(--spacing-unit);
        margin: var(--spacing-unit);
        border-radius: var(--corner-unit);
        position: relative;
        height: auto;
      }
    

    .numeric {
        font-size: inherit;
        box-shadow: none;
        border-style: none;
        border-radius: calc(var(--corner-unit) * 0.5);
        appearance: none;
        -moz-appearance: none;
        -webkit-appearance: none;
        box-shadow: var(--shadow-elevation-low);
        padding: 0.25rem;
        margin: 0.5rem;
        width: 1.5rem;
        &:-webkit-outer-spin-button,
        &:-webkit-inner-spin-button {
        -webkit-appearance: none;
        }
        -moz-appearance: textfield;
        &:focus {
            box-shadow: var(--shadow-elevation-medium);
            outline: none;
        }
    }

    .pie {
        max-height: 28rem;
        canvas {
            margin: 0;
            max-height: 15rem;
        }
    }

    sup {
        font-size: 0.6em;
    }

    .indented {
        margin-left: var(--spacing-unit);
    }
    
</style>