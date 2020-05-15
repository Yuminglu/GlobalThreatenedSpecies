let body = d3.select("#body");
let mapSvg = d3.select("#container").append("svg");

let div = d3.select(".tooltip").style("opacity", 0);

let w = window.innerWidth;
let h = window.innerHeight;

let legendSvg = d3.select("svg")

legendSvg.append("circle").attr("cx",200).attr("cy",10).attr("r", 6).style("fill", "#552223")
legendSvg.append("circle").attr("cx",200).attr("cy",40).attr("r", 6).style("fill", "#881F20")
legendSvg.append("circle").attr("cx",200).attr("cy",70).attr("r", 6).style("fill", "#C1776B")
legendSvg.append("circle").attr("cx",200).attr("cy",100).attr("r", 6).style("fill", "#CF8F87")
legendSvg.append("circle").attr("cx",200).attr("cy",130).attr("r", 6).style("fill", "#BCA79A")
legendSvg.append("circle").attr("cx",200).attr("cy",160).attr("r", 6).style("fill", "#89BDC1")
legendSvg.append("circle").attr("cx",200).attr("cy",190).attr("r", 6).style("fill", "#68A194")
legendSvg.append("circle").attr("cx",200).attr("cy",220).attr("r", 6).style("fill", "#56957D")
legendSvg.append("text").attr("x", 220).attr("y", 220).text("0").style("font-size", "15px").attr("alignment-baseline","middle").style("fill", "#FFFFFF")
legendSvg.append("text").attr("x", 220).attr("y", 190).text("10").style("font-size", "15px").attr("alignment-baseline","middle").style("fill", "#FFFFFF")
legendSvg.append("text").attr("x", 220).attr("y", 160).text("30").style("font-size", "15px").attr("alignment-baseline","middle").style("fill", "#FFFFFF")
legendSvg.append("text").attr("x", 220).attr("y", 130).text("60").style("font-size", "15px").attr("alignment-baseline","middle").style("fill", "#FFFFFF")
legendSvg.append("text").attr("x", 220).attr("y", 100).text("90").style("font-size", "15px").attr("alignment-baseline","middle").style("fill", "#FFFFFF")
legendSvg.append("text").attr("x", 220).attr("y", 70).text("500").style("font-size", "15px").attr("alignment-baseline","middle").style("fill", "#FFFFFF")
legendSvg.append("text").attr("x", 220).attr("y", 40).text("1000").style("font-size", "15px").attr("alignment-baseline","middle").style("fill", "#FFFFFF")
legendSvg.append("text").attr("x", 220).attr("y", 10).text("2400").style("font-size", "15px").attr("alignment-baseline","middle").style("fill", "#FFFFFF")
// legendSvg.append("text").attr("x", 200).attr("y", 250).text("Number").style("font-size", "15px").attr("alignment-baseline","middle").style("fill", "#FFFFFF")
legendSvg.append("text").attr("x", 140).attr("y", 270).text("Number of Threatened Species").style("font-size", "15px").attr("alignment-baseline","middle").style("fill", "#FFFFFF")


let tooltipSvg = div
  .append("svg")
  .attr("width", 500)
  .attr("height", 500)
  .append("g");

Promise.all([d3.csv("Species8.csv"), d3.json("countries.geo.json")]).then(
  showData
);

let mapdata = "";
let allData = "";
let hostData = "";
let currentYear = "2015";
let currentCategory = "Total";
let years = [2015, 2016, 2017, 2018, 2019];

var sliderStep = d3
  .sliderBottom()
  .min(2015)
  .max(2019)
  .width(300)
  .ticks(5)
  .step(1)
  .default(2015)
  .on("onchange", val => {
    currentYear = val;
    render(allData, currentCategory, currentYear);
  });

var gStep = d3
  .select("div#slider-step")
  .append("svg")
  .attr("width", w)
  .attr("height", 180)
  .append("g")
  .attr("transform", "translate(550,70)");

gStep.call(sliderStep);


const zoom = d3
  .zoom()
  .scaleExtent([-8, 8])
  .on("zoom", function(d) {
    let centered;
    zoomed();
  });
body.call(zoom);

function showData(datasources) {
  let data = datasources[0];
  let mapInfo = datasources[1];

  mapdata = mapInfo.features;
  allData = data;

  render(allData, "Vertebrates", 2015);
}

function render(data, Category, year) {
  body.selectAll("*").remove();
  let category = data.filter(function(d) {
    return d.Category == Category;
  });
  category = category.filter(function(d) {
    return parseInt(d.Year) == year;
  });
  currentCategory = Category;
  let bodyHeight = 400;
  let bodyWidth = 1400;

  let cScale = d3
    .scaleLinear()
    .domain([0, 10, 30, 60, 90, 120, 500, 1500])
    .domain([0, 10, 30, 60, 90, 500, 1000, 2400])
    .range([
      "#56957D",
      "#68A194",
      "#89BDC1",
      "#BCA79A",
      "#CF8F87",
      "#C1776B",
      "#881F20",
      "#552223"
    ]);

  var projection = d3
    .geoMercator()
    .scale(120)
    .translate([bodyWidth / 2, bodyHeight / 2 + 10]);

  var path = d3.geoPath().projection(projection);

  let geoPath = d3.geoPath().projection(projection);

  body
    .selectAll("path")
    .data(mapdata)
    .enter()
    .append("path")
    .attr("d", d => path(d))
    .attr("stroke", "#282828")
    .attr("stroke-width", "0.5")
    // .attr("fill","black")
    .style("fill", function(feature) {
      let name = feature.properties.name;
      // let countryvalue = feature.properties.value;
      let myRow = category.find(function(countryRow) {
        return countryRow["Country"] == name;
      });
      if (myRow) {
        return cScale(+myRow.Value);
      } else {
        //those countries that never been to worldcup
        return "#ffffff";
      }
    })
    .on("click", d => {
      plotTooltip(d.id, d.properties.name, d.Year);
      div
        .transition()
        .duration(200)
        .style("opacity", 0.9);
      div
        .style("left", d3.event.pageX + "px")
        .style(
          "top",
          d3.event.pageY > 300 ? "250px" : d3.event.pageY - 42 + "px"
        );
    })
    .on("mouseout", d => {
      tooltipSvg.selectAll("*").remove();
      div
        .transition()
        .duration(500)
        .style("opacity", 0);
    });
}

function zoomed() {
  body
    .selectAll("path") // To prevent stroke width from scaling
    .attr("transform", d3.event.transform);
  body
    .selectAll("circle") // To prevent stroke width from scaling
    .attr("transform", d3.event.transform);
}

// function plotTooltip(id, host) {
function plotTooltip(id, country_name, Year) {
  hostData = allData.filter(function(d) {
    return d.Country == country_name && d.Category !== "Total";
  });

  var sumstat = d3
    .nest() // nest function allows to group the calculation per level of a factor
    .key(function(d) {
      return d.Category;
    })
    .entries(hostData);
  // get scaling function for years (x axis)
  const valueDomain = d3.extent(hostData.map(i => +i.Value));
  let yScale = d3
  .scaleLinear()
  .domain(valueDomain)
  .range([265, 120]);
let yAxis2 = tooltipSvg
  .append("g")
  .attr("transform", "translate(50,0)")
  .call(d3.axisLeft(yScale));

// let yearLimits = d3.extent(hostData, d => new Year(d["Year"]))
// get scaling function for y axis
const yearDomain = d3.extent(hostData, d => +d["Year"]);
let xScale = d3
  .scaleLinear()
  // .domain([yearLimits[0], yearLimits[1]])
  .domain(yearDomain)
  .range([50, 275]);
let xAxis2 = tooltipSvg
  .append("g")
  .attr("transform", "translate(0,265)")
  .call(d3.axisBottom(xScale));
  //let line = d3
  //  .line()
  //  .x(d => xScale(new Date(d["Date"]))) // set the x values for the line generator
  //  .y(d => yScale(parseInt(d["Value"].replace("$", "")))); // set the y values for the line generator
  let line = d3
    .line()
    .x(d => xScale(d.Year)) // set the x values for the line generator
    .y(d => yScale(d.Value)); // set the y values for the line generator
  // append line to svg
  var res = sumstat.map(function(d) {
    return d.key;
  }); // list of group names
  var color = d3
    .scaleOrdinal()
    .domain(res)
    .range([
      "#56957D",
      "#BCA79A",
      "#C1776B"
    ]);

  tooltipSvg
    .selectAll(".line")
    .data(sumstat)
    .enter()
    .append("path")
    .attr("d", d => line(d.values))
    .attr("fill", "none")
    .attr("stroke-width",2)
    .attr("stroke", d => color(d.key));

    tooltipSvg
      .append("text")
      .attr("x", 35)
      .attr("y", 60)
      .attr("font-size", "10pt")
      .text("Vertebrates");
      // .text("Year: " + Year);

      tooltipSvg
        .append("circle")
        .attr("cx", 25)
        .attr("cy", 55)
        .attr("r", 6)
        .style("fill", "#56957D")

      tooltipSvg
        .append("text")
        .attr("x", 35)
        .attr("y", 80)
        .attr("font-size", "10pt")
        .text("Invertebrates");

        tooltipSvg
          .append("circle")
          .attr("cx", 25)
          .attr("cy", 75)
          .attr("r", 6)
          .style("fill", "#BCA79A")


        tooltipSvg
          .append("text")
          .attr("x", 35)
          .attr("y", 100)
          .attr("font-size", "10pt")
          .text("Plants");

          tooltipSvg
            .append("circle")
            .attr("cx", 25)
            .attr("cy", 95)
            .attr("r", 6)
            .style("fill", "#C1776B")

  tooltipSvg
    .append("text")
    .attr("x", 100)
    .attr("y", 30)
    .attr("font-size", "10pt")
    .text("Country: " + country_name);
    // .text("Year: " + Year);
}

// function label(){
//   tooltipSvg.append("text")
//  .attr('x', 100)
//  .attr('y', 20)
//  .attr('font-size', '10pt')
//  .text('Time vs price of ')
// }
function select(name) {
  render(allData, name, currentYear);
}

// function select(myrange) {
//     // render(allData, name, currentYear);
// }
