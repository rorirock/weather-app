import { Component, OnInit, ViewChild } from '@angular/core';
import { WeatherService } from '../core/services/weather.service';
import {ChartConfiguration, ChartOptions } from "chart.js";
import { BaseChartDirective } from 'ng2-charts';
import { weather} from '../core/models/weather'

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  options = [
    {
    'code': 'LWX',
    'name': 'District of Columbia Forecast'
    },
    {
      'code': 'TOP',
      'name': 'Kansas Forecast'
    }
  ]

  activeBtn?:string
  activeDegrees:string='F'

  periods:any[]=[]

  filterDayOrNigth=true

  title:string=''

  lineChartOptions: ChartOptions<'line'> = {
     responsive: true,
     elements:{
       point:{
        radius:3,
        pointStyle:'rectRounded',
        rotation:1,
        backgroundColor:'#dfbd13',
        borderColor:'#dfbd13',
       },
       line:{
        borderColor:'#4d62da',
        tension:0.2
       },
       bar:{
        backgroundColor:'#dfbd13',
        borderWidth:10
       }
     },
     plugins:{
      
      legend: {
        display: false,
       },
      tooltip:{
        enabled: false,
        external: function(context){

          let tooltipEl = document.getElementById('chartjs-tooltip');
          if (!tooltipEl) {
            tooltipEl = document.createElement('div');
            tooltipEl.id = 'chartjs-tooltip';
            tooltipEl.innerHTML = '<container></container>';
            document.body.appendChild(tooltipEl);
          }

          const tooltipModel = context.tooltip;
          const indexTooltip = context.tooltip.dataPoints[0].dataIndex
          const dataTooltipItem = JSON.parse(JSON.stringify(tooltipModel.dataPoints[0].dataset.data[indexTooltip]))
          if (tooltipModel.opacity === 0) {
            tooltipEl.style.opacity = '0';
            return;
          }

          tooltipEl.classList.remove('above', 'below', 'no-transform');
            if (tooltipModel.yAlign) {
                tooltipEl.classList.add(tooltipModel.yAlign);
            } else {
                tooltipEl.classList.add('no-transform');
          }
          if (tooltipModel.body) {

            const styleContent = `background:#010b46d4; 
                                  border-radius:5px; 
                                  width:100px; 
                                  height:100px;
                                  color:#FFF; 
                                  text-align:center;
                                  font-size:10px;
                                  `
            const styleImg = `width:20px; 
                              height:15px`
            const styleInfo = `display: flex;
                              flex-direction: column;
                              justify-content: center;
                              margin:5px;
                              text-align:left;`
            const styleHumidity = `font-size:10px
                                  `

            let innerHtml = `
            <div style='${styleContent}' >
              <div> ${dataTooltipItem.name} | <span style='font-weight: bold;'>°${dataTooltipItem.temperature}</span></div>
              
              <div style='${styleInfo}'>
                <div style='${styleHumidity}'> Humidity:
                  <span style='font-weight: bold;'>${dataTooltipItem.relativeHumidity.value}%</span>
                </div>
                <div style='font-size:10px; letter-spacing: -1px;white-space: nowrap;'>${dataTooltipItem.shortForecast}</div>
                <img style='${styleImg}' src='${dataTooltipItem.icon}'/>
              </div>
             
            </div>
            `;
            let tableRoot = tooltipEl.querySelector('container');
            if (tableRoot) {
              tableRoot.innerHTML = innerHtml;
            }
        }

        const position = context.chart.canvas.getBoundingClientRect();
        tooltipEl.style.opacity = '1';
        tooltipEl.style.position = 'absolute';
        tooltipEl.style.left = position.left + window.pageXOffset + tooltipModel.caretX + 'px';
        tooltipEl.style.top = position.top + window.pageYOffset + tooltipModel.caretY + 'px';
        tooltipEl.style.pointerEvents = 'none';

        }
      },
     },
     parsing: {
      xAxisKey: 'name',
      yAxisKey: 'temperature'
    }
  };
  lineChartLegend = true;
  lineChartData: ChartConfiguration<'line',weather[]>['data'] = {
    labels: [],
    datasets: [
      {
        data:[],
        fill: false,
        label:'degrees',
        parsing: {
          xAxisKey: 'name',
          yAxisKey: 'temperature'
        },
        
      },
    ],
  };

  constructor(private serviceWeather: WeatherService){
    
  }

  ngOnInit(){

  }

  RenderChart(labels:any,data:any) {
    this.lineChartData.labels = labels
    this.lineChartData.datasets[0].data = data
    this.chart?.render()
  }


  getDataWeather(code:string){
    this.title = this.options.filter((item:any)=> item.code== code)[0].name
    this.activeBtn = code
    this.activeDegrees = 'F'
    this.serviceWeather.getWeather(code).subscribe((res:any)=>{
      this.periods = res.properties.periods
      const labels = this.periods.map((period:any)=> period.name)
      const data = this.periods.map((period:any)=>{ 
        const item = new weather
        item.temperature = period.temperature
        item.name = period.name
        item.icon = period.icon
        item.isDaytime = period.isDaytime
        item.number = period.number
        item.shortForecast = period.shortForecast
        item.relativeHumidity = period.relativeHumidity
        return item
      })
      this.periods = data
      this.RenderChart(labels,data)
    })
  }

 
  filterDayOrNight(){
    this.filterDayOrNigth = !this.filterDayOrNigth
    const labels = this.periods.map((period:any)=> {
      if(period.isDaytime && this.filterDayOrNigth){
        return period.name
      }else if(!period.isDaytime && !this.filterDayOrNigth){
        return period.name
      }
    })
    const data = this.periods.map((period:any)=>{ 
      if(period.isDaytime  && this.filterDayOrNigth ){
        return period
      }else if(!period.isDaytime && !this.filterDayOrNigth){
        return period
      }
    }).filter(item => item != undefined)
    this.RenderChart(labels,data)
  }

  changeDegrees(degrees: string){
    if(this.activeDegrees != degrees){
      this.activeDegrees = degrees
      this.lineChartData.datasets[0].data = this.lineChartData.datasets[0].data.map((f:any)=>{
         f.temperature = this.calculateCelsius(degrees,f.temperature)
         return f
      })
      this.chart?.render()
    }
  }

  calculateCelsius(type: string,degrees:number):number{
    return (type == 'C') ? Math.ceil((degrees-32)*5/9) : Math.floor(degrees * 9/5 + 32 )
  }

}