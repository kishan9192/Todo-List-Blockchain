/* Here we create a javascript app that talks to the blockchain*/
App = {
	contracts: {},
	loading: false,
	load: async () => {
		// Load app
		// We want to load the Web3 library
		// in order to connect to blockchain
		await App.loadWeb3()
		await App.loadAccount()
		await App.loadContract()
		await App.render()
},
	// We are creating a way to talk to blockchain
	// We will use metamask i.e our browser extension to talk to our blockchain with Web3js
	
	/* Our client side application
		needs to connect to blockchain,
		and that is what Web3 JS is for */ 

	/* This is where we have connected to blochain*/
	/* and now we need our browser and metamask to connect to it*/
	loadWeb3: async () => {
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider
      web3 = new Web3(web3.currentProvider)
    } else {
      window.alert("Please connect to Metamask.")
    }
    // Modern dapp browsers...
    if (window.ethereum) {
      window.web3 = new Web3(ethereum)
      try {
        // Request account access if needed
        await ethereum.enable()
        // Acccounts now exposed
        web3.eth.sendTransaction({/* ... */})
      } catch (error) {
        // User denied account access...
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      App.web3Provider = web3.currentProvider
      window.web3 = new Web3(web3.currentProvider)
      // Acccounts always exposed
      web3.eth.sendTransaction({/* ... */})
    }
    // Non-dapp browsers...
    else {
      console.log('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  },

  loadAccount: async () => {
    // Set the current blockchain account
    App.account = web3.eth.accounts[0]
    // The line below will load the app and print the account currently being used for the transactions
    //console.log(App.account)
  },


  // Loads the smart contract from the 
  // blockchain, this will be the Todo list that we created
  loadContract: async () => {
    // Create a JavaScript version of the smart contract
    const todoList = await $.getJSON('TodoList.json')

    // Now we are creating a truffle contract
    // A truffle contract is a javascript version of 
    // a smart contract, that allows us to call the functions on it.

    App.contracts.TodoList = TruffleContract(todoList)
    App.contracts.TodoList.setProvider(App.web3Provider)

    // Hydrate the smart contract with values from the blockchain
    // gets a deployed copy of smart contract.
    App.todoList = await App.contracts.TodoList.deployed()
  	console.log(todoList) 
  },

  // render some information on the page
  // render up the account that we're connected with 
  render: async () => {
    // Prevent double render
    if (App.loading) {
      return
    }

    // Update app loading state
    App.setLoading(true)

    // Render Account
    $('#account').html(App.account)

    // Render Tasks
    await App.renderTasks()

    // Update loading state
    App.setLoading(false)
  },

  renderTasks: async () => {
    // Load the total task count from the blockchain
    const taskCount = await App.todoList.taskCount()
    
    // this template will list out all the tasks in the page
    const $taskTemplate = $('.taskTemplate')

    // Render out each task with a new task template
    for (var i = 1; i <= taskCount; i++) {
      // Fetch the task data from the blockchain

      const task = await App.todoList.tasks(i)
      /* 'i' here stands for Id, and this first line
      will return a task array whose 0th index will
      point to task id, and so on*/
      const taskId = task[0].toNumber()
      const taskContent = task[1]
      const taskCompleted = task[2]

      // Create the html for the task
      // We have created a new copy of the template
      const $newTaskTemplate = $taskTemplate.clone()
      $newTaskTemplate.find('.content').html(taskContent)
      $newTaskTemplate.find('input')
                      .prop('name', taskId)
                      .prop('checked', taskCompleted)
                      .on('click', App.toggleCompleted)

      // Put the task in the correct list
      if (taskCompleted) {
      	// '#' denotes the id's of the form elements
        $('#completedTaskList').append($newTaskTemplate)
      } else {
        $('#taskList').append($newTaskTemplate)
      }

      // Show the task
      $newTaskTemplate.show()
    }
  },

  createTask: async () => {
    App.setLoading(true)
    // fetching the value from the form element id=newTask
    const content = $('#newTask').val()
    // Here we have called the smart contract create Task function
    await App.todoList.createTask(content)
    window.location.reload()
  },

  // We will be passing an event e here in parameter
  // as the task can only be completed when it is checked
  toggleCompleted: async (e) => {
    App.setLoading(true)
    const taskId = e.target.name
    await App.todoList.toggleCompleted(taskId)
	// avoid double render autorefresh   
    window.location.reload()
  },

  setLoading: (boolean) => {
    App.loading = boolean
    const loader = $('#loader')
    const content = $('#content')
    if (boolean) {
      loader.show()
      content.hide()
    } else {
      loader.hide()
      content.show()
    }
  }
}


/* In order to load the app
whenever the project loads we do App.load()*/
$(() => {
	$(window).load(() => {
		App.load()
	})
})
