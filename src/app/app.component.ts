import { Component, OnInit } from '@angular/core';
import { DataService } from './data.service';
import * as am5 from '@amcharts/amcharts5';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';
import * as am5hierarchy from '@amcharts/amcharts5/hierarchy';

interface StatisticData {
  name: String;
  continent: String;
  children: [{ name: String; value: Number }];
}
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  title = 'COVID-STATISTIC';

  stateData: Array<StatisticData> = [];
  chart: any;
  level1: any;
  level2: any;
  loader: boolean = false;

  indianSubContinents = [
    'India',
    'Nepal',
    'Bangladesh',
    'Pakistan',
    'Bhutan',
    'Sri Lanka',
    'Maldives',
  ];

  constructor(public dataService: DataService) {}

  ngOnInit() {
    this.getAlllData();
  }

  getAlllData() {
    this.loader = true;
    this.dataService
      .get('https://corona.lmao.ninja/v2/countries?yesterday=false&sort')
      .then((result) => {
        this.stateData = result
          .filter((country) => {
            return this.indianSubContinents.indexOf(country.country) > -1;
          })
          .map((country) => {
            return {
              name: country.country,
              children: [
                {
                  name: 'cases',
                  children: [
                    { name: 'recovered', value: country.recovered },
                    { name: 'deaths', value: country.deaths },
                    { name: 'active', value: country.active },
                  ],
                },
              ],
            };
          });
        this.loader = false;
        console.log(this.stateData);
        setTimeout(() => {
          this.initializeChart(this.stateData);
        }, 0);
      })
      .catch((error) => {
        console.log('error while fetching', error);
      });
  }

  initializeChart(data) {
    var root = am5.Root.new('chartdiv');
    root.setThemes([am5themes_Animated.new(root)]);
    var container = root.container.children.push(
      am5.Container.new(root, {
        width: am5.percent(100),
        height: am5.percent(100),
        layout: root.verticalLayout,
      })
    );

    var series = container.children.push(
      am5hierarchy.Sunburst.new(root, {
        downDepth: 1,
        initialDepth: 3,
        valueField: 'value',
        categoryField: 'name',
        childDataField: 'children',
        innerRadius: am5.percent(50),
      })
    );
    const chartData = [
      {
        name: 'Root',
        children: [...data],
      },
    ];
    series.data.setAll(chartData);
    series.set('selectedDataItem', series.dataItems[0]);

    container.children.unshift(
      am5hierarchy.BreadcrumbBar.new(root, {
        series: series,
      })
    );
  }
}
