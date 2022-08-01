// set the dimensions and margins of the graph
const margin = { top: 30, right: 50, bottom: 100, left: 15 },
  width = document.body.clientWidth - margin.left - margin.right,
  height = document.body.clientHeight - margin.top - margin.bottom;

// how many "countries" in one row
const hm = 9;

// Link to directory of all files/data
const Directory =
  "https://raw.githubusercontent.com/A-Tilunaite/cost_vizualization_D3/main";

  // items we are interested in + their icon names
// const select_items = ["Lettuce","Tomato_1kg","Onion_1kg"];
// const icon_items = ["lettuce","tomatoe","onion"];
const select_items = ["Lettuce","Loaf_of_bread","Onion_1kg"];
const icon_items = ["lettuce","bread","onion"];
const icon_scale=[50,50,50];
const icon_shift=[0.15,0.4,0.5];

// append the svg object to the body of the page
const svg = d3
  .select("#my_dataviz")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);
// append the svg_legend object to the body of the page
const svg_legend = d3
  .select("#my_legend")
  .append("svg")
  .attr(
    "width",
    Math.floor(document.body.clientWidth / hm) + 40 + margin.left + margin.right
  )
  .attr("height", 4 * 43 + 10 + margin.bottom + margin.top)
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

d3.csv(Directory + "/Data/europe_countries.csv")
  //.then(data1 => _.values(data1))
  .then(function (data1) {
    // sort data
    data1.sort(function (b, a) {
      return (
        +a.Single_person_monthly_costs.replace(",", "") *
          +a.Exchange_to_eur.replace(",", "") -
        +b.Single_person_monthly_costs.replace(",", "") *
          +b.Exchange_to_eur.replace(",", "")
      );
    });

    // const ExpensesMinMax = d3.extent(data1, d => +d.Single_person_monthly_costs.replace(',','')* +d.Exchange_to_eur.replace(',',''));
    // console.log(ExpensesMinMax[1])

    svg
      .append("text")
      .attr("class", "x label")
      .attr("text-anchor", "middle")
      .attr("x", width / 2)
      .attr("y", height + margin.bottom - 10)
      .style("font-size", "34px")
      .text("Groccerie's price (\u20AC)");


    function groceriesdf(d,items) {
        
      const it = [];
      let tot = [];

      for (let i = 0; i < d.length; i++) {
        tot[i]=0;
    }

      for (let j = 0; j< items.length; j++){
        const iti=[];  
        for (let i = 0; i < d.length; i++) {
            iti[i] =+ _.get(d[i],items[j]).replace(",", "") *
            +d[i].Exchange_to_eur.replace(",", "");
            tot[i] +=  iti[i];
        }
        it[j]=iti;
}
      return { items: it, all: tot };
    }
    const grocerriesData = groceriesdf(data1,select_items);
    // console.log(grocerriesData);

    function plot_groc(data,ic_name,sc,sh){
        const itemplot = svg
        .selectAll("items")
        .data(data)
        .join("image")
        .attr("xlink:href", Directory + "/icons/"+ic_name+".svg")
        .attr(
            "x",
            (d) =>
            sh * Math.floor(document.body.clientWidth / hm) + 5 - (sc * d) / 2
        )
        .attr("y", (d) => 70 - (sc * d) / 2)
        .attr("width", (d) => sc * d)
        .attr("height", (d) => sc * d)
        .attr(
            "transform",
            (d, i) =>
            `translate(${
                (i % hm) * Math.floor(document.body.clientWidth / hm) + 40
            },${Math.floor(i / hm) * (4 * 43)})`
        );
    }

    // Plot items
    for (let i=0; i< select_items.length; i++){
        plot_groc(grocerriesData.items[i],icon_items[i],icon_scale[i],icon_shift[i])
    }

    // //   myimage.attr('x', 100).attr('y',150)

    svg
      .selectAll("paths")
      .data(data1)
      .enter()
      .append("path")
      //  .data(data1)
      .attr("id", function (d, i) {
        return "country_" + i;
      }) //Unique id of the path
      .attr(
        "d",
        "M" +
          String(margin.left / 2 - 5) +
          ",90 L" +
          String(margin.left / 2 - 5) +
          ",-10"
      ) //SVG path
      .attr(
        "transform",
        (d, i) =>
          `translate(${(i % hm) * Math.floor(document.body.clientWidth / hm)},${
            Math.floor(i / hm) * (4 * 43) + 10
          })`
      )
      .style("fill", "black")
      .style("stroke", "blue")
      .style("stroke-width", 2);

    //Create an SVG text element and append a textPath element
    svg
      .selectAll("textPath")
      .data(data1)
      .enter()
      .append("text")
      .append("textPath") //append a textPath to the text element
      .attr("xlink:href", function (d, i) {
        return "#country_" + i;
      })
      // .style("text-anchor","middle") //place the text halfway on the arc
      .attr("startOffset", "0%")
      .text(function (d) {
        return d.Country.replace("+", " ");
      })
      .style("font-size", "22px");

    //Create legend labels
    svg
      .selectAll(".itemsum")
      .data(grocerriesData.all)
      .enter()
      .append("text")
      .attr(
        "x",
        (d, i) => (i % hm) * Math.floor(document.body.clientWidth / hm) + 5
      )
      .attr("y", (d, i) => Math.floor(i / hm) * (4 * 43) + 135)
      .text(
        (d) => " Sum of all: " + String(Math.round(d * 100) / 100) + "\u20AC"
      )
      .style("font-size", "22px")
      .style("fill", "blue");

          const chartData = [];
              for (let i=0;i<icon_items.length;i++){
                chartData[i]={
                    name: icon_items[i],
                    value: d3.extent(grocerriesData.items[i]),
                    icon: Directory + "/icons/"+icon_items[i]+".svg",
                  }
              }
    
     console.log(chartData)

    //Initialize legend
    const legendItemSize = 40;
    const legendSpacing = 10;
    const legend = svg_legend.selectAll(".legendItem").data(chartData);

    //Create legend items
    legend
      .enter()
      .append("image")
      .attr("class", "legendItem")
      .attr("width", legendItemSize)
      .attr("height", legendItemSize)
      .attr("xlink:href", (d) => d.icon)
      .attr("transform", (d, i) => {
        var x = 0;
        var y = (legendItemSize + legendSpacing) * i;
        return `translate(${x}, ${y})`;
      });

    //Create legend labels
    legend
      .enter()
      .append("text")
      .attr("x", legendItemSize + 15)
      .attr(
        "y",
        (d, i) => (legendItemSize + legendSpacing) * i + legendItemSize / 2
      )
      .text(
        (d) =>
          "Min " +
          String(Math.round(d.value[0] * 100) / 100) +
          "\u20AC , max " +
          String(Math.round(d.value[1] * 100) / 100) +
          "\u20AC"
      )
      .style("font-size", "22px");
  });
