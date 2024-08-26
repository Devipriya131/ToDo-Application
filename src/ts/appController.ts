import * as ko from "knockout";
import Context = require("ojs/ojcontext");
import 'ojs/ojinputtext';
import { ojButton } from 'ojs/ojbutton';
import { of } from 'rxjs';
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
import 'ojs/ojmenu';

interface TaskData {
  id: number;
  name: string;
  description: string;
  completed: boolean;
}

class RootViewModel {

  value: ko.Observable<string>;
  txtTask: ko.Observable<string>;
  txtDescription: ko.Observable<string>; // Added this property
  chkCompleted: ko.Observable<boolean>;

  private readonly taskArray = ko.observableArray<TaskData>([]);
  private readonly statusdata = [
    { value: true, label: 'Open' },
    { value: false, label: 'Completed' }
  ];
  private readonly statusDP = new ArrayDataProvider(this.statusdata, {
    keyAttributes: 'value'
  });

  readonly dataprovider = new ArrayDataProvider<TaskData['id'], TaskData>(
    this.taskArray,
    {
      keyAttributes: 'id'
    }
  );

  deleteAction = (
    event: ojButton.ojAction,
    context: ojTable.CellTemplateContext<TaskData['id'], TaskData>
  ) => {
    const rowIndex = this.taskArray.indexOf(context.item.data);
    this.taskArray.splice(rowIndex, 1);
    return true;
  };

  editAction = (
    event: ojButton.ojAction,
    context: ojTable.CellTemplateContext<TaskData['id'], TaskData>
  ) => {
    // Implement edit logic here
    return true;
  };

  addAction = () => {
    // Create a new task object
    const newTask: TaskData = {
      id: 0, // This will be ignored by the server if it's auto-generated
      name: this.txtTask(),
      description: this.txtDescription(),
      completed: this.chkCompleted()
    };

    // Send the new task to the server via POST
    fetch('http://localhost:8080/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newTask)
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((createdTask: TaskData) => {
        this.taskArray.push(createdTask); // Add the newly created task to the taskArray
        this.clearForm(); // Clear the input fields after adding the task
        this.fetchTasks;
      })
      .catch(error => {
        console.error('There was a problem with the POST operation:', error);
      });
  };

  constructor() {
    this.value = ko.observable('');
    this.txtTask = ko.observable('');
    this.txtDescription = ko.observable(''); // Initialize txtDescription
    this.chkCompleted = ko.observable(false);

    // Fetch tasks from the API
    this.fetchTasks();

    Context.getPageContext().getBusyContext().applicationBootstrapComplete();
  }

  // Method to fetch tasks from the API
  private fetchTasks() {
    fetch('http://localhost:8080/tasks')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data: TaskData[]) => {
        this.taskArray(data); // Update taskArray with the fetched data
      })
      .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
      });
  }

  // Method to clear the form after adding a task
  private clearForm() {
    this.txtTask('');
    this.txtDescription(''); // Clear txtDescription
    this.chkCompleted(false);
  }
}

export default new RootViewModel();
