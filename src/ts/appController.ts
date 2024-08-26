import * as ko from "knockout";
import Context = require("ojs/ojcontext");
import 'ojs/ojinputtext';
import { ojButton } from 'ojs/ojbutton';
import 'ojs/ojbutton';
import 'ojs/ojcheckboxset';
import 'ojs/ojcollapsible';
import 'ojs/ojselectsingle';
import 'ojs/ojtable';
import { ojTable } from 'ojs/ojtable';
import 'ojs/ojknockout';
import 'ojs/ojbutton';
import 'ojs/ojoption';
import ArrayDataProvider = require('ojs/ojarraydataprovider');
import * as taskData from "text!./todo_data.json"
import 'ojs/ojmenu';

  interface TaskData {
    Id: number;
    task: string;
    desc: string;
    Status: string;
  }

class RootViewModel {

     value: ko.Observable<string>;

    private readonly taskArray = ko.observableArray(JSON.parse(taskData));
    private readonly statusdata = [
      { value: 'o', label: 'Open' },
      { value: 'c', label: 'Completed' },
      { value: 'd', label: 'Deferred' }
    ];
    private readonly statusDP = new ArrayDataProvider(this.statusdata, {
      keyAttributes: 'value'
    });
  
    readonly dataprovider = new ArrayDataProvider<TaskData['Id'], TaskData>(
      this.taskArray,
      {
        keyAttributes: 'Id'
      }
    );

    deleteAction = (
      event: ojButton.ojAction,
      context: ojTable.CellTemplateContext<TaskData['Id'], TaskData>
    ) => {
      const rowIndex = this.taskArray.indexOf(context.item.data);
      this.taskArray.splice(rowIndex, 1);
      return true;
    };

    editAction = (
      event: ojButton.ojAction,
      context: ojTable.CellTemplateContext<TaskData['Id'], TaskData>
    ) => {
      return true;
    };

    addAction = (
      event: ojButton.ojAction,
      context: ojTable.CellTemplateContext<TaskData['Id'], TaskData>
    ) => {
      return true;
    };

    


  constructor() {


    this.value = ko.observable('');
    Context.getPageContext().getBusyContext().applicationBootstrapComplete();        
  }
  
  
}

export default new RootViewModel();