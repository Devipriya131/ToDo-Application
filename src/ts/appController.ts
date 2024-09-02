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
import { ojDialog } from 'ojs/ojdialog';
import 'ojs/ojdialog';
import ArrayDataProvider = require('ojs/ojarraydataprovider');
import { ojMenuEventMap } from 'ojs/ojmenu';
import 'ojs/ojmenu';

interface TaskData {
  id: number;
  name: string;
  description: string;
  completed: boolean;
}

class RootViewModel {
  
  value: ko.Observable<string>;
  txtID: ko.Observable<number>;
  txtTask: ko.Observable<string>;
  txtDescription: ko.Observable<string>; // Added this property
  chkCompleted: ko.Observable<boolean>;
  searchQuery: ko.Observable<string>;
  editTask: ko.Observable<TaskData>;
  currentColor: ko.ObservableArray<string>;
  agreement: ko.ObservableArray<string>;
  tagsArray: ko.ObservableArray<string>;

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

  menuListener = (
    event: ojMenuEventMap['ojMenuAction'],
    context: ojTable.CellTemplateContext<TaskData['id'], TaskData>
  ) => {
    const rowIndex = this.taskArray.indexOf(context.item.data);
    if (event.detail.selectedValue === 'edit') {
      this.editOpenDialogAction(event,context)
    } else if (event.detail.selectedValue === 'delete') {
      this.deleteAction(event,context)
    }
  };

  public close(event: ojButton.ojAction) {
    (document.getElementById('modalDialog1') as ojDialog).close();
  }

  public closeEditDialog(event: ojButton.ojAction) {
    (document.getElementById('editModalDialog') as ojDialog).close();
  }

  public open(event: ojButton.ojAction) {
    (document.getElementById('modalDialog1') as ojDialog).open();
  }

  deleteAction = (
    event: ojButton.ojAction,
    context: ojTable.CellTemplateContext<TaskData['id'], TaskData>
  ) => {
    const taskToDelete = context.item.data;

    fetch(`http://localhost:8080/tasks/${taskToDelete.id}`, {
      method: 'DELETE',
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
  
        const rowIndex = this.taskArray.indexOf(taskToDelete);
        if (rowIndex > -1) {
          this.taskArray.splice(rowIndex, 1);
        }
      })
      .catch(error => {
        console.error('There was a problem with the DELETE operation:', error);
      });
  
    return true;
  };

  searchAction = (
    event: ojButton.ojAction,
    context: ojTable.CellTemplateContext<TaskData['id'], TaskData>
  ) => {
    alert('search')
   
  
    return true;
  };
  
  editAction =() => {
    const newTask: TaskData = {
      id: this.txtID(), 
      name: this.txtTask(),
      description: this.txtDescription(),
      completed: this.chkCompleted()
    };
    alert(JSON.stringify(newTask))
    alert("http://localhost:8080/tasks/${newTask.id}")
    fetch(`http://localhost:8080/tasks/${newTask.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newTask)
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
      })
      .catch(error => {
        console.error('There was a problem with the EDIT operation:', error);
      });
      this.taskArray.push(newTask);
      (document.getElementById('editModalDialog') as ojDialog).close();
     
    return true;
  };

  editOpenDialogAction = (
    event: ojButton.ojAction,
    context: ojTable.CellTemplateContext<TaskData['id'], TaskData>
  ) => {
    //this.txtDescription=context.item.data;
    const taskToEdit = context.item.data;
    const rowIndex = this.taskArray.indexOf(taskToEdit);
   
    this.editTask(taskToEdit);
    this.txtID(taskToEdit.id)

    this.txtTask(taskToEdit.name);
    this.txtDescription(taskToEdit.description);
    this.chkCompleted(taskToEdit.completed);
    
    (document.getElementById('editModalDialog') as ojDialog).open();

    return true;
  };

  addAction = () => {
    const newTask: TaskData = {
      id: 0, 
      name: this.txtTask(),
      description: this.txtDescription(),
      completed: this.chkCompleted()
    };
    alert(JSON.stringify(newTask))

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
        this.taskArray.push(createdTask); 
        this.clearForm(); 
        this.fetchTasks;
      })
      .catch(error => {
        console.error('There was a problem with the POST operation:', error);
      });
  };

  constructor() {
    this.currentColor = ko.observableArray(['red']);
      this.agreement = ko.observableArray();
    this.value = ko.observable('');
    this.txtID = ko.observable(0);
    this.txtTask = ko.observable('');
    this.txtDescription = ko.observable('');
    this.chkCompleted = ko.observable(false);
    this.searchQuery = ko.observable('');
    this.editTask = ko.observable<TaskData>({ id: 0, name: '', description: '', completed: false }); 
    this.tagsArray = ko.observableArray(['Tag1', 'Tag2', 'Tag3', 'Tag4']);

    this.fetchTasks();  
    const query = this.searchQuery().toLowerCase();
    const filteredTasks = this.taskArray().filter((task) =>
      task.name.toLowerCase().includes(query) ||
      task.description.toLowerCase().includes(query)
    );
  
    this.taskArray(filteredTasks)

    Context.getPageContext().getBusyContext().applicationBootstrapComplete();
  }
 

  private fetchTasks() {
   
    fetch('http://localhost:8080/tasks')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data: TaskData[]) => {
        this.taskArray(data);
      })
      .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
      });
  }

  private clearForm() {
    this.txtTask('');
    this.txtDescription(''); 
    this.chkCompleted(false);
  }
}

export default new RootViewModel();
