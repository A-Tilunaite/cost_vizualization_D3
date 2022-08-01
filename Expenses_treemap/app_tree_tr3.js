// set the dimensions and margins of the graph
const margin = { top: 50, right: 50, bottom: 70, left: 20 };
const height = document.body.clientHeight - margin.top - margin.bottom;
const width = document.body.clientWidth - margin.left - margin.right;
const padding = 20; // labelled `pad` in image due to space constraints

const countrnr = 41;

// append the svg object to the body of the page
const svg = d3
  .select("#my_dataviz")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// append the svg_legend object to the body of the page
const svg_legend = d3
  .select("#my_legend")
  .append("svg")
  .attr(
    "width",
    Math.floor(document.body.clientWidth / 10) + 40 + margin.left + margin.right
  )
  .attr("height", 4 * 43 + 10 + margin.bottom + margin.top)
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

svg
  .append("text")
  .attr("text-anchor", "middle")
  .attr("x", width / 2)
  .attr("y", -margin.top/2)
  .text("Potential expenses and savings")
  .attr("font-size", "30px")
  .attr("fill", "grey");

// read csv data
const Directory =
  "https://raw.githubusercontent.com/A-Tilunaite/cost_vizualization_D3/main";

const fields = ["Groceries", "Bills", "Salary", "Rent"];
const colorsf = ["red", "blue", "green", "yellow"];

const select_rent_group = 'Apartment_1_bed_OutsideCentre';

const no_countries_in_map=[ "Andorra", "Liechtenstein","Monaco", "North+Macedonia"];

var expenses_data = d3.csv(
  Directory + "/Data/europe_countries_transpose_v2.csv"
);
var map_data = d3.json(
  "https://raw.githubusercontent.com/mustafasaifee42/Tile-Grid-Map/master/Tile-Grid-Map-Cleaned.json"
);

Promise.all([expenses_data, map_data]).then(function (data) {
  // Expenses data

  var expenses = data[0]
    .filter(function (row) {
        if (select_rent_group ==[]){
            return (
                fields.indexOf(row["Group"]) >= 0 ||
                fields.indexOf(row["Field"]) >= 0 ||
                row["Field"] == "All_data"
            );}
      else{
          var fields_without_rent = fields.filter(e => e !== 'Rent')
          return (
            fields_without_rent.indexOf(row["Group"]) >= 0 ||
            fields_without_rent.indexOf(row["Field"]) >= 0 ||
            row["Field"] == "All_data"||
            row["Field"] == "Rent" ||
            row["Field"] == select_rent_group
        );
      }
    });

  var countries = Object.keys(expenses[0]);

  // Map data:

  const coord = data[1]
    .filter(function (row) {
      return row.region == "Europe" & row.name != "Russian Federation" & row.name != 'Ukraine' & row.name != 'Belarus';
    })
    .map((d) => {
      return { name: d.name, x: d.coordinates[0], y: d.coordinates[1] };
    });

  const xlim = d3.extent(coord, (d) => +d.x);
  const ylim = d3.extent(coord, (d) => +d.y);

  const subw = width / (xlim[1] - xlim[0] + 1) - padding;
  const subh = height / (ylim[1] - ylim[0] + 2)-padding/2;

  const color = d3.scaleOrdinal().domain(fields).range(colorsf);

  function plot_tree(data, map_coordx,map_coordy) {
    // console.log('yyy', map_coord.x)
    const root = d3
      .stratify()
      .id(function (d) {
        return d.Field;
      }) // Name of the entity (column name is name in csv)
      .parentId(function (d) {
        return d.Group;
      })(
      // Name of the parent (column name is parent in csv)
      data
    );

    root.sum(function (d) {
      return +d.Value;
    }); // Compute the numeric value for each entity

    //   console.log(root)
    // Then d3.treemap computes the position of each element of the hierarchy
    let test = d3
      .treemap()
      .size([subw, subh])
      .paddingTop(padding /10)
      .paddingRight(padding / 5)
      .paddingInner(1)(
      //Padding between each rectangle
      root
    );

    //  console.log('ttt', test)

    // svg
    //     .append("image")
    //     .attr("xlink:href", Directory + "/icons/coins_stack.svg")
    //     .attr( "x",(subw + padding )* (indx % coln))
    //     .attr("y", (subh + padding) * Math.floor(indx / coln))
    //     .attr("width", subw - padding)
    //     .attr("height", subh );

    svg
      .selectAll("items")
      .data(root.leaves())
      .join("rect")
      .attr("x", function (d) {
        return d.x0 + (subw + padding) * (map_coordx - xlim[0]);
      })
      .attr("y", function (d) {
        return d.y0 + (subh + padding) * (map_coordy - ylim[0]);
      })
      .attr("width", function (d) {
        return d.x1 - d.x0;
      })
      .attr("height", function (d) {
        return d.y1 - d.y0;
      })
      .style("stroke", "black")
      .style("fill", function (d) {
        return color(d.parent.id);
      });
    //  .style("opacity", 0.8)
    //  .style("opacity", function(d){ return opacity(d.data.Value)})

    // and to add the text labels
    svg
      .selectAll("items")
      .data(root.leaves())
      .enter()
      .append("text")
      .attr("x", function (d) {
        return d.x0 + 5 + (subw + padding) * (map_coordx - xlim[0]);
      }) // +10 to adjust position (more right)
      .attr("y", function (d) {
        return d.y0 + 5 + (subh + padding) * (map_coordy - ylim[0]);
      }) // +20 to adjust position (lower)
      .text(function (d) {
        return d.data.Value;
      })
      .attr("font-size", "5px")
      .attr("fill", "white");
  }

  let getColumns = [];
  var select_countries = [];
  var coord_2 = [];
  let map_iterator = 0;
  var exception = 0;

  let map_indx = 0;

  var ratio_savings_salary = [];

  for (let i = 0; i < countrnr; i++) {
      if (no_countries_in_map.indexOf(countries[2+i]) ===-1){
      getColumns = expenses.map((d) => {
        return { Field: d.Field, Group: d.Group, Value: d[countries[2 + i]] };
      });

      map_indx = coord.findIndex(el => el.name.indexOf(countries[2+i].slice(0,5)) != -1);
      if (map_indx == -1){
        map_indx = coord.findIndex(el => el.name.indexOf('Great') != -1);
      }
      // Change net salary to remaining salary
      const sal_indx = getColumns.findIndex(el => el.Field.indexOf('Net_Salary')>=0 );
      const sal = getColumns[sal_indx].Value;
      getColumns[sal_indx].Value =
        2 * sal - d3.sum(getColumns, (d) => d.Value);
      getColumns[sal_indx].Field = 'Remaining salary';
      fields[fields.indexOf('Salary')]='Savings';

    //   console.log('ttt',countries[2+i])
      // stratify the data: reformatting for d3.js
      if (countries[2 + i] != "Australia" & countries[2 + i] != "New+Zealand") {
        plot_tree(getColumns, coord[map_indx].x, coord[map_indx].y);
        coord_2[map_iterator]= [coord[map_indx].x, coord[map_indx].y];}
      else{
        plot_tree(getColumns, xlim[0]+ 1 + exception, ylim[1]+0.5);
        coord_2[map_iterator]= [xlim[0]+ 1 + exception, ylim[1]+0.5];
        exception +=1; }
      select_countries[map_iterator] = countries[2 + i];
      ratio_savings_salary[map_iterator]= getColumns[sal_indx].Value/sal;
      map_iterator += 1;
    }
  }

  svg
    .selectAll("paths")
    .data(coord_2)
    .enter()
    .append("path")
    .attr("id", function (d, i) {
      return "country_" + i;
    }) //Unique id of the path
    .attr(
      "d",
      "M" +
        String(-5) +
        "," +
        String(subh - padding / 2) +
        " L" +
        String(-5) +
        ",0"
    ) //SVG path
    .attr(
      "transform",
      (d) =>
        `translate(${(subw + padding) * (d[0] - xlim[0])},${
          (subh + padding) * (d[1] - ylim[0])
        })`
    )
    .style("fill", "black")
    .style("stroke", "blue")
    .style("stroke-width", 2);

  //Create an SVG text element and append a textPath element
  svg
    .selectAll("textPath")
    .data(select_countries)
    .enter()
    .append("text")
    .append("textPath") //append a textPath to the text element
    .attr("xlink:href", function (d, i) {
      return "#country_" + i;
    })
    .attr("startOffset", "0%")
    .text(function (d) {
      return d.replace("+", " ");
    })
    .style("font-size", "22px");

 svg
    .selectAll("ratio_text")
    .data(ratio_savings_salary)
    .enter()
    .append("text")
    .attr("x",  (d, i) =>  (coord_2[i][0] -xlim[0])*(subw+padding) + padding)
    .attr("y", (d, i) =>  (coord_2[i][1] -ylim[0])*(subh+padding) )
    .text((d) => "savings " + String(Math.round(d*100)) + "%")
    .style("font-size", "22px");

  ////////  Legend

  //Initialize data
  const chartData = [];
  for (let i = 0; i < fields.length; i++) {
    chartData[i] = {
      name: fields[i],
      color: colorsf[i],
    };
  }

  //Initialize legend
  var legendItemSize = 12;
  var legendSpacing = 4;
  var xOffset = 70;
  var yOffset = 10;
  const legend = svg_legend.selectAll(".legendItem").data(chartData);

  //Create legend items
  legend
    .enter()
    .append("rect")
    .attr("class", "legendItem")
    .attr("width", legendItemSize)
    .attr("height", legendItemSize)
    .style("fill", (d) => d.color)
    .attr("transform", (d, i) => {
      var x = xOffset;
      var y = yOffset + (legendItemSize + legendSpacing) * i;
      return `translate(${x}, ${y})`;
    });

  //Create legend labels
  legend
    .enter()
    .append("text")
    .attr("x", xOffset + legendItemSize + 5)
    .attr("y", (d, i) => yOffset + (legendItemSize + legendSpacing) * i + 12)
    .text((d) => d.name);

  // Add image near legends
  legend
    .enter()
    .append("image")
    .attr("xlink:href", Directory + "/icons/coins_stack.svg")
    .attr("x", 0)
    .attr("y", yOffset)
    .attr("width", fields.length * (legendItemSize + legendSpacing))
    .attr("height", fields.length * (legendItemSize + legendSpacing));
});
