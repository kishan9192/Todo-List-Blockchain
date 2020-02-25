pragma solidity ^0.5.0;
/**
 * The contractName contract does this and that...
 */
contract TodoList {
  constructor() public {
  	createTask("Check out dappuniversity.com");
    
  }
  /* Public here allows to read the value of Taskcount*/
  uint public taskCount = 0;
  struct Task {
  	uint id;
  	string content;
  	bool completed;
  }

  /* here unit = id and the Task will be the Task corresponding to that id*/
  mapping (uint => Task) public tasks;

  // The task created is available to us, inside the smart contract
  event TaskCreated(
  	uint id,
  	string content,
  	bool completed
  	);
  /* function allows us to put the struct Task into the mapping*/
  function createTask(string memory _content) public {

  	taskCount ++;
  	tasks[taskCount] = Task(taskCount, _content, false);
  	// This is how we trigger events in solidity
  	emit TaskCreated(taskCount, _content, false);
  } 

  event TaskCompleted(
  	uint id,
  	bool completed
  	);
  function toggleCompleted(uint _id) public {
  	Task memory _task = tasks[_id];
  	_task.completed = !_task.completed;
  	tasks[_id] = _task;
  	emit TaskCompleted(_id, _task.completed);
  }
  
}
