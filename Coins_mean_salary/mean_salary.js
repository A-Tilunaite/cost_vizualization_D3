
function myResponsiveComponent(container,props){
    const {width, height} =props;
    let svg =container.selectAll('svg').data([null]);
    svg = svg.enter().append('svg')
    .merge(svg)
        .attr('width',width)
        .attr('height',height);

    let rect = svg.selectAll('rect').data([null]);
    rect = rect.enter().append('rect')
        .attr('stroke', 'black')
        .attr('fill', '#69a3b2')
        .attr('fill-opacity',0.5)
        .attr('rx',100)
    .merge(rect)
        .attr('y',100)
        .attr('width',width)
        .attr('height',height-105);

}


function createCoin(length, width) {
    const scl=-0.4;

    const path = d3.path();
    path.moveTo(0, 0);
    path.bezierCurveTo(0.0,width,length,width,length,0);
    path.bezierCurveTo(length,-width,0,-width,0,0);
    path.closePath();
    path.lineTo(0,width*(1+scl));
    path.bezierCurveTo(0.0,(2+scl)*width,length,(2+scl)*width,length,width*(1+scl));
    path.lineTo(length,0);
    path.moveTo(0.1*length, 0);
    path.bezierCurveTo(0.1*length,0.65*width,0.9*length,0.65*width,0.9*length,0);
    path.bezierCurveTo(0.9*length,-0.65*width,0.1*length,-0.65*width,0.1*length,0);
    return path;
  }


  function render(){
    myResponsiveComponent(d3.select('body'),{
        width: document.body.clientWidth,
       height: document.body.clientHeight
    });    
  }

  render();

  // d3.select('body').select('svg')
  //  .append('path')
  //  .attr('d',createCoin(100,100*0.3))
  //  .attr('stroke', 'black')
  //  .attr('fill', 'gold')
  //  .attr('transform','translate(60, 60)');

  d3.csv('https://raw.githubusercontent.com/A-Tilunaite/cost_vizualization_D3/main/Data/europe_countries.csv')
  //.then(data1 => _.values(data1))
  .then(function (data1){
  
    var CoinSize = 50;
    var coinPath = createCoin(CoinSize,CoinSize*0.3);

   // const SalaryMinMax = d3.extent(data1, d => +d.Average_Monthly_Net_Salary.replace(',','')/ +d.Apartment_1_bed_OutsideCentre.replace(',',''));
   const SalaryMinMax = d3.extent(data1, d => +d.Average_Monthly_Net_Salary.replace(',','')* +d.Exchange_to_eur.replace(',',''));

    //console.log(SalaryMinMax)


    const numCoinScale = d3.scaleQuantize().domain(SalaryMinMax).range([1,2,3,4,5,6,7,8,9,10]);
  
   const coinsData = _.map(data1, d => {
    // const numCoins = numCoinScale(+d.Average_Monthly_Net_Salary.replace(',','')/ +d.Apartment_1_bed_OutsideCentre.replace(',',''));
    const numCoins = numCoinScale(+d.Average_Monthly_Net_Salary.replace(',','')* +d.Exchange_to_eur.replace(',',''));

     //console.log(numCoins);
   return {
     coins: _.times(numCoins, i => {return {yshift: -(CoinSize*0.3*0.7)*i, coinPath}}),
     numCoins,
    }
 }); 
 const hm = 11;

const coinStack = d3.select('body').select('svg')
   .selectAll('g')
   .data(coinsData)
   .enter()
   .append('g')
  .attr('transform', (d, i) => `translate(${(i % hm) * Math.floor(document.body.clientWidth/hm)+40},${Math.floor(i / hm) * (4*CoinSize)+210})`);

  /////////////////////////////////////////////////////////
	/// Glow filter for some extra pizzazz  from VC web /////
	/////////////////////////////////////////////////////////
	
	//Filter for the outside glow
	var filter = coinStack.append('defs').append("filter")
  .attr("id","glow");
filter.append("feGaussianBlur")
  .attr("stdDeviation","3.5")
  .attr("result","coloredBlur");
var feMerge = filter.append("feMerge");
feMerge.append("feMergeNode")
  .attr("in","coloredBlur");
feMerge.append("feMergeNode")
  .attr("in","SourceGraphic");


  //Append a radialGradient element to the defs and give it a unique id
var radialGradient = coinStack.append('defs').append("radialGradient")
.attr("id", "radial-gradient")
.attr("cx", "50%")    //The x-center of the gradient
.attr("cy", "50%")    //The y-center of the gradient
.attr("r", "50%");   //The radius of the gradient


//Add colors to make the gradient appear like a Sun
radialGradient.append("stop")
    .attr("offset", "0%")
    .attr("stop-color", "yellow");
radialGradient.append("stop")
    .attr("offset", "30%")
    .attr("stop-color", "gold");
radialGradient.append("stop")
    .attr("offset", "90%")
    .attr("stop-color", "goldenrod");
radialGradient.append("stop")
    .attr("offset", "100%")
    .attr("stop-color", "darkgoldenrod");
  /////////////////////////////////////////////////

  coinStack.selectAll('path')
  .data(d => d.coins).enter().append('path')
  .attr('d',d => d.coinPath)
  .attr('transform',d=>`translate(0,${d.yshift})`)
  //.attr('fill', 'gold')
  .attr('stroke', 'black') 
  .style("filter", "url(#glow)") 
  .style("fill", "url(#radial-gradient)")
  .append("path");

  coinStack.append('path')
     .attr("id", "wavy") //Unique id of the path
     .attr("d", "M -10,20 L -10,-100") //SVG path
     .style("fill", "black")
     .style("stroke", "blue")
     .style("stroke-width", 2);

  coinStack.append('path')
  .attr("id", "mean_sal") //Unique id of the path
  .attr("d", "M -1,40 L 80,40") //SVG path
  .style("fill", "none")
  .style("stroke", "none");

 //Create an SVG text element and append a textPath element
 coinStack.append("text")
 .data(data1)
 .append("textPath") //append a textPath to the text element
  .attr("xlink:href", "#wavy") //place the ID of the path here
 // .style("text-anchor","middle") //place the text halfway on the arc
  .attr("startOffset", "0%")
  .text(function(d){return d.Country.replace('+',' ');})
  .style("font-size", "22px");

  coinStack.append("text")
  .data(data1)
  .append("textPath")
  .attr("xlink:href", "#mean_sal")
  .attr("startOffset", "30%")
  .attr("text-anchor", "middle")
  .attr("dominant-baseline", "middle")
  .text(function(d){return  String(Math.round(+d.Average_Monthly_Net_Salary.replace(',','')* +d.Exchange_to_eur.replace(',',''))) + "\u20AC";})
  .style("font-size", "18px");

 var main_window=d3.select('body').select('svg');
 
 main_window.append('path')
 .attr("id", "title") //Unique id of the path
 .attr("d", "M 20,50 L" +document.body.clientWidth+",50") //SVG path
 .style("fill", "none")
 .style("stroke", "none");

 main_window.append("text")
 .append("textPath") //append a textPath to the text element
 .attr("xlink:href", "#title") //place the ID of the path here
  .attr("text-anchor", "middle")
  .attr("startOffset", "50%")
  .style("font-size", "16px")
  //.text("Ratio of average Net salary and 1 bedroom rent")
  .text("Average Net salary in EUR")
  .style("font-size", "44px");

   } );

