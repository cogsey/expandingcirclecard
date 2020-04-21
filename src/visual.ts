/*
*  Power BI Visual CLI
*
*  Copyright (c) Microsoft Corporation
*  All rights reserved.
*  MIT License
*
*  Permission is hereby granted, free of charge, to any person obtaining a copy
*  of this software and associated documentation files (the ""Software""), to deal
*  in the Software without restriction, including without limitation the rights
*  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
*  copies of the Software, and to permit persons to whom the Software is
*  furnished to do so, subject to the following conditions:
*
*  The above copyright notice and this permission notice shall be included in
*  all copies or substantial portions of the Software.
*
*  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
*  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
*  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
*  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
*  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
*  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
*  THE SOFTWARE.
*/
"use strict";

import "core-js/stable";
import "../style/visual.less";
import powerbi from "powerbi-visuals-api";
import IVisual = powerbi.extensibility.IVisual;
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisualHost = powerbi.extensibility.visual.IVisualHost;
import DataView = powerbi.DataView;
import EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;
import VisualObjectInstanceEnumeration = powerbi.VisualObjectInstanceEnumeration;
import VisualObjectInstanceEnumerationObject = powerbi.VisualObjectInstanceEnumerationObject;
import { VisualSettings } from "./settings";
import { valueFormatter } from "powerbi-visuals-utils-formattingutils";

import * as d3 from "d3";

export interface ViewModel {
    LabelValue?: string;
    Category?: string;
    Expand?: number;
    CircleColor?: string;
    CircleTransparency?: number;
    ShowOutline?: boolean;
    CircleStrokeColor?:string;
    CircleThickness?:number;
    DisplayUnits?:number;
    Precision?:number;
    LabelFontFamily?:string;
    LabelFontSize?:number;
    LabelFontColor?:string;
    Show?:boolean;
    CatFontFamily?:string;
    CatFontSize?:number;
    CatFontColor?:string;
    Format?:string;
}

export class Visual implements IVisual {
    private host: IVisualHost;
    private svg: d3.Selection<SVGElement>;
    private container: d3.Selection<SVGElement>;
    private circle: d3.Selection<SVGElement>;
    private label: d3.Selection<SVGElement>;
    private category: d3.Selection<SVGElement>;
    private visualSettings: VisualSettings;
    private rect: d3.Selection<SVGElement>;

    constructor(options: VisualConstructorOptions) {
        this.host = options.host
        this.svg = d3.select(options.element)
            .append('svg')
            .classed('circleCard', true);
        this.container = this.svg.append("g")
            .classed('container', true);
        this.circle = this.container.append("circle")
            .classed('circle', true);
        this.label = this.container.append("text")
            .classed("label", true);
        this.category = this.container.append("text")
            .classed("category", true);
        this.rect = this.container.append("rect")
            .classed('rect', true);
    }

    public update(options: VisualUpdateOptions) {

        console.log("Updating...")

        var dataView: DataView = options.dataViews[0]
        var viewModel: ViewModel = this.createViewModel(dataView);

        this.visualSettings = VisualSettings.parse<VisualSettings>(dataView);
        this.visualSettings.circle.circleThickness = Math.max(0, this.visualSettings.circle.circleThickness);
        this.visualSettings.circle.circleThickness = Math.min(10, this.visualSettings.circle.circleThickness);

        /**measurement variables */
        let width: number = options.viewport.width;
        let height: number = options.viewport.height;
        let expand: number = 1 + (viewModel.Expand/100)
        let expandedRadius: number = Math.min(width, height) / 2.05
        let normalRadius: number = expandedRadius/expand
        let labelFontSize = viewModel.LabelFontSize
        let catFontSize = viewModel.CatFontSize

        let iValueFormatter = valueFormatter.create({
            format:viewModel.Format, 
            value: viewModel.DisplayUnits, 
            precision: viewModel.Precision, 
            cultureSelector: this.host.locale
        })

        /**create top level svg element */
        this.svg.attr("width", width);
        this.svg.attr("height", height);            

        this.rect
            .attr("width", width)
            .attr("height", height)
            .style("fill-opacity",0);

        /**draw the rest of the visual in a base state or when there is a mouseover or mouseout event */
        this.drawVisual(normalRadius, width, height, labelFontSize, catFontSize, viewModel, iValueFormatter)
        this.svg.on("mouseover", () => this.drawVisual(expandedRadius, width, height, labelFontSize * expand, catFontSize * expand, viewModel, iValueFormatter))

        var mouse
        
        this.rect.on("mouseout", function () {
            mouse = d3.mouse(this)
            return mouse
        })

        this.svg.on("mouseout", ()=>{
            if(mouse[0]<width*0.1 || mouse[0]>width*0.9 || mouse[1]<height*0.1 || mouse[1]>height*0.9){
                this.drawVisual(normalRadius, width, height, labelFontSize, catFontSize, viewModel, iValueFormatter)
            }
        })
    }

    /**function used to draw the visual */
    public drawVisual(radius, width, height, labelFontSize, catFontSize, viewModel, iValueFormatter){

        this.circle
            .style("fill", viewModel.CircleColor)
            .style("fill-opacity", 1 - (viewModel.CircleTransparency/100))
            .style("stroke", viewModel.CircleStrokeColor)
            .style("stroke-width", viewModel.CircleThickness)
            .attr("r", radius)
            .attr("cx", width / 2)
            .attr("cy", height / 2);

        this.label
            .text(iValueFormatter.format(viewModel.LabelValue))
            .attr("x", "50%")
            .attr("y", "50%")
            .attr("dy", labelFontSize / 4 + "px")
            .attr("text-anchor", "middle")
            .style("font-size", labelFontSize + "px")
            .style("font-family",viewModel.LabelFontFamily)
            .style("fill",viewModel.LabelFontColor);

        this.category
            .text(viewModel.Category)
            .attr("x", "50%")
            .attr("y", (height + radius)/2)
            .attr("text-anchor", "middle")
            .style("font-size", catFontSize + "px")
            .style("font-family", viewModel.CatFontFamily)
            .style("fill",viewModel.CatFontColor);
    }

    public createViewModel(dataView: DataView):ViewModel{
        this.visualSettings = VisualSettings.parse(dataView) as VisualSettings;

        /**get persistent values */
        var expand: number = this.visualSettings.circle.expand;
        var circleColor: string = this.visualSettings.circle.circleColor;
        var circleTransparency: number = this.visualSettings.circle.circleTransparency;
        var showOutline: boolean = this.visualSettings.circle.showOutline;
        var circleStrokeColor: string = (!showOutline) ? "" : this.visualSettings.circle.circleStrokeColor;
        var circleThickness: number = (!showOutline) ? null : this.visualSettings.circle.circleThickness;
        var displayUnits: number = this.visualSettings.labelProperties.displayUnits;
        var precision: number = this.visualSettings.labelProperties.precision;
        var labelFontFamily: string = this.visualSettings.labelProperties.labelFontFamily;
        var labelFontSize: number = this.visualSettings.labelProperties.labelFontSize;
        var labelFontColor: string = this.visualSettings.labelProperties.labelFontColor;
        var show: boolean = this.visualSettings.categoryProperties.show;
        var catFontFamily: string = (!show) ? "" :this.visualSettings.categoryProperties.catFontFamily;
        var catFontSize: number = (!show) ? null :this.visualSettings.categoryProperties.catFontSize;
        var catFontColor: string = (!show) ? "" :this.visualSettings.categoryProperties.catFontColor;

        /**data values */
        var labelValue: string = dataView.single.value as string;
        var category: string = dataView.metadata.columns[0].displayName;

        /**get formatting code for the field that is the measure*/
        var format: string = dataView.metadata.columns[0].format

        return{
            LabelValue: labelValue,
            Category: category,
            Expand: expand,
            CircleColor: circleColor,
            CircleTransparency: circleTransparency,
            ShowOutline: showOutline,
            CircleStrokeColor: circleStrokeColor,
            CircleThickness: circleThickness,
            DisplayUnits: displayUnits,
            Precision: precision,
            LabelFontFamily: labelFontFamily,
            LabelFontSize: labelFontSize,
            LabelFontColor: labelFontColor,
            Show: show,
            CatFontFamily: catFontFamily,
            CatFontSize: catFontSize,
            CatFontColor: catFontColor,
            Format:format
        };
    }


    private static parseSettings(dataView: DataView): VisualSettings {
        return VisualSettings.parse(dataView) as VisualSettings;
    }

    /**
     * This function gets called for each of the objects defined in the capabilities files and allows you to select which of the
     * objects and properties you want to expose to the users in the property pane.
     *
     */
    public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstanceEnumeration {

        var visualObjects: VisualObjectInstanceEnumerationObject =
            <VisualObjectInstanceEnumerationObject>VisualSettings.enumerateObjectInstances(this.visualSettings, options);

        visualObjects.instances[0].validValues = {
            expand: { numberRange: { min: 0, max: 200 } },
            circleTransparency: { numberRange: { min: 0, max: 100 } },
            circleThickness: { numberRange: { min: 0, max: 50 } },
            precision: { numberRange: { min: 0, max: 2 } },
            labelFontSize: { numberRange: { min: 5, max: 250 } },
            catFontSize: { numberRange: { min: 5, max: 250 } },
        };

        let objectName = options.objectName;

        switch (objectName) {
            case "circle": {
                if (!this.visualSettings.circle.showOutline) {
                    delete visualObjects.instances[0].properties["circleStrokeColor"]
                    delete visualObjects.instances[0].properties["circleThickness"]
                }
                break;
            }
        }

        return visualObjects
    }


}
