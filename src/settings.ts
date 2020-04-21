/*
 *  Power BI Visualizations
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

import  { dataViewObjectsParser } from "powerbi-visuals-utils-dataviewutils"

export class CircleSettings {
  public expand: number = 25;
  public circleColor: string = "#ffffff";
  public circleTransparency: number = 25;
  public showOutline: boolean = true;
  public circleStrokeColor: string = "#000000";
  public circleThickness: number = 2;
}

export class LabelSettings {
  public displayUnits: number = 0;
  public precision: number = 0;
  public labelFontFamily: string = "Segoe UI";
  public labelFontSize: number = 45;
  public labelFontColor: string = "#000000";
}

export class CategorySettings {
  public show: boolean = true;
  public catFontFamily: string = "Segoe UI";
  public catFontSize: number = 25;
  public catFontColor: string = "#000000";
}


export class VisualSettings extends dataViewObjectsParser.DataViewObjectsParser {
  public circle: CircleSettings = new CircleSettings();
  public labelProperties: LabelSettings = new LabelSettings();
  public categoryProperties: CategorySettings = new CategorySettings();
}


