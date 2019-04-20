require('dotenv').config()
var Discordie = require("discordie")
var fs = require('fs')
var data = fs.readFileSync('./data/pengetahuan-umum.json', 'utf8')
var Events = Discordie.Events

var client = new Discordie({autoReconnect: true})

client.connect({ token: process.env.BOT_TOKEN })

client.Dispatcher.on(Events.DISCONNECTED, e => {
  console.log(e)
})

client.Dispatcher.on(Events.GATEWAY_READY, e => {
  console.log("Connected as: " + client.User.username)
})

var dataJson = JSON.parse(data)
var answered = false
var players = []
var names = []
var scores = []
var question = 0
var questionAnswer = ''

client.Dispatcher.on(Events.MESSAGE_CREATE, e => {
  console.log(e.message.content)
  if (e.message.content == '!ping') {
  	e.message.channel.sendMessage(helpCommand(e))
  }
  if (e.message.content === '!bantuan') {
  	e.message.channel.sendMessage(commandList())
  }
  if (e.message.content === '!yansen') {
  	e.message.channel.sendMessage('siapa Yansen? saya tidak tahu')
  }
  if (e.message.content === '!me') {
  	e.message.channel.sendMessage('Kamu adalah ' + e.message.author.username)
  }
  if (e.message.content === '!mulai') {
  	getQuestion(e)
  }
  if (e.message.content === '!ulang') {
  	question = 0
  	getQuestion(e)
  }
  if (e.message.content === '!hint') {
  	e.message.channel.sendMessage(answerHint())
  }
  if (e.message.content === '!peringkat') {
  	
  	e.message.channel.sendMessage(peringkat())
  }
  if (e.message.content === '!skor') {
  	var playerSkor
  	if (players.indexOf(e.message.author.id) === -1) {
  		playerSkor = 0
  	} else {
  		var playerIndex = players.indexOf(e.message.author.id)
  		playerSkor = scores[playerIndex]
  	}
  	e.message.channel.sendMessage('** skor ' + e.message.author.username + ': ' + playerSkor + '**')
  }
  if (e.message.content.toLowerCase() === questionAnswer) {
  	if (answered === true) {
  		e.message.channel.sendMessage('**pertanyaan sudah di jawab, menuju soal berikutnya**')
  	} else {
  		answered = true
  		var playerSkor
  		if (players.indexOf(e.message.author.id) === -1) {
  			players.push(e.message.author.id)
				names.push(e.message.author.username)
				scores.push(1)
				playerSkor = 1
  		} else {
  			var playerIndex = players.indexOf(e.message.author.id)
  			scores[playerIndex]++
  			playerSkor = scores[playerIndex]
  			players = urutkan(players, scores)
				names = urutkan(names, scores)
				scores.sort(function(a, b) {
				return b - a
				})
  		}
  		e.message.channel.sendMessage('**' + e.message.author.username + ' benar, skor kamu sekarang: ' + playerSkor + '**')
  		e.message.channel.sendMessage('**soal selanjutnya dalam 3 detik....**')
  		setTimeout(getQuestion, 3000, e)
  		question += 1
  	}
  }
  setTimeout()
  	

})

function getQuestion (e) {
	var questionLength = dataJson.questions.length
	if (question <= (questionLength - 1)) {
		answered = false
		questionAnswer = dataJson.questions[question].answers.text.toLowerCase()
		e.message.channel.sendMessage('**``` Pertanyaan: ' + dataJson.questions[question].text + '```**')
	} else {
		questionAnswer = ''
		e.message.channel.sendMessage('**Pertanyaan sudah habis**')
	}
}

function helpCommand (e) {
	return 'Hi, ' + e.message.author.username + ' butuh bantuan? \nketik !bantuan'
}

function commandList () {
	return '**```Command List\n!skor: untuk check score kamu\n!mulai: untuk memulai quiz\n!me: untuk yang lupa ingatan\n!ping: untuk check bot status```**'
}

function answerHint () {
	var blank = ''
	var splitAnswer = questionAnswer.split('')
	for (var i = 0; i < splitAnswer.length; i++) {
		if (i === 0 || Math.random() < 0.7) {
			blank += '\\_'
		} else {
			blank += splitAnswer[i]
		}
	}
	return blank
}

function urutkan (sthis, sby) {
	var newArray = sthis
	newArray.sort(function(a, b) {
		return sby[sthis.indexOf(b)] - sby[sthis.indexOf(a)]
	})
	return newArray
}

function peringkat () {
	console.log(players)
	var peringkat = ''
	var playersLength = players.length
	var iter
	if (players.length <= 0) {
		peringkat = '**Tidak ada player**'
	} else {
		iter = playersLength < 9 ? (playersLength - 1) : 9
		for (var i = 0; i <= iter; i++) {
			peringkat += '**' + (i + 1) + '. ' + names[i] + '**\n'
		}
	}
	console.log(peringkat)
	return peringkat
}
